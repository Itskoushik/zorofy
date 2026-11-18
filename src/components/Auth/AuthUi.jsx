"use client";

import Image from "next/image";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { FiLoader } from "react-icons/fi";

export function AuthCard({ title, subtitle, children }) {
  return (
    <main className="relative flex min-h-[calc(100dvh-76px)] w-full min-w-0 items-center justify-center overflow-x-hidden px-4 py-6 sm:px-6">
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00E676]/[0.055] blur-[100px]" />
      <section className="relative my-auto w-full min-w-0 max-w-[min(468px,calc(100vw-2rem))] rounded-3xl border border-[#00E676]/20 bg-[#101A14]/95 p-6 shadow-[0_28px_100px_rgba(0,0,0,.55),0_0_44px_rgba(0,230,118,.06)] backdrop-blur-xl sm:p-8">
        <Link href="/" aria-label="Zorofy home" className="mx-auto mb-5 flex w-fit items-center justify-center gap-2 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#00E676]">
          <Image src="/logo1.png" width={44} height={44} priority unoptimized alt="" className="h-10 w-10 object-contain" />
          <Image src="/product name.png" width={150} height={52} priority unoptimized alt="Zorofy" className="h-9 w-[138px] object-contain object-left" />
        </Link>
        <header className="mb-5 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-[#F5F7F5] sm:text-[28px]">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-[#A0AAA3]">{subtitle}</p>
        </header>
        {children}
      </section>
    </main>
  );
}

export function AuthField({ id, label, error, trailing, ...inputProps }) {
  return (
    <div className="space-y-2">
      {label && <label htmlFor={id} className="block text-sm font-medium text-[#E8EEE9]">{label}</label>}
      <div className="relative">
        <input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          {...inputProps}
          className={`h-12 w-full rounded-xl border bg-[#080F0B] px-4 text-[15px] text-[#F5F7F5] outline-none transition placeholder:text-[#76817A] focus:border-[#00E676]/70 focus:ring-4 focus:ring-[#00E676]/10 ${error ? "border-rose-400/70" : "border-white/10"} ${trailing ? "pr-12" : ""}`}
        />
        {trailing && <div className="absolute inset-y-0 right-3 flex items-center">{trailing}</div>}
      </div>
      {error && <p id={`${id}-error`} className="text-xs text-rose-300">{error}</p>}
    </div>
  );
}

export function AuthNotice({ children, tone = "error" }) {
  if (!children) return null;
  const colors = tone === "error"
    ? "border-rose-400/25 bg-rose-950/35 text-rose-100"
    : "border-amber-300/25 bg-amber-950/25 text-amber-100";
  return <p role="alert" className={`rounded-xl border px-3.5 py-3 text-sm leading-5 ${colors}`}>{children}</p>;
}

export function AuthDivider() {
  return <div className="flex items-center gap-3 py-1 text-xs font-medium uppercase tracking-[.18em] text-[#758078]"><span className="h-px flex-1 bg-white/10" /><span>or continue with</span><span className="h-px flex-1 bg-white/10" /></div>;
}

export function GoogleButton({ onClick, loading, disabled }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled || loading} className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-[#0B120E] px-4 text-sm font-semibold text-[#F5F7F5] transition hover:border-[#00E676]/45 hover:bg-white/[0.035] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E676]/70 disabled:cursor-not-allowed disabled:opacity-55">
      {loading ? <FiLoader aria-hidden="true" className="animate-spin text-lg" /> : <FcGoogle aria-hidden="true" className="text-xl" />}
      {loading ? "Connecting to Google..." : "Continue with Google"}
    </button>
  );
}

export function AuthSubmitButton({ children, loading, disabled }) {
  return (
    <button type="submit" disabled={disabled || loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#00E676] px-4 text-sm font-bold text-[#06120B] shadow-[0_8px_28px_rgba(0,230,118,.17)] transition hover:bg-[#39FF88] hover:shadow-[0_10px_34px_rgba(0,230,118,.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5F7F5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101A14] disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none">
      {loading && <FiLoader aria-hidden="true" className="animate-spin text-base" />}
      {loading ? "Please wait..." : children}
    </button>
  );
}
