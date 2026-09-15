import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { CategorySidebar } from "@/components/category/category-sidebar";
import { CategoryView } from "@/components/category/category-view";
import {
  fetchCategoryBySlug,
  fetchCategoryNavigation,
  MOCK_CATEGORY_OPERATORS,
} from "@/lib/categories";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await fetchCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Categoria não encontrada · OEST",
      description: "A categoria solicitada não foi encontrada.",
    };
  }

  return {
    title: category.seo.title,
    description: category.seo.description,
    keywords: category.seo.keywords,
    alternates: {
      canonical: category.seo.canonical_url,
    },
    openGraph: {
      title: category.social.og_title,
      description: category.social.og_description,
      url: category.seo.canonical_url,
      images: category.social.og_image_url
        ? [{ url: category.social.og_image_url, width: 1200, height: 630, alt: category.name }]
        : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: category.social.twitter_title,
      description: category.social.twitter_description,
      images: category.social.twitter_image_url ? [category.social.twitter_image_url] : undefined,
    },
    robots: {
      index: category.seo.robots_index,
      follow: category.seo.robots_follow,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [category, navigationItems] = await Promise.all([
    fetchCategoryBySlug(slug),
    fetchCategoryNavigation(),
  ]);

  if (!category) {
    notFound();
  }

  // Schema.org Structured Data (CollectionPage + BreadcrumbList + ItemList + FAQPage)
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": category.seo.canonical_url,
        url: category.seo.canonical_url,
        name: category.seo.title,
        description: category.seo.description,
        isPartOf: {
          "@type": "WebSite",
          name: "OEST",
          url: "https://oest.com.br",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Início",
            item: "https://oest.com.br",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Setores",
            item: "https://oest.com.br/categories",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: category.name,
            item: category.seo.canonical_url,
          },
        ],
      },
      ...(category.faqs && category.faqs.length > 0
        ? [
            {
              "@type": "FAQPage",
              mainEntity: category.faqs.map((faq) => ({
                "@type": "Question",
                name: faq.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: faq.answer,
                },
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      {/* Structured Data Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Public Global Header */}
      <PublicHeader />

      <main className="mx-auto max-w-[1320px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-5 flex items-center gap-1.5 text-[13px] text-text-muted">
          <Link href="/" className="hover:text-text transition-colors">
            Início
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-text-muted" />
          <Link href="/categories" className="hover:text-text transition-colors">
            Setores
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-text-muted" />
          <span className="font-semibold text-text">{category.name}</span>
        </nav>

        {/* Master Category Layout: Sidebar + Main Content */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Left Setores Sidebar */}
          <CategorySidebar items={navigationItems} activeSlug={category.slug} />

          {/* Main Category Content */}
          <div className="min-w-0 flex-1">
            <CategoryView
              category={category}
              initialOperators={MOCK_CATEGORY_OPERATORS}
            />
          </div>
        </div>
      </main>

      {/* Public Footer */}
      <PublicFooter />
    </div>
  );
}
