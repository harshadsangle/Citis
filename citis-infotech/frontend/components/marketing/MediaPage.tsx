import Image from "next/image";
import { AnimatedSection } from "@/components/shared/AnimatedSection";

const mediaPhotos = [
  {
    src: "/images/media/microsoft-ict-championship-sakal-times.png",
    alt: "Media",
  },
  {
    src: "/images/media/microsoft-championship-sakal-today.png",
    alt: "Media",
  },
];

export function MediaPage() {
  return (
    <section className="container-site py-16 sm:py-24">
      <AnimatedSection>
        <div className="grid gap-8 md:grid-cols-2">
          {mediaPhotos.map((photo) => (
            <figure
              key={photo.src}
              className="overflow-hidden rounded-2xl border border-border bg-white p-3 shadow-[0_12px_36px_rgba(15,76,129,0.08)]"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                width={1228}
                height={1505}
                priority
                className="h-auto w-full rounded-xl"
              />
            </figure>
          ))}
        </div>
      </AnimatedSection>
    </section>
  );
}