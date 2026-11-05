"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  LoaderCircle,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { authClient } from "@/lib/auth-client";

export default function SignupPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState<"customer" | "studio_owner">("customer");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  // Email Signup
  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const role = formData.get("role") as "customer" | "studio_owner";

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await authClient.signUp.email({
        name,
        email,
        password,
        role,
        callbackURL: "/dashboard",
      });

      if (error) {
        setError(error.message || "Failed to create account.");
        return;
      }

      if (data) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Google Signup
  const handleGoogleSignup = async () => {
    try {
      setError("");
      setGoogleLoading(true);

      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
        newUserCallbackURL: `/signup/complete?role=${role}`,
      });
    } catch (err) {
      console.error("Google signup error:", err);
      setError("Google signup failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  return (
    <section className="min-h-[85vh] bg-[#05090f] px-4 py-12">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-[#0b111b] shadow-2xl md:grid-cols-2">

        {/* Left Side */}
        <div className="relative hidden min-h-[700px] flex-col justify-between overflow-hidden p-12 md:flex">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1200')",
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-orange-950/70" />

          <div className="relative z-10">
            <p className="text-2xl font-bold tracking-wide text-white">
              Studio<span className="text-orange-500">Space</span>
            </p>
          </div>

          <div className="relative z-10 max-w-md">
            <span className="mb-5 inline-block rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-orange-400">
              Join our community
            </span>

            <h1 className="text-4xl font-bold leading-tight text-white lg:text-5xl">
              Find your space.
              <br />
              Create something
              <span className="text-orange-500"> amazing.</span>
            </h1>

            <p className="mt-6 leading-7 text-gray-300">
              Create your account and discover inspiring studios
              and creative spaces for your next project.
            </p>
          </div>

          <p className="relative z-10 text-sm text-gray-400">
            © 2026 StudioSpace. All rights reserved.
          </p>
        </div>

        {/* Right Side */}
        <div className="flex items-center justify-center p-6 py-12 sm:p-10 lg:p-14">
          <div className="w-full max-w-md">

            <div className="mb-8">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-orange-500">
                Get started
              </p>

              <h2 className="text-3xl font-bold text-white">
                Create an account
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                Join StudioSpace and find your perfect creative space.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Google Signup */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={googleLoading || loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 py-3.5 font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {googleLoading ? (
                <LoaderCircle className="h-5 w-5 animate-spin" />
              ) : (
                <FcGoogle className="h-5 w-5" />
              )}

              {googleLoading
                ? "Connecting to Google..."
                : "Continue with Google"}
            </button>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs uppercase tracking-wider text-gray-500">
                Or sign up with email
              </span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* Signup Form */}
            <form onSubmit={handleSignup} className="space-y-5">

              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Full name
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#080d15] px-4 transition focus-within:border-orange-500">
                  <User className="h-5 w-5 text-gray-500" />

                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    required
                    autoComplete="name"
                    className="w-full bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-gray-600"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Email address
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#080d15] px-4 transition focus-within:border-orange-500">
                  <Mail className="h-5 w-5 text-gray-500" />

                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    className="w-full bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-gray-600"
                  />
                </div>
              </div>

              {/* Account role */}
              <fieldset>
                <legend className="mb-2 block text-sm font-medium text-gray-300">
                  I want to join as
                </legend>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-[#080d15] p-4 transition has-checked:border-orange-500 has-checked:bg-orange-500/10">
                    <input
                      type="radio"
                      name="role"
                      value="customer"
                      checked={role === "customer"}
                      onChange={() => setRole("customer")}
                      className="mt-1 accent-orange-500"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-white">
                        Customer
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-gray-400">
                        Find and book a studio
                      </span>
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-[#080d15] p-4 transition has-checked:border-orange-500 has-checked:bg-orange-500/10">
                    <input
                      type="radio"
                      name="role"
                      value="studio_owner"
                      checked={role === "studio_owner"}
                      onChange={() => setRole("studio_owner")}
                      className="mt-1 accent-orange-500"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-white">
                        Studio owner
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-gray-400">
                        List and manage a studio
                      </span>
                    </span>
                  </label>
                </div>
              </fieldset>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Password
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#080d15] px-4 transition focus-within:border-orange-500">
                  <LockKeyhole className="h-5 w-5 text-gray-500" />

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create a password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-gray-600"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-500 hover:text-white"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Confirm password
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#080d15] px-4 transition focus-within:border-orange-500">
                  <LockKeyhole className="h-5 w-5 text-gray-500" />

                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-gray-600"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="text-gray-500 hover:text-white"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 text-sm text-gray-400">
                <input
                  type="checkbox"
                  required
                  className="mt-1 accent-orange-500"
                />

                <span>
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-orange-500 hover:underline"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-orange-500 hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || googleLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-gray-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-orange-500 hover:text-orange-400"
              >
                Sign in
              </Link>
            </p>

          </div>
        </div>
      </div>
    </section>
  );
}
