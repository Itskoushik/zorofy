"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setProgress } from "@/redux/features/loadingBarSlice";
import ZorofyAudioLoader from "@/components/ZorofyAudioLoader";
import { useSession } from "next-auth/react";
import { FaGoogle } from "react-icons/fa";

const page = () => {
  const { status } = useSession();
  const router = useRouter();
  const dispatch = useDispatch();
  const [authConfig, setAuthConfig] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    fetch("/api/auth/status", { cache: "no-store" })
      .then((response) => response.json())
      .then(setAuthConfig)
      .catch(() => setAuthConfig({ databaseConfigured: false, googleEnabled: false }));
  }, []);

  useEffect(() => {
    if (status === "authenticated") router.replace("/");
  }, [status, router]);

  const onchange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handelSubmit = async (e) => {
    e.preventDefault();
    if (!authConfig?.databaseConfigured) {
      toast.error("Account storage is not configured. Set MONGODB_URI in .env.local, then restart the app.");
      return;
    }
    try {
      setIsSubmitting(true);
      dispatch(setProgress(70));
      const res = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
        callbackUrl: "/",
      });
      if (res?.ok && !res.error) {
        toast.success("Logged in successfully");
        router.replace(res.url || "/");
        router.refresh();
      } else {
        toast.error(res?.error === "CredentialsSignin" ? "Email or password is incorrect." : "Could not log in. Check your account configuration and try again.");
      }
    } catch (error) {
      toast.error(error?.message || "Could not log in. Please try again.");
    } finally {
      setIsSubmitting(false);
      dispatch(setProgress(100));
    }
  };

  // redirect if user is authenticated
  if (status === "loading") {
    return (
      <div className=" w-screen h-screen flex justify-center items-center">
        <ZorofyAudioLoader size="medium" label="Tuning your experience..." />
      </div>
    );
  }
  return (
    <div className=" w-11/12 mx-auto mt-32 min-h-screen">
      <div className=" flex justify-center items-center">
        <div className="container flex justify-center flex-col items-center w-screen sm:w-[90vw] lg:w-1/2">
          <h1 className=" text-4xl text-[#00E676] font-medium mb-8">Login</h1>
          {authConfig && !authConfig.databaseConfigured && <p role="alert" className="mb-5 max-w-xl rounded-xl border border-amber-400/30 bg-amber-950/30 px-4 py-3 text-sm text-amber-100">Account storage is not configured. Add MONGODB_URI to .env.local and restart the app to enable login and signup.</p>}
          <form
            onSubmit={handelSubmit}
            className="text-white flex flex-col text-base lg:text-xl gap-2 font-medium"
          >
            <div className=" flex gap-4 items-end mb-3">
              <label className=" mr-9 lg:mr-11" htmlFor="email">
                Email
              </label>
              <input
                onChange={onchange}
                value={formData.email}
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Email"
                required
                className=" appearance-none bg-black border-b border-white focus:outline-none text-base lg:text-lg"
              />
            </div>
            <div className=" flex gap-4 items-end">
              <label className="" htmlFor="password">
                Password
              </label>
              <input
                onChange={onchange}
                value={formData.password}
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Password"
                required
                className=" appearance-none bg-black border-b border-white focus:outline-none text-base lg:text-lg"
              />
            </div>
            <Link href={"/reset-password"}>
              <p className=" text-xs text-[#00E676]">Forgot Password?</p>
            </Link>
            <div className=" w-full flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting || !authConfig?.databaseConfigured}
                className="relative inline-block px-4 py-2 font-medium group"
              >
                <span className="absolute inset-0 w-full h-full transition duration-200 ease-out transform translate-x-1 translate-y-1 bg-[#008F52] group-hover:-translate-x-0 group-hover:-translate-y-0"></span>
                <span className="absolute inset-0 w-full h-full bg-black border-2 border-white group-hover:bg-"></span>
                <span className="relative text-white group-hover:text-[#00E676]">
                  {isSubmitting ? "Logging in..." : "Login"}
                </span>
              </button>
            </div>
            {authConfig?.googleEnabled && authConfig?.databaseConfigured && <>
              <div className=" flex justify-center items-center"><hr className=" w-1/2 mx-2 border-white" /><p className=" text-xs text-white">or</p><hr className=" w-1/2 mx-2 border-white" /></div>
              <div className=" w-full flex justify-center">
                <button onClick={() => signIn("google", { callbackUrl: "/" })} type="button" disabled={isSubmitting} className="flex items-center gap-2 hover:border-[#00E676] justify-center px-4 py-2 group font-medium border-2 border-white rounded-sm disabled:opacity-50">
                  <FaGoogle className=" group-hover:text-[#00E676]" /> Continue with Google
                </button>
              </div>
            </>}
            <p className=" w-full flex justify-center gap-2">
              Don't have an account?{" "}
              <Link href={"/signup"} className=" text-[#00E676] font-semibold">
                {" "}
                Sign Up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default page;
