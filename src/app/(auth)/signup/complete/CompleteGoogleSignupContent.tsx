"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function CompleteGoogleSignupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const requestedRole = searchParams.get("role");
    const role = requestedRole === "studio_owner" ? "studio_owner" : "customer";

    void authClient.updateUser({ role }).then(({ error }) => {
      if (cancelled) return;
      router.replace(error ? "/signup?error=role" : "/");
      router.refresh();
    });

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#05090f] px-4 text-center text-white">
      <div>
        <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-orange-500" />
        <p className="mt-4 text-sm text-gray-300">Finishing your signup...</p>
      </div>
    </main>
  );
}
