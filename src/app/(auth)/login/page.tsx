
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  LoaderCircle,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/",
      });

      if (error) {
        setError(error.message || "Invalid email or password.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setGoogleLoading(true);

    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch {
      setError("Google login failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  return (
    <section className="flex min-h-[750px] items-center justify-center bg-[#05090f] px-4 py-12">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-[#0b1420] shadow-2xl md:grid-cols-2">

        {/* Left Side */}
        <div className="relative hidden min-h-[600px] flex-col justify-end overflow-hidden p-10 md:flex">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=85&w=1200&auto=format&fit=crop')",
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#05090f] via-black/40 to-black/20" />

          <div className="relative z-10">
            <span className="mb-4 inline-block rounded-full border border-white/20 px-4 py-2 text-xs text-gray-300">
              CONNECT · CREATE · COLLABORATE
            </span>

            <h1 className="text-4xl font-bold leading-tight text-white">
              Welcome Back!
            </h1>

            <p className="mt-4 max-w-sm text-sm leading-7 text-gray-300">
              Sign in to access your account and manage your studios,
              bookings, and more.
            </p>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center justify-center p-6 sm:p-10 md:p-12">
          <div className="w-full max-w-md">

            <div className="mb-8">
              <p className="text-sm font-medium text-orange-400">
                Welcome to StudioSpace
              </p>

              <h2 className="mt-2 text-3xl font-bold text-white">
                Login to your account
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-orange-400 hover:text-orange-300"
                >
                  Register
                </Link>
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Email Address
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#111e2d] px-4 focus-within:border-orange-500">
                  <Mail className="h-5 w-5 text-gray-500" />

                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-transparent py-4 text-sm text-white outline-none placeholder:text-gray-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Password
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#111e2d] px-4 focus-within:border-orange-500">
                  <LockKeyhole className="h-5 w-5 text-gray-500" />

                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-transparent py-4 text-sm text-white outline-none placeholder:text-gray-500"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-500 hover:text-white"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between gap-3 text-sm">
                <label className="flex items-center gap-2 text-gray-400">
                  <input
                    type="checkbox"
                    className="accent-orange-500"
                  />
                  Remember me
                </label>

                <Link
                  href="/forgot-password"
                  className="text-orange-400 hover:text-orange-300"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Error */}
              {error && (
                <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </p>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading || googleLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-4 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    Login
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs text-gray-500">
                OR CONTINUE WITH
              </span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* Google Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-[#111e2d] py-4 text-sm font-medium text-white transition hover:bg-[#192a3c] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {googleLoading ? (
                <>
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                  Connecting to Google...
                </>
              ) : (
                <>
                  <FcGoogle className="h-5 w-5" />
                  Continue with Google
                </>
              )}
            </button>

            <p className="mt-7 text-center text-xs leading-6 text-gray-500">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="text-orange-400">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-orange-400">
                Privacy Policy
              </Link>.
            </p>

          </div>
        </div>
      </div>
    </section>
  );
}
