"use client";

import { useState } from "react";
import {
  Building2,
  Brain,
  FlaskConical,
  Cpu,
  CheckCircle2,
  Send,
  LoaderCircle,
} from "lucide-react";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { openMailto, SUPPORT_EMAIL } from "@/lib/mailto";

/* ─── Data ──────────────────────────────────────────────────────────────── */

const franchiseModels = [
  {
    icon: Building2,
    title: "CITIS Skill Development Centre",
    description:
      "Focused on vocational education, technology skills, certifications and employability programs.",
  },
  {
    icon: Brain,
    title: "CITIS AI Academy",
    description:
      "Focused on AI literacy, AI skills, emerging technologies and future-ready learning.",
  },
  {
    icon: FlaskConical,
    title: "CITIS STEM & Innovation Centre",
    description:
      "Focused on STEM education, coding, digital making, science learning and innovation.",
  },
  {
    icon: Cpu,
    title: "CITIS Technology Centre",
    description:
      "Focused on advanced technology programs, professional certifications and industry-oriented learning.",
  },
];

const institutionalAreas = [
  "AI Academy",
  "AI & Emerging Technology Programs",
  "CODMOS Coding & Digital Learning",
  "STEM Education",
  "Virtual Science Labs",
  "Honours & Minor Programs",
  "Certification Programs",
  "Vocational Education",
  "Industry Integrated Learning",
  "Faculty Development Programs",
  "Centres of Excellence",
  "Placement & Internship Programs",
  "Digital Learning Ecosystems",
];

const interestOptions = [
  "CITIS Franchise / Centre Partnership",
  "AI Academy Partnership",
  "School Partnership",
  "College / University Partnership",
  "STEM & Science Lab Partnership",
  "Skill Development Partnership",
  "Vocational Education Partnership",
  "Industry Integrated Learning",
  "Centre of Excellence",
  "Placement & Internship Partnership",
  "Corporate / Workforce Development",
  "Technology Partnership",
  "Strategic Business Collaboration",
  "Other",
];

const timelineOptions = [
  "Immediately",
  "Within 3 months",
  "3–6 months",
  "6–12 months",
  "Exploring / Yet to decide",
];

/* ─── Form ──────────────────────────────────────────────────────────────── */

