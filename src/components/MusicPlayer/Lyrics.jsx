"use client";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setActiveSong, setAutoAdd } from "@/redux/features/playerSlice";
import { getRecommendedVideos } from "@/services/dataAPI";
import { useEffect, useState } from "react";
import SongsList from "../SongsList";
import ZorofyAudioLoader from "../ZorofyAudioLoader";

export default function Lyrics({ activeSong }) {
  const { currentSongs } = useSelector((state) => state.player);
  const { autoAdd } = useSelector((state) => state.player);
  const dispatch = useDispatch();
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);

  useEffect(() => {
    if (!activeSong?.id) { setRecommendations([]); return; }
    let cancelled = false;
    setRecommendationsLoading(true);
    getRecommendedVideos(activeSong).then((items) => {
      if (cancelled) return;
      setRecommendations(items);
      if (autoAdd && items.length) {
        const known = new Set(currentSongs.map((song) => song.id));
        const additions = items.filter((item) => !known.has(item.id));
        if (additions.length) {
          const currentIndex = currentSongs.findIndex((song) => song.id === activeSong.id);
          dispatch(setActiveSong({ song: activeSong, data: [...currentSongs, ...additions], i: currentIndex >= 0 ? currentIndex : 0 }));
        }
      }
    }).catch(() => { if (!cancelled) setRecommendations([]); }).finally(() => { if (!cancelled) setRecommendationsLoading(false); });
    return () => { cancelled = true; };
  }, [activeSong?.id, autoAdd]);
  return <section className="mx-auto mt-6 w-full max-w-xl" onClick={(event) => event.stopPropagation()}>
    <div className="flex items-center justify-between"><h2 className="text-xl font-semibold text-white">Up next</h2><label className="flex cursor-pointer items-center gap-2 text-xs text-gray-300"><input type="checkbox" checked={Boolean(autoAdd)} onChange={(event) => dispatch(setAutoAdd(event.target.checked))} className="accent-[#00E676]" />Auto-add related videos</label></div>
    {activeSong?.name && <p className="mt-1 text-center text-sm text-gray-400">Playing: {activeSong.name}</p>}
    {currentSongs?.length ? <div className="mt-4 max-h-[28vh] overflow-y-auto"><SongsList SongData={currentSongs} loading={false} hidePlays /></div> : <p className="mt-4 text-center text-gray-400">Your queue is empty.</p>}
    <h3 className="mt-5 text-sm font-semibold uppercase tracking-wide text-[#00E676]">Related tracks</h3>
    {recommendationsLoading ? <ZorofyAudioLoader size="small" mode="loading" label="Finding related tracks..." className="mt-3" /> : recommendations.length ? <div className="mt-2 max-h-[28vh] overflow-y-auto"><SongsList SongData={recommendations} loading={false} hidePlays /></div> : <p className="mt-3 text-sm text-gray-400">No related tracks found.</p>}
  </section>;
}
