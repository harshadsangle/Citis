import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface OfficeMapProps {
  /** Latitude for the map marker. */
  lat?: number;
  /** Longitude for the map marker. */
  lng?: number;
  /** Full address used for Google Maps search embed + open link. */
  address?: string;
  /** Zoom level for coordinate-based embeds. */
  zoom?: number;
  title?: string;
  addressLabel?: string;
  className?: string;
}

/**
 * Google Maps embed — uses the public maps embed URL (no Maps Platform API key).
 */
export function OfficeMap({
  lat,
  lng,
  address,
  zoom = 16,
  title = "CITIS InfoTech office location",
  addressLabel,
  className,
}: OfficeMapProps) {
  const query =
    address?.trim() ||
    (lat !== undefined && lng !== undefined ? `${lat},${lng}` : "Bengaluru, India");
  const embedSrc = `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=${zoom}&output=embed`;
  const openSrc = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  const label = addressLabel || address || query;

  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-muted", className)}>
      <iframe
        title={title}
        src={embedSrc}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        className="h-72 w-full border-0 sm:h-80"
      />
      <div className="flex items-center justify-between gap-3 border-t border-border bg-card px-4 py-3 text-sm">
        <p className="flex min-w-0 items-center gap-2 text-muted-foreground">
          <MapPin className="size-4 shrink-0 text-primary" />
          <span className="truncate">{label}</span>
        </p>
        <a
          href={openSrc}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 font-medium text-primary hover:underline"
        >
          Open in Google Maps
        </a>
      </div>
    </div>
  );
}

/** @deprecated Prefer OfficeMap — kept as alias for existing imports. */
export const GoogleMap = OfficeMap;
