import React from 'react'

const SongCardSkeleton = () => {
  return (
    <div className='flex w-full flex-col p-2 lg:w-[205px] rounded-lg bg-white/5 animate-pulse'>
    <div role="status" className="animate-pulse">
      <div className="flex aspect-square items-center justify-center rounded-lg bg-gray-800">
       
      </div>
      <div className="w-full mt-3">
        <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-800 w-16 mb-2"></div>
        <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-800 w-28"></div>
      </div>
    </div>
  </div>
  )
}

export default SongCardSkeleton
