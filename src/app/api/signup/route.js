import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbconnect";
import User from "@/models/User";
import UserData from "@/models/UserData";
import bcrypt from "bcryptjs";
import { userEmailFilter } from "@/utils/userLookup";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  let userData;
  try {
    const body = await request.json();
    const userName = String(body?.userName || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");
    const confirmPassword = String(body?.confirmPassword || "");

    if (!userName || !email || !password) {
      return NextResponse.json({ success: false, message: "Enter a username, email, and password." }, { status: 400 });
    }
    if (userName.length < 2 || userName.length > 40) {
      return NextResponse.json({ success: false, message: "Username must be between 2 and 40 characters." }, { status: 400 });
    }
    if (!emailPattern.test(email) || email.length > 254) {
      return NextResponse.json({ success: false, message: "Enter a valid email address." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ success: false, message: "Password must be at least 8 characters." }, { status: 400 });
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ success: false, message: "Passwords do not match." }, { status: 400 });
    }

    await dbConnect();
    const existingUser = await User.findOne(userEmailFilter(email));
    if (existingUser) {
      return NextResponse.json({ success: false, message: "An account with this email already exists. Try logging in." }, { status: 409 });
    }

    userData = await UserData.create({});
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await User.create({
      userName,
      email,
      password: passwordHash,
      imageUrl: `/logo.png`,
      userData: userData._id,
    });

    return NextResponse.json({
      success: true,
      message: "Account created successfully.",
      data: { id: result._id.toString(), userName: result.userName, email: result.email },
    }, { status: 201 });
  } catch (error) {
    if (userData?._id) await UserData.deleteOne({ _id: userData._id }).catch(() => {});
    if (/define MONGODB_URL|MONGODB_URI/i.test(error?.message || "")) {
      return NextResponse.json({ success: false, message: "Account storage is not configured. Add MONGODB_URI to .env.local and restart the app." }, { status: 503 });
    }
    if (error?.code === 11000) {
      return NextResponse.json({ success: false, message: "An account with this email already exists. Try logging in." }, { status: 409 });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ success: false, message: "The signup request was invalid. Please try again." }, { status: 400 });
    }
    console.error("Signup failed:", error?.name || "Unknown error");
    return NextResponse.json({ success: false, message: "Could not create your account. Check the account database configuration and try again." }, { status: 500 });
  }
}
