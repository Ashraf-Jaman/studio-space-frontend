
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  MapPin,
  SlidersHorizontal,
  Star,
  Wifi,
  Lightbulb,
  Car,
  Snowflake,
  X,
} from "lucide-react";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/studios`;

type Studio = {
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
  rating: number;
  totalReviews?: number;
  createdAt?: string;
};

const MAX_PRICE = 5000;

const categories = [
  "Photo Studios",
  "Sound Studios",
  "Podcast Rooms",
  "Music Studios",
  "Art Workshops",
];

const categoryMap: Record<string, string> = {
  "Photo Studios": "Photography",
  "Sound Studios": "Sound",
  "Podcast Rooms": "Podcast",
  "Music Studios": "Music",
  "Art Workshops": "Art",
};

// Backend category values (e.g. `?category=Music`) back to filter labels.
const categoryFromValue: Record<string, string> = Object.fromEntries(
  Object.entries(categoryMap).map(([label, value]) => [value, label])
);

const amenityOptions = [
  { name: "Lighting", icon: Lightbulb },
  { name: "WiFi", icon: Wifi },
  { name: "Parking", icon: Car },
  { name: "AC", icon: Snowflake },
];

const imageGradients = [
  "from-orange-950 via-stone-800 to-slate-950",
  "from-blue-950 via-indigo-900 to-slate-950",
  "from-purple-950 via-fuchsia-900 to-slate-950",
  "from-red-950 via-rose-900 to-slate-950",
  "from-amber-950 via-orange-900 to-slate-950",
  "from-emerald-950 via-teal-900 to-slate-950",
];

function StudiosContent() {
  const searchParams = useSearchParams();

  const [studios, setStudios] = useState<Studio[]>([]);
  // Locations seen so far. Kept separate from `studios` so the dropdown does
  // not shrink to the current filter's single value.
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState(
    () => searchParams.get("search") ?? ""
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    () => {
      const requested = searchParams.get("category");

      if (!requested) return [];

      return requested
        .split(",")
        .map((value) => categoryFromValue[value.trim()])
        .filter((label): label is string => Boolean(label));
    }
  );
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [rating, setRating] = useState("all");
  const [location, setLocation] = useState("all");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("popular");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  // Bumping this re-runs the fetch effect (used by the "Try Again" button).
  const [retryKey, setRetryKey] = useState(0);

  // Fetch studios from Backend with filters
  useEffect(() => {
    const controller = new AbortController();

    const fetchStudios = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        if (search.trim()) {
          params.set("search", search.trim());
        }

        if (selectedCategories.length > 0) {
          const values = selectedCategories.map(
            (item) => categoryMap[item]
          );

          params.set("category", values.join(","));
        }

        if (location !== "all") {
          params.set("location", location);
        }

        params.set("minPrice", "0");

        if (maxPrice < MAX_PRICE) {
          params.set("maxPrice", String(maxPrice));
        }

        if (selectedAmenities.length > 0) {
          params.set("amenities", selectedAmenities.join(","));
        }

        if (rating !== "all") {
          params.set("minRating", rating);
        }

        const sortMap: Record<string, string> = {
          popular: "newest",
          rating: "rating",
          "price-low": "price-low",
          "price-high": "price-high",
          name: "name",
        };

        params.set("sortBy", sortMap[sortBy] || "newest");

        const response = await fetch(
          `${API_URL}?${params.toString()}`,
          { signal: controller.signal }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to fetch studios"
          );
        }

        const nextStudios: Studio[] = result.data || [];

        setStudios(nextStudios);

        setLocations((previous) => {
          const merged = new Set(previous);

          for (const studio of nextStudios) {
            if (studio.location) merged.add(studio.location);
          }

          return [...merged].sort((a, b) => a.localeCompare(b));
        });
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong"
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchStudios();

    return () => controller.abort();
  }, [
    search,
    selectedCategories,
    maxPrice,
    rating,
    location,
    selectedAmenities,
    sortBy,
    retryKey,
  ]);

  // Backend already filters and sorts
  const filteredStudios = studios;

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category]
    );
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((item) => item !== amenity)
        : [...prev, amenity]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setMaxPrice(MAX_PRICE);
    setRating("all");
    setLocation("all");
    setSelectedAmenities([]);
    setSearch("");
    setSortBy("popular");
  };

  const FilterContent = () => (
    <div className="space-y-7">
      {/* Category */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-white">
          Category
        </h3>

        <div className="space-y-3">
          {categories.map((category) => (
            <label
              key={category}
              className="flex cursor-pointer items-center gap-3 text-sm text-slate-400 hover:text-white"
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => toggleCategory(category)}
                className="h-4 w-4 accent-orange-500"
              />
              {category}
            </label>
          ))}
        </div>
      </div>

      <div className="h-px bg-slate-800" />

      {/* Price */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">
            Maximum Price
          </h3>

          <span className="text-xs text-orange-400">
            ৳{maxPrice.toLocaleString()}
          </span>
        </div>

        <input
          type="range"
          min="0"
          max={MAX_PRICE}
          step="100"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full cursor-pointer accent-orange-500"
        />

        <div className="mt-2 flex justify-between text-xs text-slate-500">
          <span>৳0</span>
          <span>৳5,000+</span>
        </div>
      </div>

      <div className="h-px bg-slate-800" />

      {/* Rating */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-white">
          Minimum Rating
        </h3>

        <div className="space-y-3">
          {[
            { label: "All ratings", value: "all" },
            { label: "4.5+", value: "4.5" },
            { label: "4.0+", value: "4" },
            { label: "3.0+", value: "3" },
          ].map((item) => (
            <label
              key={item.value}
              className="flex cursor-pointer items-center gap-3 text-sm text-slate-400 hover:text-white"
            >
              <input
                type="radio"
                name="rating"
                value={item.value}
                checked={rating === item.value}
                onChange={() => setRating(item.value)}
                className="accent-orange-500"
              />
              {item.label}
            </label>
          ))}
        </div>
      </div>

      <div className="h-px bg-slate-800" />

      {/* Location */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-white">
          Location
        </h3>

        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-[#101c2b] px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-orange-500"
        >
          <option value="all">Any Location</option>

          {locations.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="h-px bg-slate-800" />

      {/* Amenities */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-white">
          Amenities
        </h3>

        <div className="space-y-3">
          {amenityOptions.map(({ name, icon: Icon }) => (
            <label
              key={name}
              className="flex cursor-pointer items-center gap-3 text-sm text-slate-400 hover:text-white"
            >
              <input
                type="checkbox"
                checked={selectedAmenities.includes(name)}
                onChange={() => toggleAmenity(name)}
                className="h-4 w-4 accent-orange-500"
              />

              <Icon size={15} />
              {name}
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={clearFilters}
        className="w-full rounded-lg border border-slate-700 py-2.5 text-sm text-slate-300 transition hover:border-orange-500 hover:text-orange-400"
      >
        Clear All
      </button>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#050c16] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">

        {/* Header */}
        <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Explore Creative Studios
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Find the perfect space for your next project.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {/* Search */}
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search studio name..."
                className="w-full rounded-lg border border-slate-700 bg-[#0b1726] py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-orange-500 sm:w-[290px]"
              />
            </div>

            {/* Sorting */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-slate-700 bg-[#0b1726] px-3 py-3 text-sm text-slate-300 outline-none focus:border-orange-500"
            >
              <option value="popular">Sort by: Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-3 text-sm text-slate-300 lg:hidden"
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">

          {/* Desktop Sidebar */}
          <aside className="hidden h-fit rounded-xl border border-slate-800 bg-[#091523] p-5 lg:block">
            <div className="mb-6 flex items-center gap-2">
              <SlidersHorizontal
                size={17}
                className="text-orange-400"
              />

              <h2 className="font-semibold">Filters</h2>
            </div>

            <FilterContent />
          </aside>

          {/* Results */}
          <section>
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm text-slate-400">
                Showing{" "}
                <span className="font-semibold text-white">
                  {filteredStudios.length}
                </span>{" "}
                studios
              </p>

              <span className="text-xs text-slate-500">
                {studios.length} results
              </span>
            </div>

            {/* Loading */}
            {loading ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div
                    key={item}
                    className="h-[310px] animate-pulse rounded-xl border border-slate-800 bg-[#0b1726]"
                  />
                ))}
              </div>
            ) : error ? (
              /* Error */
              <div className="rounded-xl border border-red-900 bg-red-950/30 p-8 text-center">
                <p className="text-red-400">{error}</p>

                <button
                  onClick={() => setRetryKey((key) => key + 1)}
                  className="mt-4 rounded-lg bg-orange-500 px-5 py-2 text-sm font-semibold text-white"
                >
                  Try Again
                </button>
              </div>
            ) : filteredStudios.length === 0 ? (
              /* Empty State */
              <div className="rounded-xl border border-slate-800 bg-[#091523] px-5 py-16 text-center">
                <Search
                  className="mx-auto mb-4 text-slate-600"
                  size={35}
                />

                <h3 className="text-lg font-semibold">
                  No studios found
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  Try changing your search or filters.
                </p>

                <button
                  onClick={clearFilters}
                  className="mt-5 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              /* Studio Cards */
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredStudios.map((studio, index) => (
                  <article
                    key={studio._id}
                    className="group overflow-hidden rounded-xl border border-slate-800 bg-[#0b1726] transition duration-300 hover:-translate-y-1 hover:border-slate-600 hover:shadow-xl hover:shadow-black/30"
                  >
                    {/* Image */}
                    <div
                      className={`relative h-48 overflow-hidden bg-gradient-to-br ${
                        imageGradients[index % imageGradients.length]
                      }`}
                    >
                      {studio.images?.[0] ? (
                        <img
                          src={studio.images[0]}
                          alt={studio.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <div className="text-center">
                            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-2xl font-bold text-white/80">
                              {studio.name.charAt(0).toUpperCase()}
                            </div>

                            <span className="text-xs font-medium tracking-widest text-white/60">
                              CREATIVE SPACE
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/50 px-3 py-1 text-[11px] font-medium text-white backdrop-blur">
                        {studio.category}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-4">
                      <h3 className="truncate text-base font-semibold text-white group-hover:text-orange-400">
                        {studio.name}
                      </h3>

                      <p className="mt-1 line-clamp-2 min-h-10 text-xs leading-5 text-slate-400">
                        {studio.description}
                      </p>

                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-base font-bold text-emerald-400">
                          ৳{studio.pricePerHour.toLocaleString()}
                          <span className="text-xs font-normal text-slate-500">
                            {" "}/ hour
                          </span>
                        </p>

                        <div className="flex items-center gap-1 text-xs text-amber-400">
                          <Star size={13} fill="currentColor" />
                          {studio.rating?.toFixed(1) ?? "0.0"}
                          <span className="text-slate-500">
                            ({studio.totalReviews ?? 0})
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-3">
                        <div className="flex min-w-0 items-center gap-1.5 text-xs text-slate-400">
                          <MapPin
                            size={13}
                            className="shrink-0 text-orange-400"
                          />

                          <span className="truncate">
                            {studio.address || studio.location}
                          </span>
                        </div>

                        <span className="shrink-0 text-xs text-slate-500">
                          {studio.capacity} guests
                        </span>
                      </div>

                      <Link
                        href={`/studios/${studio._id}`}
                        className="mt-4 block w-full rounded-lg bg-orange-500 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-orange-600"
                      >
                        View Details
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close filters"
            onClick={() => setShowMobileFilters(false)}
            className="absolute inset-0 bg-black/70"
          />

          <div className="absolute bottom-0 left-0 top-0 w-[85%] max-w-sm overflow-y-auto border-r border-slate-800 bg-[#091523] p-5">
            <div className="mb-7 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal
                  size={18}
                  className="text-orange-400"
                />

                <h2 className="font-semibold">Filters</h2>
              </div>

              <button
                onClick={() => setShowMobileFilters(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <FilterContent />

            <button
              onClick={() => setShowMobileFilters(false)}
              className="mt-5 w-full rounded-lg bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-600"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default function ExploreStudiosPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#050c16] px-4 py-8 text-white sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1500px] animate-pulse">
            <div className="h-8 w-72 rounded bg-slate-800" />
            <div className="mt-3 h-4 w-56 rounded bg-slate-800/70" />
            <div className="mt-8 h-12 rounded-xl bg-slate-800/60" />
            <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-72 rounded-2xl bg-slate-800/40"
                />
              ))}
            </div>
          </div>
        </main>
      }
    >
      <StudiosContent />
    </Suspense>
  );
}
