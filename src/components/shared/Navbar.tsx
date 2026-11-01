
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Clapperboard } from "lucide-react";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Explore Studios", href: "/studios" },
  { name: "How It Works", href: "/#HowItWorks" },
  { name: "About Us", href: "/#AboutUs" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (href: string) => {
    setIsOpen(false);

    const id = href.split("#")[1];

    // Normal route navigation
    if (!id) {
      router.push(href);
      return;
    }

    // If already on homepage, scroll without route navigation
    if (pathname === "/") {
      smoothScrollTo(id);
      return;
    }

    // Navigate to homepage first, then scroll
    sessionStorage.setItem("scrollTarget", id);
    router.push("/");
  };

  const smoothScrollTo = (id: string) => {
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
  };

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

        {/* Desktop Auth Buttons */}
        <div className="hidden items-center gap-3 md:flex">
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

            <div className="flex gap-3 border-t border-white/10 pt-5">
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
          </div>
        </div>
      )}
    </nav>
  );
}
