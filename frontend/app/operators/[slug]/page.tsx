import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicHeader } from "@/components/layout/public-header";
import { fetchOperatorBySlug, fetchOperators } from "@/lib/operators";

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

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-text-muted">
          <Link href="/" className="hover:underline">
            Início
          </Link>
          <span>/</span>
          <Link href="/operators" className="hover:underline">
            Operadores
          </Link>
          <span>/</span>
          <span className="text-text truncate">{name}</span>
        </nav>

        {/* Profile Card Header */}
        <div className="rounded-card border border-border bg-surface p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold text-text sm:text-3xl">{name}</h1>
                {op.verification_status === "verified" && (
                  <span className="rounded bg-accent/30 px-2 py-0.5 text-xs font-semibold text-accent-ink border border-accent-ink/20">
                    Homologado ✓
                  </span>
                )}
              </div>

              {op.headline && (
                <p className="mt-1 text-base text-text-muted">{op.headline}</p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-text-muted">
                {(op.organization?.city || op.organization?.state_code) && (
                  <span className="flex items-center gap-1">
                    📍 {op.organization.city ? `${op.organization.city}, ` : ""}{op.organization.state_code}
                  </span>
                )}
                {op.rating_average && (
                  <span className="flex items-center gap-1 font-medium text-text">
                    ⭐ {op.rating_average.toFixed(1)} ({op.rating_count || 0} avaliações)
                  </span>
                )}
                <span className="rounded bg-surface-soft px-2 py-0.5 font-medium text-text">
                  {op.missions_completed || 0} missões executadas
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 shrink-0">
              <Link
                href={`/app/missions/new?operator=${op.slug}`}
                className="btn-primary text-center px-6 py-2.5"
              >
                Solicitar Cotação
              </Link>
              {op.accepting_jobs !== false ? (
                <span className="text-center text-[11px] text-green-700 font-medium">
                  ● Disponível para novas missões
                </span>
              ) : (
                <span className="text-center text-[11px] text-text-muted">
                  ○ Agenda temporariamente cheia
                </span>
              )}
            </div>
          </div>

          {op.about && (
            <div className="mt-6 border-t border-border pt-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-2">
                Sobre a operação
              </h2>
              <p className="text-sm text-text leading-relaxed whitespace-pre-line">
                {op.about}
              </p>
            </div>
          )}
        </div>

        {/* Services & Fleet */}
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {/* Services */}
          <div className="rounded-card border border-border bg-surface p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-text">Serviços Oferecidos</h2>
            {(!op.services || op.services.length === 0) ? (
              <p className="text-xs text-text-muted">Consulte os serviços disponíveis diretamente na cotação.</p>
            ) : (
              <ul className="divide-y divide-border text-sm">
                {op.services.map((s) => (
                  <li key={s.id} className="py-2.5 flex justify-between items-center">
                    <span className="font-medium text-text">{s.title}</span>
                    <span className="text-xs text-text-muted font-mono">
                      {s.price_from ? `a partir de R$ ${s.price_from}` : "Sob consulta"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Equipment */}
          <div className="rounded-card border border-border bg-surface p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-text">Frota & Tecnologia</h2>
            {(!op.drones || op.drones.length === 0) ? (
              <p className="text-xs text-text-muted">Drones homologados pela ANATEL e cadastrados no SISANT/ANAC.</p>
            ) : (
              <ul className="divide-y divide-border text-sm">
                {op.drones.map((d, i) => (
                  <li key={i} className="py-2.5 flex items-center gap-2 text-xs">
                    <span className="text-base">🛸</span>
                    <span className="font-medium text-text">{d.manufacturer} {d.model}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
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
