import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    databaseConfigured: Boolean(process.env.MONGODB_URL || process.env.MONGODB_URI),
    googleEnabled: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  }, {
    headers: { "Cache-Control": "no-store" },
  });
}
