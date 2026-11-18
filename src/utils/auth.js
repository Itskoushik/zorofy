import { getToken } from "next-auth/jwt";
import User from "@/models/User";
import dbConnect from "@/utils/dbconnect";
import authSecret from "@/utils/authSecret";

// check if user is logged in
export default async function auth(req) {
    try {
        const token = await getToken({ req, secret: authSecret });
        if (!token) {
            console.error("Token not found or invalid.");
            return null;
        }

        await dbConnect();  // Ensure db connection is established
        const user = await User.findOne({ email: token.email });
        if (!user) {
            return null;
        }
        return user;

    } catch (error) {
        console.error("Error in authentication:", error);
        return null;
    }
}
