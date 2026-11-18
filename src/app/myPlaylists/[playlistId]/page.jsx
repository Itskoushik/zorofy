'use client';
import SongsList from '@/components/SongsList';
import { getVideosData } from '@/services/dataAPI';
import React, { useEffect } from 'react'
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { getSinglePlaylist } from '@/services/playlistApi';
import ZorofyAudioLoader from '@/components/ZorofyAudioLoader';

const page = ({params}) => {
  const [loading, setLoading] = useState(true);
  const [songs, setSongs] = useState([]);
  const [playlist, setPlaylist] = useState({});
  const [error, setError] = useState("");
  const { status } = useSession();

  useEffect(() => {
    let cancelled = false;
    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const res = await getSinglePlaylist(params.playlistId);
        if (res?.success === true && !cancelled) {
          setPlaylist(res?.data || {});
          const ids = res?.data?.songs || [];
          const loaded = await getVideosData(ids);
          if (!cancelled) setSongs(loaded.reverse().filter(Boolean));
        }
      } catch (fetchError) {
        if (!cancelled) setError(fetchError?.message || "Could not load this playlist.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchFavorites();
    return () => { cancelled = true; };
  }, []);

  // redirect if user is authenticated
  if (status === 'loading') {
    return <div className=' w-screen h-screen flex justify-center items-center'>
      <ZorofyAudioLoader size="medium" label="Tuning your experience..." />
    </div>
  }
  if (status === 'unauthenticated') {
    redirect('/login');
  }
  return (
    <div className='mx-auto relative flex flex-col w-11/12 text-white min-h-screen '>
      <h1 className='text-4xl md:text-6xl font-semibold mt-10'>{playlist?.name || "My playlist"}</h1>
      {error && <p role="alert" className="mt-6 text-rose-300">{error}</p>}
      <h2 className='text-3xl font-semibold mt-10'>Songs</h2>
      {loading ? <ZorofyAudioLoader size="medium" label="Preparing your playlist..." /> : songs?.length === 0 ?
        <h1 className='text-xl font-semibold mt-10'>Playlist is Empty</h1>
        :
        <SongsList SongData={songs} loading={false} playlistID={playlist?._id} isUserPlaylist={true} setSongs={setSongs} />
      }
    </div>
  )
}

export default page
