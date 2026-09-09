import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Compass,
  GraduationCap,
  Layers3,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { generatePageMetadata } from "@/lib/seo";
import { redirectToLmsPortal } from "@/lib/lms-portal";
import { LMS_PORTALS, normalizeLmsPortal, type LmsPortal } from "@/lib/lms-roles";
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

  const icons: Record<LmsPortal, typeof ShieldCheck> = {
    admin: ShieldCheck,
    instructor: BookOpenCheck,
    learner: GraduationCap,
  };

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
                  <Link href="/lms/login?portal=learner" className="lms-secondary-cta">
                    Enter learner portal
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

        <section className="lms-portal-section">
          <div className="container-site">
            <div className="lms-section-heading">
              <div><p className="lms-kicker"><span className="lms-kicker-line" />Your learning workspace</p><h2>Everything you need to keep moving.</h2></div>
              <p>Choose your workspace and step into a focused experience designed around your role.</p>
            </div>
            <div className="lms-portal-grid">
              {(Object.keys(LMS_PORTALS) as LmsPortal[]).map((key, index) => {
                const portalOption = LMS_PORTALS[key];
                const Icon = icons[key];
                return (
                  <article key={key} className={`lms-portal-card lms-portal-card-${index + 1}`}>
                    <div className="lms-portal-card-header"><span className="lms-portal-icon"><Icon className="size-5" /></span><span className="lms-portal-number">0{index + 1}</span></div>
                    <p>{portalOption.eyebrow}</p>
                    <h3>{portalOption.label}</h3>
                    <span className="lms-portal-description">{portalOption.description}</span>
                    <Link href={`/lms/login?portal=${key}${providerQuery}`} className="lms-portal-link">Continue as {key === "admin" ? "administrator" : key}<ArrowRight className="size-4" /></Link>
                  </article>
                );
              })}
            </div>
            <div className="lms-portal-footnote"><span>Not sure which workspace is right for you?</span><Link href="/certificate-verification">Verify a CITIS certificate <ArrowRight className="size-3.5" /></Link></div>
          </div>
        </section>

        <LmsCourseCatalogue categories={courseCategories} provider={provider} providerQuery={providerQuery} />
        <ProfessionalProgramsCatalogue compact />
      </main>
    </>
  );
}