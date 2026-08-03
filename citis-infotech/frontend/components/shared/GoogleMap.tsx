import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface GoogleMapProps {
  query?: string;
  title?: string;
  className?: string;
}

export function GoogleMap({ query = "CITIS Infotech Bengaluru", title = "CITIS InfoTech office location", className }: GoogleMapProps) {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) {
    return (
      <div className={cn("flex min-h-80 items-center justify-center rounded-xl border border-border bg-slate-100 dark:bg-slate-900", className)}>
        <div className="max-w-sm px-6 text-center"><MapPin className="mx-auto size-9 text-primary" /><p className="mt-4 font-heading font-semibold">{title}</p><a className="mt-2 inline-block text-sm text-primary hover:underline" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`} target="_blank" rel="noreferrer">Open in Google Maps</a></div>
      </div>
    );
  }
  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-muted", className)}>
      <iframe title={title} src={`https://www.google.com/maps/embed/v1/place?key=${key}&q=${encodeURIComponent(query)}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen className="h-96 w-full border-0" />
    </div>
  );
}
