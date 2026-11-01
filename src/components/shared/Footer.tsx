
import Link from "next/link";
import { Clapperboard } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaLinkedinIn,
  FaXTwitter,
} from "react-icons/fa6";

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "Explore Studios", href: "/studios" },
  { name: "How It Works", href: "/how-it-works" },
  { name: "About Us", href: "/about" },
  { name: "Contact", href: "/contact" },
];

const categories = [
  { name: "Photo Studios", href: "/studios/photo" },
  { name: "Sound Systems", href: "/studios/sound" },
  { name: "Podcast Rooms", href: "/studios/podcast" },
  { name: "Music Studios", href: "/studios/music" },
  { name: "Art Workshops", href: "/studios/art" },
];

const socialLinks = [
  { icon: FaFacebookF, href: "#", label: "Facebook" },
  { icon: FaXTwitter, href: "#", label: "Twitter" },
  { icon: FaInstagram, href: "#", label: "Instagram" },
  { icon: FaYoutube, href: "#", label: "YouTube" },
  { icon: FaLinkedinIn, href: "#", label: "LinkedIn" },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-[#05090f] text-gray-400">
      <div className="mx-auto max-w-7xl px-6 py-10">

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Logo & Description */}
          <div>
            <Link href="/" className="mb-4 flex items-center gap-2">
              <Clapperboard
                size={28}
                className="text-orange-500"
              />
              <span className="text-xl font-bold text-white">
                Studio<span className="text-orange-500">Space</span>
              </span>
            </Link>

            <p className="mb-5 max-w-xs text-sm leading-6">
              Creative spaces for creative people.
              Find studios, book your space and
              bring your ideas to life.
            </p>

            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="rounded-full border border-gray-700 p-2 transition hover:border-orange-500 hover:bg-orange-500 hover:text-white"
                >
                  <social.icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 font-semibold text-white">
              Quick Links
            </h3>

            <ul className="space-y-2 text-sm">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="transition hover:text-orange-500"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="mb-4 font-semibold text-white">
              Categories
            </h3>

            <ul className="space-y-2 text-sm">
              {categories.map((category) => (
                <li key={category.name}>
                  <Link
                    href={category.href}
                    className="transition hover:text-orange-500"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="mb-4 font-semibold text-white">
              Newsletter
            </h3>

            <p className="mb-4 text-sm">
              Get the latest updates and offers.
            </p>

            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                required
                className="min-w-0 flex-1 rounded-md border border-gray-700 bg-[#0b111a] px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:border-orange-500"
              />

              <button
                type="submit"
                className="rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                Subscribe
              </button>
            </form>

            <p className="mt-4 text-sm">
              <span className="text-orange-500">✉</span>{" "}
              Stay connected with us!
            </p>
          </div>

        </div>

        {/* Bottom Footer */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-5 text-xs sm:flex-row">

          <p>
            © 2026 StudioSpace. All rights reserved.
          </p>

          <div className="flex gap-5">
            <Link
              href="/terms"
              className="transition hover:text-orange-500"
            >
              Terms of Service
            </Link>

            <Link
              href="/privacy"
              className="transition hover:text-orange-500"
            >
              Privacy Policy
            </Link>
          </div>

        </div>

      </div>
    </footer>
  );
}
