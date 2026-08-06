"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowRight, Check, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SUPPORT_EMAIL, openMailto } from "@/lib/mailto";
import { newsletterSchema, type NewsletterInput } from "@/lib/validations";
import { cn } from "@/lib/utils";

export function NewsletterForm({ className, variant = "light" }: { className?: string; variant?: "light" | "dark" }) {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<NewsletterInput>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "" },
  });

  const submit = async ({ email }: NewsletterInput) => {
    setServerError("");
    try {
      openMailto({
        to: SUPPORT_EMAIL,
        subject: "Subscribe to newsletter — CITIS InfoTech",
        body: [
          `Please subscribe this address to the CITIS InfoTech newsletter:`,
          "",
          email,
          "",
          `— Sent from the website footer`,
        ].join("\n"),
      });
      setSuccess(true);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Could not open email. Write to support@citis.in.");
    }
  };

  if (success) {
    return (
      <p className={cn("flex items-center gap-2 text-sm font-medium text-success", className)}>
        <Check className="size-4" />
        Email draft opened for {SUPPORT_EMAIL}. Send it to finish subscribing.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(submit)} className={cn(className)} noValidate>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          type="email"
          aria-label="Email address"
          placeholder="Work email address"
          className={cn("flex-1", variant === "dark" && "border-slate-600 bg-slate-900/60 text-white placeholder:text-slate-500")}
          {...register("email")}
        />
        <Button type="submit" variant="accent" disabled={isSubmitting}>
          {isSubmitting ? <LoaderCircle className="animate-spin" /> : <>Subscribe to newsletter<ArrowRight /></>}
        </Button>
      </div>
      {(errors.email?.message || serverError) && (
        <p className="mt-2 text-xs text-orange-300">{errors.email?.message ?? serverError}</p>
      )}
    </form>
  );
}
