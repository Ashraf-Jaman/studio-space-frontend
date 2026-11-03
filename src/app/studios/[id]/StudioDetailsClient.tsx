
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Users,
  Clock,
  Heart,
  Star,
  Check,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  LoaderCircle,
  Camera,
  Music,
  Wifi,
  Snowflake,
  Car,
  Coffee,
  Volume2,
} from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

const API = process.env.NEXT_PUBLIC_API_URL;

interface Studio {
  _id: string;
  ownerId: string;
  name: string;
  description: string;
  category: string;
  location: string;
  address: string;
  pricePerHour: number;
  capacity: number;
  images: string[];
  amenities: string[];
  isAvailable: boolean;
}

interface Review {
  _id: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface WishlistItem {
  _id: string;
  studioId: string;
}

const amenityIcons: Record<string, React.ElementType> = {
  AC: Snowflake,
  "Sound System": Volume2,
  WiFi: Wifi,
  Parking: Car,
  Coffee,
  Camera,
  Music,
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDuration(hours: number) {
  return `${hours} ${hours === 1 ? "hour" : "hours"}`;
}

export default function StudioDetailsClient({
  studioId,
}: {
  studioId: string;
}) {
  const router = useRouter();

  const { data: session, isPending: sessionLoading } =
    authClient.useSession();

  const userId = session?.user?.id;

  const [studio, setStudio] = useState<Studio | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem | null>(null);

  const [loading, setLoading] = useState(true);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("12:00");
  const [bookingError, setBookingError] = useState("");

  const [notice, setNotice] = useState("");

  const [reviewPage, setReviewPage] = useState(0);

  // API helper
  const getToken = async () => {
    const result = await authClient.token();

    if (result.error || !result.data?.token) {
      throw new Error("Please login to continue.");
    }

    return result.data.token;
  };

  const authenticatedFetch = async (
    url: string,
    options: RequestInit = {}
  ) => {
    const token = await getToken();

    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
  };

  // Fetch studio and reviews
  const fetchStudio = useCallback(async () => {
    try {
      setLoading(true);

      const [studioRes, reviewRes] = await Promise.all([
        fetch(`${API}/studios/${studioId}`, {
          cache: "no-store",
        }),
        fetch(`${API}/reviews/studio/${studioId}`, {
          cache: "no-store",
        }),
      ]);

      if (!studioRes.ok) {
        throw new Error("Studio not found.");
      }

      const studioJson = await studioRes.json();
      const reviewJson = await reviewRes.json();

      if (!studioJson.success) {
        throw new Error(
          studioJson.message || "Unable to load studio."
        );
      }

      setStudio(studioJson.data);
      setReviews(
        reviewJson.success && Array.isArray(reviewJson.data)
          ? reviewJson.data
          : []
      );
      setReviewPage(0);
    } catch (error) {
      console.error("Studio fetch error:", error);
      setNotice(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, [studioId]);

  useEffect(() => {
    fetchStudio();
  }, [fetchStudio]);

  // Fetch wishlist
  useEffect(() => {
    if (!userId || !API) return;

    let cancelled = false;

    const fetchWishlist = async () => {
      try {
        const res = await authenticatedFetch(
          `${API}/wishlist/user/${userId}`
        );

        if (!res.ok) return;

        const json = await res.json();

        if (!cancelled && json.success) {
          const items: WishlistItem[] = json.data || [];

          const found = items.find(
            (item) => item.studioId === studioId
          );

          setWishlist(found || null);
        }
      } catch (error) {
        console.error("Wishlist fetch error:", error);
      }
    };

    fetchWishlist();

    return () => {
      cancelled = true;
    };
  }, [userId, studioId]);

  // Wishlist toggle
  const handleWishlist = async () => {
    if (!userId) {
      router.push("/login");
      return;
    }

    try {
      setWishlistLoading(true);

      if (wishlist) {
        const res = await authenticatedFetch(
          `${API}/wishlist/${wishlist._id}`,
          { method: "DELETE" }
        );

        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || "Unable to remove wishlist.");
        }

        setWishlist(null);
        setNotice("Removed from wishlist.");
      } else {
        const res = await authenticatedFetch(
          `${API}/wishlist`,
          {
            method: "POST",
            body: JSON.stringify({ studioId }),
          }
        );

        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || "Unable to add wishlist.");
        }

        setWishlist({
          _id: json.data?._id,
          studioId,
        });

        setNotice("Added to wishlist.");
      }
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Wishlist failed."
      );
    } finally {
      setWishlistLoading(false);
    }
  };

