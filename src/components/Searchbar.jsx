'use client'
import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setIsTyping } from '@/redux/features/loadingBarSlice';


const Searchbar = () => {
  const ref = React.useRef(null);
  const dispatch = useDispatch();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e) => {
    if (!searchTerm.trim()) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    router.push(`/search/${encodeURIComponent(searchTerm.trim())}`);
  };
  const handleFocus = () => {
    dispatch(setIsTyping(true));
  };
  const handleBlur = () => {
    dispatch(setIsTyping(false));
  };

  return (
    <form onSubmit={handleSubmit} autoComplete="off" role="search" className="relative w-[160px] shrink-0 p-2 text-gray-400 transition focus-within:text-white sm:w-[240px]">
      <label htmlFor="search-field" className="sr-only">
        Search all files
      </label>
      <div className="flex items-center rounded-full border border-white/10 bg-white/[0.045] transition focus-within:border-zorofy-green/40 focus-within:bg-white/[0.07]">
        <FiSearch aria-hidden="true" className="ml-4 h-5 w-5 text-zorofy-muted" />
        <input
        onFocus={handleFocus}
        onBlur={handleBlur}
          name="search-field"
          autoComplete="off"
          id="search-field"
          className="w-[80px] flex-none bg-transparent p-3 text-sm text-white outline-none placeholder:text-zorofy-muted sm:w-40 sm:flex-1 lg:w-64"
          placeholder="Search"
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </form>
  );
};

export default Searchbar;
