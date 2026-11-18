"use client";
import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import { getplaylistData } from "@/services/dataAPI";
import { playPause, setActiveSong } from "@/redux/features/playerSlice";
import PlayButton from "@/components/PlayButton";
import SongsList from "@/components/SongsList";
import ZorofyAudioLoader from "@/components/ZorofyAudioLoader";

export default function PlaylistTracks({ playlist, playlistId }) {
  const dispatch = useDispatch();
  const [songs, setSongs] = useState(playlist?.songs || []);
  const [pageToken, setPageToken] = useState(playlist?.nextPageToken || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const total = Number(playlist?.itemCount || 0);
  const playlistWithSongs = useMemo(() => ({ ...playlist, songs }), [playlist, songs]);

  const handleLoadMore = async () => {
    if (!pageToken) return;
    setLoading(true); setError("");
    try {
      const result = await getplaylistData(playlistId, pageToken);
      const known = new Set(songs.map((song) => song.id));
      const items = (result?.items || []).filter((item) => item?.id && !known.has(item.id));
      setSongs((current) => [...current, ...items]); setPageToken(result?.nextPageToken || "");
      if (!items.length && result?.nextPageToken) setError("This page contained no playable videos. You can continue loading the playlist.");
    } catch (e) { setError(e.message || "Could not load more playlist videos."); }
    finally { setLoading(false); }
  };

  const handlePlayAll = async () => {
    setLoading(true); setError("");
    try {
      const queue = [...songs]; const seen = new Set(queue.map((song) => song.id)); let token = pageToken;
      while (token && (!total || queue.length < total)) {
        const result = await getplaylistData(playlistId, token);
        for (const item of result?.items || []) if (item?.id && !seen.has(item.id)) { seen.add(item.id); queue.push(item); }
        token = result?.nextPageToken || "";
      }
      setSongs(queue); setPageToken(token);
      if (total && queue.length < total) toast("Some videos may be unavailable or restricted.");
      if (queue.length) { dispatch(setActiveSong({ song: queue[0], data: queue, i: 0 })); dispatch(playPause(true)); }
    } catch (e) { setError(e.message || "Could not load the playlist queue."); }
    finally { setLoading(false); }
  };

  return <section className="mt-10 text-gray-200"><div className="flex flex-wrap items-center justify-between gap-4"><h2 className="text-3xl font-bold">Tracks <span className="text-base font-normal text-gray-400">{total ? `(${total})` : ""}</span></h2><PlayButton songList={playlistWithSongs} onPlay={handlePlayAll} loading={loading} /></div>{error && <p role="alert" className="mt-4 text-rose-300">{error}</p>}<SongsList SongData={songs} loading={false} />{pageToken && <button type="button" disabled={loading} onClick={handleLoadMore} className="my-6 rounded-lg border border-white/20 px-5 py-3 text-white disabled:opacity-50">{loading ? <><ZorofyAudioLoader size="small" mode="loading" />Loading tracks…</> : "Load more tracks"}</button>}</section>;
}
