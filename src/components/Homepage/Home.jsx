"use client";
import { homePageData } from "@/services/dataAPI";
import React from "react";
import { useEffect, useState } from "react";
import { SwiperSlide } from "swiper/react";
import SongCard from "./SongCard";
import { useDispatch, useSelector } from "react-redux";
import SwiperLayout from "./Swiper";
import { setProgress } from "@/redux/features/loadingBarSlice";
import SongCardSkeleton from "./SongCardSkeleton";
import { GiMusicalNotes } from 'react-icons/gi'
import SongBar from "./SongBar";
import OnlineStatus from "./OnlineStatus";
import ListenAgain from "./ListenAgain";


const Home = () => {
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const dispatch = useDispatch();
  const { activeSong, isPlaying, } = useSelector((state) => state.player);
  const { languages } = useSelector((state) => state.languages);
  const skeletonSlides = (prefix) => Array.from({ length: 6 }, (_, index) => (
    <SwiperSlide key={`${prefix}-skeleton-${index}`}><SongCardSkeleton /></SwiperSlide>
  ));

  // salutation
  const currentTime = new Date();
  const currentHour = currentTime.getHours();

  let salutation = '';
  if (currentHour >= 5 && currentHour < 12) {
    salutation = 'Good morning';
  } else if (currentHour >= 12 && currentHour < 18) {
    salutation = 'Good afternoon';
  } else {
    salutation = 'Good evening';
  }



  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const fetchData = async () => {
      setLoading(true);
      setApiError("");
      dispatch(setProgress(70))
      try {
        const res = await homePageData(languages, { signal: controller.signal });
        const hasBrowseItems = res?.trending?.songs?.length || res?.trending?.albums?.length || res?.charts?.length || res?.albums?.length || res?.playlists?.length;
        if (!hasBrowseItems) throw new Error("The music service returned no browse results. Check the API instance and try again.");
        if (!cancelled) setData(res || {});
      } catch (error) {
        if (!cancelled) {
          console.error("Unable to load homepage music", error);
          setApiError(error?.message || "Music could not be loaded.");
          setData({});
        }
      } finally {
        if (!cancelled) {
          dispatch(setProgress(100));
          setLoading(false);
        }
      }
    };
    fetchData();
    return () => { cancelled = true; controller.abort(); };
  }, [languages, retryCount, dispatch]);



  return (
    <div className="mx-auto w-full max-w-[1680px] px-4 pb-8 sm:px-6 lg:px-10">
      <OnlineStatus />
      <section className="relative mb-7 mt-7 overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-[#102017] via-[#0A100D] to-[#080B09] px-5 py-6 shadow-[0_18px_60px_rgba(0,0,0,.18)] sm:px-8 sm:py-8 lg:mb-10">
        <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full bg-[#00E676]/[0.08] blur-3xl" />
        <p className="relative mb-2 text-xs font-semibold uppercase tracking-[.2em] text-zorofy-green">Made for your mood</p>
        <h1 className="relative flex items-center gap-3 text-2xl font-semibold tracking-tight text-zorofy-text sm:text-3xl lg:text-4xl">{salutation}<GiMusicalNotes className="text-zorofy-green" /></h1>
        <p className="relative mt-2 max-w-xl text-sm text-zorofy-muted sm:text-base">Find your next favorite, from the latest Indian hits to music around the world.</p>
      </section>

      <ListenAgain />

      {apiError && (
        <div role="alert" className="my-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-rose-400/30 bg-rose-950/40 p-4 text-sm text-rose-100">
          <p>Music service unavailable: {apiError}</p>
          <button type="button" onClick={() => setRetryCount((count) => count + 1)} className="rounded-lg bg-white/10 px-4 py-2 font-semibold hover:bg-white/20">Retry</button>
        </div>
      )}

      {/* trending */}
      <SwiperLayout title={"Trending"} >
        {
          loading ? (
            skeletonSlides("trending")
          ) : (
            <>
              {data?.trending?.songs?.map(
                (song) =>
                (
                  <SwiperSlide key={song?.id}>
                    <SongCard song={song} activeSong={activeSong} isPlaying={isPlaying} />
                  </SwiperSlide>
                )
              )}

              {data?.trending?.albums?.map(
                (song) =>
                (
                  <SwiperSlide key={song?.id}>
                    <SongCard song={song} activeSong={activeSong} isPlaying={isPlaying} />
                  </SwiperSlide>
                )
              )}
              {!data?.trending?.songs?.length && !data?.trending?.albums?.length && (
                <SwiperSlide><p className="p-4 text-sm text-gray-400">No trending tracks are available.</p></SwiperSlide>
              )}
            </>
          )
        }
      </SwiperLayout>

      {/* top charts */}
      <div className="my-4 lg:mt-14">
        <h2 className=" text-white mt-4 text-2xl lg:text-3xl font-semibold mb-4 ">Top Charts</h2>
        <div className="grid lg:grid-cols-2 gap-x-10 max-h-96 lg:max-h-full lg:overflow-y-auto overflow-y-scroll">
          {
            loading ? (
              <div className="flex w-[90vw] gap-3 overflow-hidden">
                {Array.from({ length: 6 }, (_, index) => <div key={`chart-skeleton-${index}`} className="w-48 shrink-0"><SongCardSkeleton /></div>)}
              </div>
            ) : (
              data?.charts?.slice(0, 10)?.map(
                (playlist, index) =>
                (
                  <SongBar key={playlist?.id} playlist={playlist} i={index} />
                ))
            )
          }
          {!loading && !data?.charts?.length && <p className="py-5 text-sm text-gray-400">No charts are available right now.</p>}
        </div>
      </div>

      {/* New Releases */}
      <SwiperLayout title={"New Releases"}>
        {
          loading ? (
            skeletonSlides("releases")
          ) : (
            data?.albums?.map(
              (song) =>
              (
                <SwiperSlide key={song?.id}>
                  <SongCard song={song} activeSong={activeSong} isPlaying={isPlaying} />
                </SwiperSlide>
              )
            )
          )
        }
        {!loading && !data?.albums?.length && <SwiperSlide><p className="p-4 text-sm text-gray-400">No new releases are available.</p></SwiperSlide>}
      </SwiperLayout>

      {/* featured playlists */}
      <SwiperLayout title={"Featured Playlists"}>
        {
          loading ? (
            skeletonSlides("playlists")
          ) : (
            data?.playlists?.map(
              (song) =>
              (
                <SwiperSlide key={song?.id}>
                  <SongCard key={song?.id} song={song} activeSong={activeSong} isPlaying={isPlaying} />
                </SwiperSlide>
              )
            )
          )
        }
        {!loading && !data?.playlists?.length && <SwiperSlide><p className="p-4 text-sm text-gray-400">No featured playlists are available.</p></SwiperSlide>}
      </SwiperLayout>

    </div>
  );
};

export default Home;
