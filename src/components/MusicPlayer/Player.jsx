"use client";
import React, { useEffect, useRef, useState } from "react";

function loadIframeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!window.youtubeIframeApiPromise) {
    window.youtubeIframeApiPromise = new Promise((resolve) => {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => { previous?.(); resolve(window.YT); };
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const script = document.createElement("script"); script.src = "https://www.youtube.com/iframe_api"; script.async = true; document.head.appendChild(script);
      }
    });
  }
  return window.youtubeIframeApiPromise;
}

function getPlayerSize(expanded, expandedTrackView = false) {
  if (!expanded || typeof window === "undefined") return { width: 200, height: 200 };
  const maxHeight = Math.min(window.innerHeight * (expandedTrackView ? 0.44 : 0.62), 700);
  const maxWidth = Math.max(200, window.innerWidth - 32);
  const width = Math.floor(Math.min(maxWidth, maxHeight * (16 / 9)));
  return { width, height: Math.max(200, Math.floor(width * (9 / 16))) };
}

export default function Player({ activeSong, isPlaying, volume, seekTime, onEnded, onTimeUpdate, onLoadedData, onPlaybackState, onPlaybackError, onWaiting, onCanPlay, repeat, fullScreen, expandedTrackView }) {
  const mountRef = useRef(null);
  const playerRef = useRef(null);
  const initializingRef = useRef(false);
  const handlersRef = useRef({});
  const currentVideo = useRef("");
  const playerReady = useRef(false);
  const [playerSize, setPlayerSize] = useState({ width: 200, height: 200 });
  const playerSizeRef = useRef(playerSize);
  playerSizeRef.current = playerSize;
  const savedTimeRef = useRef(0);
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  handlersRef.current = { onEnded, onTimeUpdate, onLoadedData, onPlaybackState, onPlaybackError, onWaiting, onCanPlay, repeat };

  useEffect(() => {
    let cancelled = false;
    loadIframeApi().then((YT) => {
      if (cancelled || !mountRef.current) return;
      initializingRef.current = true;
      playerReady.current = false;
      const size = getPlayerSize(fullScreen, expandedTrackView);
      playerSizeRef.current = size;
      setPlayerSize(size);
      const target = document.createElement("div");
      target.id = "zorofy-youtube-player";
      mountRef.current.replaceChildren(target);
      const initialVideoId = currentVideo.current || activeSong?.videoId || activeSong?.id || "";
      const player = new YT.Player(target.id, {
        width: String(size.width), height: String(size.height), ...(initialVideoId ? { videoId: initialVideoId } : {}),
        playerVars: { autoplay: 0, controls: 0, enablejsapi: 1, playsinline: 1, rel: 0, origin: window.location.origin },
        events: {
          onReady: (event) => {
            playerRef.current = event.target;
            playerReady.current = true;
            initializingRef.current = false;
            event.target.setVolume(Math.round((Number(volume) || 0) * 100));
            if (currentVideo.current) {
              const video = { videoId: currentVideo.current, startSeconds: savedTimeRef.current };
              if (isPlayingRef.current) event.target.loadVideoById(video);
              else event.target.cueVideoById(video);
            }
            savedTimeRef.current = 0;
            handlersRef.current.onLoadedData(event.target.getDuration() || 0);
            handlersRef.current.onCanPlay();
          },
          onStateChange: (event) => {
            const state = event.data;
            if (state === YT.PlayerState.PLAYING) { handlersRef.current.onPlaybackState(true); handlersRef.current.onCanPlay(); }
            else if (state === YT.PlayerState.PAUSED || state === YT.PlayerState.CUED) handlersRef.current.onPlaybackState(false);
            else if (state === YT.PlayerState.BUFFERING) handlersRef.current.onWaiting();
            else if (state === YT.PlayerState.ENDED) {
              if (handlersRef.current.repeat) { event.target.seekTo(0, true); event.target.playVideo(); }
              else { handlersRef.current.onPlaybackState(false); handlersRef.current.onEnded(); }
            }
          },
          onError: (event) => {
            playerReady.current = true;
            const message = ({ 2: "This track could not be loaded.", 5: "This track could not be played here.", 100: "This track is unavailable or has been removed.", 101: "The owner does not allow this track to play here.", 150: "The owner does not allow this track to play here." })[event.data] || "Zorofy could not play this track.";
            handlersRef.current.onPlaybackState(false); handlersRef.current.onPlaybackError(message);
          },
          onAutoplayBlocked: () => {
            handlersRef.current.onPlaybackState(false);
            handlersRef.current.onPlaybackError("Playback did not start automatically. Press Play in Zorofy to continue.");
          },
        },
      });
      playerRef.current = player;
    }).catch((error) => {
      initializingRef.current = false;
      handlersRef.current.onPlaybackError("The Zorofy player could not be loaded.");
    });
    return () => {
      cancelled = true;
      const player = playerRef.current;
      if (playerReady.current && player?.getCurrentTime) savedTimeRef.current = player.getCurrentTime() || savedTimeRef.current;
      playerReady.current = false;
      initializingRef.current = false;
      playerRef.current = null;
      player?.destroy?.();
      mountRef.current?.replaceChildren();
    };
  // Recreate the one live IFrame player when its target dimensions change. Playback position is restored.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullScreen, expandedTrackView]);

  const videoId = activeSong?.videoId || activeSong?.id || "";
  useEffect(() => {
    if (!videoId || currentVideo.current === videoId) return;
    currentVideo.current = videoId;
    if (!playerReady.current || !playerRef.current) return;
    if (isPlayingRef.current) playerRef.current.loadVideoById(videoId);
    else playerRef.current.cueVideoById(videoId);
  }, [videoId]);

  useEffect(() => {
    const player = playerRef.current;
    if (!playerReady.current || !player || !currentVideo.current) return;
    if (isPlaying) player.playVideo(); else player.pauseVideo();
  }, [isPlaying, videoId]);

  useEffect(() => { playerRef.current?.setVolume?.(Math.round(Math.max(0, Math.min(1, Number(volume) || 0)) * 100)); }, [volume]);
  useEffect(() => {
    const resize = () => {
      if (!fullScreen) return;
      const size = getPlayerSize(true, expandedTrackView);
      if (size.width === playerSizeRef.current.width && size.height === playerSizeRef.current.height) return;
      playerSizeRef.current = size;
      setPlayerSize(size);
    };
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [fullScreen, expandedTrackView]);
  useEffect(() => {
    if (!Number.isFinite(Number(seekTime)) || !playerRef.current?.seekTo) return;
    if (Math.abs((playerRef.current.getCurrentTime() || 0) - Number(seekTime)) > 1) playerRef.current.seekTo(Number(seekTime), true);
  }, [seekTime]);
  useEffect(() => {
    const timer = window.setInterval(() => {
      const player = playerRef.current;
      if (!player?.getCurrentTime) return;
      const duration = player.getDuration?.() || 0;
      handlersRef.current.onLoadedData(duration);
      if (player.getPlayerState?.() === 1) handlersRef.current.onTimeUpdate(player.getCurrentTime() || 0);
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!repeat || !playerRef.current) return;
    // Repeat-one is handled by the queue when the official player reports ENDED.
  }, [repeat]);

  return <div className={`youtube-player-frame ${fullScreen ? "youtube-player-full" : ""}`} style={{ width: playerSize.width, height: playerSize.height }}><div ref={mountRef} /></div>;
}
