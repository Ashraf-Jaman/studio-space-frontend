
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  Clapperboard,
  User,
  ChevronDown,
  LogOut,
  Settings,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Explore Studios", href: "/studios" },
  { name: "How It Works", href: "/#HowItWorks" },
  { name: "About Us", href: "/#AboutUs" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  // Better Auth Session
  const { data: session, isPending } = authClient.useSession();

  const user = session?.user;

  // Navigation
  const handleNavigation = (href: string) => {
    setIsOpen(false);

    const id = href.split("#")[1];

    if (!id) {
      router.push(href);
      return;
    }

    if (pathname === "/") {
      smoothScrollTo(id);
      return;
    }

    sessionStorage.setItem("scrollTarget", id);
    router.push("/");
  };

  // Smooth Scroll
  const smoothScrollTo = useCallback((id: string) => {
    const target = document.getElementById(id);

    if (!target) return;

    const startPosition = window.scrollY;
    const targetPosition =
      target.getBoundingClientRect().top + window.scrollY - 90;

    const distance = targetPosition - startPosition;
    const duration = 800;
    let startTime: number | null = null;

    const easeInOut = (t: number) =>
      t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const animateScroll = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;

      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      window.scrollTo(
        0,
        startPosition + distance * easeInOut(progress)
      );

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  }, []);

  // Resume a section scroll requested before navigating to the home page
  useEffect(() => {
    if (pathname !== "/") return;

    const id = sessionStorage.getItem("scrollTarget");

    if (!id) return;

    sessionStorage.removeItem("scrollTarget");

    let frame = 0;

    const attempt = () => {
      if (document.getElementById(id)) {
        smoothScrollTo(id);
        return;
      }

      if (frame++ < 30) requestAnimationFrame(attempt);
    };

    requestAnimationFrame(attempt);
  }, [pathname, smoothScrollTo]);

  // Sign Out
  const handleSignOut = async () => {
    try {
      setSigningOut(true);

      const { error } = await authClient.signOut();

      if (error) {
        console.error("Sign out error:", error);
        return;
      }

      setProfileOpen(false);
      setMobileProfileOpen(false);
      setIsOpen(false);

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Sign out failed:", error);
    } finally {
      setSigningOut(false);
    }
  };

  // Profile Dropdown
  const ProfileDropdown = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="relative">
      <button
        onClick={() =>
          mobile
            ? setMobileProfileOpen(!mobileProfileOpen)
            : setProfileOpen(!profileOpen)
        }
        className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white transition hover:border-orange-500/50 hover:bg-white/10"
      >
        {user?.image ? (
          <img
            src={user.image}
            alt="Profile"
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-white">
            <User size={19} />
          </div>
        )}

        <div className="min-w-0 flex-1 text-left">
          <p className="truncate text-sm font-semibold">
            {user?.name || "My Account"}
          </p>
          <p className="text-xs text-gray-400">My Profile</p>
        </div>

        <ChevronDown
          size={17}
          className={`text-gray-400 transition-transform ${
            (mobile ? mobileProfileOpen : profileOpen)
              ? "rotate-180"
              : ""
          }`}
        />
      </button>

      {(mobile ? mobileProfileOpen : profileOpen) && (
        <div
          className={`z-50 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-[#0b111b] shadow-2xl ${
            mobile
              ? "relative"
              : "absolute right-0 top-full mt-3 w-64"
          }`}
        >
          <div className="border-b border-white/10 px-4 py-4">
            <p className="truncate text-sm font-semibold text-white">
              {user?.name}
            </p>
            <p className="truncate text-xs text-gray-400">
              {user?.email}
            </p>
          </div>

          <div className="p-2">
            <Link
              href="/profile"
              onClick={() => {
                setProfileOpen(false);
                setMobileProfileOpen(false);
                setIsOpen(false);
              }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-300 transition hover:bg-white/5 hover:text-orange-500"
            >
              <User size={17} />
              My Profile
            </Link>

            <Link
              href="/settings"
              onClick={() => {
                setProfileOpen(false);
                setMobileProfileOpen(false);
                setIsOpen(false);
              }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-300 transition hover:bg-white/5 hover:text-orange-500"
            >
              <Settings size={17} />
              Settings
            </Link>

            <div className="my-2 border-t border-white/10" />

            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
            >
              <LogOut size={17} />
              {signingOut ? "Signing out..." : "Sign Out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#05090f]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">

        {/* Logo */}
        <Link
          href="/"
          onClick={() => setIsOpen(false)}
          className="flex items-center gap-2.5"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 shadow-lg shadow-orange-500/20">
            <Clapperboard
              size={24}
              className="text-white"
              strokeWidth={2.2}
            />
          </div>

          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-white">
              Studio<span className="text-orange-500">Space</span>
            </span>

            <span className="text-[9px] font-medium uppercase tracking-[2px] text-gray-400">
              Book Your Creative Space
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleNavigation(link.href)}
              className="text-sm font-medium text-gray-300 transition-colors hover:text-orange-500"
            >
              {link.name}
            </button>
          ))}
        </div>

        {/* Desktop Auth */}
        <div className="hidden items-center gap-3 md:flex">
          {isPending ? (
            <div className="h-10 w-28 animate-pulse rounded-xl bg-white/5" />
          ) : user ? (
            <ProfileDropdown />
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg border border-white/20 px-5 py-2 text-sm font-semibold text-white transition-all hover:border-orange-500 hover:text-orange-500"
              >
                Login
              </Link>

              <Link
                href="/signup"
                className="rounded-lg bg-orange-500 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-orange-600"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="border-t border-white/10 bg-[#05090f] px-5 py-5 md:hidden">
          <div className="flex flex-col gap-5">

            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavigation(link.href)}
                className="text-left text-sm font-medium text-gray-300 transition-colors hover:text-orange-500"
              >
                {link.name}
              </button>
            ))}

            <div className="border-t border-white/10 pt-5">
              {isPending ? (
                <div className="h-12 animate-pulse rounded-xl bg-white/5" />
              ) : user ? (
                <ProfileDropdown mobile />
              ) : (
                <div className="flex gap-3">
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 rounded-lg border border-white/20 py-2.5 text-center text-sm font-semibold text-white hover:border-orange-500 hover:text-orange-500"
                  >
                    Login
                  </Link>

                  <Link
                    href="/signup"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 rounded-lg bg-orange-500 py-2.5 text-center text-sm font-semibold text-white hover:bg-orange-600"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
