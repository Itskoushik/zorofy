import { discover, YouTubeApiError } from "@/services/youtubeServer";

export async function GET(request) {
  try {
    const language = new URL(request.url).searchParams.get("language") || "hindi";
    return Response.json({ success: true, data: await discover(language) }, { headers: { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=43200" } });
  } catch (error) {
    const apiError = error instanceof YouTubeApiError ? error : new YouTubeApiError("Music discovery could not be loaded.", 500);
    return Response.json({ success: false, message: apiError.message, reason: apiError.reason }, { status: apiError.status });
  }
}
