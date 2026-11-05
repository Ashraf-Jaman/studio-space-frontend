"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  CalendarCheck,
  CalendarDays,
  Check,
  Compass,
  Image as ImageIcon,
  LoaderCircle,
  Mail,
  ShieldAlert,
  ShieldCheck,
  User,
} from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { authClient } from "@/lib/auth-client";

const API = process.env.NEXT_PUBLIC_API_URL;

type Stats = { made: number; received: number; confirmed: number };

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function formatJoined(value: Date | string | undefined) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-BD", {
    month: "long",
    year: "numeric",
  });
}

function Avatar({
  src,
  name,
}: {
  src?: string | null;
  name: string;
}) {
  // Track the URL that failed instead of a boolean so a newly saved image is
  // still attempted when the old one was broken.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const showImage = Boolean(src) && src !== failedSrc;

  // Sizing is class-based so the avatar can shrink on phones.
  const shell =
    "h-[72px] w-[72px] sm:h-24 sm:w-24 shrink-0 rounded-full border-4 border-[#0b1726]";

  if (showImage) {
    return (
      <img
        src={src as string}
        alt={name}
        onError={() => setFailedSrc(src ?? null)}
        className={`${shell} object-cover`}
      />
    );
  }

  return (
    <div
      className={`${shell} flex items-center justify-center bg-orange-500 text-2xl font-bold text-white sm:text-4xl`}
    >
      {getInitials(name) || <User className="h-8 w-8 sm:h-10 sm:w-10" />}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  className = "",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border border-slate-800 bg-[#0b1726] p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4 ${className}`}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 sm:h-11 sm:w-11">
        <Icon size={18} />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500 sm:text-xs">
          {label}
        </p>
        <p className="mt-0.5 break-words text-base font-semibold text-white sm:mt-0 sm:text-lg">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();

  const user = session?.user;
  const isStudioOwner = (user as { role?: string } | undefined)?.role === "studio_owner";

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!isPending && !user) {
      router.replace("/login");
    }
  }, [isPending, user, router]);

  // The counts are a nice-to-have; a failed request must not block the page.
  useEffect(() => {
    if (!user?.id || !API) return;

    let cancelled = false;

    const loadStats = async () => {
      try {
        const result = await authClient.token();

        if (result.error || !result.data?.token) return;

        const headers = { Authorization: `Bearer ${result.data.token}` };

        const madeRes = await fetch(`${API}/bookings/my`, {
          headers,
          cache: "no-store",
        });
        const madeJson = await madeRes.json();
        const receivedRes = isStudioOwner
          ? await fetch(`${API}/bookings/owner/recent`, { headers, cache: "no-store" })
          : null;
        const receivedJson = receivedRes ? await receivedRes.json() : null;

        if (cancelled) return;

        const count = (res: Response, json: unknown) => {
          if (!res.ok || typeof json !== "object" || json === null) return null;

          const body = json as { success?: boolean; data?: unknown };

          return body.success && Array.isArray(body.data)
            ? body.data.length
            : null;
        };

        const made = count(madeRes, madeJson);
        const received = receivedRes && receivedJson
          ? count(receivedRes, receivedJson)
          : null;
        const confirmed = madeJson.success && Array.isArray(madeJson.data)
          ? madeJson.data.filter((booking: { status?: string }) => booking.status === "confirmed").length
          : null;

        if (made === null && received === null && confirmed === null) return;

        setStats({ made: made ?? 0, received: received ?? 0, confirmed: confirmed ?? 0 });
      } catch {
        // Leave the placeholders in place.
      }
    };

    loadStats();

    return () => {
      cancelled = true;
    };
  }, [user?.id, isStudioOwner]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const name = String(formData.get("name") || "").trim();
    const image = String(formData.get("image") || "").trim();

    setNotice("");

    if (!name) {
      setError("Your name cannot be empty.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const { error: updateError } = await authClient.updateUser({
        name,
        image: image || null,
      });

      if (updateError) {
        throw new Error(updateError.message || "Could not update your profile.");
      }

      setNotice("Your profile has been updated.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050c16] px-4 py-6 text-white sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto grid max-w-[1400px] gap-5 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-6">
        <DashboardSidebar active="profile" />

        <section>
          {/* Header */}
          <div className="mb-5 flex flex-col justify-between gap-4 sm:mb-6 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                My Profile
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Manage your account details and see your activity at a glance.
              </p>
            </div>

          </div>

          {!user ? (
            /* Loading / redirecting */
            <div className="space-y-6">
              <div className="h-56 animate-pulse rounded-2xl border border-slate-800 bg-[#0b1726]" />

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className={`animate-pulse rounded-xl border border-slate-800 bg-[#0b1726] ${
                      index === 2 ? "col-span-2 h-[92px] sm:col-span-1" : "h-[92px]"
                    }`}
                  />
                ))}
              </div>

              <div className="h-80 animate-pulse rounded-2xl border border-slate-800 bg-[#0b1726]" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Identity */}
              <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0b1726]">
                <div className="h-24 bg-gradient-to-r from-orange-600/80 via-orange-500/30 to-slate-900 sm:h-28" />

                <div className="flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-end sm:justify-between sm:px-7 sm:pb-7">
                  <div className="-mt-9 flex items-end gap-4 sm:-mt-12">
                    <Avatar src={user.image} name={user.name} />

                    <div className="min-w-0 pb-1">
                      <h2 className="truncate text-lg font-bold sm:text-2xl">
                        {user.name}
                      </h2>

                      <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-slate-400">
                        <Mail size={14} className="shrink-0" />
                        <span className="truncate">{user.email}</span>

                        {user.emailVerified && (
                          <BadgeCheck
                            size={15}
                            className="shrink-0 text-emerald-400"
                            aria-label="Email verified"
                          />
                        )}
                      </p>

                      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                        <CalendarDays size={13} className="shrink-0" />
                        Member since {formatJoined(user.createdAt)}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                      user.emailVerified
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {user.emailVerified ? (
                      <ShieldCheck size={14} />
                    ) : (
                      <ShieldAlert size={14} />
                    )}
                    {user.emailVerified ? "Verified account" : "Unverified email"}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                <StatCard
                  icon={CalendarCheck}
                  label="Bookings made"
                  value={stats ? String(stats.made) : "—"}
                />
                <StatCard
                  icon={CalendarDays}
                  label={isStudioOwner ? "Bookings received" : "Bookings confirmed"}
                  value={stats ? String(isStudioOwner ? stats.received : stats.confirmed) : "—"}
                />
                <StatCard
                  icon={ShieldCheck}
                  label="Email status"
                  value={user.emailVerified ? "Verified" : "Unverified"}
                  className="col-span-2 sm:col-span-1"
                />
              </div>

              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_360px]">
                {/* Edit form */}
                <form
                  onSubmit={handleSubmit}
                  className="rounded-2xl border border-slate-800 bg-[#0b1726] p-5 sm:p-6"
                >
                  <h3 className="text-lg font-semibold">Profile details</h3>

                  <p className="mt-1 text-sm text-slate-400">
                    This information is shown on your bookings and listings.
                  </p>

                  <div className="mt-6 space-y-5">
                    {/* Name */}
                    <div>
                      <label
                        htmlFor="name"
                        className="mb-2 block text-sm font-medium text-gray-300"
                      >
                        Full name
                      </label>

                      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#111e2d] px-4 focus-within:border-orange-500">
                        <User className="h-5 w-5 shrink-0 text-gray-500" />

                        <input
                          id="name"
                          name="name"
                          type="text"
                          required
                          maxLength={80}
                          autoComplete="name"
                          defaultValue={user.name}
                          placeholder="Your name"
                          className="w-full bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-gray-500"
                        />
                      </div>
                    </div>

                    {/* Avatar URL */}
                    <div>
                      <label
                        htmlFor="image"
                        className="mb-2 block text-sm font-medium text-gray-300"
                      >
                        Profile photo URL
                      </label>

                      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#111e2d] px-4 focus-within:border-orange-500">
                        <ImageIcon className="h-5 w-5 shrink-0 text-gray-500" />

                        <input
                          id="image"
                          name="image"
                          type="url"
                          autoComplete="url"
                          defaultValue={user.image ?? ""}
                          placeholder="https://example.com/photo.jpg"
                          className="w-full bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-gray-500"
                        />
                      </div>

                      <p className="mt-2 text-xs text-slate-500">
                        Leave this empty to use your initials instead.
                      </p>
                    </div>

                    {/* Email (read-only) */}
                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-medium text-gray-300"
                      >
                        Email address
                      </label>

                      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0b1420] px-4">
                        <Mail className="h-5 w-5 shrink-0 text-gray-500" />

                        <input
                          id="email"
                          type="email"
                          value={user.email}
                          readOnly
                          className="w-full cursor-not-allowed bg-transparent py-3.5 text-sm text-slate-400 outline-none"
                        />
                      </div>

                      <p className="mt-2 text-xs text-slate-500">
                        Your email is tied to how you sign in and cannot be
                        changed here.
                      </p>
                    </div>
                  </div>

                  {error && (
                    <p className="mt-5 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                      {error}
                    </p>
                  )}

                  {notice && (
                    <p className="mt-5 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                      <Check size={16} className="shrink-0" />
                      {notice}
                    </p>
                  )}

                  <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-800 pt-5">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                      {saving ? (
                        <>
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>

                    <span className="text-xs text-slate-500">
                      Changes apply everywhere you appear on StudioSpace.
                    </span>
                  </div>
                </form>

                {/* Side column */}
                <div className="space-y-6">
                  <div className="rounded-2xl border border-slate-800 bg-[#0b1726] p-5">
                    <h3 className="text-lg font-semibold">Account</h3>

                    <dl className="mt-4 space-y-4 text-sm">
                      <div className="flex items-start justify-between gap-3">
                        <dt className="text-slate-400">Email</dt>
                        <dd className="min-w-0 truncate text-right text-slate-200">
                          {user.email}
                        </dd>
                      </div>

                      <div className="flex items-start justify-between gap-3">
                        <dt className="text-slate-400">Status</dt>
                        <dd
                          className={
                            user.emailVerified
                              ? "text-emerald-400"
                              : "text-amber-400"
                          }
                        >
                          {user.emailVerified ? "Verified" : "Unverified"}
                        </dd>
                      </div>

                      <div className="flex items-start justify-between gap-3">
                        <dt className="text-slate-400">Member since</dt>
                        <dd className="text-slate-200">
                          {formatJoined(user.createdAt)}
                        </dd>
                      </div>

                      <div className="flex items-start justify-between gap-3">
                        <dt className="shrink-0 text-slate-400">User ID</dt>
                        <dd
                          title={user.id}
                          className="min-w-0 truncate font-mono text-xs leading-5 text-slate-500"
                        >
                          {user.id}
                        </dd>
                      </div>
                    </dl>
                  </div>

                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
