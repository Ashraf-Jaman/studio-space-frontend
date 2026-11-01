
import {
  ShieldCheck,
  BadgeCheck,
  PackageCheck,
  Headset,
} from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Liability Protection",
    description: "Coverage for your peace of mind.",
  },
  {
    icon: BadgeCheck,
    title: "Verified Profiles",
    description: "Real creators, real studios.",
  },
  {
    icon: PackageCheck,
    title: "Equipment Safety",
    description: "Fair and reliable equipment protection.",
  },
  {
    icon: Headset,
    title: "24/7 Host Support",
    description: "We're here whenever you need help.",
  },
];

export default function AboutUs() {
  return (
    <section className="px-5 py-10 sm:px-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-orange-500">
          About StudioSpace
        </p>

        <h2 className="mt-2 text-2xl font-bold text-white">
          Host Guarantee & Creator Support
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-400">
          StudioSpace connects creators with inspiring spaces.
          We make studio discovery and booking simple while
          helping hosts and creators feel confident throughout
          the experience.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <div
              key={feature.title}
              className="rounded-xl border border-white/10 bg-[#0b1722] p-4 transition hover:border-orange-500/50"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-orange-500/20 bg-orange-500/10">
                <Icon className="h-5 w-5 text-orange-500" />
              </div>

              <h3 className="text-sm font-semibold text-white">
                {feature.title}
              </h3>

              <p className="mt-2 text-xs leading-5 text-gray-400">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
