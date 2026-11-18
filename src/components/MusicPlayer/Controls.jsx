"use client";
import React from "react";
import { MdSkipNext, MdSkipPrevious } from "react-icons/md";
import { BsFillPauseFill, BsFillPlayFill } from "react-icons/bs";
import { TbRepeat, TbRepeatOnce, TbArrowsShuffle } from "react-icons/tb";
import { MdOutlineCloseFullscreen, MdOutlineOpenInFull } from "react-icons/md";
import FavouriteButton from "./FavouriteButton";
import ZorofyAudioLoader from "../ZorofyAudioLoader";

const Controls = ({
  isPlaying,
  repeatMode = "off",
  setRepeatMode,
  shuffle,
  setShuffle,
  currentSongs,
  handlePlayPause,
  handlePrevSong,
  handleNextSong,
  activeSong,
  fullScreen,
  handleAddToFavourite,
  favouriteSongs,
  loading,
  videoExpanded,
  onToggleVideo,
  isBuffering = false,
}) => {
  return (
    <div className="flex w-52 items-center justify-around text-lg sm:w-80 lg:w-80 2xl:w-80 gap-2 sm:gap-0">
      <FavouriteButton
        favouriteSongs={favouriteSongs}
        activeSong={activeSong}
        loading={loading}
        handleAddToFavourite={handleAddToFavourite}
        style={" sm:block hidden"}
      />
      <button type="button" aria-label={repeatMode === "off" ? "Enable playlist repeat" : repeatMode === "all" ? "Enable track repeat" : "Disable repeat"} title={repeatMode === "off" ? "Repeat off" : repeatMode === "all" ? "Repeat playlist" : "Repeat track"} onClick={(event) => { event.stopPropagation(); setRepeatMode(repeatMode === "off" ? "all" : repeatMode === "all" ? "one" : "off"); }} className={`${!fullScreen ? "hidden sm:block" : "m-1"} rounded-full p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00E676]`}>
        {repeatMode === "one" ? <TbRepeatOnce size={24} color="#00E676" /> : <TbRepeat size={24} color={repeatMode === "all" ? "#00E676" : "white"} />}
      </button>
      <button type="button" aria-label="Previous track" disabled={!currentSongs?.length} onClick={handlePrevSong} className="disabled:opacity-40"><MdSkipPrevious size={32} color="white" /></button>
      {activeSong?.id ? (
        isBuffering ? (
          <ZorofyAudioLoader size="small" mode="buffering" label="Loading track..." className="zorofy-player-waveform" />
        ) : (
          <button type="button" aria-label={isPlaying ? "Pause" : "Play"} disabled={!currentSongs?.length} onClick={handlePlayPause} className="disabled:opacity-40">
            {isPlaying ? <BsFillPauseFill size={42} color="#00E676" /> : <BsFillPlayFill size={42} color="#00E676" />}
          </button>
        )
      ) : <span className="h-[42px] w-[42px]" aria-hidden="true" />}
      <button type="button" aria-label="Next track" disabled={!currentSongs?.length} onClick={handleNextSong} className="disabled:opacity-40"><MdSkipNext size={32} color="white" /></button>
      <button type="button" aria-label={shuffle ? "Disable shuffle" : "Enable shuffle"} title="Shuffle" onClick={(event) => { event.stopPropagation(); setShuffle((previous) => !previous); }} className={`${!fullScreen ? "hidden sm:block" : "m-1"} rounded-full p-1`}><TbArrowsShuffle size={24} color={shuffle ? "#00E676" : "white"} /></button>
      <button type="button" aria-label={videoExpanded ? "Collapse video" : "Expand video"} title={videoExpanded ? "Compact video" : "Expand video"} onClick={(event) => { event.stopPropagation(); onToggleVideo?.(); }} className="rounded-full p-1 text-white hover:text-[#00E676] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00E676]">{videoExpanded ? <MdOutlineCloseFullscreen size={21} /> : <MdOutlineOpenInFull size={21} />}</button>
    </div>
  );
};

export default Controls;
