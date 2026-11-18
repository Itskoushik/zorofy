"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import MusicPlayer from "@/components/MusicPlayer";

const isAuthenticationRoute = (pathname = "") =>
  pathname === "/login" || pathname === "/signup" || pathname.startsWith("/reset-password");

export default function MusicPlayerFrame() {
  const pathname = usePathname();
  const hidden = isAuthenticationRoute(pathname);

  useLayoutEffect(() => {
    document.body.classList.toggle("auth-page", hidden);
    return () => document.body.classList.remove("auth-page");
  }, [hidden]);

  // Keep the player mounted so its playback state and single YouTube player
  // instance survive navigation through login or password recovery.
  return (
    <div
      aria-hidden={hidden}
      className={hidden ? "hidden" : "fixed bottom-0 left-0 right-0 z-50 flex rounded-t-3 backdrop-blur-lg"}
    >
      <MusicPlayer />
    </div>
  );
}
