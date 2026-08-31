"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { CheckCircle2, Eye, EyeOff, LoaderCircle, Send, Upload } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api";
import { applyJobSchema, loginSchema, partnerSchema, type ApplyJobInput, type LoginInput, type PartnerInput } from "@/lib/validations";
import { authService } from "@/services/api";
import { CAREERS_EMAIL, SUPPORT_EMAIL, openMailto } from "@/lib/mailto";
import { canAccessLmsPortal, firstAvailableLmsPortal, LMS_PORTALS, type LmsPortal } from "@/lib/lms-roles";

const message = (text?: string) => text && <p className="mt-1.5 text-xs text-destructive">{text}</p>;

function FormSuccess({ title, copy }: { title: string; copy: string }) {
  return <div role="status" className="surface rounded-xl p-9 text-center"><CheckCircle2 className="mx-auto size-12 text-success" /><h3 className="mt-4 font-heading text-2xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{copy}</p></div>;
}

export function PartnerInquiryForm() {
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<PartnerInput>({
    resolver: zodResolver(partnerSchema),
    defaultValues: { name: "", email: "", phone: "", company: "", website: "", partnershipType: "", message: "" },
  });
  const onSubmit = async (values: PartnerInput) => {
    setServerError("");
    try {
      openMailto({
        to: SUPPORT_EMAIL,
        subject: `Partnership inquiry — ${values.partnershipType || "general"}`,
        body: [
          `Name: ${values.name}`,
          `Email: ${values.email}`,
          `Phone: ${values.phone || "—"}`,
          `Organization: ${values.company}`,
          `Website: ${values.website || "—"}`,
          `Partnership model: ${values.partnershipType}`,
          "",
          values.message,
          "",
          `— Sent from the CITIS InfoTech partner form`,
        ].join("\n"),
      });
      setDone(true);
    }
    catch (error) { setServerError(error instanceof Error ? error.message : "Your inquiry could not be sent. Please try again."); }
  };
  if (done) return <FormSuccess title="Partnership inquiry draft ready" copy="Your email app should open a message to support@citis.in. Send it to complete your inquiry." />;
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="surface space-y-5 rounded-xl p-6 sm:p-8" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div><Label htmlFor="partner-name">Full name *</Label><Input id="partner-name" className="mt-2" autoComplete="name" {...register("name")} />{message(errors.name?.message)}</div>
        <div><Label htmlFor="partner-email">Work email *</Label><Input id="partner-email" className="mt-2" type="email" autoComplete="email" {...register("email")} />{message(errors.email?.message)}</div>
        <div><Label htmlFor="partner-phone">Phone</Label><Input id="partner-phone" className="mt-2" type="tel" {...register("phone")} />{message(errors.phone?.message)}</div>
        <div><Label htmlFor="partner-company">Organization *</Label><Input id="partner-company" className="mt-2" autoComplete="organization" {...register("company")} />{message(errors.company?.message)}</div>
        <div><Label htmlFor="partner-website">Website</Label><Input id="partner-website" className="mt-2" type="url" placeholder="https://" {...register("website")} />{message(errors.website?.message)}</div>
        <div><Label>Partnership model *</Label><Controller name="partnershipType" control={control} render={({ field }) => <Select value={field.value} onValueChange={field.onChange}><SelectTrigger className="mt-2"><SelectValue placeholder="Select a model" /></SelectTrigger><SelectContent><SelectItem value="academic">Academic collaboration</SelectItem><SelectItem value="industry">Industry alliance</SelectItem><SelectItem value="delivery">Delivery partner</SelectItem><SelectItem value="technology">Technology partner</SelectItem></SelectContent></Select>} />{message(errors.partnershipType?.message)}</div>
      </div>
      <div><Label htmlFor="partner-message">What would you like to achieve? *</Label><Textarea id="partner-message" className="mt-2 min-h-32" placeholder="Share your institution, audience, priorities, and preferred timeline." {...register("message")} />{message(errors.message?.message)}</div>
      {serverError && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{serverError}</p>}
      <Button type="submit" variant="accent" size="lg" disabled={isSubmitting}>{isSubmitting ? <><LoaderCircle className="animate-spin" />Sending…</> : <>Send inquiry<Send /></>}</Button>
    </form>
  );
}

