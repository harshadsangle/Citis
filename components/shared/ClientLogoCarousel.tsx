"use client";

import Image from "next/image";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import type { Client } from "@/types";
import { getStrapiMedia } from "@/services/strapi";

type LogoItem = {
  name: string;
  logo: string;
};

interface ClientLogoCarouselProps {
  clients?: Client[];
  logos?: ReadonlyArray<string | LogoItem>;
}

function normalizeLogos(logos: ReadonlyArray<string | LogoItem>): LogoItem[] {
  return logos.map((item) =>
    typeof item === "string" ? { name: item, logo: "" } : { name: item.name, logo: item.logo },
  );
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
          spaceBetween={20}
          slidesPerView={2}
          breakpoints={{ 480: { slidesPerView: 3 }, 768: { slidesPerView: 4 }, 1024: { slidesPerView: 5 } }}
        >
          {clients.map((client) => (
            <SwiperSlide key={client.id}>
              <a
                href={client.website ?? "#"}
                target={client.website ? "_blank" : undefined}
                rel={client.website ? "noreferrer" : undefined}
                aria-label={client.name}
                className="flex h-28 items-center justify-center rounded-2xl border border-[#0F4C81]/15 bg-white px-5 shadow-[0_8px_28px_rgba(15,76,129,0.08)] transition hover:-translate-y-1 hover:border-[#FF7A00]/40 hover:shadow-[0_12px_32px_rgba(255,122,0,0.12)]"
              >
                <Image
                  src={getStrapiMedia(client.logo)}
                  alt={client.logo.alternativeText ?? client.name}
                  width={180}
                  height={56}
                  className="max-h-14 w-auto object-contain"
                />
              </a>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    );
  }

  if (!logos?.length) return null;

  const items = normalizeLogos(logos);
  const loop = items.length < 6 ? [...items, ...items] : items;

  return (
    <div aria-label="Key clientele" className="overflow-hidden py-2">
      <Swiper
        modules={[Autoplay]}
        loop
        speed={1100}
        autoplay={{ delay: 1800, disableOnInteraction: false, pauseOnMouseEnter: true }}
        spaceBetween={18}
        slidesPerView={2}
        breakpoints={{ 480: { slidesPerView: 3 }, 768: { slidesPerView: 4 }, 1024: { slidesPerView: 5 } }}
      >
        {loop.map((item, index) => (
          <SwiperSlide key={`${item.name}-${index}`}>
            <div className="flex h-28 items-center justify-center rounded-2xl border border-[#0F4C81]/15 bg-white px-4 shadow-[0_8px_28px_rgba(15,76,129,0.08)] transition hover:-translate-y-1 hover:border-[#FF7A00]/40 hover:shadow-[0_12px_32px_rgba(255,122,0,0.12)]">
              {item.logo ? (
                <Image
                  src={item.logo}
                  alt={item.name}
                  width={220}
                  height={72}
                  sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, 33vw"
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-center font-heading text-sm font-bold tracking-wide text-[#0F4C81] sm:text-base">
                  {item.name}
                </span>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
