import { playlistPage, YouTubeApiError } from "@/services/youtubeServer";

export async function GET(request, { params }) {
  try {
    const pageToken = new URL(request.url).searchParams.get("pageToken") || "";
    const data = await playlistPage(params.playlistId, pageToken);
    return Response.json({ success: true, data }, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" } });
  } catch (error) {
    const apiError = error instanceof YouTubeApiError ? error : new YouTubeApiError("Playlist tracks could not be loaded.", 500);
    return Response.json({ success: false, message: apiError.message, reason: apiError.reason }, { status: apiError.status });
  }
}
