
import StudioDetailsClient from "./StudioDetailsClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StudioDetailsPage({
  params,
}: PageProps) {
  const { id } = await params;

  return <StudioDetailsClient studioId={id} />;
}
