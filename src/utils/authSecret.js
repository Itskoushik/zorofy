// Use one secret for NextAuth sessions and the app's authenticated API routes.
const authSecret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;

export default authSecret;
