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

export default function SignupPage() {
  const { status } = useSession();
  const router = useRouter();
  const dispatch = useDispatch();
  const [authConfig, setAuthConfig] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({ userName: "", email: "", password: "", confirmPassword: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

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

  const updateField = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => {
      const next = { ...current, [name]: "" };
      if (name === "password" || name === "confirmPassword") {
        const nextPassword = name === "password" ? value : formData.password;
        const nextConfirmation = name === "confirmPassword" ? value : formData.confirmPassword;
        next.confirmPassword = nextConfirmation && nextPassword !== nextConfirmation ? "Passwords do not match." : "";
      }
      return next;
    });
    setErrorMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting || googleLoading) return;
    const errors = {};
    const email = formData.email.trim();
    if (formData.userName.trim().length < 2) errors.userName = "Enter a name with at least 2 characters.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";
    if (formData.password.length < 8) errors.password = "Use at least 8 characters for your password.";
    if (formData.confirmPassword !== formData.password) errors.confirmPassword = "Passwords do not match.";
    setFieldErrors(errors);
    setErrorMessage("");
    if (Object.keys(errors).length) return;
    if (!authConfig?.databaseConfigured) {
      setErrorMessage("Account storage is unavailable. Check the server database configuration and try again.");
      return;
    }

    try {
      setIsSubmitting(true);
      dispatch(setProgress(70));
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: formData.userName.trim(),
          email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.success !== true) {
        setErrorMessage(result?.message || "We could not create your account. Please try again.");
        return;
      }
      toast.success("Your account is ready. Sign in to start listening.");
      router.push("/login");
    } catch {
      setErrorMessage("We could not reach the sign-up service. Please try again.");
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
    <AuthCard title="Create your account" subtitle="Join Zorofy and discover your next favourite.">
      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        <AuthNotice>{errorMessage}</AuthNotice>
        {authConfig && !authConfig.databaseConfigured && <AuthNotice tone="warning">Account storage is unavailable right now. Please try again later.</AuthNotice>}
        {authConfig && (!authConfig.sessionSecretConfigured || !authConfig.canonicalUrlConfigured) && <AuthNotice tone="warning">Server sign-in configuration is incomplete. Set NEXTAUTH_SECRET and NEXTAUTH_URL on the server.</AuthNotice>}
        <AuthField
          id="userName"
          label="Name"
          name="userName"
          type="text"
          autoComplete="name"
          minLength={2}
          maxLength={40}
          placeholder="How should we call you?"
          value={formData.userName}
          onChange={updateField}
          error={fieldErrors.userName}
          required
          disabled={isSubmitting || googleLoading}
        />
        <AuthField
          id="email"
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          maxLength={254}
          placeholder="you@example.com"
          value={formData.email}
          onChange={updateField}
          error={fieldErrors.email}
          required
          disabled={isSubmitting || googleLoading}
        />
        <AuthField
          id="password"
          label="Password"
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          minLength={8}
          placeholder="At least 8 characters"
          value={formData.password}
          onChange={updateField}
          error={fieldErrors.password}
          required
          disabled={isSubmitting || googleLoading}
          trailing={<button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} className="rounded-md p-1 text-[#A0AAA3] outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-[#00E676]"><span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>{showPassword ? <FiEyeOff /> : <FiEye />}</button>}
        />
        <AuthField
          id="confirmPassword"
          label="Confirm password"
          name="confirmPassword"
          type={showConfirmPassword ? "text" : "password"}
          autoComplete="new-password"
          minLength={8}
          placeholder="Enter your password again"
          value={formData.confirmPassword}
          onChange={updateField}
          error={fieldErrors.confirmPassword}
          required
          disabled={isSubmitting || googleLoading}
          trailing={<button type="button" onClick={() => setShowConfirmPassword((visible) => !visible)} aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"} className="rounded-md p-1 text-[#A0AAA3] outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-[#00E676]"><span className="sr-only">{showConfirmPassword ? "Hide confirm password" : "Show confirm password"}</span>{showConfirmPassword ? <FiEyeOff /> : <FiEye />}</button>}
        />
        <p className="-mt-1 text-xs leading-5 text-[#A0AAA3]">Google sign-in is available too; Google accounts do not need a separate Zorofy password.</p>
        <AuthSubmitButton loading={isSubmitting} disabled={status === "loading" || !authConfig?.databaseConfigured || !authConfig?.sessionSecretConfigured || !authConfig?.canonicalUrlConfigured}>Create account</AuthSubmitButton>
        {authConfig?.googleEnabled && <>
          <AuthDivider />
          <GoogleButton onClick={handleGoogle} loading={googleLoading} disabled={isSubmitting || !authConfig.databaseConfigured || !authConfig.sessionSecretConfigured || !authConfig.canonicalUrlConfigured} />
        </>}
        <p className="pt-1 text-center text-sm text-[#A0AAA3]">
          Already have an account? <Link href="/login" className="font-semibold text-[#39FF88] transition hover:text-white focus-visible:outline-none focus-visible:underline">Sign in</Link>
        </p>
      </form>
    </AuthCard>
  );
}
