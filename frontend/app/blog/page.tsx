import Link from "next/link";
import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/public-header";
import { getMessages, type Locale } from "@/lib/i18n";
import { getPosts } from "@/lib/data/posts";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Artigos sobre dados de drone, missões, ortomosaico, agricultura e operação B2B no Brasil.",
  openGraph: {
    title: "Blog · DroneHub",
    description: "Conteúdo técnico e de mercado sobre missões e dados geoespaciais.",
  },
};

export default async function BlogIndexPage() {
  // Locale is URL-owned for public cacheability. /blog is the pt-BR canonical.
  const locale: Locale = "pt-BR";
  const m = getMessages(locale);
  const posts = await getPosts(locale);

  return (
    <div className="min-h-dvh">
      <PublicHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight text-text">{m.blog.title}</h1>
        <p className="mt-2 text-[16px] text-text-muted">{m.blog.subtitle}</p>

        {posts.length === 0 ? (
          <div className="mt-12 rounded-card border border-border bg-surface p-10 text-center text-text-muted">
            {m.blog.empty}
          </div>
        ) : (
          <ul className="mt-10 space-y-6">
            {posts.map((p) => (
              <li key={p.slug} className="border-b border-border pb-6">
                <Link
                  href={p.path || `/blog/${p.slug}`}
                  className="group block"
                >
                  <h2 className="text-xl font-semibold text-text group-hover:underline">
                    {p.title}
                  </h2>
                  {p.excerpt && (
                    <p className="mt-2 text-[15px] text-text-muted line-clamp-2">{p.excerpt}</p>
                  )}
                  <span className="mt-3 inline-block text-sm font-medium text-accent-ink">
                    {m.blog.readMore} →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
