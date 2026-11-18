import React from 'react';
import { FaPauseCircle, FaPlayCircle } from 'react-icons/fa';
import ZorofyAudioLoader from '@/components/ZorofyAudioLoader';

const PlayPause = ({ isPlaying, activeSong, song, handlePause, handlePlay, loading }) => (
  loading ? (
    <ZorofyAudioLoader size="small" mode="loading" />
  ) :
  isPlaying && activeSong?.id === song?.id ? (
  <FaPauseCircle
    size={35}
    className="text-gray-300 hover:scale-125 transform transition-all duration-300 ease-in-out"
    onClick={(event) => { event.stopPropagation(); handlePause(event); }}
  />
) : (
  <FaPlayCircle
    size={35}
    className="text-gray-300 hover:scale-125 transform transition-all duration-300 ease-in-out"
    onClick={(event) => { event.stopPropagation(); handlePlay(event); }}
  />
));

export default PlayPause;
