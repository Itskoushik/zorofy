"use client";

import React from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MdLogout } from "react-icons/md";
import ZorofyAudioLoader from "@/components/ZorofyAudioLoader";

const Profile = ({ setShowNav }) => {
  const router = useRouter();
  const { status, data } = useSession();
  const account = data?.user || {};
  const displayName = account.userName || account.name || "Your account";
  const avatar = account.imageUrl || account.image || "/logo.png";

  const goTo = (path) => {
    setShowNav(false);
    router.push(path);
  };

  return (
    <div className="text-white">
      {status === "loading" ? (
        <div className="ml-5"><ZorofyAudioLoader size="small" mode="loading" label="Loading account..." /></div>
      ) : status === "unauthenticated" ? (
        <div className="ml-5 flex gap-2">
          <button type="button" onClick={() => goTo("/login")} className="m-2 rounded border border-[#00E676] px-3 py-1 text-lg">Login</button>
          <button type="button" onClick={() => goTo("/signup")} className="m-2 rounded border border-[#00E676] px-3 py-1 text-lg">Sign up</button>
        </div>
      ) : (
        <div className="ml-1 flex min-w-0 items-center gap-3">
          <img
            src={avatar}
            alt={`${displayName}'s profile`}
            width={48}
            height={48}
            referrerPolicy="no-referrer"
            onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/logo.png"; }}
            className="h-12 w-12 shrink-0 rounded-full border border-white/10 object-cover"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-base font-semibold">{displayName}</p>
              <button
                type="button"
                title="Log out"
                aria-label="Log out"
                onClick={() => { setShowNav(false); signOut({ callbackUrl: "/" }); }}
                className="shrink-0 rounded p-1 text-white transition hover:text-[#00E676] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00E676]"
              >
                <MdLogout size={21} />
              </button>
            </div>
            <p className="truncate text-xs text-zorofy-muted">{account.email || ""}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
