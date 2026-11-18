const API = "https://www.googleapis.com/youtube/v3";
const LANGUAGES = { hindi: "hi", kannada: "kn", telugu: "te", tamil: "ta", malayalam: "ml", punjabi: "pa", bengali: "bn", marathi: "mr", english: "en", international: "en" };
const apiCache = new Map();
const pendingApiRequests = new Map();

export class YouTubeApiError extends Error {
  constructor(message, status = 500, reason = "", retryAfter = "") { super(message); this.status = status; this.reason = reason; this.retryAfter = retryAfter; }
}

async function youtube(resource, params, revalidate = 21600) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new YouTubeApiError("Zorofy music services are not configured. Please contact support.", 503);
  const queryKey = `${resource}?${new URLSearchParams(params)}`;
  const cached = apiCache.get(queryKey);
  if (cached?.expiresAt > Date.now()) return cached.payload;
  if (pendingApiRequests.has(queryKey)) return pendingApiRequests.get(queryKey);
  const request = (async () => {
    const query = new URLSearchParams({ ...params, key });
    let response;
    try { response = await fetch(`${API}/${resource}?${query}`, { next: { revalidate } }); }
    catch { throw new YouTubeApiError("Could not reach the music service. Check your connection and retry.", 502); }
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const reason = payload?.error?.errors?.[0]?.reason || "";
      const retryAfter = response.headers.get("retry-after") || "";
      const isQuota = reason === "quotaExceeded" || reason === "dailyLimitExceeded" || response.status === 429;
      const isRateLimited = response.status === 429 || reason === "rateLimitExceeded" || reason === "userRateLimitExceeded";
      const message = isQuota
        ? "Zorofy has reached its daily music search limit. Please try again later."
        : isRateLimited
          ? "Zorofy has reached its current music search limit. Please try again later."
          : reason === "keyInvalid" || reason === "accessNotConfigured"
            ? "Zorofy music services need configuration. Please contact support."
            : `Your music request could not be completed (${response.status}).`;
      throw new YouTubeApiError(message, response.status, reason, retryAfter);
    }
    apiCache.set(queryKey, { payload, expiresAt: Date.now() + revalidate * 1000 });
    if (apiCache.size > 300) apiCache.delete(apiCache.keys().next().value);
    return payload;
  })();
  pendingApiRequests.set(queryKey, request);
  try { return await request; }
  finally { if (pendingApiRequests.get(queryKey) === request) pendingApiRequests.delete(queryKey); }
}

const thumb = (snippet) => {
  const thumbnails = snippet?.thumbnails || {};
  return thumbnails.maxres?.url || thumbnails.standard?.url || thumbnails.high?.url || thumbnails.medium?.url || thumbnails.default?.url || "";
};
const imageList = (snippet) => {
  const thumbnails = snippet?.thumbnails || {};
  return [thumbnails.default, thumbnails.medium, thumbnails.high, thumbnails.standard, thumbnails.maxres].filter((image) => image?.url).map((image) => ({ url: image.url, width: image.width, height: image.height }));
};
const durationSeconds = (value = "") => {
  const match = value.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  return match ? Number(match[1] || 0) * 3600 + Number(match[2] || 0) * 60 + Number(match[3] || 0) : 0;
};

export function normalizeVideo(item) {
  const snippet = item?.snippet || {};
  const id = typeof item?.id === "string" ? item.id : item?.id?.videoId;
  if (!id) return null;
  return { id, videoId: id, type: "song", name: snippet.title || "Untitled video", title: snippet.title || "Untitled video", subtitle: snippet.channelTitle || "Zorofy", channelTitle: snippet.channelTitle || "", channelId: snippet.channelId || "", categoryId: snippet.categoryId || "", image: imageList(snippet), thumbnail: thumb(snippet), description: snippet.description || "", publishedAt: snippet.publishedAt || "", duration: durationSeconds(item?.contentDetails?.duration), embeddable: item?.status?.embeddable !== false };
}

