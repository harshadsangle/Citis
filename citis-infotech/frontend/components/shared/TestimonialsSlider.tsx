"use client";

import { A11y, Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { Quote, Star } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getStrapiMedia } from "@/services/strapi";
import type { Testimonial } from "@/types";

export function TestimonialsSlider({ testimonials }: { testimonials: Testimonial[] }) {
  if (!testimonials.length) return null;
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
      {testimonials.map((item) => (
        <SwiperSlide key={item.id} className="h-auto">
          <figure className="surface flex h-full flex-col rounded-xl p-7 sm:p-8">
            <div className="flex items-center justify-between">
              <Quote className="size-9 text-primary/25" />
              <div className="flex text-amber-500" aria-label={`${item.rating ?? 5} out of 5 stars`}>
                {Array.from({ length: item.rating ?? 5 }).map((_, index) => <Star key={index} className="size-3.5 fill-current" />)}
              </div>
            </div>
            <blockquote className="mt-6 flex-1 font-heading text-lg leading-8 text-foreground">&ldquo;{item.quote}&rdquo;</blockquote>
            <figcaption className="mt-7 flex items-center gap-3 border-t border-border pt-5">
              <Avatar>
                {item.avatar && <AvatarImage src={getStrapiMedia(item.avatar)} alt={item.name} />}
                <AvatarFallback>{item.name.split(" ").map((name) => name[0]).join("").slice(0, 2)}</AvatarFallback>
              </Avatar>
              <span><span className="block text-sm font-semibold">{item.name}</span><span className="block text-xs text-muted-foreground">{item.role}, {item.company}</span></span>
            </figcaption>
          </figure>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
