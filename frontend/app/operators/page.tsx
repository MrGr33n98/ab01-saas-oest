import Link from "next/link";
import { PublicHeader } from "@/components/layout/public-header";
import { OperatorCard } from "@/components/marketplace/operator-card";
import { SERVICE_CATEGORIES } from "@/lib/categories";
import { fetchOperators } from "@/lib/operators";
import { BannerSlot } from "@/components/ads/banner-slot";

export const metadata = {
  title: "Operadores de Drones Homologados no Brasil",
  description: "Encontre operadores certificados pela ANAC/DECEA para missões de mapeamento aéreo, topografia, agricultura e inspeções em todo o Brasil.",
  alternates: {
    canonical: "/operators",
  },
  openGraph: {
    title: "Operadores de Drones Homologados · DroneHub",
    description: "Contrate pilotos e empresas de drones certificados para sua operação no campo ou na cidade.",
    url: "/operators",
  },
};

export default async function OperatorsPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; state?: string; min_rating?: string }>;
}) {
  const sp = await searchParams;
  const operators = await fetchOperators({
    service: sp.service,
    state: sp.state,
    min_rating: sp.min_rating,
  });

  return (
    <div className="min-h-dvh">
      <PublicHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="w-full shrink-0 lg:w-56">
            <h2 className="text-[13px] font-medium uppercase tracking-wider text-text-muted">
              Categorias
            </h2>
            <ul className="mt-3 space-y-1">
              <li>
                <Link
                  href="/operators"
                  className={`block rounded-input px-3 py-2 text-[14px] ${
                    !sp.service
                      ? "bg-surface-soft font-medium text-text"
                      : "text-text-muted hover:bg-surface-soft hover:text-text"
                  }`}
                >
                  Todas
                </Link>
              </li>
              {SERVICE_CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/operators?service=${c.slug}`}
                    className={`block rounded-input px-3 py-2 text-[14px] ${
                      sp.service === c.slug
                        ? "bg-surface-soft font-medium text-text"
                        : "text-text-muted hover:bg-surface-soft hover:text-text"
                    }`}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Sidebar Ad (OEST Ads: operators.sidebar) */}
            <div className="mt-6">
              <BannerSlot placement="operators.sidebar" variant="sidebar" />
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold text-text">Operadores verificados</h1>
            <p className="mt-1 text-[15px] text-text-muted">
              Apenas perfis verificados e aceitando jobs. Avaliações só de missões reais.
            </p>
            <div className="mt-6">
              <BannerSlot placement="operators.top" />
            </div>

            {operators.length === 0 ? (
              <div className="mt-10 card py-16 text-center">
                <p className="font-medium text-text">Nenhum operador encontrado</p>
                <p className="mt-2 text-[14px] text-text-muted">
                  Quando houver operadores verificados, eles aparecem aqui — sem perfis fictícios.
                </p>
              </div>
            ) : (
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {operators.map((op) => (
                  <OperatorCard key={op.id} op={op} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
