import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/layout/public-shell";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { GLOSSARY } from "@/lib/seo/content";

export const metadata: Metadata = {
  title: "Glossário de dados e drones",
  description:
    "Ortomosaico, NDVI, DTM, DSM, LiDAR, GSD, AOI e outros termos usados em missões DroneHub.",
  alternates: { canonical: "/glossary" },
};

export default function GlossaryIndexPage() {
  const terms = Object.entries(GLOSSARY).sort((a, b) =>
    a[1].term.localeCompare(b[1].term, "pt-BR")
  );

  return (
    <PublicShell>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Breadcrumbs items={[{ name: "Início", href: "/" }, { name: "Glossário" }]} />
        <h1 className="mt-4 text-3xl font-semibold text-text">Glossário</h1>
        <p className="mt-3 text-text-muted">
          Termos técnicos de fotogrametria, sensores e do Mission OS.
        </p>
        <ul className="mt-8 divide-y divide-border border-y border-border">
          {terms.map(([slug, t]) => (
            <li key={slug}>
              <Link
                href={`/glossary/${slug}`}
                className="flex justify-between py-3 text-[15px] hover:bg-surface-soft"
              >
                <span className="font-medium text-text">{t.term}</span>
                <span className="text-text-muted">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </PublicShell>
  );
}