function PartnerInterestForm() {
  const [interests, setInterests] = useState<string[]>([]);
  const [infrastructure, setInfrastructure] = useState("");
  const [timeline, setTimeline] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [fields, setFields] = useState({
    name: "",
    organisation: "",
    designation: "",
    city: "",
    state: "",
    email: "",
    mobile: "",
    interest: "",
    geography: "",
  });

  const toggleInterest = (option: string) => {
    setInterests((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fields.name.trim()) e.name = "Name is required.";
    if (!fields.email.trim()) e.email = "Email is required.";
    if (!consent) e.consent = "Please agree to be contacted before submitting.";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      openMailto({
        to: SUPPORT_EMAIL,
        subject: `Partnership Interest — ${fields.name}${fields.organisation ? ` (${fields.organisation})` : ""}`,
        body: [
          `I am interested in: ${interests.length ? interests.join(", ") : "—"}`,
          "",
          "--- About You ---",
          `Name: ${fields.name}`,
          `Organisation / Institution: ${fields.organisation || "—"}`,
          `Designation: ${fields.designation || "—"}`,
          `City / Location: ${fields.city || "—"}`,
          `State: ${fields.state || "—"}`,
          `Email: ${fields.email}`,
          `Mobile Number: ${fields.mobile || "—"}`,
          "",
          "--- Interest Details ---",
          `What would you like to explore with CITIS? ${fields.interest || "—"}`,
          `Do you currently have infrastructure / facilities available? ${infrastructure || "—"}`,
          `Preferred geography / area of operation: ${fields.geography || "—"}`,
          `Expected timeline to start: ${timeline || "—"}`,
          "",
          "--- Consent ---",
          "I agree to be contacted by the CITIS Infotech team regarding the partnership opportunity.",
          "",
          "— Sent from the CITIS InfoTech partner form",
        ].join("\n"),
      });
      setSubmitted(true);
    } catch {
      setErrors({ form: "Could not open your email app. Please write directly to support@citis.in." });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="surface rounded-xl p-10 text-center">
        <CheckCircle2 className="mx-auto size-12 text-green-500" />
        <h3 className="mt-4 font-heading text-2xl font-semibold">Partnership inquiry draft ready</h3>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Your email app should open a message to{" "}
          <span className="font-medium text-foreground">{SUPPORT_EMAIL}</span>.{" "}
          Send it to complete your inquiry.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => setSubmitted(false)}>
          Submit another inquiry
        </Button>
      </div>
    );
  }

  const fieldErr = (key: string) =>
    errors[key] && (
      <p className="mt-1.5 text-xs text-destructive">{errors[key]}</p>
    );

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="surface rounded-xl p-6 sm:p-8 space-y-8"
    >
      {/* I am interested in */}
      <div className="space-y-3">
        <p className="font-semibold text-sm">I am interested in:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {interestOptions.map((option) => (
            <label
              key={option}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <Checkbox
                checked={interests.includes(option)}
                onCheckedChange={() => toggleInterest(option)}
                id={`interest-${option}`}
              />
              <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">
                {option}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* About You */}
      <div className="space-y-4">
        <p className="font-semibold text-sm border-t border-border pt-6">About You</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="pw-name">Name: *</Label>
            <Input
              id="pw-name"
              className="mt-2"
              autoComplete="name"
              value={fields.name}
              onChange={(e) => setFields((f) => ({ ...f, name: e.target.value }))}
            />
            {fieldErr("name")}
          </div>
          <div>
            <Label htmlFor="pw-org">Organisation / Institution:</Label>
            <Input
              id="pw-org"
              className="mt-2"
              autoComplete="organization"
              value={fields.organisation}
              onChange={(e) => setFields((f) => ({ ...f, organisation: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="pw-designation">Designation:</Label>
            <Input
              id="pw-designation"
              className="mt-2"
              value={fields.designation}
              onChange={(e) => setFields((f) => ({ ...f, designation: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="pw-city">City / Location:</Label>
            <Input
              id="pw-city"
              className="mt-2"
              autoComplete="address-level2"
              value={fields.city}
              onChange={(e) => setFields((f) => ({ ...f, city: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="pw-state">State:</Label>
            <Input
              id="pw-state"
              className="mt-2"
              autoComplete="address-level1"
              value={fields.state}
              onChange={(e) => setFields((f) => ({ ...f, state: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="pw-email">Email: *</Label>
            <Input
              id="pw-email"
              type="email"
              className="mt-2"
              autoComplete="email"
              value={fields.email}
              onChange={(e) => setFields((f) => ({ ...f, email: e.target.value }))}
            />
            {fieldErr("email")}
          </div>
          <div>
            <Label htmlFor="pw-mobile">Mobile Number:</Label>
            <Input
              id="pw-mobile"
              type="tel"
              className="mt-2"
              autoComplete="tel"
              value={fields.mobile}
              onChange={(e) => setFields((f) => ({ ...f, mobile: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Tell Us About Your Interest */}
      <div className="space-y-4 border-t border-border pt-6">
        <p className="font-semibold text-sm">Tell Us About Your Interest</p>
        <div>
          <Label htmlFor="pw-interest">What would you like to explore with CITIS?</Label>
          <Textarea
            id="pw-interest"
            className="mt-2 min-h-[120px]"
            value={fields.interest}
            onChange={(e) => setFields((f) => ({ ...f, interest: e.target.value }))}
          />
        </div>

        {/* Infrastructure */}
        <div className="space-y-2">
          <p className="text-sm font-medium">
            Do you currently have infrastructure / facilities available?
          </p>
          <div className="flex flex-wrap gap-4">
            {["Yes", "No", "To be developed"].map((opt) => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="infrastructure"
                  value={opt}
                  checked={infrastructure === opt}
                  onChange={() => setInfrastructure(opt)}
                  className="accent-orange-500 w-4 h-4"
                />
                <span className="text-sm text-foreground/80">{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Geography */}
        <div>
          <Label htmlFor="pw-geography">Preferred geography / area of operation:</Label>
          <Input
            id="pw-geography"
            className="mt-2"
            value={fields.geography}
            onChange={(e) => setFields((f) => ({ ...f, geography: e.target.value }))}
          />
        </div>

        {/* Timeline */}
        <div>
          <Label>Expected timeline to start:</Label>
          <Select value={timeline} onValueChange={setTimeline}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select a timeline" />
            </SelectTrigger>
            <SelectContent>
              {timelineOptions.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Consent */}
      <div className="border-t border-border pt-6 space-y-2">
        <p className="font-semibold text-sm">Consent</p>
        <div className="flex items-start gap-2.5">
          <Checkbox
            id="pw-consent"
            checked={consent}
            onCheckedChange={(v) => setConsent(!!v)}
          />
          <Label
            htmlFor="pw-consent"
            className="text-sm font-normal leading-5 text-muted-foreground cursor-pointer"
          >
            I agree to be contacted by the CITIS Infotech team regarding the
            partnership opportunity.
          </Label>
        </div>
        {fieldErr("consent")}
      </div>

      {errors.form && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errors.form}
        </p>
      )}

      <Button type="submit" variant="accent" size="lg" disabled={submitting}>
        {submitting ? (
          <>
            <LoaderCircle className="animate-spin" />
            Sending…
          </>
        ) : (
          <>
            <Send />
            Submit Partnership Interest
          </>
        )}
      </Button>
    </form>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────── */

export default function PartnerWithUsPage() {
  return (
    <div className="pb-24">
      {/* ── Intro ── */}
      <AnimatedSection>
        <section className="container-site max-w-4xl py-16 sm:py-24 space-y-6">
          <p className="text-lg text-foreground/80 leading-relaxed">
            CITIS Infotech believes that meaningful education transformation is best achieved
            through collaboration. We invite educational institutions, universities, schools,
            corporates, training organisations, entrepreneurs, technology companies, industry
            bodies and professionals to partner with us and create new opportunities in
            education, skills and emerging technologies.
          </p>
          <p className="text-lg text-foreground/80 leading-relaxed">
            Whether you are looking to establish a CITIS-enabled education centre, introduce
            future-ready programs in your institution, offer technology and skill development
            programs, or explore a strategic business collaboration, we provide multiple
            partnership models that can be customised to suit the partner's objectives,
            capabilities and market.
          </p>
        </section>
      </AnimatedSection>

      {/* ── Franchise & Centre Partnership ── */}
      <AnimatedSection>
        <section className="bg-slate-50 dark:bg-slate-900/50 py-16 sm:py-20">
          <div className="container-site max-w-5xl space-y-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-1">
                Franchise &amp; Centre Partnership
              </h2>
              <p className="text-orange-500 font-semibold">
                Build a CITIS Learning Ecosystem in Your Region
              </p>
            </div>
            <p className="text-foreground/80 leading-relaxed">
              CITIS offers opportunities for eligible entrepreneurs, education professionals and
              organisations to establish CITIS-enabled learning and skill development centres.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              Depending on the partnership model, centres can offer programs across AI and
              emerging technologies, vocational education, skill development, certifications,
              coding, STEM, professional education and career-oriented programs.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              Partners benefit from access to CITIS's academic framework, curriculum, technology
              ecosystem, branding, training, operational guidance and program support, subject to
              the applicable partnership terms and eligibility requirements.
            </p>

            <div className="pt-2">
              <h3 className="text-lg font-semibold mb-5">Potential Franchise / Centre Models</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {franchiseModels.map((model) => {
                  const Icon = model.icon;
                  return (
                    <Card key={model.title} className="border border-border bg-background h-full">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-4 h-4 text-orange-500" />
                          </div>
                          <CardTitle className="text-sm leading-snug">{model.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-foreground/70 leading-relaxed">
                          {model.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              <p className="text-foreground/70 text-sm leading-relaxed mt-5">
                Partnership models can be structured based on geography, infrastructure, target
                learners, programs and the partner's capabilities.
              </p>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ── Institutional Collaboration ── */}
      <AnimatedSection>
        <section className="py-16 sm:py-20">
          <div className="container-site max-w-5xl space-y-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-1">
                Institutional Collaboration
              </h2>
              <p className="text-orange-500 font-semibold">
                Transform Your Institution with CITIS
              </p>
            </div>
            <p className="text-foreground/80 leading-relaxed">
              Schools, colleges and universities can collaborate with CITIS to introduce new
              programs, technologies and education initiatives within their institutions.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              Possible areas of collaboration include:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {institutionalAreas.map((area) => (
                <div
                  key={area}
                  className="flex items-center gap-3 p-3 rounded-lg bg-orange-500/5 border border-orange-200/50 dark:border-orange-800/30"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                  <span className="text-sm text-foreground/80">{area}</span>
                </div>
              ))}
            </div>
            <p className="text-foreground/80 leading-relaxed">
              CITIS can work with institutional leadership to understand the requirement and
              develop a suitable implementation model.
            </p>
          </div>
        </section>
      </AnimatedSection>

      {/* ── Industry & Corporate Collaboration ── */}
      <AnimatedSection>
        <section className="bg-slate-50 dark:bg-slate-900/50 py-16 sm:py-20">
          <div className="container-site max-w-5xl space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold">
              Industry &amp; Corporate Collaboration
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              Organisations can partner with CITIS to develop technology, skills and workforce
              initiatives aligned with industry requirements.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              Collaboration opportunities may include corporate training, AI adoption and
              literacy, workforce upskilling, certification programs, industry projects,
              internships, technology initiatives, research and Centres of Excellence.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              We are also open to working with industry organisations to bring real-world
              projects, mentoring and workplace exposure into academic programs.
            </p>
          </div>
        </section>
      </AnimatedSection>

      {/* ── Strategic Partnerships ── */}
      <AnimatedSection>
        <section className="py-16 sm:py-20">
          <div className="container-site max-w-5xl space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold">Strategic Partnerships</h2>
            <p className="text-foreground/80 leading-relaxed">
              We welcome strategic partnerships with organisations that can contribute
              technology, expertise, infrastructure, content, market access, industry networks
              or other capabilities to the CITIS ecosystem.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              Strategic partnerships can be explored across:
            </p>
            <p className="text-center text-lg font-semibold text-orange-600 dark:text-orange-400 py-4 px-6 rounded-xl bg-orange-500/5 border border-orange-200/50 dark:border-orange-800/30">
              Education × Technology × AI × Skills × Industry × Innovation
            </p>
            <p className="text-foreground/80 leading-relaxed">
              Our objective is to create partnerships where both organisations bring
              complementary strengths and jointly create scalable solutions.
            </p>
          </div>
        </section>
      </AnimatedSection>

      {/* ── Become a CITIS Partner — Form ── */}
      <AnimatedSection>
        <section className="bg-slate-50 dark:bg-slate-900/50 py-16 sm:py-24">
          <div className="container-site max-w-4xl space-y-10">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold">Become a CITIS Partner</h2>
              <p className="text-foreground/70 leading-relaxed">
                If you are interested in partnering with CITIS, tell us a little about yourself
                and the opportunity you would like to explore.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-orange-500 uppercase tracking-widest mb-6">
                Partnership Interest Form
              </p>
              <PartnerInterestForm />
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ── Final CTA ── */}
      <AnimatedSection>
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 sm:py-20 text-white text-center">
          <div className="container-site max-w-3xl space-y-5">
            <h2 className="text-2xl sm:text-3xl font-bold">
              Let's Create Something Meaningful Together
            </h2>
            <p className="text-white/75 leading-relaxed">
              Whether you are an entrepreneur looking for an education business opportunity, a
              school seeking to introduce AI and STEM education, a university looking to build
              industry-integrated programs, or an organisation looking for a strategic education
              and technology partner, CITIS would be pleased to explore the opportunity with you.
            </p>
            <p className="text-lg font-semibold text-orange-400 pt-2">
              Partner with CITIS. Build capabilities. Create opportunities. Transform education.
            </p>
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
}
