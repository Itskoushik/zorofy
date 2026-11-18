import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import dbConnect from "@/utils/dbconnect";
import authSecret from "@/utils/authSecret";
import User from "@/models/User";
import UserData from "@/models/UserData";
import { userEmailFilter } from "@/utils/userLookup";

const providers = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

providers.push(
  CredentialsProvider({
    name: "Email and password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const email = String(credentials?.email || "").trim().toLowerCase();
      const password = String(credentials?.password || "");
      if (!email || !password) return null;

      await dbConnect();
      const user = await User.findOne(userEmailFilter(email));
      if (!user?.password || !(await bcrypt.compare(password, user.password))) {
        return null;
      }

      return {
        id: user._id.toString(),
        name: user.userName,
        email: user.email,
        image: user.imageUrl,
        userName: user.userName,
        imageUrl: user.imageUrl,
      };
    },
  })
);

const options = {
  providers,
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: authSecret,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") return true;

      const email = String(profile?.email || user?.email || "").trim().toLowerCase();
      if (!email || profile?.email_verified === false) return false;

      await dbConnect();
      let databaseUser = await User.findOne(userEmailFilter(email));
      if (!databaseUser) {
        const userData = await UserData.create({});
        try {
          databaseUser = await User.create({
            userName: profile?.name || user?.name || email.split("@")[0],
            email,
            imageUrl: profile?.picture || user?.image || "/logo.png",
            isVerified: profile?.email_verified === true,
            userData: userData._id,
          });
        } catch (error) {
          await UserData.deleteOne({ _id: userData._id });
          if (error?.code !== 11000) throw error;
          databaseUser = await User.findOne(userEmailFilter(email));
        }
      }

      if (!databaseUser) return false;
      user.id = databaseUser._id.toString();
      user.name = databaseUser.userName;
      user.email = databaseUser.email;
      user.image = databaseUser.imageUrl;
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id || user._id?.toString() || token.sub;
        token.userName = user.userName || user.name || token.name;
        token.imageUrl = user.imageUrl || user.image || token.picture;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id || token.sub;
        session.user.userName = token.userName || token.name;
        session.user.imageUrl = token.imageUrl || token.picture;
      }
      return session;
    },
  },
};

const handler = (req, res) => NextAuth(req, res, options);
export { handler as GET, handler as POST };
