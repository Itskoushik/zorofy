'use client'
import React from 'react'
import { useDispatch } from 'react-redux';
import { BsFillPlayFill } from 'react-icons/bs';
import ZorofyAudioLoader from '@/components/ZorofyAudioLoader';

import { playPause, setActiveSong } from "@/redux/features/playerSlice";
const PlayButton = ({ songList, onPlay, loading = false }) => {
    const dispatch = useDispatch();
    const handlePlayClick = (song, index) => {
        if (!song || !Array.isArray(songList?.songs) || !songList.songs.length) return;
        dispatch(setActiveSong({ song, data: songList.songs, i: index }));
        dispatch(playPause(true));
    };
    return (
        <button
            type="button"
            disabled={!songList?.songs?.length || loading}
            aria-label="Play all tracks in this playlist"
            onClick={() => { if (onPlay) onPlay(); else handlePlayClick(songList?.songs?.[0], 0); }}
            className="flex items-center gap-2 mt-5 rounded-3xl py-2 px-3 hover:border-[#00E676] group w-fit cursor-pointer border border-white disabled:cursor-not-allowed disabled:opacity-50">
            <BsFillPlayFill size={25} className="text-gray-200 group-hover:text-[#00E676]" />
            {loading ? <><ZorofyAudioLoader size="small" mode="loading" /><span className="text-sm font-semibold">Preparing queue...</span></> : <span className="text-lg font-semibold">Play all</span>}
        </button>
    )
}

export default PlayButton
