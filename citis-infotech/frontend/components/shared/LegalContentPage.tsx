export function LegalContentPage({ content }: { content: string }) {
  const firstLineBreak = content.indexOf("\n");
  const title = firstLineBreak === -1 ? content : content.slice(0, firstLineBreak);
  const body = firstLineBreak === -1 ? "" : content.slice(firstLineBreak + 1);

  return (
    <section className="bg-muted/45 py-14 sm:py-20">
      <article className="container-site max-w-4xl rounded-2xl border border-border bg-card px-6 py-8 shadow-sm sm:px-10 sm:py-12">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{title}</h1>
        <div className="mt-7 whitespace-pre-wrap break-words text-sm leading-7 text-foreground sm:text-base sm:leading-8">
          {body}
        </div>
      </article>
    </section>
  );
}