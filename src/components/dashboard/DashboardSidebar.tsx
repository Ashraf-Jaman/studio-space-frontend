"use client";

import Link from "next/link";
import {
  Building2,
  LayoutDashboard,
  User,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

type ItemKey = "profile" | "dashboard" | "listings";

const items: {
  key: ItemKey;
  label: string;
  icon: React.ElementType;
  href?: string;
}[] = [
  { key: "profile", label: "My Profile", icon: User, href: "/profile" },
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { key: "listings", label: "My Listings", icon: Building2, href: "/dashboard#my-listings" },
];

/**
 * Dashboard rail shared by the account pages. The active item is passed in
 * rather than read from `usePathname`, so pages do not need an extra Suspense
 * boundary for the `cacheComponents` prerender.
 */
export default function DashboardSidebar({
  active,
}: {
  active: ItemKey;
}) {
  const { data: session } = authClient.useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const visibleItems = items.filter((item) => item.key !== "listings" || role === "studio_owner");

  const renderItem = (item: (typeof items)[number]) => {
    const Icon = item.icon;
    const isActive = item.key === active;

    if (!item.href) {
      return (
        <span
          key={item.key}
          aria-disabled="true"
          className="flex min-w-0 cursor-not-allowed items-center gap-2 rounded-lg px-2.5 py-2.5 text-sm text-gray-600 sm:gap-3 sm:px-3"
        >
          <Icon size={17} className="shrink-0" />
          <span className="truncate">{item.label}</span>
          <span className="ml-auto hidden shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-gray-500 sm:inline">
            Soon
          </span>
        </span>
      );
    }

    return (
      <Link
        key={item.key}
        href={item.href}
        aria-current={isActive ? "page" : undefined}
        className={`flex min-w-0 items-center gap-2 rounded-lg px-2.5 py-2.5 text-sm transition sm:gap-3 sm:px-3 ${
          isActive
            ? "bg-orange-500/10 font-semibold text-orange-400"
            : "text-gray-300 hover:bg-white/5 hover:text-orange-400"
        }`}
      >
        <Icon size={17} className="shrink-0" />
        <span className="truncate">{item.label}</span>
      </Link>
    );
  };

  return (
    <aside className="rounded-xl border border-slate-800 bg-[#091523] p-3 lg:sticky lg:top-24 lg:h-fit lg:p-4">
      {/* Mobile / tablet: compact grid so every link stays reachable */}
      <nav className="grid grid-cols-2 gap-2 lg:hidden">
        {visibleItems.map(renderItem)}
      </nav>

      {/* Desktop: vertical rail */}
      <nav className="hidden flex-col gap-1 lg:flex">
        {visibleItems.map(renderItem)}
      </nav>
    </aside>
  );
}
