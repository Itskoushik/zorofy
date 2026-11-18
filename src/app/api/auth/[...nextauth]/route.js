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
      if (!user?.password || !(await bcrypt.compare(password, user.password))) return null;

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
      const googleId = String(account.providerAccountId || profile?.sub || "");
      if (!email || !googleId || profile?.email_verified !== true) {
        console.warn("[auth] Google sign-in rejected: verified profile details are missing.");
        return false;
      }

      let stage = "database connection";
      try {
        await dbConnect();
        stage = "account lookup";
        let databaseUser = await User.findOne({ googleId });
        if (!databaseUser) databaseUser = await User.findOne(userEmailFilter(email));

        if (!databaseUser) {
          stage = "account creation";
          const userData = await UserData.create({});
          try {
            databaseUser = await User.create({
              userName: profile?.name || user?.name || email.split("@")[0],
              email,
              googleId,
              authProviders: ["google"],
              imageUrl: profile?.picture || user?.image || "/logo.png",
              isVerified: true,
              userData: userData._id,
            });
          } catch (error) {
            await UserData.deleteOne({ _id: userData._id });
            if (error?.code !== 11000) throw error;
            databaseUser = await User.findOne({ googleId }) || await User.findOne(userEmailFilter(email));
            if (!databaseUser) throw error;
          }
        }

        const wasGoogleLinked = databaseUser.googleId === googleId;
        if (databaseUser.googleId && databaseUser.googleId !== googleId) {
          console.warn("[auth] Google sign-in rejected: account identifier is already linked elsewhere.");
          return false;
        }

        databaseUser.googleId = googleId;
        databaseUser.authProviders = [...new Set([...(databaseUser.authProviders || []), "google"])];
        databaseUser.isVerified = true;
        // Keep a user's chosen avatar. Replace only the default, or refresh a
        // profile that was already linked to this same Google account.
        const googleImage = profile?.picture || user?.image;
        if (googleImage && (wasGoogleLinked || !databaseUser.imageUrl || databaseUser.imageUrl === "/logo.png")) {
          databaseUser.imageUrl = googleImage;
        }
        stage = "account update";
        await databaseUser.save();

        user.id = databaseUser._id.toString();
        user.name = databaseUser.userName;
        user.email = databaseUser.email;
        user.image = databaseUser.imageUrl || googleImage || "/logo.png";
        user.userName = databaseUser.userName;
        user.imageUrl = user.image;
        console.info("[auth] Google callback completed and account session data was prepared.");
        return true;
      } catch (error) {
        // Do not log email addresses, OAuth profiles, tokens, or database URIs.
        console.error("[auth] Google account persistence failed.", {
          stage,
          name: error?.name || "Error",
          code: error?.code || "unknown",
        });
        throw error;
      }
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
        session.user.name = token.userName || token.name || session.user.name;
        session.user.userName = token.userName || token.name;
        session.user.email = token.email || session.user.email;
        session.user.image = token.imageUrl || token.picture || session.user.image || "/logo.png";
        session.user.imageUrl = session.user.image;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // NextAuth only follows local paths or URLs on the configured Zorofy origin.
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch {}
      return baseUrl;
    },
  },
};

// App Router route handlers use the NextAuth v4 factory form. Passing the
// Pages Router (req, res, options) signature here prevents OAuth/session routes
// from behaving reliably in production.
const handler = NextAuth(options);
export { handler as GET, handler as POST };