export function JobApplicationForm({ jobId, jobTitle }: { jobId: string; jobTitle: string }) {
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<ApplyJobInput>({
    resolver: zodResolver(applyJobSchema),
    defaultValues: { name: "", email: "", phone: "", jobId, linkedIn: "", portfolio: "", coverLetter: "" },
  });
  const onSubmit = async (values: ApplyJobInput) => {
    setServerError("");
    try {
      openMailto({
        to: CAREERS_EMAIL,
        subject: `Job application — ${jobTitle}`,
        body: [
          `Role: ${jobTitle}`,
          `Name: ${values.name}`,
          `Email: ${values.email}`,
          `Phone: ${values.phone}`,
          `LinkedIn: ${values.linkedIn || "—"}`,
          `Portfolio: ${values.portfolio || "—"}`,
          `Skills: ${values.skills || "—"}`,
          "",
          values.coverLetter || "",
          "",
          "Please attach your résumé to this email before sending.",
          "",
           `Résumé file: ${values.resume?.name || "—"}`,
           "",
           `— Sent from the CITIS InfoTech careers form`,
        ].join("\n"),
      });
      setDone(true);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "We could not submit your application. Please try again.");
    }
  };
   if (done) return <FormSuccess title="Application ready to send" copy={`Your email app should open a message to careers@citis.in for ${jobTitle}. Attach your résumé, then send the email to complete your application.`} />;
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="surface space-y-5 rounded-xl p-6 sm:p-8" noValidate>
      <input type="hidden" {...register("jobId")} />
      <div className="grid gap-5 sm:grid-cols-2">
       <div><Label htmlFor="apply-name">Full name *</Label><Input id="apply-name" className="mt-2" required {...register("name")} />{message(errors.name?.message)}</div>
       <div><Label htmlFor="apply-email">Email *</Label><Input id="apply-email" className="mt-2" type="email" required {...register("email")} />{message(errors.email?.message)}</div>
       <div><Label htmlFor="apply-phone">Phone *</Label><Input id="apply-phone" className="mt-2" type="tel" required {...register("phone")} />{message(errors.phone?.message)}</div>
        <div><Label htmlFor="apply-linkedin">LinkedIn</Label><Input id="apply-linkedin" className="mt-2" type="url" placeholder="https://linkedin.com/in/…" {...register("linkedIn")} />{message(errors.linkedIn?.message)}</div>
      </div>
      <div><Label htmlFor="apply-portfolio">Portfolio</Label><Input id="apply-portfolio" className="mt-2" type="url" placeholder="https://" {...register("portfolio")} />{message(errors.portfolio?.message)}</div>
       <div><Label htmlFor="apply-cover">Why CITIS InfoTech? *</Label><Textarea id="apply-cover" className="mt-2 min-h-28" required {...register("coverLetter")} />{message(errors.coverLetter?.message)}</div>
       <div><Label htmlFor="apply-skills">Skills *</Label><Input id="apply-skills" className="mt-2" required placeholder="React, Node.js, Instructional design…" {...register("skills")} /><p className="mt-1 text-xs text-muted-foreground">Comma-separated skills</p>{message(errors.skills?.message)}</div>
       <div><Label htmlFor="apply-resume">Résumé *</Label><label htmlFor="apply-resume" className="mt-2 flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-input bg-background p-4 text-sm hover:border-primary/50"><Upload className="size-5 text-primary" />Choose a file</label><Input id="apply-resume" className="sr-only" required type="file" accept=".pdf,.doc,.docx" onChange={(event) => { const file = event.target.files?.[0]; if (file) setValue("resume", file, { shouldValidate: true }); }} />{message(errors.resume?.message)}</div>
      {serverError && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{serverError}</p>}
      <Button type="submit" variant="accent" size="lg" disabled={isSubmitting}>{isSubmitting ? <><LoaderCircle className="animate-spin" />Submitting…</> : <>Submit application<Send /></>}</Button>
    </form>
  );
}

