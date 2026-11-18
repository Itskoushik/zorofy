import { Swiper } from "swiper/react";
import "swiper/css";
import { FreeMode, Mousewheel, Keyboard } from "swiper/modules";
import { MdNavigateNext } from "react-icons/md";
import { MdNavigateBefore } from "react-icons/md";
import { useRef, useState } from 'react';

const SwiperLayout = ({children,title}) => {
    const swiperRef = useRef(null);
    const [canGoBack, setCanGoBack] = useState(false);
    const [canGoForward, setCanGoForward] = useState(false);

    const updateNavigation = (swiper) => {
      setCanGoBack(!swiper.isBeginning);
      setCanGoForward(!swiper.isEnd);
    };

  return (
    <div className=" my-4 lg:mt-14">
    <div className=" flex justify-between">
      <h2 className=" text-white mt-4 text-2xl lg:text-3xl font-semibold mb-4 ">{title}</h2>
        <div className="hidden md:flex gap-1">
        <button type="button" aria-label={`Scroll ${title} backward`} disabled={!canGoBack} onClick={() => swiperRef.current?.slidePrev()} className="m-4 mb-5 rounded-full border border-white/15 p-1 transition hover:border-zorofy-green hover:text-zorofy-green disabled:opacity-30">
          <MdNavigateBefore size={28} className="text-white" />
        </button>
        <button type="button" aria-label={`Scroll ${title} forward`} disabled={!canGoForward} onClick={() => swiperRef.current?.slideNext()} className="m-4 mb-5 rounded-full border border-white/15 p-1 transition hover:border-zorofy-green hover:text-zorofy-green disabled:opacity-30">
          <MdNavigateNext size={28} className="text-white" />
        </button>
      </div>
      </div>
      <Swiper
        modules={[FreeMode, Mousewheel, Keyboard]}
        style={{
          "--swiper-navigation-size": "20px",
          "--swiper-navigation-color": "white",
        }}
        breakpoints={{
          300:{slidesPerView:3.1,spaceBetween: 5,},
          640:{slidesPerView:4.2,spaceBetween: 5,},
          1024:{slidesPerView:6,spaceBetween: 5,},
      }}
        mousewheel={{
          enabled: true,
          forceToAxis: true,
        }}
        freeMode={true}
        keyboard={{ enabled: true, onlyInViewport: true }}
        onSwiper={(swiper) => { swiperRef.current = swiper; updateNavigation(swiper); }}
        onSlideChange={updateNavigation}
        onResize={updateNavigation}
        className="mySwiper"
      >
        {children}
      </Swiper>
      </div>
  )
}

export default SwiperLayout
