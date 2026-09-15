import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicHeader } from "@/components/layout/public-header";
import { fetchOperatorBySlug, fetchOperators } from "@/lib/operators";
import { OperatorProfileTabs } from "@/components/operator/operator-profile-tabs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const op = await fetchOperatorBySlug(slug);

  if (!op) {
    return { title: "Operador não encontrado" };
  }

  const name = op.organization?.name || op.headline || "Operador de Drones";
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dronehub.com.br";
  const canonicalUrl = `${siteUrl}/operators/${op.slug}`;

  return {
    title: `${name} — Operador de Drones Homologado`,
    description: op.about?.slice(0, 160) || `${name}: Mapeamento aéreo, topografia e operações com drones em ${op.organization?.city || "Brasil"}.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${name} · DroneHub`,
      description: op.headline || op.about?.slice(0, 160),
      url: canonicalUrl,
      type: "profile",
    },
  };
}

export default async function OperatorProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const op = await fetchOperatorBySlug(slug);

  if (!op) {
    notFound();
  }

  const name = op.organization?.name || op.headline || "Operador de Drones";
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dronehub.com.br";
  const profileUrl = `${siteUrl}/operators/${op.slug}`;

  // LocalBusiness Schema
  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: name,
    description: op.about || op.headline,
    url: profileUrl,
    address: {
      "@type": "PostalAddress",
      addressLocality: op.organization?.city || "Cuiabá",
      addressRegion: op.organization?.state_code || "MT",
      addressCountry: "BR",
    },
    ...(op.rating_average && op.rating_count
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: op.rating_average.toFixed(1),
            reviewCount: op.rating_count,
            bestRating: "5",
            worstRating: "1",
          },
        }
      : {}),
    priceRange: "$$",
  };

  return (
    <div className="min-h-dvh bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />

      <PublicHeader />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Breadcrumbs */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-text-muted">
          <Link href="/" className="hover:underline">
            Início
          </Link>
          <span>/</span>
          <Link href="/operators" className="hover:underline">
            Operadores
          </Link>
          <span>/</span>
          <span className="text-text truncate font-medium">{name}</span>
        </nav>

        {/* Dynamic Multi-Tab Showcase with Panoramic Hero Banner */}
        <OperatorProfileTabs
          operator={{
            slug: op.slug,
            name: name,
            headline: op.headline,
            about: op.about,
            verification_status: op.verification_status,
            city: op.organization?.city || (op as any).city,
            state_code: op.organization?.state_code || (op as any).state_code,
            rating_average: op.rating_average,
            rating_count: op.rating_count,
            missions_completed: op.missions_completed,
            accepting_jobs: op.accepting_jobs,
            hero_banner_url: (op as any).hero_banner_url,
            avatar_url: (op as any).avatar_url,
            banner_headline: (op as any).banner_headline,
            banner_subtitle: (op as any).banner_subtitle,
            banner_badges: (op as any).banner_badges,
            website_url: (op as any).website_url,
            linkedin_url: (op as any).linkedin_url,
            instagram_url: (op as any).instagram_url,
            anac_sisant_status: (op as any).anac_sisant_status,
            reta_insurance_status: (op as any).reta_insurance_status,
            mop_status: (op as any).mop_status,
            canac_pilots_count: (op as any).canac_pilots_count,
            data_intent_config: (op as any).data_intent_config,
            services: op.services,
            drones: op.drones,
            pilots: op.pilots,
            portfolio_items: (op as any).portfolio_items || (op.portfolio as any),
            reviews: (op as any).reviews as any,
          }}
        />
      </main>
    </div>
  );
}

export const dynamicParams = true;

/** Bounded pre-rendering for discovery; marketplace long tail remains on-demand ISR. */
export async function generateStaticParams() {
  const operators = await fetchOperators();
  return operators.slice(0, 100).map((operator) => ({ slug: operator.slug }));
}
