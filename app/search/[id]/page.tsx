import { redirect } from "next/navigation";

/**
 * Legacy route. Tag browsing moved to /tag/[slug]; this kept working links
 * from before that change alive rather than 404ing them.
 */
export default function LegacySearchRedirect({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/tag/${params.id}`);
}
