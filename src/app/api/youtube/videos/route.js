import { videosByIds, YouTubeApiError } from "@/services/youtubeServer";

export async function GET(request) {
  try {
    const ids = new URL(request.url).searchParams.get("ids")?.split(",") || [];
    if (ids.length > 50) return Response.json({ success: false, message: "You can request up to 50 videos at once." }, { status: 400 });
    return Response.json({ success: true, data: { items: await videosByIds(ids) } }, { headers: { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=43200" } });
  } catch (error) {
    const apiError = error instanceof YouTubeApiError ? error : new YouTubeApiError("Track details could not be loaded.", 500);
    return Response.json({ success: false, message: apiError.message, reason: apiError.reason }, { status: apiError.status });
  }
}
