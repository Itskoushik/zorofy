import Lyrics from "./Lyrics";
import React from "react";
import { useDispatch } from "react-redux";
import { setFullScreen } from "@/redux/features/playerSlice";
import { useSwipeable } from "react-swipeable";

const FullscreenTrack = ({
  fullScreen,
  activeSong,
  videoExpanded,
  largeVideo,
  handlePrevSong,
  handleNextSong,
}) => {
  const dispatch = useDispatch();
  const handlers = useSwipeable({
    onSwipedLeft: () => handleNextSong(),
    onSwipedRight: () => handlePrevSong(),
    onSwipedDown: () => dispatch(setFullScreen(false)),
    preventDefaultTouchmoveEvent: true,
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  return (
    <div
      className={`${fullScreen ? "flex" : "hidden"} ${largeVideo ? "fullscreen-track-below-video" : ""} w-full max-w-[1000px] px-4 mx-auto flex-row items-center justify-between gap-4 pt-3`}
    >
      <div className="flex flex-col items-center lg:w-96">
        <button type="button" {...handlers} onClick={(event) => { event.stopPropagation(); dispatch(setFullScreen(false)); }} aria-label="Collapse expanded track artwork" aria-hidden={!videoExpanded} className={`fullscreen-track-artwork ${largeVideo ? "h-32 w-32" : "h-[200px] w-[200px]"} shrink-0 overflow-hidden rounded-2xl shadow-xl ring-1 ring-white/10 ${videoExpanded ? "visible" : "invisible pointer-events-none"}`}>
          <img
            src={
              activeSong?.image?.[2]?.url ||
              activeSong?.image?.[1]?.url ||
              activeSong?.image?.[0]?.url ||
              "/logo.png"
            }
            alt="cover art"
            onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/logo.png"; }}
            width={500}
            height={500}
            className="h-full w-full object-cover"
          />
        </button>
        <div
          onClick={(e) => e.stopPropagation()}
          className="min-w-0 flex-1 select-none text-left"
        >
          <p className="truncate text-white font-bold text-base sm:text-xl mb-1">
            {activeSong?.name
              ? activeSong?.name.replace("&#039;", "'").replace("&amp;", "&")
              : "Song"}
          </p>
          <p className="truncate text-gray-300">
            {activeSong?.channelId ? <a className="hover:underline" href={`https://www.youtube.com/channel/${encodeURIComponent(activeSong.channelId)}`} target="_blank" rel="noreferrer" onClick={() => dispatch(setFullScreen(false))}>{activeSong?.channelTitle || "Open artist page"}</a> : activeSong?.channelTitle || "Zorofy"}
          </p>
        </div>
      </div>
      <div
        onClick={(e) => e.stopPropagation()}
          className="hidden h-[min(70vh,620px)] w-[min(38vw,420px)] flex-col items-center overflow-y-auto lg:flex"
      >
        <Lyrics activeSong={activeSong} />
      </div>
    </div>
  );
};

export default FullscreenTrack;
