import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/layout/public-shell";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { CUSTOMERS } from "@/lib/seo/content";

export const metadata: Metadata = {
  title: "Cases e clientes",
  description:
    "Como organizações usam o DroneHub para missões, propostas e dados aprovados.",
  alternates: { canonical: "/customers" },
};

export default function CustomersPage() {
  return (
    <PublicShell>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Breadcrumbs items={[{ name: "Início", href: "/" }, { name: "Cases" }]} />
        <h1 className="mt-4 text-3xl font-semibold text-text">Cases</h1>
        <p className="mt-3 text-text-muted">
          Exemplos ilustrativos de uso (substitua por cases reais com autorização).
        </p>
        <ul className="mt-8 space-y-4">
          {CUSTOMERS.map((c) => (
            <li key={c.slug} className="rounded-card border border-border p-5">
              <p className="text-xs font-medium uppercase text-text-muted">{c.sector}</p>
              <Link
                href={`/customers/${c.slug}`}
                className="mt-1 block text-lg font-semibold text-text hover:underline"
              >
                {c.name}
              </Link>
              <p className="mt-2 text-sm text-text-muted">{c.summary}</p>
            </li>
          ))}
        </ul>
      </main>
    </PublicShell>
  );
}
