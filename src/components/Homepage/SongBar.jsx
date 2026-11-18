"use client";
import { useDispatch, useSelector } from "react-redux";
import { playPause, setActiveSong, setFullScreen } from "@/redux/features/playerSlice";
import { FaPlayCircle } from "react-icons/fa";

export default function SongBar({ playlist: song, i }) {
  const dispatch = useDispatch();
  const currentSongs = useSelector((state) => state.player.currentSongs || []);
  const image = song?.thumbnail || song?.image?.[2]?.url || song?.image?.[1]?.url || "/logo.png";
  return <button type="button" onClick={() => { const index = currentSongs.findIndex((item) => item.id === song.id); const queue = index >= 0 ? currentSongs : [...currentSongs, song]; dispatch(setActiveSong({ song, data: queue, i: index >= 0 ? index : queue.length - 1 })); dispatch(setFullScreen(true)); dispatch(playPause(true)); }} className="group mb-2 flex w-full cursor-pointer items-center rounded-2xl border border-white/[0.06] bg-[#101A14]/80 p-3 text-left transition hover:border-[#00E676]/25 hover:bg-[#14231A]">
    <h3 className="mr-3 text-base font-extrabold text-white">{i + 1}.</h3><img width={80} height={80} loading="lazy" alt="" src={image} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/logo.png"; }} className="h-16 w-16 shrink-0 rounded-lg object-cover sm:h-20 sm:w-20"/><span className="mx-3 min-w-0 flex-1"><span className="block truncate font-semibold text-white md:text-lg">{song?.title || song?.name}</span><span className="mt-1 block truncate text-sm text-gray-300">{song?.channelTitle || "Zorofy"}</span></span><FaPlayCircle size={30} className="shrink-0 text-gray-300 transition group-hover:scale-110" />
  </button>;
}
