'use client'
import React from 'react'
import Image from 'next/image'
import Searchbar from './Searchbar'
import Link from 'next/link'
import { useDispatch } from 'react-redux'
import { setProgress } from '@/redux/features/loadingBarSlice'
import { MdOutlineMenu } from 'react-icons/md'
import { IoClose } from 'react-icons/io5'
import Sidebar from './Sidebar/Sidebar'


const Navbar = () => {
  const dispatch = useDispatch();
  const [showNav, setShowNav] = React.useState(false);
  return (
    <>
      <div className='sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-white/[0.06] bg-[#050807]/95 px-2 text-white shadow-[0_8px_28px_rgba(0,0,0,.22)] backdrop-blur-xl sm:px-4'>
        <div className='flex h-full items-center gap-2'>
          <MdOutlineMenu onClick={
            () => setShowNav(true)
          } aria-label="Open navigation" className='mx-2 my-auto cursor-pointer rounded-full p-2 text-2xl text-zorofy-muted transition hover:bg-white/5 hover:text-zorofy-green lg:text-3xl' />
          <div className='flex items-center gap-2 sm:gap-3'>
            <Link href='/' className="flex items-center gap-2" aria-label="Zorofy home">
              <Image onClick={() => { dispatch(setProgress(100)) }}
                src="/logo1.png" width={48} height={48} priority unoptimized alt="Zorofy emblem" className='h-10 w-10 object-contain sm:h-12 sm:w-12' />
              <Image src="/product name.png" width={190} height={64} priority unoptimized alt="Zorofy" className='h-8 w-[112px] object-contain object-left sm:h-10 sm:w-[155px] lg:w-[180px]' />
            </Link>
          </div>
        </div>
        <Searchbar />
      </div>

      <Sidebar showNav={showNav} setShowNav={setShowNav} />
      {/* overlay */}
      <div onClick={() => setShowNav(false)}
        className={`${showNav ? '' : 'hidden'} transition-all duration-200 fixed top-0 left-0 z-30 w-screen h-screen bg-black bg-opacity-50`}></div>
      <div onClick={
        () => setShowNav(false)
      } className={`${showNav ? '' : 'hidden'} md:hidden fixed top-7 right-10 z-50 text-3xl text-white`}>
        <IoClose />
      </div>
    </>
  )
}

export default Navbar
