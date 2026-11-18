"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setProgress } from "@/redux/features/loadingBarSlice";
import { AuthCard, AuthDivider, AuthField, AuthNotice, AuthSubmitButton, GoogleButton } from "@/components/Auth/AuthUi";

const oauthErrors = {
  OAuthAccountNotLinked: "This email is already registered. Sign in with your original method, then connect Google from your account.",
  OAuthCallbackError: "Google sign-in could not be completed. Check the Google callback and account database settings, then try again.",
  OAuthSignin: "Zorofy could not start Google sign-in. Check the OAuth client configuration and try again.",
  AccessDenied: "Google did not provide a verified email address for this account.",
  Configuration: "Sign-in is not configured correctly. Check the server authentication environment settings.",
};

export default function LoginPage() {
  const { status, update } = useSession();
  const router = useRouter();
  const dispatch = useDispatch();
  const [authConfig, setAuthConfig] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({ email: "", password: "" });

  useEffect(() => {
    let active = true;
    fetch("/api/auth/status", { cache: "no-store" })
      .then((response) => response.json())
      .then((config) => { if (active) setAuthConfig(config); })
      .catch(() => { if (active) setAuthConfig({ databaseConfigured: false, googleEnabled: false, sessionSecretConfigured: false, canonicalUrlConfigured: false }); });
    const error = new URLSearchParams(window.location.search).get("error");
    if (error) setErrorMessage(oauthErrors[error] || "Sign-in could not be completed. Please try again.");
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (status === "authenticated") router.replace("/");
  }, [status, router]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    setErrorMessage("");
    const errors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) errors.email = "Enter a valid email address.";
    if (!formData.password) errors.password = "Enter your password.";
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;
    if (!authConfig?.databaseConfigured) {
      setErrorMessage("Account storage is unavailable. Check the server database configuration and try again.");
      return;
    }
    try {
      setIsSubmitting(true);
      dispatch(setProgress(70));
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email.trim(),
        password: formData.password,
        callbackUrl: "/",
      });
      if (!result?.ok || result.error) {
        setErrorMessage(result?.error === "CredentialsSignin" ? "That email and password combination was not recognized." : "We could not sign you in. Please try again.");
        return;
      }
      await update();
      toast.success("Welcome back");
      router.replace("/");
      router.refresh();
    } catch {
      setErrorMessage("We could not reach the sign-in service. Please try again.");
    } finally {
      setIsSubmitting(false);
      dispatch(setProgress(100));
    }
  };

  const handleGoogle = async () => {
    if (googleLoading || !authConfig?.googleEnabled || !authConfig?.databaseConfigured) return;
    setErrorMessage("");
    setGoogleLoading(true);
    try {
      const result = await signIn("google", { callbackUrl: "/" });
      if (result?.error) {
        setErrorMessage("Google sign-in could not be completed. Please check your account and try again.");
        setGoogleLoading(false);
      }
    } catch {
      setErrorMessage("Zorofy could not connect to Google sign-in. Please try again.");
      setGoogleLoading(false);
    }
  };

  return (
    <AuthCard title="Welcome back" subtitle="Your music is waiting for you.">
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <AuthNotice>{errorMessage}</AuthNotice>
        {authConfig && !authConfig.databaseConfigured && <AuthNotice tone="warning">Account storage is unavailable right now. Please try again later.</AuthNotice>}
        {authConfig && (!authConfig.sessionSecretConfigured || !authConfig.canonicalUrlConfigured) && <AuthNotice tone="warning">Server sign-in configuration is incomplete. Set NEXTAUTH_SECRET and NEXTAUTH_URL on the server.</AuthNotice>}
        <AuthField
          id="email"
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          maxLength={254}
          value={formData.email}
          onChange={(event) => { setFormData((current) => ({ ...current, email: event.target.value })); setFieldErrors((current) => ({ ...current, email: "" })); }}
          error={fieldErrors.email}
          required
          disabled={isSubmitting || googleLoading}
        />
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="password" className="text-sm font-medium text-[#E8EEE9]">Password</label>
            <Link href="/reset-password" className="text-xs font-medium text-[#39FF88] transition hover:text-white focus-visible:outline-none focus-visible:underline">Forgot password?</Link>
          </div>
          <AuthField
            id="password"
            label=""
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={(event) => { setFormData((current) => ({ ...current, password: event.target.value })); setFieldErrors((current) => ({ ...current, password: "" })); }}
            error={fieldErrors.password}
            required
            disabled={isSubmitting || googleLoading}
            trailing={<button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} className="rounded-md p-1 text-[#A0AAA3] outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-[#00E676]"><span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>{showPassword ? <FiEyeOff /> : <FiEye />}</button>}
          />
        </div>
        <AuthSubmitButton loading={isSubmitting} disabled={status === "loading" || !authConfig?.databaseConfigured || !authConfig?.sessionSecretConfigured || !authConfig?.canonicalUrlConfigured}>Sign in</AuthSubmitButton>
        {authConfig?.googleEnabled && <>
          <AuthDivider />
          <GoogleButton onClick={handleGoogle} loading={googleLoading} disabled={isSubmitting || !authConfig.databaseConfigured || !authConfig.sessionSecretConfigured || !authConfig.canonicalUrlConfigured} />
        </>}
        <p className="pt-1 text-center text-sm text-[#A0AAA3]">
          New to Zorofy? <Link href="/signup" className="font-semibold text-[#39FF88] transition hover:text-white focus-visible:outline-none focus-visible:underline">Create an account</Link>
        </p>
      </form>
    </AuthCard>
  );
}
