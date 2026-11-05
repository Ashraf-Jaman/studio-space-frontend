"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Heart,
  Info,
  LoaderCircle,
  MapPin,
  Star,
  Users,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const API = process.env.NEXT_PUBLIC_API_URL;

const FEATURED_LIMIT = 4;

// Stable empty map so memoised consumers don't re-run every render.
const EMPTY_SAVED: Record<string, string> = {};

type Studio = {
  _id: string;
  name: string;
  category: string;
  location: string;
  address: string;
  pricePerHour: number;
  capacity: number;
  images?: string[];
  rating?: number;
  totalReviews?: number;
};

type WishlistItem = {
  _id: string;
  studioId: string;
};

// Display names for the category values the backend stores.
const categoryLabels: Record<string, string> = {
  Photography: "Photo Studio",
  Sound: "Sound Stage",
  Podcast: "Podcast Room",
  Music: "Music Studio",
  Art: "Art Workshop",
  Film: "Film Studio",
  Event: "Event Space",
};

const imageGradients = [
  "from-orange-950 via-stone-800 to-slate-950",
  "from-blue-950 via-indigo-900 to-slate-950",
  "from-purple-950 via-fuchsia-900 to-slate-950",
  "from-red-950 via-rose-900 to-slate-950",
  "from-amber-950 via-orange-900 to-slate-950",
  "from-emerald-950 via-teal-900 to-slate-950",
];

async function requestStudios(url: string, signal: AbortSignal) {
  const response = await fetch(url, { signal });
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to load studios");
  }

  return (result.data ?? []) as Studio[];
}

async function getToken() {
  const result = await authClient.token();

  if (result.error || !result.data?.token) return null;

  return result.data.token;
}

