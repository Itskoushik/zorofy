import { searchYouTube, YouTubeApiError } from "@/services/youtubeServer";

export async function GET(request) {
  try {
    const params = new URL(request.url).searchParams;
    const q = params.get("q")?.trim();
    if (!q) return Response.json({ success: true, data: { items: [], nextPageToken: "", totalResults: 0 } });
    if (q.length > 180) return Response.json({ success: false, message: "Search text must be 180 characters or fewer." }, { status: 400 });
    const data = await searchYouTube(q, params.get("type") || "video", params.get("pageToken") || "");
    return Response.json({ success: true, data }, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" } });
  } catch (error) {
    const apiError = error instanceof YouTubeApiError ? error : new YouTubeApiError("Search could not be completed.", 500);
    return Response.json(
      { success: false, message: apiError.message, reason: apiError.reason },
      { status: apiError.status, headers: apiError.retryAfter ? { "Retry-After": apiError.retryAfter } : undefined },
    );
  }
}
