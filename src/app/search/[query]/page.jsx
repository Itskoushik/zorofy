"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import SongCard from "@/components/Homepage/SongCard";
import { searchYouTube } from "@/services/dataAPI";
import { useDispatch } from "react-redux";
import { setProgress } from "@/redux/features/loadingBarSlice";
import ZorofyAudioLoader from "@/components/ZorofyAudioLoader";

const tabs = [{ id: "video", label: "Songs" }, { id: "playlist", label: "Playlists" }, { id: "channel", label: "Artists" }];

export default function SearchPage() {
  const params = useParams();
  const query = decodeURIComponent(String(params.query || ""));
  const dispatch = useDispatch();
  const [type, setType] = useState("video");
  const [items, setItems] = useState([]);
  const [pageToken, setPageToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [retryWait, setRetryWait] = useState(0);
  const [quotaExhausted, setQuotaExhausted] = useState(false);

  useEffect(() => {
    if (!retryWait) return;
    const timer = setTimeout(() => setRetryWait((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => clearTimeout(timer);
  }, [retryWait]);

  useEffect(() => {
    const controller = new AbortController();
    if (query.trim().length < 2) {
      setItems([]); setPageToken(""); setError(""); setLoading(false);
      return () => controller.abort();
    }
    const timer = setTimeout(async () => {
      setLoading(true); setError(""); setQuotaExhausted(false); setItems([]); setPageToken(""); dispatch(setProgress(65));
      try {
        const result = await searchYouTube(query, type, "", { signal: controller.signal });
        if (!controller.signal.aborted) { setItems(result?.items || []); setPageToken(result?.nextPageToken || ""); setRetryWait(0); }
      } catch (e) {
        if (!controller.signal.aborted) {
          setError(e.message || "Search could not be completed.");
          setQuotaExhausted(e.status === 429 || ["quotaExceeded", "dailyLimitExceeded"].includes(e.reason) || /music search limit/i.test(e.message || ""));
          if (e.status === 429) setRetryWait(Math.max(5, Math.min(60, Number(e.retryAfter) || 15)));
        }
      }
      finally { if (!controller.signal.aborted) { setLoading(false); dispatch(setProgress(100)); } }
    }, 500);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query, type, retry, dispatch]);

  const loadMore = async () => {
    if (!pageToken || loading) return;
    setLoading(true); setError("");
    try { const result = await searchYouTube(query, type, pageToken); setItems((current) => [...current, ...(result?.items || [])]); setPageToken(result?.nextPageToken || ""); }
    catch (e) { setError(e.message || "Could not load more results."); }
    finally { setLoading(false); }
  };

  return <main className="mx-auto mt-12 w-11/12 max-w-7xl pb-8 text-gray-100">
    <h1 className="text-2xl font-bold sm:text-3xl">Search results for {query}</h1>
    <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Search type">
      {tabs.map((tab) => <button key={tab.id} role="tab" aria-selected={type === tab.id} onClick={() => setType(tab.id)} className={`rounded-full px-4 py-2 text-sm ${type === tab.id ? "bg-[#00E676] font-semibold text-slate-950" : "bg-white/10 text-white hover:bg-white/20"}`}>{tab.label}</button>)}
    </div>
    {error && <div role="alert" className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-400/30 bg-rose-950/40 p-4 text-rose-100"><p>{error}</p>{!quotaExhausted && <button disabled={retryWait > 0} onClick={() => setRetry((n) => n + 1)} className="rounded-lg bg-white/10 px-4 py-2 disabled:cursor-wait disabled:opacity-50">{retryWait ? `Retry in ${retryWait}s` : "Retry"}</button>}</div>}
    {loading && !items.length ? <ZorofyAudioLoader size="large" mode="loading" label="Finding your next favourite..." className="mx-auto w-full py-16" /> : items.length ? <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">{items.map((item) => <SongCard key={`${type}-${item.id}`} song={item} />)}</div> : !error && <p className="py-16 text-center text-gray-400">No {type === "video" ? "music videos" : type === "playlist" ? "playlists" : "artists"} found. Try another search.</p>}
    {pageToken && <div className="mt-8 text-center"><button onClick={loadMore} disabled={loading} className="rounded-lg border border-white/20 px-6 py-3 font-semibold text-white disabled:opacity-50">{loading ? "Loading…" : "Load more"}</button></div>}
  </main>;
}
