import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Layers3,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { generatePageMetadata } from "@/lib/seo";
import { redirectToLmsPortal } from "@/lib/lms-portal";
import { normalizeLmsPortal } from "@/lib/lms-roles";
import { LMS_COURSE_CATEGORIES, normalizeLmsCourseProvider } from "@/lib/lms-catalog";
import { ProfessionalProgramsCatalogue } from "@/components/marketing/ProfessionalProgramsCatalogue";
import { LmsCourseCatalogue } from "@/components/marketing/LmsCourseCatalogue";

export const metadata = generatePageMetadata({
  title: "Learning Portal",
  path: "/lms",
  description: "Access the CITIS Skills Excellence Centre learning portal for learners, educators, and institution teams.",
  noIndex: true,
});

type LmsEntryPageProps = {
  searchParams?: Promise<{ portal?: string; provider?: string }>;
};

export default async function LmsEntryPage({ searchParams }: LmsEntryPageProps) {
  const params = await searchParams;
  const provider = normalizeLmsCourseProvider(params?.provider);
  const portal = normalizeLmsPortal(params?.portal);
  if (portal) await redirectToLmsPortal(portal, provider);
  const providerQuery = provider ? `&provider=${provider}` : "";
  const courseCategories = provider
    ? LMS_COURSE_CATEGORIES.filter((category) => category.id === provider)
    : LMS_COURSE_CATEGORIES;
  const courseCount = courseCategories.reduce((total, category) => total + category.courses.length, 0);

  return (
    <>
      <main className="lms-page">
        <section className="lms-hero relative isolate overflow-hidden">
          <div className="lms-hero-grid absolute inset-0 -z-10" aria-hidden="true" />
          <div className="container-site">
            <div className="lms-hero-layout">
              <div className="lms-hero-copy">
                <p className="lms-kicker"><Sparkles className="size-4" />CITIS Skills Excellence Centre</p>
                <h1>Learn skills that move <span>your future forward.</span></h1>
                <p className="lms-hero-lede">
                  Discover objective-led certifications and career-focused programmes built to turn curiosity into capability.
                </p>
                <div className="lms-hero-actions">
                  <Link href="#global-certifications" className="lms-primary-cta">
                    Explore the catalogue <ArrowRight className="size-4" />
                  </Link>
                  <Link href="#professional-programs" className="lms-secondary-cta">
                    View professional programmes
                  </Link>
                </div>
                <div className="lms-hero-proof">
                  <span className="lms-avatar-stack" aria-hidden="true">
                    <span>CS</span><span>AI</span><span>IT</span>
                  </span>
                  <span><strong>Built for purposeful progress</strong><small>Learn with structure, support, and a next step in view.</small></span>
                </div>
              </div>

              <div className="lms-hero-visual" aria-label="CITIS learning platform highlights">
                <div className="lms-hero-orbit lms-hero-orbit-one" />
                <div className="lms-hero-orbit lms-hero-orbit-two" />
                <div className="lms-hero-dashboard">
                  <div className="lms-dashboard-topline"><span>YOUR LEARNING PATH</span><span className="lms-live-dot">LIVE</span></div>
                  <div className="lms-dashboard-title">Make your next<br /><em>skill</em> count.</div>
                  <div className="lms-dashboard-progress">
                    <div><span>Certification pathways</span><strong>{courseCategories.length} providers</strong></div>
                    <span className="lms-progress-track"><span style={{ width: "72%" }} /></span>
                  </div>
                  <div className="lms-dashboard-chips">
                    <span><Layers3 className="size-4" />{courseCount} courses</span>
                    <span><CheckCircle2 className="size-4" />Official objectives</span>
                  </div>
                  <div className="lms-dashboard-footer"><span className="lms-mini-mark">C</span><span>CITIS learning workspace</span><ArrowRight className="ml-auto size-4" /></div>
                </div>
                <span className="lms-float-card lms-float-card-top"><Compass className="size-4" /><span><strong>Find your direction</strong><small>Explore by interest</small></span></span>
                <span className="lms-float-card lms-float-card-bottom"><span className="lms-float-number">01</span><span><strong>Start where you are</strong><small>Build from foundations</small></span></span>
              </div>
            </div>
          </div>
        </section>

        <section className="lms-stat-strip" aria-label="Learning platform highlights">
          <div className="container-site lms-stat-grid">
            <div><strong>{courseCount}</strong><span>certification courses</span></div>
            <div><strong>{courseCategories.length}</strong><span>recognised pathways</span></div>
            <div><strong>01</strong><span>learning workspace</span></div>
            <div className="lms-stat-note"><UsersRound className="size-5 text-accent" /><span>For learners, educators, and institution teams</span></div>
          </div>
        </section>

        <LmsCourseCatalogue categories={courseCategories} provider={provider} providerQuery={providerQuery} />
        <ProfessionalProgramsCatalogue compact />
      </main>
    </>
  );
}