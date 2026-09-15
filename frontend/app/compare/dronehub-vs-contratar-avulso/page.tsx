import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/layout/public-shell";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { COMPARE_AVULSO } from "@/lib/seo/content";

export const metadata: Metadata = {
  title: "DroneHub vs contratar operador avulso",
  description:
    "Compare workspace, propostas, pagamento e entrega aprovada versus contratação informal por WhatsApp.",
  alternates: { canonical: "/compare/dronehub-vs-contratar-avulso" },
};

export default function ComparePage() {
  const { h1, intro, rows } = COMPARE_AVULSO;
  return (
    <PublicShell>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Breadcrumbs
          items={[
            { name: "Início", href: "/" },
            { name: "Comparativo" },
          ]}
        />
        <h1 className="mt-4 text-3xl font-semibold text-text">{h1}</h1>
        <p className="mt-4 text-[16px] text-text-muted">{intro}</p>
        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-text-muted">
                <th className="py-2 pr-4 font-medium">Critério</th>
                <th className="py-2 pr-4 font-medium">DroneHub</th>
                <th className="py-2 font-medium">Avulso</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-b border-border/70">
                  <td className="py-3 pr-4 font-medium text-text">{r.label}</td>
                  <td className="py-3 pr-4 text-text-muted">{r.hub}</td>
                  <td className="py-3 text-text-muted">{r.avulso}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Link href="/sign-up" className="btn-primary mt-10 inline-flex">
          Criar conta
        </Link>
      </main>
    </PublicShell>
  );
}
