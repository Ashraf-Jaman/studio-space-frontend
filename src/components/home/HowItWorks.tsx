
import {
  Search,
  CalendarCheck,
  CreditCard,
  Video,
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Discover Spaces",
    description: "Browse creative spaces near you.",
    icon: Search,
  },
  {
    number: "02",
    title: "Select Shoot Hours",
    description: "Choose your preferred hours, date and time.",
    icon: CalendarCheck,
  },
  {
    number: "03",
    title: "Book Instantly",
    description: "Secure your booking with ease.",
    icon: CreditCard,
  },
  {
    number: "04",
    title: "Create & Produce",
    description: "Bring your creative vision to life.",
    icon: Video,
  },
];

export default function HowItWorks() {
  return (
    <section className="px-5 py-10 sm:px-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">
          How Booking Works
        </h2>
        <p className="mt-1 text-sm text-gray-400">
          Get your studio in 4 simple steps.
        </p>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step) => {
          const Icon = step.icon;

          return (
            <div key={step.number} className="relative">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
                  {step.number}
                </span>
                <Icon className="h-5 w-5 text-orange-400" />
              </div>

              <h3 className="font-semibold text-white">
                {step.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-400">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-10 h-[2px] w-full bg-gradient-to-r from-orange-500 via-orange-400/50 to-transparent" />
    </section>
  );
}