function isMusicVideo(video) {
  const title = `${video?.title || ""} ${video?.name || ""}`;
  return video?.categoryId === "10" && video?.duration >= 60 && !/(?:#|\b)(?:shorts?|ytshorts|youtubeshorts)\b/i.test(title) && video?.embeddable !== false;
}

export function normalizePlaylist(item) {
  const snippet = item?.snippet || {};
  const id = typeof item?.id === "string" ? item.id : item?.id?.playlistId;
  if (!id) return null;
  return { id, playlistId: id, type: "playlist", title: snippet.title || "Your playlist", name: snippet.title || "Your playlist", subtitle: snippet.channelTitle || "Zorofy", channelTitle: snippet.channelTitle || "", description: snippet.description || "", image: imageList(snippet), thumbnail: thumb(snippet), itemCount: item?.contentDetails?.itemCount || 0 };
}

export async function videosByIds(ids) {
  const clean = [...new Set(ids.filter(Boolean))].slice(0, 50);
  if (!clean.length) return [];
  const result = await youtube("videos", { part: "snippet,contentDetails,status", id: clean.join(","), fields: "items(id,snippet(title,description,channelTitle,channelId,categoryId,publishedAt,thumbnails),contentDetails(duration),status(embeddable))" });
  return (result.items || []).map(normalizeVideo).filter(Boolean);
}

function relevanceLanguage(language) { return LANGUAGES[String(language || "").toLowerCase()] || "en"; }
function regionalQuery(language, fallback) {
  const names = { hindi: "Hindi", kannada: "Kannada", telugu: "Telugu", tamil: "Tamil", malayalam: "Malayalam", punjabi: "Punjabi", bengali: "Bengali", marathi: "Marathi", english: "English", international: "international" };
  return names[String(language || "").toLowerCase()] || fallback;
}

export async function discover(language = "hindi") {
  const lang = regionalQuery(language, "Indian");
  const publishedAfter = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
  const [popular, trendingResults, releases, featured] = await Promise.all([
    youtube("videos", { part: "snippet,contentDetails,status", chart: "mostPopular", regionCode: "IN", videoCategoryId: "10", maxResults: "24", fields: "items(id,snippet(title,description,channelTitle,channelId,categoryId,publishedAt,thumbnails),contentDetails(duration),status(embeddable))" }),
    youtube("search", { part: "snippet", q: `${lang} trending songs official music video`, type: "video", videoCategoryId: "10", videoEmbeddable: "true", regionCode: "IN", relevanceLanguage: relevanceLanguage(language), maxResults: "20", fields: "items(id(videoId),snippet(title,description,channelTitle,channelId,publishedAt,thumbnails))" }),
    youtube("search", { part: "snippet", q: `${lang} latest official music video`, type: "video", videoCategoryId: "10", videoEmbeddable: "true", regionCode: "IN", relevanceLanguage: relevanceLanguage(language), publishedAfter, order: "date", maxResults: "20", fields: "items(id(videoId),snippet(title,description,channelTitle,channelId,publishedAt,thumbnails))" }),
    youtube("search", { part: "snippet", q: `${lang} music playlist official`, type: "playlist", regionCode: "IN", relevanceLanguage: relevanceLanguage(language), maxResults: "20", fields: "items(id(playlistId),snippet(title,description,channelTitle,thumbnails))" }),
  ]);
  const popularVideos = (popular.items || []).map(normalizeVideo).filter(isMusicVideo);
  const trendingIds = (trendingResults.items || []).map((item) => item?.id?.videoId).filter(Boolean);
  const trendingDetails = trendingIds.length ? await videosByIds(trendingIds) : [];
  const trendingById = new Map(trendingDetails.map((item) => [item.id, item]));
  const trending = trendingIds.map((id) => trendingById.get(id)).filter(isMusicVideo);
  const newReleaseIds = (releases.items || []).map((item) => item?.id?.videoId).filter(Boolean);
  const newReleases = newReleaseIds.length ? (await videosByIds(newReleaseIds)).filter(isMusicVideo) : [];
  return { trending: { songs: trending, albums: [] }, charts: popularVideos.slice(0, 12), albums: newReleases, playlists: (featured.items || []).map(normalizePlaylist).filter(Boolean) };
}

export async function searchYouTube(query, type = "video", pageToken = "") {
  const allowed = ["video", "playlist", "channel"];
  if (!allowed.includes(type)) throw new YouTubeApiError("Choose videos, playlists, or artists to search.", 400);
  const normalizedQuery = String(query || "").toLowerCase();
  const matchedLanguage = Object.keys(LANGUAGES).find((language) => normalizedQuery.includes(language)) || "english";
  const params = { part: "snippet", q: query, type, regionCode: "IN", relevanceLanguage: relevanceLanguage(matchedLanguage), maxResults: "24", fields: "nextPageToken,items(id(videoId,playlistId,channelId),snippet(title,description,channelTitle,channelId,publishedAt,thumbnails))" };
  if (type === "video") params.videoEmbeddable = "true";
  if (type === "video") params.videoCategoryId = "10";
  if (pageToken) params.pageToken = pageToken;
  const result = await youtube("search", params, 3600);
  let items = (result.items || []).map((item) => type === "video" ? normalizeVideo(item) : type === "playlist" ? normalizePlaylist(item) : ({ id: item?.id?.channelId, type: "artist", title: item?.snippet?.title || "", name: item?.snippet?.title || "", subtitle: item?.snippet?.customUrl || item?.snippet?.channelTitle || "YouTube channel", description: item?.snippet?.description || "", thumbnail: thumb(item.snippet), image: imageList(item.snippet), channelId: item?.id?.channelId })).filter((item) => item?.id);
  if (type === "video" && items.length) {
    const details = await videosByIds(items.map((item) => item.id));
    const byId = new Map(details.map((item) => [item.id, item]));
    items = items.map((item) => byId.get(item.id)).filter(isMusicVideo);
  }
  return { items, nextPageToken: result.nextPageToken || "", totalResults: result.pageInfo?.totalResults || 0 };
}

export async function playlistPage(playlistId, pageToken = "") {
  const [playlistData, tracks] = await Promise.all([
    youtube("playlists", { part: "snippet,contentDetails", id: playlistId, fields: "items(id,snippet(title,description,channelTitle,thumbnails),contentDetails(itemCount))" }),
    youtube("playlistItems", { part: "snippet,contentDetails", playlistId, maxResults: "50", ...(pageToken ? { pageToken } : {}), fields: "nextPageToken,items(snippet(title,description,channelTitle,channelId,publishedAt,thumbnails,resourceId(videoId)),contentDetails(videoId))" }, 3600),
  ]);
  const entries = (tracks.items || []).map((item) => ({ id: item?.contentDetails?.videoId || item?.snippet?.resourceId?.videoId, snippet: item?.snippet })).filter((item) => item.id);
  const details = await videosByIds(entries.map((item) => item.id));
  const byId = new Map(details.map((item) => [item.id, item]));
  const videos = entries.map((item) => byId.get(item.id)).filter(isMusicVideo);
  return { playlist: normalizePlaylist(playlistData.items?.[0]) || { id: playlistId, title: "Your playlist", type: "playlist" }, items: videos, nextPageToken: tracks.nextPageToken || "" };
}
