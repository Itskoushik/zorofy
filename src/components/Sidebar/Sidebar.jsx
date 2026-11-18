import React from "react";
import Languages from "./Languages";
import { MdOutlineMenu } from "react-icons/md";
import { HiOutlineHome, HiOutlineClock, HiOutlineHeart, HiOutlineQueueList } from "react-icons/hi2";
import { FiSearch } from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";
import Profile from "./Profile";
import { useDispatch } from "react-redux";
import Playlists from "./Playlists";
import { setProgress } from "@/redux/features/loadingBarSlice";

const Sidebar = ({ showNav, setShowNav }) => {
  const dispatch = useDispatch();
  return (
    <div
      className={`${
        showNav ? "" : "translate-x-[-100%]"
      } transition-all duration-200 h-screen w-[min(82vw,320px)] md:w-[280px] fixed top-0 left-0 z-40 border-r border-white/[0.07] bg-[#080F0B] text-white shadow-2xl flex flex-col justify-between`}
    >
      <div>
        <div className="flex mt-3 items-center">
          <MdOutlineMenu
            onClick={() => setShowNav(false)}
            aria-label="Close navigation"
            className="mx-3 text-2xl lg:text-3xl my-auto text-zorofy-muted hover:text-zorofy-green cursor-pointer"
          />
          <div className="flex items-center gap-2">
            <Link href="/">
              <Image src="/logo1.png" width={44} height={44} unoptimized alt="Zorofy emblem" className="h-10 w-10 object-contain" />
            </Link>
            <Link href="/">
              <Image
                onClick={() => {
                  dispatch(setProgress(100));
                }}
                src="/product name.png"
                alt="Zorofy"
                width={180}
                height={60}
                unoptimized
                className="h-8 w-[130px] object-contain object-left lg:w-[155px]"
              />
            </Link>
          </div>
        </div>
        <div className="mt-5 pb-5 border-b border-white/10 w-[95%]">
          <Profile setShowNav={setShowNav} />
        </div>
        <nav aria-label="Main navigation" className="mt-4 space-y-1 px-3">
          {[
            { label: "Home", href: "/", Icon: HiOutlineHome },
            { label: "Search", href: null, Icon: FiSearch },
            { label: "Your Library", href: "#your-library", Icon: HiOutlineQueueList },
            { label: "Recently Played", href: "#recently-played", Icon: HiOutlineClock },
            { label: "Liked Songs", href: "/favourite", Icon: HiOutlineHeart },
          ].map(({ label, href, Icon }) => href ? (
            <Link key={label} href={href} onClick={() => setShowNav(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zorofy-muted transition hover:bg-white/[0.05] hover:text-zorofy-green">
              <Icon className="h-5 w-5" />{label}
            </Link>
          ) : (
            <button key={label} type="button" onClick={() => { document.getElementById("search-field")?.focus(); setShowNav(false); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-zorofy-muted transition hover:bg-white/[0.05] hover:text-zorofy-green">
              <Icon className="h-5 w-5" />{label}
            </button>
          ))}
        </nav>
        <div className="flex flex-col gap-1">
          <Languages />
          <hr className="border-gray-400 w-[95%] mx-auto" />
        </div>
        <div className="flex flex-col gap-1">
          <hr className="border-gray-400 w-[95%] mx-auto" />
          <Playlists setShowNav={setShowNav} />
          <hr className="border-gray-400 w-[95%] mx-auto" />
        </div>
      </div>
      <div className="mb-8 px-5 text-xs text-zorofy-muted/70">Your music. Your vibe.</div>
    </div>
  );
};

export default Sidebar;
