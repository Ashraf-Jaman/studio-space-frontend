
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  MapPin,
  DollarSign,
  Users,
  Image as ImageIcon,
  Wifi,
  Lightbulb,
  Car,
  Snowflake,
  Music,
  Armchair,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const amenitiesList = [
  { name: "WiFi", icon: Wifi },
  { name: "Lighting", icon: Lightbulb },
  { name: "Parking", icon: Car },
  { name: "AC", icon: Snowflake },
  { name: "Sound System", icon: Music },
  { name: "Other", icon: Armchair },
];

export default function CreateStudioForm() {
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [amenities, setAmenities] = useState<string[]>([]);

  // This page is owner-only; send anonymous visitors to login up front instead
  // of letting them fill in the whole form before the token call fails.
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace("/login");
    }
  }, [isPending, session, router]);

  const toggleAmenity = (value: string) => {
    setAmenities((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!session?.user) {
      router.replace("/login");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const imageUrl = String(formData.get("imageUrl") || "").trim();

    const studioData = {
      name: String(formData.get("name") || "").trim(),
      category: String(formData.get("category") || ""),
      pricePerHour: Number(formData.get("pricePerHour")),
      capacity: Number(formData.get("capacity")),
      location: String(formData.get("location") || "").trim(),
      address: String(formData.get("address") || "").trim(),
      images: imageUrl ? [imageUrl] : [],
      amenities,
      description: String(formData.get("description") || "").trim(),
      isAvailable: true,
    };


try {
  const { data: tokenData, error: tokenError } =
    await authClient.token();

  if (tokenError || !tokenData?.token) {
    throw new Error("Authentication token not found");
  }

  
  const res = await fetch("http://localhost:4000/api/studios", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokenData.token}`,
    },
    body: JSON.stringify(studioData),
  });

  
  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to create studio");
  }

  
  setMessage("Studio created successfully!");
  form.reset();
  setAmenities([]);

} catch (err) {
  setError(
    err instanceof Error ? err.message : "Something went wrong"
  );
} finally {
  setLoading(false);
}

  };

  return (
    <section className="min-h-screen bg-[#05090f] px-4 py-12">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-2xl border border-white/10 bg-[#0b111b] shadow-2xl md:grid-cols-[0.8fr_1.5fr]">

        {/* Left Side */}
        <div className="relative flex min-h-[300px] flex-col justify-end overflow-hidden p-7 md:min-h-[750px]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1200')",
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#05090f] via-black/40 to-black/10" />

          <div className="relative z-10">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500">
              <Camera className="h-6 w-6 text-white" />
            </div>

            <h2 className="text-2xl font-bold text-white">
              Join Our Community
            </h2>

            <p className="mt-2 max-w-xs text-sm leading-6 text-gray-300">
              Be part of a creative network and share your spaces
              with the world.
            </p>
          </div>
        </div>

        {/* Right Side */}
        <div className="p-6 sm:p-9 lg:p-12">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-white">
              Create Your Studio
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              Add your studio details and start receiving bookings.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Studio Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Studio Title
              </label>

              <input
                name="name"
                type="text"
                placeholder="Enter studio name"
                required
                className="w-full rounded-lg border border-white/10 bg-[#101b28] px-4 py-3 text-sm text-white outline-none transition focus:border-orange-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Studio Category
              </label>

              <select
                name="category"
                required
                defaultValue=""
                className="w-full rounded-lg border border-white/10 bg-[#101b28] px-4 py-3 text-sm text-white outline-none focus:border-orange-500"
              >
                <option value="" disabled>Select category</option>
                <option value="Photography">Photography Studio</option>
                <option value="Podcast">Podcast Studio</option>
                <option value="Music">Music Studio</option>
                <option value="Film">Film & Video Studio</option>
                <option value="Event">Event Space</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Price and Capacity */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  <DollarSign className="mr-1 inline h-4 w-4 text-orange-500" />
                  Hourly Rate (৳)
                </label>

                <input
                  name="pricePerHour"
                  type="number"
                  min="1"
                  placeholder="e.g. 500"
                  required
                  className="w-full rounded-lg border border-white/10 bg-[#101b28] px-4 py-3 text-sm text-white outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  <Users className="mr-1 inline h-4 w-4 text-orange-500" />
                  Maximum Capacity
                </label>

                <input
                  name="capacity"
                  type="number"
                  min="1"
                  placeholder="e.g. 10"
                  required
                  className="w-full rounded-lg border border-white/10 bg-[#101b28] px-4 py-3 text-sm text-white outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Location and Address */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  <MapPin className="mr-1 inline h-4 w-4 text-orange-500" />
                  Location / City
                </label>

                <input
                  name="location"
                  type="text"
                  placeholder="e.g. Dhaka"
                  required
                  className="w-full rounded-lg border border-white/10 bg-[#101b28] px-4 py-3 text-sm text-white outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Full Address
                </label>

                <input
                  name="address"
                  type="text"
                  placeholder="Enter full address"
                  required
                  className="w-full rounded-lg border border-white/10 bg-[#101b28] px-4 py-3 text-sm text-white outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                <ImageIcon className="mr-1 inline h-4 w-4 text-orange-500" />
                Studio Image URL
              </label>

              <input
                name="imageUrl"
                type="url"
                placeholder="https://example.com/image.jpg"
                required
                className="w-full rounded-lg border border-white/10 bg-[#101b28] px-4 py-3 text-sm text-white outline-none focus:border-orange-500"
              />
            </div>

            {/* Amenities */}
            <div>
              <label className="mb-3 block text-sm font-medium text-gray-300">
                Amenities
              </label>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {amenitiesList.map((item) => {
                  const Icon = item.icon;
                  const checked = amenities.includes(item.name);

                  return (
                    <label
                      key={item.name}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm transition ${
                        checked
                          ? "border-orange-500 bg-orange-500/10 text-orange-400"
                          : "border-white/10 bg-[#101b28] text-gray-400 hover:border-white/30"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleAmenity(item.name)}
                        className="accent-orange-500"
                      />

                      <Icon className="h-4 w-4" />
                      {item.name}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Detailed Overview
              </label>

              <textarea
                name="description"
                rows={4}
                required
                placeholder="Write a detailed description of your studio..."
                className="w-full resize-none rounded-lg border border-white/10 bg-[#101b28] px-4 py-3 text-sm text-white outline-none focus:border-orange-500"
              />
            </div>

            {/* Messages */}
            {message && (
              <p className="rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-400">
                {message}
              </p>
            )}

            {error && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-orange-500 py-3.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating Studio..." : "Create Studio"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
