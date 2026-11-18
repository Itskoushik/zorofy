'use client'
import Homepage from '@/components/Homepage/Home'
import { useEffect, useLayoutEffect } from 'react'
import { useState } from 'react'

export default function Home() {
  const [showtip, setShowtip] = useState(false);
  const [toturialComplete, setToturialComplete] = useState(false);

  useLayoutEffect(() => {
    let timer;
    let completed = false;
    try {
      completed = localStorage.getItem('toturialComplete') === 'true';
    } catch {}
    setToturialComplete(completed);

    timer = setTimeout(() => {
      if (!completed) {
        setShowtip(true);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [])
  const handleClick = () => {
    setShowtip(false);
    setToturialComplete(true);
    try { localStorage.setItem('toturialComplete', 'true'); } catch {}
  }
  return (
    <div className="relative">
      {showtip && !toturialComplete &&
        <div className='fixed right-5 top-[88px] z-20 w-[min(270px,calc(100vw-32px))] max-sm:hidden'>
          <div className='relative rounded-2xl border border-[#00E676]/20 bg-[#101A14] p-4 shadow-[0_16px_42px_rgba(0,0,0,.5)]'>
            <p className='text-sm leading-6 text-zorofy-muted'>
              Create your own <span className='text-[#00E676]'>Playlists</span> <br />and
              add songs to <span className='text-[#00E676]'>Favourite</span>
            </p>
            <div className='mt-3 flex items-center justify-end'>
              <button onClick={handleClick} className='rounded-lg bg-zorofy-green px-4 py-2 text-sm font-semibold text-black transition hover:bg-zorofy-bright'>Got it</button>
            </div>
          </div>
        </div>}
      <div className=' mx-auto relative flex flex-col w-11/12 text-white '>
        <Homepage />
      </div>
    </div>
  )
}
