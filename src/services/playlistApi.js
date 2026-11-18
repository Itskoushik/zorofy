async function request(url, options = {}) {
  let response;
  try {
    response = await fetch(url, { ...options, signal: options.signal || AbortSignal.timeout(15000) });
  } catch (error) {
    if (error?.name === "TimeoutError" || error?.name === "AbortError") {
      throw new Error("The playlist service took too long to respond.");
    }
    throw new Error("Could not reach the playlist service. Check your connection and sign-in status.");
  }
  let data;
  try { data = await response.json(); } catch { throw new Error(`Playlist service returned an invalid response (${response.status}).`); }
  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || `Playlist request failed (${response.status}).`);
  }
  return data;
}

const jsonRequest = (method, body) => ({
  method,
  headers: { "Content-Type": "application/json" },
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
});

export const createPlaylist = (name) => request("/api/userPlaylists", jsonRequest("POST", { name }));
export const getUserPlaylists = () => request("/api/userPlaylists");
export const deletePlaylist = (id) => request("/api/userPlaylists", jsonRequest("DELETE", { playlistId: id }));
export const addSongToPlaylist = (playlistID, song) => request("/api/userPlaylists/songs", jsonRequest("POST", { playlistID, song }));
export const deleteSongFromPlaylist = (playlistID, song) => request("/api/userPlaylists/songs", jsonRequest("DELETE", { playlistID, song }));
export const getSinglePlaylist = (id) => request(`/api/userPlaylists/songs?${new URLSearchParams({ playlist: id })}`);
