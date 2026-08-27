import Image from "next/image";
import { BadgeCheck, ShieldCheck } from "lucide-react";
import type { GlobalCertification } from "@/lib/global-certifications";

export function DigitalBadge({ certification }: { certification: GlobalCertification }) {
  const isAdobe = certification.slug.startsWith("adobe-");
  const nameSize =
    isAdobe || certification.name.length > 28
      ? "text-[0.58rem] tracking-[0.1em]"
      : certification.name.length > 16
        ? "text-[0.66rem] tracking-[0.12em]"
        : "text-[0.76rem] tracking-[0.14em]";

  return (
    <div className={`group/badge relative mx-auto aspect-square w-full max-w-[15rem] overflow-hidden rounded-[2rem] p-2 shadow-[0_22px_50px_rgba(15,76,129,0.2)] transition-transform duration-300 group-hover/badge:-translate-y-1 ${isAdobe ? "bg-gradient-to-br from-[#eb1000] via-[#1e1e1e] to-[#080808]" : "bg-gradient-to-br from-[#0f4c81] via-[#123d5c] to-[#092c46]"}`}>
      <div className={`absolute -right-12 -top-12 size-36 rounded-full blur-2xl ${isAdobe ? "bg-[#ff2a1a]/40" : "bg-[#f9e8a2]/35"}`} />
      <div className="absolute -bottom-16 -left-12 size-40 rounded-full bg-[#4d9dbc]/30 blur-3xl" />
      <div className="relative flex size-full flex-col items-center justify-between rounded-[1.55rem] border border-white/25 bg-[linear-gradient(160deg,#fafdfe_0%,#e8f4f8_100%)] px-5 py-5 text-center">
        <div className="flex w-full items-center justify-between">
          {isAdobe ? (
            <Image
              src="/images/adobe.png"
              alt="Adobe"
              width={288}
              height={75}
              className="h-auto w-[52%] object-contain"
            />
          ) : (
            <Image
              src="/images/citis-logo-certificate.png"
              alt="CITIS InfoTech"
              width={707}
              height={121}
              className="h-auto w-[58%] object-contain"
            />
          )}
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#fff6d0] text-[#c9930f] shadow-sm">
            <ShieldCheck className="size-4" />
          </span>
        </div>

        <div className="relative grid size-[5.25rem] place-items-center rounded-full border-[3px] border-[#d8b42b] bg-white shadow-[0_8px_20px_rgba(15,76,129,0.12)]">
          <div className="absolute inset-1 rounded-full border border-[#f0d77c]" />
          <BadgeCheck className="relative size-10 text-[#0f4c81]" strokeWidth={1.5} />
        </div>

        <div className="w-full">
           <p className={`text-[0.6rem] font-bold tracking-[0.26em] uppercase ${isAdobe ? "text-[#eb1000]" : "text-[#c49319]"}`}>
             {isAdobe ? "Adobe Credential" : "Digital Badge"}
           </p>
          <p className={`mt-2 font-heading font-bold leading-tight text-[#123d5c] uppercase ${nameSize}`}>
            {certification.name}
          </p>
          <div className="mx-auto mt-3 h-px w-2/3 bg-gradient-to-r from-transparent via-[#8fc1d5] to-transparent" />
          <p className="mt-2 text-[0.58rem] font-semibold tracking-[0.14em] text-[#6d8794] uppercase">
             {isAdobe ? "Adobe · Certiport" : "Global Certification"}
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-[0.58rem] font-semibold text-[#0f4c81]">
           <BadgeCheck className={`size-3.5 ${isAdobe ? "text-[#eb1000]" : "text-[#c9930f]"}`} />
           {isAdobe ? "Badge by Credly" : "Verified credential"}
        </div>
      </div>
    </div>
  );
}