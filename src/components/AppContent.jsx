"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export default function AppContent({ children }) {
  const pathname = usePathname();
  const contentRef = useRef(null);
  useEffect(() => { contentRef.current?.scrollTo({ top: 0, behavior: "auto" }); }, [pathname]);
  return <div ref={contentRef} className="app-content-scroll">{children}</div>;
}
