"use client";
import React, { useState, useEffect, useLayoutEffect, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  nextSong,
  prevSong,
  playPause,
  setFullScreen,
  setRepeatMode,
} from "../../redux/features/playerSlice";
import Controls from "./Controls";
import Player from "./Player";
import Seekbar from "./Seekbar";
import Track from "./Track";
import VolumeBar from "./VolumeBar";
import FullscreenTrack from "./FullscreenTrack";
import Lyrics from "./Lyrics";
import { HiOutlineChevronDown } from "react-icons/hi";
import { addFavourite, getFavourite } from "@/services/dataAPI";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import FavouriteButton from "./FavouriteButton";
import { toast } from "react-hot-toast";
import { getNextTrackIndex, getPreviousTrackIndex, shouldAdvanceAfterEnd } from "@/services/playerUtils.mjs";

const MusicPlayer = () => {
  const {
    activeSong,
    currentSongs,
    currentIndex,
    isActive,
    isPlaying,
    fullScreen,
    repeatMode = "off",
  } = useSelector((state) => state.player);
  const { isTyping } = useSelector((state) => state.loadingBar);
  const [duration, setDuration] = useState(0);
  const [seekTime, setSeekTime] = useState(0);
  const [appTime, setAppTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [shuffle, setShuffle] = useState(false);
  const [favouriteSongs, setFavouriteSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { status } = useSession();
  const pathname = usePathname();
  const isAuthRoute = pathname === "/login" || pathname === "/signup" || pathname?.startsWith("/reset-password");
  const router = useRouter();
  const [playbackError, setPlaybackError] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const [videoExpanded, setVideoExpanded] = useState(false);
  const dockRef = useRef(null);
  const playerSlotRef = useRef(null);

  useEffect(() => {
    document.body.classList.toggle("video-expanded", videoExpanded);
    return () => document.body.classList.remove("video-expanded");
  }, [videoExpanded]);

  useEffect(() => {
    document.body.classList.toggle("has-active-song", Boolean(activeSong?.id));
    return () => document.body.classList.remove("has-active-song");
  }, [activeSong?.id]);

  useLayoutEffect(() => {
    const slot = playerSlotRef.current;
    const dock = dockRef.current;
    if (!slot || !dock) return;
    const alignPlayerWithArtwork = () => {
      if (fullScreen && !videoExpanded) {
        const artwork = dock.querySelector(".fullscreen-track-artwork");
        if (!artwork) return;
        const artRect = artwork.getBoundingClientRect();
        const dockRect = dock.getBoundingClientRect();
        slot.style.position = "absolute";
        slot.style.left = `${artRect.left - dockRect.left}px`;
        slot.style.top = `${artRect.top - dockRect.top}px`;
        slot.style.width = `${artRect.width}px`;
        slot.style.height = `${artRect.height}px`;
        slot.style.transform = "none";
      } else {
        slot.style.removeProperty("position");
        slot.style.removeProperty("left");
        slot.style.removeProperty("top");
        slot.style.removeProperty("width");
        slot.style.removeProperty("height");
        slot.style.removeProperty("transform");
      }
    };
    alignPlayerWithArtwork();
    window.addEventListener("resize", alignPlayerWithArtwork);
    return () => window.removeEventListener("resize", alignPlayerWithArtwork);
  }, [fullScreen, videoExpanded, activeSong?.id]);

  useEffect(() => {
    if (currentSongs?.length) dispatch(playPause(true));
  }, [currentIndex]);

  useEffect(() => {
    setAppTime(0);
    setSeekTime(0);
    setDuration(0);
  }, [activeSong?.id]);

  useEffect(() => {
    let cancelled = false;
    getFavourite()
      .then((songs) => { if (!cancelled && Array.isArray(songs)) setFavouriteSongs(songs); })
      .catch(() => { if (!cancelled) setFavouriteSongs([]); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    setPlaybackError("");
    setIsWaiting(false);
    if (activeSong?.name) {
      document.title = activeSong?.name;
    } else {
      document.title = "Zorofy – Your Music, Your Vibe";
    }
  }, [activeSong]);

  // off scroll when full screen
  useEffect(() => {
    document.documentElement.style.overflow = fullScreen && !isAuthRoute ? "hidden" : "auto";
    const content = document.querySelector(".app-content-scroll");
    if (content) content.style.overflowY = fullScreen && !isAuthRoute ? "hidden" : "auto";

    return () => {
      document.documentElement.style.overflow = "auto";
      if (content) content.style.overflowY = "auto";
    };
  }, [fullScreen, isAuthRoute]);

  // Hotkey for play pause
  const handleKeyPress = (event) => {
    const target = event.target;
    const isInteractive = target?.matches?.("input, textarea, select, button, [contenteditable='true']");
    if (!isTyping && !isInteractive && !event.repeat && event.key === " ") {
      event.preventDefault();
      handlePlayPause();
    }
  };
  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, isActive, isTyping]);

  const handlePlayPause = useCallback((e) => {
    e?.stopPropagation();
    if (!isActive) return;

    if (isPlaying) {
      dispatch(playPause(false));
    } else {
      dispatch(playPause(true));
    }
  }, [dispatch, isActive, isPlaying]);

  const handleNextSong = (e) => {
    e?.stopPropagation();
    if (!currentSongs?.length) return;
    const index = getNextTrackIndex(currentIndex, currentSongs.length, shuffle);
    setPlaybackError("");
    dispatch(nextSong(index));
    dispatch(playPause(true));
  };

  const handlePrevSong = (e) => {
    e?.stopPropagation();
    if (!currentSongs?.length) return;
    const index = getPreviousTrackIndex(currentIndex, currentSongs.length, shuffle);
    setPlaybackError("");
    dispatch(prevSong(index));
    dispatch(playPause(true));
  };

  const handleTrackEnded = () => {
    if (!shouldAdvanceAfterEnd(currentIndex, currentSongs.length, repeatMode)) {
      dispatch(playPause(false));
      return;
    }
    handleNextSong();
  };

  const handlePlaybackState = useCallback((playing) => {
    dispatch(playPause(playing));
    if (playing) setPlaybackError("");
  }, [dispatch]);

  const handlePlaybackError = useCallback((message) => {
    setPlaybackError(message);
    setIsWaiting(false);
    toast.error(message, { id: "playback-error" });
  }, []);

  const handleAddToFavourite = async (favsong) => {
    if (status === "unauthenticated") {
      dispatch(setFullScreen(false));
      router.push("/login");
    }

    if (favsong?.id && status === "authenticated") {
      try {
        setLoading(true);
        // optimistic update
        if (favouriteSongs?.find((song) => song === favsong?.id)) {
          setFavouriteSongs(
            favouriteSongs?.filter((song) => song !== favsong?.id)
          );
        } else {
          setFavouriteSongs([...favouriteSongs, favsong?.id]);
        }
        const res = await addFavourite(favsong);
        if (res?.success === true) {
          setFavouriteSongs(res?.data?.favourites || []);
        } else {
          throw new Error(res?.message || "Could not update favourites.");
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        toast.error(error?.message || "Could not update favourites.");
      }
    }
  };

  return (
    <div
      ref={dockRef}
      className={`music-player-dock ${videoExpanded ? "video-expanded-active" : ""} relative z-50 overflow-hidden items-center lg:items-stretch lg:overflow-visible hideScrollBar sm:px-6 flex flex-col transition-all duration-200 ${
        fullScreen ? "h-[100dvh] w-[100vw] overflow-y-auto" : videoExpanded ? "video-expanded-dock w-full px-2 sm:px-4 bg-[#0A100D]" : activeSong?.id ? "w-full min-h-[216px] justify-center px-2 sm:px-4 bg-[#0A100D]" : "w-full min-h-[112px] justify-center px-2 sm:px-4 bg-[#0A100D]"
      }`}
      onClick={() => {
        if (activeSong?.id) {
          dispatch(setFullScreen(!fullScreen));
        }
      }}
      style={{ backgroundColor: "rgba(5,8,7,0.96)", borderTop: "1px solid var(--zorofy-border)" }}
    >
      <HiOutlineChevronDown
        onClick={(e) => {
          e.stopPropagation();
          dispatch(setFullScreen(!fullScreen));
        }}
        className={` absolute top-16 md:top-10 right-7 text-white text-3xl cursor-pointer ${
          fullScreen ? "" : "hidden"
        }`}
      />
      <div ref={playerSlotRef} className={`${activeSong?.id ? "youtube-player-slot" : "hidden"} ${videoExpanded ? "youtube-player-expanded-slot" : fullScreen ? "youtube-player-card-slot" : "youtube-player-inline-slot"}`} onClick={(event) => event.stopPropagation()}>
        <Player
          activeSong={activeSong}
          volume={volume}
          isPlaying={isPlaying}
          seekTime={seekTime}
          repeat={repeatMode === "one"}
          fullScreen={videoExpanded}
          expandedTrackView={videoExpanded && fullScreen}
          onEnded={handleTrackEnded}
          onTimeUpdate={(time) => setAppTime(time)}
          onLoadedData={(nextDuration) => setDuration(Number(nextDuration) || 0)}
          onPlaybackState={handlePlaybackState}
          onPlaybackError={handlePlaybackError}
          onWaiting={() => setIsWaiting(true)}
          onCanPlay={() => setIsWaiting(false)}
        />
      </div>
      <FullscreenTrack
        handleNextSong={handleNextSong}
        handlePrevSong={handlePrevSong}
        activeSong={activeSong}
        fullScreen={fullScreen}
        videoExpanded={videoExpanded}
        largeVideo={videoExpanded && fullScreen}
      />
      <div className={`music-player-controls-row flex w-full items-center justify-between gap-3 pt-2 ${fullScreen ? "flex-col lg:flex-row" : "flex-row"}`}>
        <Track
          isPlaying={isPlaying}
          isActive={isActive}
          activeSong={activeSong}
          fullScreen={fullScreen}
          videoExpanded={videoExpanded}
          onExpand={() => {
            setVideoExpanded(false);
            dispatch(setFullScreen(true));
          }}
        />
        <div className={`flex flex-1 flex-col items-center justify-center gap-2 ${fullScreen ? "" : "min-w-0"}`}>
          <div
            className={`${
              fullScreen ? "" : "hidden"
            }  sm:hidden flex items-center justify-center gap-4`}
          >
            <FavouriteButton
              favouriteSongs={favouriteSongs}
              activeSong={activeSong}
              loading={loading}
              handleAddToFavourite={handleAddToFavourite}
              style={"mb-4"}
            />
          </div>
          <Controls
            isPlaying={isPlaying}
            isActive={isActive}
            repeatMode={repeatMode}
            setRepeatMode={(mode) => dispatch(setRepeatMode(mode))}
            shuffle={shuffle}
            setShuffle={setShuffle}
            currentSongs={currentSongs}
            activeSong={activeSong}
            fullScreen={fullScreen}
            handlePlayPause={handlePlayPause}
            handlePrevSong={handlePrevSong}
            handleNextSong={handleNextSong}
            handleAddToFavourite={handleAddToFavourite}
            favouriteSongs={favouriteSongs}
            loading={loading}
            videoExpanded={videoExpanded}
            onToggleVideo={() => setVideoExpanded((expanded) => !expanded)}
            isBuffering={Boolean(activeSong?.id && isWaiting)}
          />
          <Seekbar
            value={appTime}
            min="0"
            max={duration}
            fullScreen={fullScreen}
            onInput={(event) => setSeekTime(Number(event.target.value))}
            setSeekTime={setSeekTime}
            appTime={appTime}
          />
        </div>
        <VolumeBar
          activeSong={activeSong}
          bgColor={null}
          fullScreen={fullScreen}
          value={volume}
          min="0"
          max="1"
          onChange={(event) => setVolume(Number(event.target.value))}
          setVolume={setVolume}
        />
      </div>
      {!fullScreen && (playbackError || isWaiting) && (
        <p role={playbackError ? "alert" : "status"} className="absolute left-1/2 -translate-x-1/2 -top-7 max-w-[90vw] truncate rounded-t-md bg-black/90 px-3 py-1 text-xs text-amber-200">
          {playbackError || "Buffering your music…"}
        </p>
      )}
      {fullScreen && (
        <div className=" lg:hidden">
          <Lyrics activeSong={activeSong} currentSongs={currentSongs} />
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;
