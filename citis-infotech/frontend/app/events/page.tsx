import { EventsClient } from "./EventsClient";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Events",
  path: "/events",
  description: "Workshops, seminars, conferences, and training sessions from CITIS InfoTech.",
});

export default function EventsPage() {
  return <EventsClient />;
}