  // Calculate booking price
  const duration =
    startTime && endTime
      ? Math.max(
          0,
          (new Date(`2000-01-01T${endTime}:00`).getTime() -
            new Date(`2000-01-01T${startTime}:00`).getTime()) /
            3600000
        )
      : 0;

  const totalPrice = studio
    ? Math.ceil(duration * studio.pricePerHour)
    : 0;

  // Create booking
  const handleBooking = async () => {
    setBookingError("");

    if (!userId) {
      router.push("/login");
      return;
    }

    if (!studio?.isAvailable) {
      setBookingError("This studio is currently unavailable.");
      return;
    }

    if (!selectedDate || !startTime || !endTime) {
      setBookingError("Please select date and time.");
      return;
    }

    if (duration <= 0) {
      setBookingError("End time must be after start time.");
      return;
    }

    const start = new Date(`${selectedDate}T${startTime}:00`);
    const end = new Date(`${selectedDate}T${endTime}:00`);

    if (start <= new Date()) {
      setBookingError("Please select a future time.");
      return;
    }

    try {
      setBookingLoading(true);

      const res = await authenticatedFetch(`${API}/bookings`, {
        method: "POST",
        body: JSON.stringify({
          studioId,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          totalPrice,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Booking failed.");
      }

      setNotice("Booking request submitted successfully!");
      setBookingError("");
    } catch (error) {
      setBookingError(
        error instanceof Error ? error.message : "Booking failed."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading || sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080d16]">
        <LoaderCircle className="h-10 w-10 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!studio) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#080d16] px-5 text-center text-white">
        <h2 className="text-2xl font-bold">Studio Not Found</h2>
        <p className="mt-2 text-gray-400">{notice}</p>
        <Link
          href="/"
          className="mt-6 rounded-xl bg-orange-500 px-6 py-3"
        >
          Back Home
        </Link>
      </div>
    );
  }

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) /
        reviews.length
      : 0;

  const images = studio.images?.length
    ? studio.images
    : ["/images/studio-placeholder.svg"];

  return (
    <main className="min-h-screen bg-[#080d16] pb-20 text-white">
      {/* Header */}
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
          <Link
            href="/studios"
            className="flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
          >
            <ArrowLeft size={18} />
            Back to Studios
          </Link>

          <button
            onClick={handleWishlist}
            disabled={wishlistLoading}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
              wishlist
                ? "border-red-500/40 bg-red-500/10 text-red-400"
                : "border-white/10 text-gray-300 hover:border-red-500/40 hover:text-red-400"
            }`}
          >
            {wishlistLoading ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <Heart
                size={17}
                fill={wishlist ? "currentColor" : "none"}
              />
            )}
            {wishlist ? "Saved" : "Save Studio"}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Studio Title */}
        <div className="mb-7 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-400">
                {studio.category}
              </span>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  studio.isAvailable
                    ? "bg-green-500/10 text-green-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {studio.isAvailable ? "Available" : "Unavailable"}
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {studio.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1.5">
                <MapPin size={16} className="text-orange-400" />
                {studio.location}
              </span>

              <span className="flex items-center gap-1.5">
                <Star
                  size={16}
                  className="fill-yellow-400 text-yellow-400"
                />
                {averageRating
                  ? averageRating.toFixed(1)
                  : "New studio"}
                ({reviews.length} reviews)
              </span>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <section className="mb-12 grid gap-3 md:grid-cols-4">
          <div className="group relative h-[300px] overflow-hidden rounded-2xl border border-white/10 md:col-span-3 md:h-[480px]">
            <img
              src={images[activeImage]}
              alt={studio.name}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

            <button
              onClick={() =>
                setActiveImage((prev) =>
                  prev === 0 ? images.length - 1 : prev - 1
                )
              }
              className="absolute left-4 top-1/2 rounded-full border border-white/20 bg-black/50 p-2 backdrop-blur hover:bg-black/80"
              aria-label="Previous image"
            >
              <ChevronLeft />
            </button>

            <button
              onClick={() =>
                setActiveImage((prev) => (prev + 1) % images.length)
              }
              className="absolute right-4 top-1/2 rounded-full border border-white/20 bg-black/50 p-2 backdrop-blur hover:bg-black/80"
              aria-label="Next image"
            >
              <ChevronRight />
            </button>

            <span className="absolute bottom-5 right-5 flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-xs backdrop-blur">
              <Camera size={15} />
              {activeImage + 1} / {images.length}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 md:grid-cols-1">
            {images.slice(0, 3).map((image, index) => (
              <button
                key={image + index}
                onClick={() => setActiveImage(index)}
                className={`h-24 overflow-hidden rounded-xl border-2 transition md:h-[151px] ${
                  activeImage === index
                    ? "border-orange-500"
                    : "border-white/10 opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={image}
                  alt={`${studio.name} ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </section>

        {/* Main Content */}
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_390px]">
          <div className="space-y-10">
            {/* Overview */}
            <section>
              <h2 className="text-2xl font-bold">About this studio</h2>

              <p className="mt-4 whitespace-pre-line text-sm leading-8 text-gray-400 sm:text-base">
                {studio.description}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-[#101925] p-4">
                  <Users className="mb-3 text-orange-400" />
                  <p className="text-xl font-bold">{studio.capacity}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Guest Capacity
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#101925] p-4">
                  <Clock className="mb-3 text-orange-400" />
                  <p className="text-xl font-bold">Hourly</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Booking Type
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#101925] p-4">
                  <MapPin className="mb-3 text-orange-400" />
                  <p className="text-sm font-bold">{studio.location}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Studio Location
                  </p>
                </div>
              </div>
            </section>

            {/* Amenities */}
            <section>
              <h2 className="text-2xl font-bold">What this place offers</h2>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {studio.amenities.map((amenity) => {
                  const Icon =
                    amenityIcons[amenity] || Check;

                  return (
                    <div
                      key={amenity}
                      className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#101925] p-4"
                    >
                      <Icon className="h-5 w-5 shrink-0 text-orange-400" />
                      <span className="text-sm text-gray-300">
                        {amenity}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Address */}
            <section>
              <h2 className="text-2xl font-bold">Location</h2>

              <div className="mt-5 rounded-2xl border border-white/10 bg-[#101925] p-5">
                <div className="flex gap-3">
                  <MapPin className="mt-1 shrink-0 text-orange-400" />
                  <div>
                    <h3 className="font-semibold">{studio.location}</h3>
                    <p className="mt-1 text-sm text-gray-400">
                      {studio.address}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Reviews */}
            <section id="reviews">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-bold">Guest Reviews</h2>

                <span className="flex items-center gap-2 text-sm text-gray-400">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {averageRating
                    ? averageRating.toFixed(1)
                    : "No ratings"}{" "}
                  · {reviews.length} reviews
                </span>
              </div>

              {reviews.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-[#101925] px-5 py-12 text-center">
                  <Star className="mx-auto h-9 w-9 text-gray-600" />
                  <h3 className="mt-4 font-semibold">
                    No reviews yet
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Be the first to share your experience.
                  </p>
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  {reviews
                    .slice(reviewPage * 4, reviewPage * 4 + 4)
                    .map((review) => (
                      <article
                        key={review._id}
                        className="rounded-2xl border border-white/10 bg-[#101925] p-5"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">
                              Guest
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {formatDate(review.createdAt)}
                            </p>
                          </div>

                          <span className="flex items-center gap-1 rounded-full bg-yellow-500/10 px-3 py-1 text-sm text-yellow-400">
                            <Star className="h-3 w-3 fill-current" />
                            {review.rating}/5
                          </span>
                        </div>

                        <p className="mt-4 text-sm leading-7 text-gray-400">
                          {review.comment}
                        </p>
                      </article>
                    ))}

                  {reviews.length > 4 && (
                    <div className="flex items-center justify-between">
                      <button
                        disabled={reviewPage === 0}
                        onClick={() =>
                          setReviewPage((p) => Math.max(0, p - 1))
                        }
                        className="rounded-lg border border-white/10 px-4 py-2 disabled:opacity-30"
                      >
                        Previous
                      </button>

                      <span className="text-xs text-gray-500">
                        Page {reviewPage + 1} of{" "}
                        {Math.ceil(reviews.length / 4)}
                      </span>

                      <button
                        disabled={
                          (reviewPage + 1) * 4 >= reviews.length
                        }
                        onClick={() => setReviewPage((p) => p + 1)}
                        className="rounded-lg border border-white/10 px-4 py-2 disabled:opacity-30"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>

          {/* Booking Card */}
          <aside className="lg:sticky lg:top-8">
            <div className="rounded-2xl border border-white/10 bg-[#101925] p-6 shadow-2xl shadow-black/20">
              <div className="flex items-end justify-between border-b border-white/10 pb-5">
                <div>
                  <p className="text-sm text-gray-400">
                    Price per hour
                  </p>
                  <p className="mt-1 text-3xl font-bold text-white">
                    ৳{studio.pricePerHour.toLocaleString("en-BD")}
                  </p>
                </div>

                <span className="rounded-lg bg-orange-500/10 px-3 py-2 text-xs text-orange-400">
                  / hour
                </span>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    <CalendarDays className="mr-2 inline h-4 w-4 text-orange-400" />
                    Select Date
                  </label>

                  <input
                    type="date"
                    min={new Date().toLocaleDateString("en-CA")}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#080d16] px-4 py-3 text-sm text-white outline-none focus:border-orange-500 [color-scheme:dark]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-2 block text-sm text-gray-400">
                      Start Time
                    </label>

                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#080d16] px-3 py-3 text-sm text-white outline-none focus:border-orange-500 [color-scheme:dark]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-gray-400">
                      End Time
                    </label>

                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#080d16] px-3 py-3 text-sm text-white outline-none focus:border-orange-500 [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div className="rounded-xl bg-[#080d16] p-4">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Duration</span>
                    <span className="text-white">
                      {duration > 0 ? formatDuration(duration) : "—"}
                    </span>
                  </div>

                  <div className="mt-3 flex justify-between text-sm text-gray-400">
                    <span>
                      ৳{studio.pricePerHour.toLocaleString("en-BD")} ×{" "}
                      {formatDuration(duration)}
                    </span>
                    <span className="text-white">
                      ৳{totalPrice.toLocaleString("en-BD")}
                    </span>
                  </div>

                  <div className="mt-4 flex justify-between border-t border-white/10 pt-4 font-bold">
                    <span>Total</span>
                    <span className="text-xl text-orange-400">
                      ৳{totalPrice.toLocaleString("en-BD")}
                    </span>
                  </div>
                </div>

                {bookingError && (
                  <p className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                    {bookingError}
                  </p>
                )}

                <button
                  onClick={handleBooking}
                  disabled={
                    bookingLoading ||
                    !studio.isAvailable ||
                    !selectedDate ||
                    duration <= 0
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-4 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {bookingLoading ? (
                    <>
                      <LoaderCircle className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Book This Studio
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <p className="flex items-center justify-center gap-2 text-center text-xs text-gray-500">
                  <ShieldCheck size={15} className="text-green-400" />
                  Secure booking with JWT authentication
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {notice && (
        <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-white/10 bg-[#172333] px-5 py-3 text-sm shadow-xl">
          <Check className="h-4 w-4 text-green-400" />
          {notice}
          <button
            onClick={() => setNotice("")}
            className="ml-2 text-gray-400 hover:text-white"
          >
            ×
          </button>
        </div>
      )}
    </main>
  );
}
