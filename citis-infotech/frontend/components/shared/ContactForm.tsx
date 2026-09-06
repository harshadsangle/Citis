"use client";

import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type FieldPath } from "react-hook-form";
import { CheckCircle2, LoaderCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SUPPORT_EMAIL, openMailto } from "@/lib/mailto";
import { contactSchema, type ContactInput } from "@/lib/validations";
import { cn } from "@/lib/utils";

const contactFieldOrder = ["name", "email", "phone", "company", "subject", "message", "consent"] as const satisfies ReadonlyArray<FieldPath<ContactInput>>;
type ContactField = typeof contactFieldOrder[number];

const contactFieldIds: Record<ContactField, string> = {
  name: "contact-name",
  email: "contact-email",
  phone: "contact-phone",
  company: "contact-company",
  subject: "contact-subject",
  message: "contact-message",
  consent: "contact-consent",
};

export function ContactForm({ className }: { className?: string }) {
  const [serverError, setServerError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const focusValidationId = useRef(0);
  const { register, handleSubmit, control, reset, trigger, getFieldState, formState: { errors, isSubmitting } } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", company: "", subject: "", message: "" },
  });

  useEffect(() => {
    if (!submitted) return;

    const timeout = window.setTimeout(() => {
      setSubmitted(false);
      reset();
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [reset, submitted]);

  const onSubmit = async (values: ContactInput) => {
    setServerError("");
    try {
      openMailto({
        to: SUPPORT_EMAIL,
        subject: values.subject?.trim() || "Contact Us — CITIS InfoTech website",
        body: [
          `Name: ${values.name}`,
          `Email: ${values.email}`,
          `Phone: ${values.phone || "—"}`,
          `Organization: ${values.company || "—"}`,
          "",
          values.message,
          "",
          `— Sent from the CITIS InfoTech contact form`,
        ].join("\n"),
      });
      setSubmitted(true);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "We could not open your email app. Please write to support@citis.in.");
    }
  };

  if (submitted) {
    return (
      <div className={cn("surface rounded-xl p-8 text-center", className)}>
        <CheckCircle2 className="mx-auto size-12 text-success" />
        <h3 className="mt-5 font-heading text-2xl font-semibold">Thank you for reaching out</h3>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Your email app should open a message to <span className="font-medium text-foreground">{SUPPORT_EMAIL}</span>.
          Send it to complete your enquiry. If nothing opened, email us directly at that address.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => {
            setSubmitted(false);
            reset();
          }}
        >
          Send another message
        </Button>
      </div>
    );
  }

  const fieldError = (message?: string) => message && <p className="mt-1.5 text-xs text-destructive">{message}</p>;

  const handleFieldFocus = async (field: ContactField) => {
    const fieldIndex = contactFieldOrder.indexOf(field);
    if (fieldIndex <= 0) return;

    const validationId = ++focusValidationId.current;
    const previousFields = contactFieldOrder.slice(0, fieldIndex);
    const previousFieldsValid = await trigger(previousFields, { shouldFocus: false });
    if (validationId !== focusValidationId.current || previousFieldsValid) return;

    const firstInvalidField = previousFields.find((previousField) => getFieldState(previousField).invalid) || previousFields[previousFields.length - 1];
    document.getElementById(contactFieldIds[firstInvalidField])?.focus();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn("surface space-y-5 rounded-xl p-6 sm:p-8", className)} noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div><Label htmlFor="contact-name">Name *</Label><Input id="contact-name" autoComplete="name" className="mt-2" placeholder="Your full name" aria-invalid={!!errors.name} {...register("name")} onFocus={() => { void handleFieldFocus("name"); }} />{fieldError(errors.name?.message)}</div>
        <div><Label htmlFor="contact-email">Email *</Label><Input id="contact-email" type="email" autoComplete="email" className="mt-2" placeholder="you@institution.edu" aria-invalid={!!errors.email} {...register("email")} onFocus={() => { void handleFieldFocus("email"); }} />{fieldError(errors.email?.message)}</div>
        <div><Label htmlFor="contact-phone">Phone</Label><Input id="contact-phone" type="tel" autoComplete="tel" className="mt-2" placeholder="+91 98765 43210" aria-invalid={!!errors.phone} {...register("phone")} onFocus={() => { void handleFieldFocus("phone"); }} />{fieldError(errors.phone?.message)}</div>
        <div><Label htmlFor="contact-company">Institution / organization</Label><Input id="contact-company" autoComplete="organization" className="mt-2" placeholder="Your institution or organization" {...register("company")} onFocus={() => { void handleFieldFocus("company"); }} /></div>
      </div>
      <div><Label htmlFor="contact-subject">How can we help?</Label><Input id="contact-subject" className="mt-2" placeholder="University programme, school STEM, academy enrollment…" {...register("subject")} onFocus={() => { void handleFieldFocus("subject"); }} /></div>
      <div><Label htmlFor="contact-message">Message *</Label><Textarea id="contact-message" className="mt-2" placeholder="Tell us about your learners, goals, and current challenge." aria-invalid={!!errors.message} {...register("message")} onFocus={() => { void handleFieldFocus("message"); }} />{fieldError(errors.message?.message)}</div>
      <Controller
        control={control}
        name="consent"
        render={({ field }) => (
          <div>
            <div className="flex items-start gap-2.5">
              <Checkbox id="contact-consent" checked={field.value} onCheckedChange={field.onChange} aria-invalid={!!errors.consent} onFocus={() => { void handleFieldFocus("consent"); }} />
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
