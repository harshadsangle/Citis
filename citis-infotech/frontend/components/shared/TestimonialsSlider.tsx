"use client";

import { A11y, Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { Quote, Star } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getStrapiMedia } from "@/services/strapi";
import type { Testimonial } from "@/types";

type SliderItem = {
  id?: string | number;
  name: string;
  role: string;
  company: string;
  quote: string;
  rating?: number;
  avatarUrl?: string;
};

interface TestimonialsSliderProps {
  testimonials?: Testimonial[];
  /** Static marketing fallbacks when CMS data is unavailable. */
  items?: ReadonlyArray<{
    name: string;
    role: string;
    company: string;
    content?: string;
    quote?: string;
    rating?: number;
  }>;
}

export function TestimonialsSlider({ testimonials, items }: TestimonialsSliderProps) {
  const slides: SliderItem[] =
    testimonials?.map((item) => ({
      id: item.id,
      name: item.name,
      role: item.role,
      company: item.company,
      quote: item.quote,
      rating: item.rating,
      avatarUrl: item.avatar ? getStrapiMedia(item.avatar) : undefined,
    })) ??
    items?.map((item, index) => ({
      id: index,
      name: item.name,
      role: item.role,
      company: item.company,
      quote: item.quote ?? item.content ?? "",
      rating: item.rating,
    })) ??
    [];

  if (!slides.length) return null;

  return (
    <Swiper
      modules={[A11y, Autoplay, Pagination]}
      autoplay={{ delay: 5500, disableOnInteraction: false, pauseOnMouseEnter: true }}
      pagination={{ clickable: true }}
      spaceBetween={24}
      slidesPerView={1}
      breakpoints={{ 768: { slidesPerView: 2 } }}
      className="!pb-12"
    >
      {slides.map((item) => (
        <SwiperSlide key={item.id ?? item.name} className="h-auto">
          <figure className="surface flex h-full flex-col rounded-[1.5rem] border border-border/60 bg-gradient-to-br from-card to-slate-50/80 p-7 shadow-[0_16px_50px_rgba(15,76,129,0.08)] sm:p-8 dark:to-slate-900/50">
            <div className="flex items-center justify-between">
              <Quote className="size-10 text-accent/70" />
              <div className="flex text-amber-500" aria-label={`${item.rating ?? 5} out of 5 stars`}>
                {Array.from({ length: item.rating ?? 5 }).map((_, index) => (
                  <Star key={index} className="size-3.5 fill-current" />
                ))}
              </div>
            </div>
            <blockquote className="mt-6 flex-1 font-heading text-xl leading-9 font-medium text-foreground">
              &ldquo;{item.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-7 flex items-center gap-3 border-t border-border pt-5">
              <Avatar>
                {item.avatarUrl ? <AvatarImage src={item.avatarUrl} alt={item.name} /> : null}
                <AvatarFallback>
                  {item.name
                    .split(" ")
                    .map((name) => name[0])
                    .join("")
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <span>
                <span className="block text-sm font-semibold">{item.name}</span>
                <span className="block text-xs text-muted-foreground">
                  {item.role}, {item.company}
                </span>
              </span>
            </figcaption>
          </figure>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
