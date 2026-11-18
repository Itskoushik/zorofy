"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import PlaylistTracks from "@/components/PlaylistTracks";
import { getplaylistData } from "@/services/dataAPI";

export default function PlaylistPage() {
  const params = useParams();
  const playlistId = String(params.playlistId || "");
  const [playlist, setPlaylist] = useState(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    getplaylistData(playlistId, "", { signal: controller.signal }).then((result) => {
      if (!controller.signal.aborted) setPlaylist({ ...result.playlist, songs: result.items || [], nextPageToken: result.nextPageToken || "" });
    }).catch((e) => { if (!controller.signal.aborted) setError(e.message || "This playlist could not be loaded."); });
    return () => controller.abort();
  }, [playlistId, retry]);

  if (error) return <main className="mx-auto mt-20 w-11/12 max-w-4xl rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white"><h1 className="text-2xl font-bold">Playlist unavailable</h1><p role="alert" className="mt-3 text-gray-300">{error}</p><button onClick={() => { setError(""); setRetry((n) => n + 1); }} className="mt-6 rounded-lg bg-[#00E676] px-5 py-2 font-semibold text-slate-950">Retry</button></main>;
  if (!playlist) return <p role="status" className="py-24 text-center text-gray-400">Loading playlist…</p>;
  const cover = playlist.thumbnail || playlist.image?.[2]?.url || playlist.image?.[1]?.url;
  return <main className="mx-auto mt-12 w-11/12 max-w-7xl pb-8">
    <header className="flex flex-col items-center gap-8 sm:flex-row sm:items-end">
      {cover && <img className="h-56 w-56 rounded-2xl object-cover shadow-lg" src={cover} alt={playlist.title || "Playlist artwork"} />}
      <div className="text-center text-gray-100 sm:text-left"><p className="text-sm font-semibold uppercase tracking-wider text-[#00E676]">Playlist</p><h1 className="mt-2 text-2xl font-bold lg:text-4xl">{playlist.title}</h1><p className="mt-3 text-gray-300">{playlist.channelTitle} · {playlist.itemCount || playlist.songs.length} tracks</p>{playlist.description && <p className="mt-3 max-w-2xl text-sm text-gray-400">{playlist.description}</p>}</div>
    </header>
    <PlaylistTracks playlist={playlist} playlistId={playlistId} />
  </main>;
}
