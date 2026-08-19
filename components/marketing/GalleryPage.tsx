import Image from "next/image";
import { AnimatedSection } from "@/components/shared/AnimatedSection";

const galleryPhotos = [
  "/images/gallery/gallery-01.png",
  "/images/gallery/gallery-02.png",
  "/images/gallery/gallery-03.png",
  "/images/gallery/gallery-04.png",
  "/images/gallery/gallery-05.png",
  "/images/gallery/gallery-06.png",
  "/images/gallery/gallery-07.png",
];

export function GalleryPage() {
  return (
    <section className="container-site py-16 sm:py-24">
      <AnimatedSection>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {galleryPhotos.map((src, index) => (
            <figure
              key={src}
              className="overflow-hidden rounded-2xl border border-border bg-white p-3 shadow-[0_12px_36px_rgba(15,76,129,0.08)]"
            >
              <Image
                src={src}
                alt={`Gallery photo ${index + 1}`}
                width={1600}
                height={1066}
                priority={index < 2}
                className="h-auto w-full rounded-xl"
              />
            </figure>
          ))}
        </div>
      </AnimatedSection>
    </section>
  );
}