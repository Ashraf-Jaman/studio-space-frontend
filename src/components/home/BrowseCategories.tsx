import Link from "next/link";
import {
  ArrowRight,
  Camera,
  Mic,
  Music,
  Palette,
  SlidersHorizontal,
} from "lucide-react";

const categories = [
  {
    label: "Photo Studios",
    value: "Photography",
    icon: Camera,
    image:
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80",
  },
  {
    label: "Sound Studios",
    value: "Sound",
    icon: SlidersHorizontal,
    image:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=80",
  },
  {
    label: "Podcast Rooms",
    value: "Podcast",
    icon: Mic,
    image:
      "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=800&q=80",
  },
  {
    label: "Music Studios",
    value: "Music",
    icon: Music,
    image:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=800&q=80",
  },
  {
    label: "Art Workshops",
    value: "Art",
    icon: Palette,
    image:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80",
  },
];

export default function BrowseCategories() {
  return (
    <section
      aria-labelledby="browse-categories-heading"
      className="mx-auto max-w-7xl px-5 py-12 lg:px-8"
    >
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2
            id="browse-categories-heading"
            className="text-xl font-bold tracking-tight text-white sm:text-2xl"
          >
            Browse by Category
          </h2>

          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            Find the perfect space for your creative needs.
          </p>
        </div>

        <Link
          href="/studios"
          className="group inline-flex shrink-0 items-center gap-1 text-xs font-medium text-slate-400 transition hover:text-orange-400 sm:text-sm"
        >
          Explore all categories
          <ArrowRight
            size={14}
            className="transition group-hover:translate-x-0.5"
          />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((category) => {
          const Icon = category.icon;

          return (
            <Link
              key={category.value}
              href={`/studios?category=${category.value}`}
              className="group relative block overflow-hidden rounded-xl border border-slate-800 transition duration-300 hover:border-orange-500/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400"
            >
              <div className="relative h-24 sm:h-28">
                <img
                  src={category.image}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#05090f] via-[#05090f]/55 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 flex items-center gap-2.5 p-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-white shadow-lg shadow-orange-500/25">
                    <Icon size={16} />
                  </span>

                  <span className="truncate text-xs font-semibold text-white sm:text-sm">
                    {category.label}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
