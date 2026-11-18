import React from "react";

const Track = ({ isPlaying, isActive, activeSong, fullScreen, videoExpanded, onExpand }) => (
  <div
    className={`music-player-track flex min-w-0 flex-1 items-center justify-start ${!videoExpanded && activeSong?.id ? "pl-[216px]" : ""} ${
      fullScreen ? "hidden" : ""
    }`}
  >
    <button
      type="button"
      onClick={(event) => { event.stopPropagation(); onExpand?.(); }}
      aria-label="Expand current song artwork and details"
      className={`mr-4 h-16 w-16 shrink-0 overflow-hidden rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00E676] ${
        isPlaying && isActive ? "animate-[spin_15s_linear_infinite]" : ""
      } ${videoExpanded ? "block" : "hidden"}`}
    >
      <img
        src={
          activeSong?.thumbnail || activeSong?.image?.[2]?.url ||
          "/logo.png"
        }
        alt={activeSong?.name ? `${activeSong.name} cover art` : "Zorofy artwork"}
        onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/logo.png"; }}
        className="h-16 w-16 rounded-full object-cover"
      />
    </button>
    <div className="track-info min-w-0 w-[190px] select-none cursor-pointer">
      <p className="truncate text-white font-bold text-lg">
        {activeSong?.name
          ? activeSong?.name.replace("&#039;", "'").replace("&amp;", "&")
          : "Nothing playing"}
      </p>
      <p className="truncate text-gray-300 text-sm">
        {activeSong?.artists?.primary?.length > 0
          ? activeSong.artists.primary.map((a) => a?.name?.trim()).join(", ")
          : activeSong?.channelTitle || "Choose a song to start listening"}
      </p>
    </div>
  </div>
);

export default Track;
