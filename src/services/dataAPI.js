export class MusicApiError extends Error {
  constructor(message, status = 0, retryAfter = "", reason = "") { super(message); this.name = "MusicApiError"; this.status = status; this.retryAfter = retryAfter; this.reason = reason; }
}

const query = (params) => new URLSearchParams(Object.entries(params).filter(([, value]) => value != null && value !== "")).toString();
const responseCache = new Map();
const pendingRequests = new Map();
const read = async (url, _signal) => {
  const now = Date.now();
  const cached = responseCache.get(url);
  if (cached && cached.expiresAt > now) return cached.payload;
  if (pendingRequests.has(url)) return pendingRequests.get(url);
  const request = (async () => {
    // Identical lookups share an in-flight request; canceled views ignore the result,
    // while the successful response stays cached for the next search render.
    const response = await fetch(url);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new MusicApiError(payload?.message || `Music request failed (${response.status}).`, response.status, response.headers.get("retry-after") || "", payload?.reason || "");
    responseCache.set(url, { payload, expiresAt: Date.now() + 5 * 60_000 });
    if (responseCache.size > 150) responseCache.delete(responseCache.keys().next().value);
    return payload;
  })();
  pendingRequests.set(url, request);
  try { return await request; }
  finally { if (pendingRequests.get(url) === request) pendingRequests.delete(url); }
};

export async function homePageData(languages = [], options = {}) {
  const language = Array.isArray(languages) ? languages[0] : languages;
  return (await read(`/api/youtube/discover?${query({ language })}`, options.signal))?.data;
}
export async function searchYouTube(search, type = "video", pageToken = "", options = {}) {
  return (await read(`/api/youtube/search?${query({ q: search, type, pageToken })}`, options.signal))?.data;
}
export async function getplaylistData(id, pageToken = "", options = {}) {
  return (await read(`/api/youtube/playlists/${encodeURIComponent(id)}?${query({ pageToken })}`, options.signal))?.data;
}
export async function getVideosData(ids, options = {}) {
  const list = [...new Set((Array.isArray(ids) ? ids : [ids]).filter(Boolean).map(String))];
  const chunks = [];
  for (let index = 0; index < list.length; index += 50) chunks.push(list.slice(index, index + 50));
  const pages = await Promise.all(chunks.map(async (chunk) => (await read(`/api/youtube/videos?${query({ ids: chunk.join(",") })}`, options.signal))?.data?.items || []));
  const byId = new Map(pages.flat().map((item) => [item.id, item]));
  return list.map((id) => byId.get(id)).filter(Boolean);
}
export async function getSongData(id) { return getVideosData([id]); }
export async function getSearchedData(search) { return searchYouTube(search, "video"); }
export async function getRecommendedVideos(song, options = {}) {
  const title = String(song?.title || song?.name || "").replace(/\s*\([^)]*official[^)]*\)/ig, "").trim();
  const channel = String(song?.channelTitle || "").trim();
  if (!title) return [];
  const search = await searchYouTube(`${title} ${channel} similar music`, "video", "", options);
  return (search?.items || []).filter((item) => item.id !== song?.id).slice(0, 8);
}
export async function addFavourite(song) {
  const response = await fetch("/api/favourite", { method: "POST", body: JSON.stringify(song), headers: { "Content-Type": "application/json" } });
  const result = await response.json();
  if (!response.ok || result?.success === false) throw new Error(result?.message || `Could not update favourites (${response.status}).`);
  return result;
}
export async function getFavourite() {
  const response = await fetch("/api/favourite"); const result = await response.json();
  if (!response.ok) throw new Error(result?.message || `Could not load favourites (${response.status}).`);
  return result?.data?.favourites || [];
}
export async function getUserInfo() {
  const response = await fetch("/api/userInfo"); const result = await response.json();
  if (!response.ok) throw new Error(result?.message || `Could not load your account (${response.status}).`); return result?.data;
}
export async function resetPassword(password, confirmPassword, token) {
  const response = await fetch("/api/forgotPassword", { method: "PUT", body: JSON.stringify({ password, confirmPassword, token }), headers: { "Content-Type": "application/json" } });
  const result = await response.json(); if (!response.ok) throw new Error(result?.message || `Password reset failed (${response.status}).`); return result;
}
export async function sendResetPasswordLink(email) {
  const response = await fetch("/api/forgotPassword", { method: "POST", body: JSON.stringify({ email }), headers: { "Content-Type": "application/json" } });
  const result = await response.json(); if (!response.ok) throw new Error(result?.message || `Could not send the reset link (${response.status}).`); return result;
}