export function LoginForm({ portal = "learner" }: { portal?: LmsPortal }) {
  const [show, setShow] = useState(false);
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "", remember: false } });
  const onSubmit = async (values: LoginInput) => {
    setServerError("");
    try {
      await authService.login(values.email, values.password);
      const response = await authService.me();
      if (!canAccessLmsPortal(response.data, portal)) {
        const availablePortal = firstAvailableLmsPortal(response.data);
        const availableCopy = availablePortal ? ` This account belongs in the ${LMS_PORTALS[availablePortal].label}.` : "";
        throw new Error(`This account does not have access to the ${LMS_PORTALS[portal].label}.${availableCopy}`);
      }
      window.location.assign(`/lms?portal=${portal}`);
    } catch (error) { setServerError(error instanceof Error ? error.message : "Sign in failed. Check your details and try again."); }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div><Label htmlFor="login-email">Email</Label><Input id="login-email" className="mt-2" type="email" autoComplete="email" placeholder="you@institution.edu" {...register("email")} />{message(errors.email?.message)}</div>
      <div><div className="flex justify-between"><Label htmlFor="login-password">Password</Label><Link href="/auth/forgot-password" className="text-xs font-semibold text-primary hover:underline">Forgot password?</Link></div><div className="relative mt-2"><Input id="login-password" type={show ? "text" : "password"} autoComplete="current-password" className="pr-11" {...register("password")} /><button type="button" onClick={() => setShow(!show)} className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground" aria-label={show ? "Hide password" : "Show password"}>{show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div>{message(errors.password?.message)}</div>
      <Controller name="remember" control={control} render={({ field }) => <div className="flex items-center gap-2"><Checkbox id="remember" checked={field.value} onCheckedChange={field.onChange} /><Label htmlFor="remember" className="font-normal">Keep me signed in</Label></div>} />
      {serverError && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{serverError}</p>}
      <Button className="w-full" variant="accent" size="lg" disabled={isSubmitting}>{isSubmitting ? <LoaderCircle className="animate-spin" /> : "Sign in"}</Button>
    </form>
  );
}

const emailSchema = z.object({ email: z.string().email("Enter a valid email address") });
const resetSchema = z.object({ password: z.string().min(8, "Use at least 8 characters"), confirmPassword: z.string() }).refine((data) => data.password === data.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });

export function ForgotPasswordForm() {
  const [done, setDone] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof emailSchema>>({ resolver: zodResolver(emailSchema) });
  const onSubmit = async (values: z.infer<typeof emailSchema>) => { try { await apiFetch("/auth/forgot-password", { method: "POST", body: JSON.stringify(values), revalidate: false }); } finally { setDone(true); } };
  if (done) return <FormSuccess title="Check your inbox" copy="If an account exists for that email, we sent a secure password reset link." />;
  return <form onSubmit={handleSubmit(onSubmit)} className="space-y-5"><div><Label htmlFor="forgot-email">Account email</Label><Input id="forgot-email" className="mt-2" type="email" autoComplete="email" {...register("email")} />{message(errors.email?.message)}</div><Button className="w-full" variant="accent" size="lg" disabled={isSubmitting}>{isSubmitting ? <LoaderCircle className="animate-spin" /> : "Send reset link"}</Button></form>;
}

export function ResetPasswordForm() {
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState("");
  const [token, setToken] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof resetSchema>>({ resolver: zodResolver(resetSchema) });

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token") || "");
  }, []);

  const onSubmit = async (values: z.infer<typeof resetSchema>) => {
    setServerError("");
    if (!token) {
      setServerError("Reset token is missing. Open the link from your email again.");
      return;
    }
    try {
      await apiFetch(`/auth/reset-password/${encodeURIComponent(token)}`, {
        method: "POST",
        body: JSON.stringify({ password: values.password }),
        revalidate: false,
      });
      setDone(true);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Could not reset password.");
    }
  };
  if (done) return <FormSuccess title="Password updated" copy="Your password has been reset. You can now sign in with your new credentials." />;
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <Label htmlFor="new-password">New password</Label>
        <Input id="new-password" className="mt-2" type="password" autoComplete="new-password" {...register("password")} />
        {message(errors.password?.message)}
        <p className="mt-1 text-xs text-muted-foreground">Use at least 8 characters with upper, lower, and a number.</p>
      </div>
      <div>
        <Label htmlFor="confirm-password">Confirm password</Label>
        <Input id="confirm-password" className="mt-2" type="password" autoComplete="new-password" {...register("confirmPassword")} />
        {message(errors.confirmPassword?.message)}
      </div>
      {serverError ? <p className="text-sm text-red-600">{serverError}</p> : null}
      <Button className="w-full" variant="accent" size="lg" disabled={isSubmitting}>
        {isSubmitting ? <LoaderCircle className="animate-spin" /> : "Set new password"}
      </Button>
    </form>
  );
}
