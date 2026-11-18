"use client";
import React, { memo, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector, useStore } from "react-redux";
import PlayPause from "../PlayPause";
import { playPause, setActiveSong, setFullScreen } from "../../redux/features/playerSlice";
import { getRecommendedVideos } from "@/services/dataAPI";

const SongCard = ({ song, isPlaying, activeSong }) => {
  const [loading] = useState(false);
  const player = useSelector((state) => state.player);
  const currentSongs = player.currentSongs || [];
  const autoAdd = player.autoAdd;
  const selectedSong = activeSong || player.activeSong;
  const playing = isPlaying ?? player.isPlaying;
  const dispatch = useDispatch();
  const store = useStore();
  const handlePauseClick = () => dispatch(playPause(false));
  const handlePlayClick = () => {
    if (!song?.id || song.type !== "song") return;
    const existingIndex = currentSongs.findIndex((item) => item?.id === song.id);
    const queue = existingIndex >= 0 ? currentSongs : [...currentSongs, song];
    dispatch(setActiveSong({ song, data: queue, i: existingIndex >= 0 ? existingIndex : queue.length - 1 }));
    dispatch(setFullScreen(true));
    dispatch(playPause(true));
    if (autoAdd) {
      getRecommendedVideos(song).then((recommendations) => {
        const currentPlayer = store.getState().player;
        if (currentPlayer.activeSong?.id !== song.id) return;
        const latest = currentPlayer.currentSongs || [];
        const known = new Set([...latest, song].map((item) => item.id));
        const additions = recommendations.filter((item) => item.id && !known.has(item.id));
        if (additions.length) {
          const index = latest.findIndex((item) => item.id === song.id);
          const queue = index >= 0 ? latest : [...latest, song];
          dispatch(setActiveSong({ song, data: [...queue, ...additions], i: index >= 0 ? index : queue.length - 1 }));
        }
      }).catch((error) => console.warn("YouTube recommendations could not be loaded", error));
    }
  };
  const image = song?.thumbnail || song?.image?.[2]?.url || song?.image?.[1]?.url || song?.image?.[0]?.url || "/logo.png";
  return (
    <div className="group/card flex w-full flex-col rounded-2xl border border-white/[0.06] bg-[#101A14]/80 p-2.5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#00E676]/25 hover:bg-[#14231A] hover:shadow-[0_12px_34px_rgba(0,230,118,.08)] lg:w-[205px]">
      <Link aria-label={song?.title || song?.name || "Open music item"} href={song?.type === "playlist" ? `/playlist/${song.id}` : song?.type === "artist" ? `https://www.youtube.com/channel/${song.id}` : "/"} target={song?.type === "artist" ? "_blank" : undefined} rel={song?.type === "artist" ? "noreferrer" : undefined} onClick={(event) => { if (song?.type === "song") { event.preventDefault(); handlePlayClick(); } }}>
        <div className="group relative aspect-square w-full overflow-hidden rounded-xl">
          <div className={`absolute inset-0 items-center justify-center bg-black/70 p-2 group-hover:flex ${selectedSong?.id === song?.id ? "flex" : "hidden"}`}>
            {song?.type === "song" && <PlayPause isPlaying={playing} activeSong={selectedSong} song={song} loading={loading} handlePause={handlePauseClick} handlePlay={handlePlayClick} />}
          </div>
          <img width={200} height={200} loading="lazy" alt={song?.title || song?.name || "Music artwork"} src={image} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/logo.png"; }} className="h-full w-full rounded-xl object-cover transition duration-500 group-hover:scale-[1.04]" />
        </div>
        <div className="mt-2 flex min-w-0 flex-col lg:mt-4">
          <p className="w-full truncate text-xs font-semibold text-zorofy-text lg:text-sm">{song?.title || song?.name}</p>
          <p className="mt-1 truncate text-[9px] text-zorofy-muted lg:text-xs">{song?.channelTitle || song?.subtitle || "Zorofy"}</p>
        </div>
      </Link>
    </div>
  );
};

export default memo(SongCard, (prev, next) => prev.song === next.song && prev.activeSong === next.activeSong && prev.isPlaying === next.isPlaying);
