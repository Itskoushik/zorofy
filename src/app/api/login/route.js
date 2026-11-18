import { NextResponse } from "next/server";
import { encode } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import dbConnect from "@/utils/dbconnect";
import User from "@/models/User";
import authSecret from "@/utils/authSecret";
import { userEmailFilter } from "@/utils/userLookup";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");
    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Enter your email and password." }, { status: 400 });
    }
    if (!authSecret) {
      return NextResponse.json({ success: false, message: "Authentication is not configured. Set NEXTAUTH_SECRET in .env.local." }, { status: 503 });
    }

    await dbConnect();
    const user = await User.findOne(userEmailFilter(email));
    if (!user?.password || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ success: false, message: "Email or password is incorrect." }, { status: 401 });
    }

    const token = await encode({
      secret: authSecret,
      token: {
        sub: user._id.toString(),
        id: user._id.toString(),
        email: user.email,
        name: user.userName,
        userName: user.userName,
        picture: user.imageUrl,
        imageUrl: user.imageUrl,
      },
    });
    const secure = process.env.NEXTAUTH_URL?.startsWith("https://") || Boolean(process.env.VERCEL);
    const cookieName = secure ? "__Secure-next-auth.session-token" : "next-auth.session-token";
    const response = NextResponse.json({
      success: true,
      message: "Logged in successfully.",
      data: { user: { id: user._id.toString(), userName: user.userName, email: user.email, imageUrl: user.imageUrl } },
    });
    response.cookies.set(cookieName, token, {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });
    return response;
  } catch (error) {
    if (/define MONGODB_URL|MONGODB_URI/i.test(error?.message || "")) {
      return NextResponse.json({ success: false, message: "Account storage is not configured. Add MONGODB_URI to .env.local." }, { status: 503 });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ success: false, message: "The login request was invalid. Please try again." }, { status: 400 });
    }
    console.error("Login failed:", error?.name || "Unknown error");
    return NextResponse.json({ success: false, message: "Could not log in. Check the account database configuration and try again." }, { status: 500 });
  }
}
