 "use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Search } from "lucide-react";

// Swap this single URL to change the hero backdrop.
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1920&q=80";

const stats = [
  { value: "500+", label: "Creative Studios" },
  { value: "1.2k+", label: "Happy Creators" },
  { value: "4.9", label: "Average Rating" },
];

export default function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const term = query.trim();

    router.push(
      term ? `/studios?search=${encodeURIComponent(term)}` : "/studios"
    );
  }

  return (
    <section className="relative isolate overflow-hidden bg-[#05090f]">
      {/* Backdrop */}
      <img
        src={HERO_IMAGE}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-[#05090f] via-[#05090f]/85 to-[#05090f]/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#05090f] via-transparent to-[#05090f]/40" />

      {/* Content */}
      <div className="relative mx-auto flex min-h-[440px] max-w-7xl flex-col justify-center px-5 py-16 lg:min-h-[520px] lg:px-8 lg:py-20">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/40 bg-orange-500/10 px-3 py-1.5 text-[11px] font-medium tracking-wide text-orange-200 sm:text-xs">
            <MapPin className="h-3.5 w-3.5" />
            Connect · Create · Collaborate
          </span>

          <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Find the Perfect Studio for Your{" "}
            <span className="text-orange-500">Creative Vision</span>
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
            From photography studios to music suites, discover and book premium
            creative spaces for your next project.
          </p>

          <form
            onSubmit={handleSubmit}
            role="search"
            className="mt-8 flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0a1622]/90 p-2 backdrop-blur-md"
          >
            <Search className="ml-2 h-4 w-4 shrink-0 text-slate-400" />

            <label htmlFor="hero-search" className="sr-only">
              Search studios
            </label>

            <input
              id="hero-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search studio, location, category..."
              className="min-w-0 flex-1 bg-transparent py-2 text-sm text-white outline-none placeholder:text-slate-400"
            />

            <button
              type="submit"
              className="shrink-0 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400 sm:px-6"
            >
              Search
            </button>
          </form>

          <div className="mt-10 grid max-w-md grid-cols-3">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={
                  index === 0
                    ? "pr-3 sm:pr-10"
                    : "border-l border-white/15 pl-3 sm:pl-10"
                }
              >
                <p className="text-lg font-bold text-white sm:text-2xl">
                  {stat.value}
                </p>

                <p className="mt-1 text-[10px] leading-4 tracking-wide text-slate-400 sm:text-xs">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
