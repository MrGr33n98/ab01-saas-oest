import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicHeader } from "@/components/layout/public-header";
import { getPost, getPosts } from "@/lib/data/posts";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return { title: "Artigo não encontrado" };
  }

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dronehub.com.br";
  const canonicalUrl = `${siteUrl}/blog/${post.slug}`;

  return {
    title: post.title,
    description: post.excerpt || `Leia sobre ${post.title} no Blog DroneHub.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${post.title} · DroneHub Blog`,
      description: post.excerpt,
      type: "article",
      url: canonicalUrl,
      publishedTime: post.published_at,
      authors: [post.author_name || "DroneHub Editorial"],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dronehub.com.br";
  const articleUrl = `${siteUrl}/blog/${post.slug}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.published_at,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    author: {
      "@type": "Organization",
      name: "DroneHub",
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "DroneHub",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/icon.png`,
      },
    },
  };

  const faqJsonLd = post.faqs && post.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  } : null;

  return (
    <div className="min-h-dvh bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <PublicHeader />

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-text-muted">
          <Link href="/" className="hover:underline">
            Início
          </Link>
          <span>/</span>
          <Link href="/blog" className="hover:underline">
            Blog
          </Link>
          <span>/</span>
          <span className="text-text truncate max-w-xs">{post.title}</span>
        </nav>

        <header className="space-y-3 border-b border-border pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">
            {post.title}
          </h1>

          {post.published_at && (
            <p className="text-xs text-text-muted">
              Publicado em{" "}
              {new Date(post.published_at).toLocaleDateString("pt-BR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
        </header>

        {post.excerpt && (
          <p className="mt-6 text-lg text-text-muted leading-relaxed font-serif italic border-l-2 border-accent-ink pl-4">
            {post.excerpt}
          </p>
        )}

        <article className="mt-8 prose prose-neutral max-w-none text-text leading-relaxed space-y-4">
          {post.body ? (
            <div dangerouslySetInnerHTML={{ __html: post.body }} />
          ) : (
            <p className="text-sm text-text-muted">Conteúdo sendo processado.</p>
          )}
        </article>

        {post.faqs && post.faqs.length > 0 && (
          <section className="mt-12 rounded-card border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold text-text mb-4">Perguntas Frequentes</h2>
            <div className="space-y-4 divide-y divide-border">
              {post.faqs.map((f, i) => (
                <div key={i} className={i > 0 ? "pt-4" : ""}>
                  <p className="text-sm font-medium text-text">{f.question}</p>
                  <p className="mt-1 text-xs text-text-muted">{f.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="mt-12 border-t border-border pt-6 flex justify-between items-center text-sm">
          <Link href="/blog" className="text-accent-ink hover:underline">
            ← Voltar para todos os artigos
          </Link>
          <Link href="/contact" className="text-text-muted hover:text-text">
            Falar com um especialista
          </Link>
        </div>
      </main>
    </div>
  );
}

export const dynamicParams = true;

/** Build a bounded hot set; every other article is rendered and cached on demand. */
export async function generateStaticParams() {
  const posts = await getPosts("pt-BR");
  return posts.slice(0, 100).map((post) => ({ slug: post.slug }));
}
