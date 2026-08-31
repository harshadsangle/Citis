export type ID = string | number;

export interface StrapiImage {
  id: ID;
  url: string;
  alternativeText?: string | null;
  width?: number;
  height?: number;
  formats?: Record<string, { url: string; width: number; height: number }>;
}

export interface SeoFields {
  metaTitle?: string;
  metaDescription?: string;
  canonicalURL?: string;
  keywords?: string[];
  metaImage?: StrapiImage;
  preventIndexing?: boolean;
}

export interface BaseContent {
  id: ID;
  documentId?: string;
  title: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  seo?: SeoFields;
}

export interface Author {
  id: ID;
  name: string;
  role?: string;
  bio?: string;
  avatar?: StrapiImage;
  socialUrl?: string;
}

export interface Category {
  id: ID;
  name: string;
  slug: string;
  description?: string;
}

export interface Blog extends BaseContent {
  excerpt: string;
  content: string;
  coverImage?: StrapiImage;
  author?: Author;
  category?: Category;
  tags?: string[];
  readingTime?: number;
  featured?: boolean;
}

export interface Product extends BaseContent {
  shortDescription: string;
  description: string;
  icon?: string;
  heroImage?: StrapiImage;
  gallery?: StrapiImage[];
  features: Feature[];
  benefits?: string[];
  industries?: Industry[];
}

export interface Feature {
  id?: ID;
  title: string;
  description: string;
  icon?: string;
}

export interface Industry extends BaseContent {
  description: string;
  icon?: string;
  image?: StrapiImage;
}

export interface Career extends BaseContent {
  department: string;
  location: string;
  employmentType: "Full-time" | "Part-time" | "Contract" | "Internship";
  experience: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  skills?: string[];
  remote?: boolean;
  active?: boolean;
}

export interface Testimonial {
  id: ID;
  quote: string;
  name: string;
  role: string;
  company: string;
  avatar?: StrapiImage;
  rating?: number;
}

export interface Client {
  id: ID;
  name: string;
  logo: StrapiImage;
  website?: string;
  industry?: string;
}

export interface CaseStudy extends BaseContent {
  client: string;
  industry: string;
  excerpt: string;
  challenge: string;
  solution: string;
  outcome: string;
  metrics?: Array<{ label: string; value: string }>;
  coverImage?: StrapiImage;
  services?: string[];
}

export interface Contact {
  id?: ID;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject?: string;
  message: string;
  consent?: boolean;
  status?: "new" | "read" | "replied";
  createdAt?: string;
  updatedAt?: string;
  repliedAt?: string;
}

export interface Inquiry extends Contact {
  service: string;
  budget?: string;
  timeline?: string;
}

export interface JobApplication {
  name: string;
  email: string;
  phone: string;
  jobId: string;
  linkedIn?: string;
  portfolio?: string;
  coverLetter?: string;
  resume: File;
}

export interface NewsletterSubscriber {
  id?: ID;
  _id?: string;
  email: string;
  isActive: boolean;
  subscribedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PartnerInquiry {
  id?: ID;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  website?: string;
  partnershipType: string;
  message: string;
  status?: "new" | "read" | "replied";
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminCareer {
  id?: ID;
  _id?: string;
  title: string;
  slug: string;
  department: string;
  location: string;
  type: "full-time" | "part-time" | "internship" | "contract";
  description: string;
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
  status: "open" | "closed";
  applicationsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminJobApplication {
  id?: ID;
  _id?: string;
  career?: AdminCareer | string;
  name: string;
  email: string;
  phone?: string;
  resume: string;
  coverLetter?: string;
  linkedIn?: string;
  portfolio?: string;
  skills?: string[];
  status: "pending" | "reviewed" | "shortlisted" | "rejected";
  adminNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PartnerApplication {
  name: string;
  email: string;
  phone?: string;
  company: string;
  website?: string;
  partnershipType: string;
  message: string;
}

export interface User {
  id: ID;
  name: string;
  email: string;
  role: "admin" | "editor" | "user";
  avatar?: string;
  createdAt?: string;
}

export interface AuthPrincipal {
  id: ID;
  tenantId: string;
  email: string | null;
  firstName: string;
  lastName: string;
  roles: Array<{ code: string; name: string }>;
  permissions: string[];
  scopes: Array<{ institutionId: string; campusId: string | null }>;
}

export interface AuthResponse {
  user: User;
  token?: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface Office {
  name: string;
  address: string;
  phone: string;
  email: string;
  coordinates?: { lat: number; lng: number };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}

export interface StrapiResponse<T> {
  data: T;
  meta: Partial<PaginationMeta>;
}

export interface NavItem {
  label: string;
  href: string;
  description?: string;
  children?: NavItem[];
}
