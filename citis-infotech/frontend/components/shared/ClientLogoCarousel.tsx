"use client";

import Image from "next/image";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import type { Client } from "@/types";
import { getStrapiMedia } from "@/services/strapi";

interface ClientLogoCarouselProps {
  clients?: Client[];
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
          spaceBetween={20}
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
                className="flex h-24 items-center justify-center rounded-2xl border border-border bg-gradient-to-br from-white to-slate-50 px-6 opacity-80 shadow-sm grayscale transition-all hover:-translate-y-1 hover:opacity-100 hover:grayscale-0 hover:shadow-md dark:from-card dark:to-slate-900"
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

  const loop = logos.length < 6 ? [...logos, ...logos] : logos;

  return (
    <div aria-label="Our clients" className="overflow-hidden py-2">
      <Swiper
        modules={[Autoplay]}
        loop
        speed={1100}
        autoplay={{ delay: 1800, disableOnInteraction: false, pauseOnMouseEnter: true }}
        spaceBetween={18}
        slidesPerView={2}
        breakpoints={{ 480: { slidesPerView: 3 }, 768: { slidesPerView: 4 }, 1024: { slidesPerView: 5 } }}
      >
        {loop.map((name, index) => (
          <SwiperSlide key={`${name}-${index}`}>
            <div className="flex h-28 items-center justify-center rounded-2xl border border-border/80 bg-gradient-to-br from-white via-slate-50 to-[#eef5fb] px-5 shadow-[0_10px_30px_rgba(15,76,129,0.06)] transition hover:-translate-y-1 hover:border-primary/30 dark:from-card dark:via-slate-900 dark:to-slate-950">
              <span className="bg-gradient-to-r from-primary to-[#1d6bb8] bg-clip-text text-center font-heading text-sm font-bold tracking-wide text-transparent sm:text-base">
                {name}
              </span>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
