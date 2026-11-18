import React, { useEffect, useRef, useState } from "react";
import {
  BsFillVolumeUpFill,
  BsVolumeDownFill,
  BsFillVolumeMuteFill,
} from "react-icons/bs";
import { BiAddToQueue } from "react-icons/bi";
import { addSongToPlaylist, getUserPlaylists } from "@/services/playlistApi";
import { toast } from "react-hot-toast";

const VolumeBar = ({
  value,
  min,
  max,
  onChange,
  setVolume,
  activeSong,
  bgColor,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const previousVolume = useRef(0.8);
  useEffect(() => {
    const getPlaylists = async () => {
      try {
        const res = await getUserPlaylists();
        if (res?.success === true) setPlaylists(res?.data?.playlists || []);
      } catch {}
    };
    getPlaylists();
  }, []);

  // add song to playlist
  const handleAddToPlaylist = async (song, playlistID) => {
    setShowMenu(false);
    try { const res = await addSongToPlaylist(playlistID, song); toast.success(res?.message || "Added to playlist."); }
    catch (error) { toast.error(error?.message || "Could not add this track."); }
  };
  return (
    <>
      <div className="hidden lg:flex flex-1 items-center justify-end">
        <div className=" relative">
          <button
            type="button"
            aria-label="Add current track to a playlist"
            disabled={!activeSong?.id}
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            title="Add to Playlist"
            className="m-3 cursor-pointer disabled:opacity-40"
          ><BiAddToQueue size={25} color="white" /></button>
          {showMenu && (
            <div
              onClick={() => {
                setShowMenu(false);
              }}
              className="absolute text-white bottom-[130%] backdrop-blur-lg rounded-lg p-3 w-32 flex flex-col gap-2 z-[100]"
              style={{
                backgroundColor: bgColor
                  ? `rgba(${bgColor.red}, ${bgColor.green}, ${bgColor.blue}, 0.3)`
                  : "rgba(0,0,0,0.2)",
                backdropFilter: "blur(20px)",
              }}
            >
              <p className="text-sm font-semibold flex gap-1 border-b border-white items-center">
                Add to Playlist
              </p>
              {playlists?.length > 0 ? (
                playlists?.map((playlist, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToPlaylist(activeSong?.id, playlist._id);
                    }}
                    className="text-sm font-semibold flex gap-1 items-center hover:underline"
                  >
                    {playlist?.name}
                  </button>
                ))
              ) : (
                <p className="text-sm font-semibold flex gap-1 items-center">
                  No Playlist
                </p>
              )}
            </div>
          )}
        </div>
        <button type="button" aria-label={Number(value) === 0 ? "Unmute" : "Mute"} onClick={(event) => { event.stopPropagation(); if (Number(value) === 0) setVolume(previousVolume.current || 0.8); else { previousVolume.current = Number(value); setVolume(0); } }}>
          {Number(value) === 0 ? <BsFillVolumeMuteFill size={24} color="#FFF" /> : Number(value) > 0.5 ? <BsFillVolumeUpFill size={24} color="#FFF" /> : <BsVolumeDownFill size={24} color="#FFF" />}
        </button>
        <input
          onClick={(event) => {
            event.stopPropagation();
          }}
          type="range"
          step="any"
          value={value}
          min={min}
          max={max}
          onChange={onChange}
          className="2xl:w-24 lg:w-24 md:w-28 h-1 ml-2 accent-[#00E676] cursor-pointer"
        />
      </div>
      {/* overlay */}
      {showMenu && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(false);
          }}
          className=" absolute w-screen h-screen bottom-0 left-0 z-[50]"
        ></div>
      )}
    </>
  );
};

export default VolumeBar;
