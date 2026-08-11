import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, Clock, LinkIcon } from "lucide-react";
import { FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { CTASection } from "@/components/shared/CTASection";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BLOG_POSTS } from "@/lib/site-content";
import { generatePageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((item) => item.slug === slug);
  return post ? generatePageMetadata({ title: post.title, description: post.excerpt, path: `/highlights/blogs/${post.slug}`, type: "article" }) : generatePageMetadata({ title: "Article not found", noIndex: true });
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((item) => item.slug === slug);
  if (!post) notFound();
  const related = BLOG_POSTS.filter((item) => item.slug !== post.slug).sort((a, b) => Number(b.category === post.category) - Number(a.category === post.category)).slice(0, 3);
  const url = encodeURIComponent(`https://www.citisinfotech.com/highlights/blogs/${post.slug}`);
  const title = encodeURIComponent(post.title);
  return (
    <>
      <article>
        <header className="relative overflow-hidden border-b border-border bg-[#eef3f8] py-16 text-slate-900 sm:py-24">
          <div className="absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_88%_12%,rgba(14,116,144,0.12),transparent_32%),radial-gradient(circle_at_10%_80%,rgba(37,99,235,0.10),transparent_36%)]" />
          <div className="container-site relative">
            <Link href="/highlights/blogs" className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-800"><ArrowLeft className="size-4" />All articles</Link>
            <div className="mt-8 max-w-4xl"><Badge variant="secondary">{post.category}</Badge><h1 className="mt-5 font-heading text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">{post.title}</h1><p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">{post.excerpt}</p><div className="mt-7 flex flex-wrap items-center gap-5 text-sm text-slate-500"><span>{post.author}</span><span className="flex items-center gap-1.5"><CalendarDays className="size-4" />{new Date(post.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span><span className="flex items-center gap-1.5"><Clock className="size-4" />{post.readTime}</span></div></div>
          </div>
        </header>
        <div className="bg-[#e8edf5] dark:bg-slate-900">
        <div className="container-site grid gap-10 py-14 lg:grid-cols-[minmax(0,1fr)_13rem] lg:gap-16 lg:py-20">
          <div className="mx-auto max-w-3xl">
            {post.content.map((section) => <section key={section.heading} className="mb-10"><h2 className="font-heading text-2xl font-semibold sm:text-3xl">{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph} className="mt-5 text-base leading-8 text-muted-foreground">{paragraph}</p>)}</section>)}
            <aside className="mt-12 rounded-2xl border-l-4 border-accent bg-primary/5 p-7"><p className="font-heading text-xl font-semibold">The practical takeaway</p><p className="mt-3 leading-7 text-muted-foreground">Start with one meaningful learner outcome, create an authentic way to observe it, and support educators to improve the experience together.</p></aside>
          </div>
          <aside className="lg:sticky lg:top-28 lg:h-fit"><p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">Share this article</p><div className="mt-4 flex gap-2 lg:flex-col"><a className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm hover:text-primary" href={`https://www.linkedin.com/sharing/share-offsite/?url=${url}`} target="_blank" rel="noreferrer"><FaLinkedinIn className="size-4" /><span className="hidden lg:inline">LinkedIn</span></a><a className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm hover:text-primary" href={`https://twitter.com/intent/tweet?url=${url}&text=${title}`} target="_blank" rel="noreferrer"><FaXTwitter className="size-4" /><span className="hidden lg:inline">X / Twitter</span></a><a className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm hover:text-primary" href={`mailto:?subject=${title}&body=${url}`}><LinkIcon className="size-4" /><span className="hidden lg:inline">Email link</span></a></div></aside>
        </div>
        </div>
      </article>
      <section className="border-y border-border bg-[#e8edf5] py-16 dark:bg-slate-900"><div className="container-site"><h2 className="font-heading text-3xl font-semibold">Continue exploring</h2><div className="mt-8 grid gap-5 md:grid-cols-3">{related.map((item) => <Card key={item.slug} className="group h-full"><CardContent className="p-6"><Badge variant="outline">{item.category}</Badge><h3 className="mt-4 font-heading text-lg font-semibold">{item.title}</h3><p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{item.excerpt}</p><Link href={`/highlights/blogs/${item.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">Read article<ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></Link></CardContent></Card>)}</div></div></section>
      <CTASection title="Explore what this could mean for your institution" description="Our team can help translate emerging ideas into responsible, measurable education programmes." />
    </>
  );
}
