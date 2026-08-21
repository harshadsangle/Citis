import { z } from "zod";

const phoneSchema = z
  .string()
  .trim()
  .regex(/^[+]?[\d\s()-]{7,20}$/, "Enter a valid phone number");

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().email("Enter a valid email address"),
  phone: phoneSchema.optional().or(z.literal("")),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  subject: z.string().trim().max(150).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Tell us a little more").max(3000),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Please accept the privacy policy" }),
  }),
});

export const newsletterSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
});

export const inquirySchema = contactSchema.extend({
  service: z.string().min(1, "Select a service"),
  budget: z.string().optional(),
  timeline: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must contain at least 8 characters"),
  remember: z.boolean().optional(),
});

export const applyJobSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  phone: phoneSchema,
  jobId: z.string().min(1),
  linkedIn: z.string().url().optional().or(z.literal("")),
  portfolio: z.string().url().optional().or(z.literal("")),
  coverLetter: z.string().trim().min(20, "Tell us why you are a strong fit").max(3000),
  skills: z.string().trim().min(2, "List at least one relevant skill").max(500),
  resume: z
    .custom<File>((value) => value === undefined || (typeof File !== "undefined" && value instanceof File))
    .refine((file) => !!file, "Upload your résumé")
    .refine((file) => !file || file.size <= 5 * 1024 * 1024, "Resume must be 5MB or smaller")
    .refine(
      (file) =>
        !file ||
        ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.type),
      "Upload a PDF, DOC, or DOCX file",
    ),
});

export const partnerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  phone: phoneSchema.optional().or(z.literal("")),
  company: z.string().trim().min(2).max(120),
  website: z.string().url().optional().or(z.literal("")),
  partnershipType: z.string().min(1, "Select a partnership type"),
  message: z.string().trim().min(20).max(3000),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
export type InquiryInput = z.infer<typeof inquirySchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ApplyJobInput = z.infer<typeof applyJobSchema>;
export type PartnerInput = z.infer<typeof partnerSchema>;
