
"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Hexagon, Play } from "lucide-react";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Explore Studios", href: "/studios" },
  { name: "How It Works", href: "/how-it-works" },
  { name: "About Us", href: "/about" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#05090f]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            <Hexagon
              size={28}
              className="text-orange-500"
              strokeWidth={2.5}
            />
            <Play
              size={11}
              fill="currentColor"
              className="absolute text-orange-500"
            />
          </div>

          <span className="text-xl font-bold tracking-tight text-white">
            Studio<span className="text-orange-500">Space</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-gray-300 transition-colors hover:text-orange-500"
            >
              {link.name}
            </Link>
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
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-gray-300 transition-colors hover:text-orange-500"
              >
                {link.name}
              </Link>
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
