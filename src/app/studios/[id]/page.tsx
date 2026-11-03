
import { Suspense } from "react";
import StudioDetailsClient from "./StudioDetailsClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

// `params` is runtime data, so it must be read inside a Suspense boundary for
// this route to prerender (cacheComponents). The client component already
// renders its own loading state once the id is known.
async function StudioDetails({ params }: PageProps) {
  const { id } = await params;

  return <StudioDetailsClient studioId={id} />;
}

function StudioDetailsFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080d16]">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
    </div>
  );
}

export default function StudioDetailsPage({ params }: PageProps) {
  return (
    <Suspense fallback={<StudioDetailsFallback />}>
      <StudioDetails params={params} />
    </Suspense>
  );
}
