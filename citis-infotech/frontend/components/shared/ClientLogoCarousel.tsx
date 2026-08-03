"use client";

import Image from "next/image";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import type { Client } from "@/types";
import { getStrapiMedia } from "@/services/strapi";

interface ClientLogoCarouselProps {
  clients?: Client[];
  /** Simple name list for static marketing pages. */
  logos?: ReadonlyArray<string>;
}

export function ClientLogoCarousel({ clients, logos }: ClientLogoCarouselProps) {
  if (clients?.length) {
    return (
      <div aria-label="Our clients" className="overflow-hidden py-4">
        <Swiper
          modules={[Autoplay]}
          loop={clients.length > 5}
          speed={900}
          autoplay={{ delay: 2200, disableOnInteraction: false, pauseOnMouseEnter: true }}
          spaceBetween={24}
          slidesPerView={2}
          breakpoints={{ 480: { slidesPerView: 3 }, 768: { slidesPerView: 4 }, 1024: { slidesPerView: 6 } }}
        >
          {clients.map((client) => (
            <SwiperSlide key={client.id}>
              <a
                href={client.website ?? "#"}
                target={client.website ? "_blank" : undefined}
                rel={client.website ? "noreferrer" : undefined}
                aria-label={client.name}
                className="flex h-20 items-center justify-center rounded-lg border border-border bg-card px-6 opacity-65 grayscale transition-all hover:opacity-100 hover:grayscale-0"
              >
                <Image
                  src={getStrapiMedia(client.logo)}
                  alt={client.logo.alternativeText ?? client.name}
                  width={150}
                  height={48}
                  className="max-h-10 w-auto object-contain"
                />
              </a>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    );
  }

  if (!logos?.length) return null;

  return (
    <div aria-label="Our clients" className="overflow-hidden py-4">
      <Swiper
        modules={[Autoplay]}
        loop={logos.length > 5}
        speed={900}
        autoplay={{ delay: 2200, disableOnInteraction: false, pauseOnMouseEnter: true }}
        spaceBetween={24}
        slidesPerView={2}
        breakpoints={{ 480: { slidesPerView: 3 }, 768: { slidesPerView: 4 }, 1024: { slidesPerView: 6 } }}
      >
        {logos.map((name) => (
          <SwiperSlide key={name}>
            <div className="flex h-20 items-center justify-center rounded-lg border border-border bg-card px-6">
              <span className="font-heading text-sm font-semibold tracking-wide text-muted-foreground">
                {name}
              </span>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
