import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface OfficeMapProps {
  /** Latitude for the map marker (defaults to Bengaluru). */
  lat?: number;
  /** Longitude for the map marker (defaults to Bengaluru). */
  lng?: number;
  /** Zoom level for OpenStreetMap embed. */
  zoom?: number;
  title?: string;
  addressLabel?: string;
  className?: string;
}

/**
 * Free OpenStreetMap embed — no Google Maps API key or paid map service required.
 */
export function OfficeMap({
  lat = 12.9716,
  lng = 77.5946,
  zoom = 14,
  title = "CITIS InfoTech office location",
  addressLabel = "CITIS InfoTech, Bengaluru",
  className,
}: OfficeMapProps) {
  const delta = 0.04;
  const bbox = `${lng - delta}%2C${lat - delta}%2C${lng + delta}%2C${lat + delta}`;
  const embedSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
  const openSrc = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}`;

  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-muted", className)}>
      <iframe
        title={title}
        src={embedSrc}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-96 w-full border-0"
      />
      <div className="flex items-center justify-between gap-3 border-t border-border bg-card px-4 py-3 text-sm">
        <p className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="size-4 shrink-0 text-primary" />
          {addressLabel}
        </p>
        <a
          href={openSrc}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-primary hover:underline"
        >
          Open map
        </a>
      </div>
    </div>
  );
}

/** @deprecated Prefer OfficeMap — kept as alias for existing imports. */
export const GoogleMap = OfficeMap;