export default function FeaturedStudios() {
  const router = useRouter();

  const { data: session } = authClient.useSession();

  const userId = session?.user?.id;

  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(Boolean(API));
  const [error, setError] = useState(
    API ? "" : "Studio API is not configured."
  );

  // Wishlist document ids are kept together with the user they belong to, so
  // a signed-out card never renders as saved.
  const [wishlist, setWishlist] = useState<{
    ownerId: string;
    items: Record<string, string>;
  } | null>(null);

  const savedItems = useMemo(
    () =>
      userId && wishlist?.ownerId === userId ? wishlist.items : EMPTY_SAVED,
    [userId, wishlist]
  );

  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [notice, setNotice] = useState("");

  // Bumping this re-runs the fetch effect (used by the "Try Again" button).
  const [retryKey, setRetryKey] = useState(0);

  // Featured studios, falling back to top-rated when the backend has no
  // featured flag yet (or none are marked).
  useEffect(() => {
    if (!API) return;

    const controller = new AbortController();

    const loadStudios = async () => {
      try {
        setLoading(true);
        setError("");

        let next: Studio[] = [];

        try {
          next = await requestStudios(
            `${API}/studios?featured=true`,
            controller.signal
          );
        } catch (err) {
          if (err instanceof Error && err.name === "AbortError") throw err;
          // Fall through to the rating-based request below.
        }

        if (next.length === 0) {
          next = await requestStudios(
            `${API}/studios?sortBy=rating`,
            controller.signal
          );
        }

        if (!controller.signal.aborted) {
          setStudios(next.slice(0, FEATURED_LIMIT));
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        setError(
          err instanceof Error ? err.message : "Something went wrong"
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadStudios();

    return () => controller.abort();
  }, [retryKey]);

  // Saved studios for the current user (outline hearts when signed out).
  useEffect(() => {
    if (!API || !userId) return;

    let cancelled = false;

    const loadWishlist = async () => {
      try {
        const token = await getToken();

        if (!token) return;

        const response = await fetch(`${API}/wishlist/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) return;

        const result = await response.json();

        if (cancelled || !result.success) return;

        const next: Record<string, string> = {};

        for (const item of (result.data ?? []) as WishlistItem[]) {
          next[item.studioId] = item._id;
        }

        setWishlist({ ownerId: userId, items: next });
      } catch (err) {
        console.error("Wishlist fetch error:", err);
      }
    };

    loadWishlist();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const toggleSaved = useCallback(
    async (studio: Studio) => {
      if (!API) return;

      if (!userId) {
        router.push("/login");
        return;
      }

      setPendingIds((previous) => new Set(previous).add(studio._id));
      setNotice("");

      try {
        const token = await getToken();

        if (!token) {
          router.push("/login");
          return;
        }

        const savedId = savedItems[studio._id];

        if (savedId) {
          const response = await fetch(`${API}/wishlist/${savedId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });

          const result = await response.json().catch(() => ({}));

          if (!response.ok || result.success === false) {
            throw new Error(
              result.message || "Unable to remove studio."
            );
          }

          setWishlist((previous) => {
            if (!previous || previous.ownerId !== userId) {
              return previous;
            }

            const items = { ...previous.items };
            delete items[studio._id];
            return { ownerId: userId, items };
          });
        } else {
          const response = await fetch(`${API}/wishlist`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ studioId: studio._id }),
          });

          const result = await response.json();

          if (!response.ok || !result.success) {
            throw new Error(result.message || "Unable to save studio.");
          }

          const wishlistId = result.data?._id;

          if (wishlistId) {
            setWishlist((previous) => ({
              ownerId: userId,
              items: {
                ...(previous?.ownerId === userId ? previous.items : {}),
                [studio._id]: wishlistId,
              },
            }));
          }
        }
      } catch (err) {
        setNotice(
          err instanceof Error ? err.message : "Wishlist update failed."
        );
      } finally {
        setPendingIds((previous) => {
          const next = new Set(previous);
          next.delete(studio._id);
          return next;
        });
      }
    },
    [router, savedItems, userId]
  );

  return (
    <section
      aria-labelledby="featured-studios-heading"
      className="mx-auto max-w-7xl px-5 pt-12 lg:px-8"
    >
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2
            id="featured-studios-heading"
            className="text-xl font-bold tracking-tight text-white sm:text-2xl"
          >
            Featured Studios
          </h2>

          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            Top-rated and most popular studios this week.
          </p>
        </div>

        <Link
          href="/studios"
          className="group inline-flex shrink-0 items-center gap-1 text-xs font-medium text-slate-400 transition hover:text-orange-400 sm:text-sm"
        >
          View All
          <ArrowRight
            size={14}
            className="transition group-hover:translate-x-0.5"
          />
        </Link>
      </div>

      {notice ? (
        <p role="status" className="mb-4 text-xs text-orange-300">
          {notice}
        </p>
      ) : null}

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: FEATURED_LIMIT }).map((_, index) => (
            <div
              key={index}
              className="h-[322px] animate-pulse rounded-xl border border-slate-800 bg-[#0b1726]"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-900 bg-red-950/30 p-8 text-center">
          <p className="text-sm text-red-400">{error}</p>

          <button
            onClick={() => setRetryKey((key) => key + 1)}
            className="mt-4 rounded-lg bg-orange-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            Try Again
          </button>
        </div>
      ) : studios.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-[#091523] px-5 py-12 text-center">
          <p className="text-sm font-semibold text-white">
            No featured studios yet
          </p>

          <p className="mt-2 text-xs text-slate-400">
            New spaces are added every week — check back soon.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {studios.map((studio, index) => {
            const saved = Boolean(savedItems[studio._id]);
            const pending = pendingIds.has(studio._id);
            const rating = studio.rating ?? 0;
            const category =
              categoryLabels[studio.category] ?? studio.category;

            return (
              <article
                key={studio._id}
                className="group overflow-hidden rounded-xl border border-slate-800 bg-[#0b1726] transition duration-300 hover:-translate-y-1 hover:border-orange-500/40 hover:shadow-xl hover:shadow-black/30"
              >
                {/* Image */}
                <div
                  className={`relative h-40 overflow-hidden bg-gradient-to-br ${
                    imageGradients[index % imageGradients.length]
                  }`}
                >
                  {studio.images?.[0] ? (
                    <img
                      src={studio.images[0]}
                      alt={studio.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-xl font-bold text-white/80">
                        {studio.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />

                  <button
                    type="button"
                    onClick={() => toggleSaved(studio)}
                    disabled={pending}
                    aria-pressed={saved}
                    aria-label={
                      saved
                        ? `Remove ${studio.name} from saved studios`
                        : `Save ${studio.name}`
                    }
                    className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur transition disabled:cursor-not-allowed ${
                      saved
                        ? "border-orange-400 bg-orange-500 text-white"
                        : "border-white/20 bg-black/40 text-white hover:border-orange-400 hover:text-orange-400"
                    }`}
                  >
                    {pending ? (
                      <LoaderCircle size={14} className="animate-spin" />
                    ) : (
                      <Heart
                        size={14}
                        fill={saved ? "currentColor" : "none"}
                      />
                    )}
                  </button>

                  {studio.capacity > 0 ? (
                    <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">
                      <Users size={10} />
                      {studio.capacity}{" "}
                      {studio.capacity === 1 ? "guest" : "guests"}
                    </span>
                  ) : null}
                </div>

                {/* Details */}
                <div className="p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-orange-400">
                    {category}
                  </p>

                  <h3 className="mt-1.5 truncate text-sm font-semibold text-white transition group-hover:text-orange-400">
                    {studio.name}
                  </h3>

                  <div className="mt-2 flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-white">
                      ৳{studio.pricePerHour.toLocaleString()}
                      <span className="text-[11px] font-normal text-slate-500">
                        {" "}
                        /hr
                      </span>
                    </p>

                    <p className="flex items-center gap-1 text-[11px] font-medium text-amber-400">
                      <Star size={12} fill="currentColor" />
                      {rating.toFixed(1)}
                    </p>
                  </div>

                  <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
                    <MapPin
                      size={12}
                      className="shrink-0 text-orange-400"
                    />

                    <span className="truncate">
                      {studio.location || studio.address || "Location TBA"}
                    </span>
                  </p>

                  <Link
                    href={`/studios/${studio._id}`}
                    className="mt-4 flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 py-2 text-xs font-medium text-slate-200 transition hover:border-orange-500 hover:text-orange-400"
                  >
                    <Info size={13} />
                    View Details
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
