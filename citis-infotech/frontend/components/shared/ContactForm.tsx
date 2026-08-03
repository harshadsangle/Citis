"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { CheckCircle2, LoaderCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { contactSchema, type ContactInput } from "@/lib/validations";
import { contactService } from "@/services/api";
import { cn } from "@/lib/utils";

export function ContactForm({ className }: { className?: string }) {
  const [serverError, setServerError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", company: "", subject: "", message: "" },
  });

  const onSubmit = async (values: ContactInput) => {
    setServerError("");
    try {
      await contactService.submit(values);
      setSubmitted(true);
      reset();
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "We could not send your message. Please try again.");
    }
  };

  if (submitted) {
    return (
      <div className={cn("surface rounded-xl p-8 text-center", className)}>
        <CheckCircle2 className="mx-auto size-12 text-success" />
        <h3 className="mt-5 font-heading text-2xl font-semibold">Thank you for reaching out</h3>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">A CITIS education or partnership specialist will get back to you within one business day.</p>
        <Button variant="outline" className="mt-6" onClick={() => setSubmitted(false)}>Send another message</Button>
      </div>
    );
  }

  const fieldError = (message?: string) => message && <p className="mt-1.5 text-xs text-destructive">{message}</p>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn("surface space-y-5 rounded-xl p-6 sm:p-8", className)} noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div><Label htmlFor="contact-name">Name *</Label><Input id="contact-name" autoComplete="name" className="mt-2" placeholder="Your full name" aria-invalid={!!errors.name} {...register("name")} />{fieldError(errors.name?.message)}</div>
        <div><Label htmlFor="contact-email">Email *</Label><Input id="contact-email" type="email" autoComplete="email" className="mt-2" placeholder="you@institution.edu" aria-invalid={!!errors.email} {...register("email")} />{fieldError(errors.email?.message)}</div>
        <div><Label htmlFor="contact-phone">Phone</Label><Input id="contact-phone" type="tel" autoComplete="tel" className="mt-2" placeholder="+91 98765 43210" aria-invalid={!!errors.phone} {...register("phone")} />{fieldError(errors.phone?.message)}</div>
        <div><Label htmlFor="contact-company">Institution / organisation</Label><Input id="contact-company" autoComplete="organization" className="mt-2" placeholder="Your institution or organisation" {...register("company")} /></div>
      </div>
      <div><Label htmlFor="contact-subject">How can we help?</Label><Input id="contact-subject" className="mt-2" placeholder="University programme, school STEM, academy enrollment…" {...register("subject")} /></div>
      <div><Label htmlFor="contact-message">Message *</Label><Textarea id="contact-message" className="mt-2" placeholder="Tell us about your learners, goals, and current challenge." aria-invalid={!!errors.message} {...register("message")} />{fieldError(errors.message?.message)}</div>
      <Controller
        control={control}
        name="consent"
        render={({ field }) => (
          <div>
            <div className="flex items-start gap-2.5">
              <Checkbox id="contact-consent" checked={field.value} onCheckedChange={field.onChange} />
              <Label htmlFor="contact-consent" className="text-xs leading-5 font-normal text-muted-foreground">I agree that CITIS InfoTech may use my details to respond to this request, in line with the privacy policy.</Label>
            </div>
            {fieldError(errors.consent?.message)}
          </div>
        )}
      />
      {serverError && <p role="alert" className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{serverError}</p>}
      <Button type="submit" variant="accent" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? <><LoaderCircle className="animate-spin" />Sending…</> : <>Send message<Send /></>}
      </Button>
    </form>
  );
}
