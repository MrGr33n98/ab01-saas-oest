import Link from "next/link";
import { PublicHeader } from "@/components/layout/public-header";
import { BannerSlot } from "@/components/ads/banner-slot";

export const metadata = { title: "Preços" };

const PLANS = [
  { name: "Starter", price: "Grátis", desc: "Missões pontuais e busca no marketplace", cta: "Começar" },
  { name: "Pro", price: "R$ 499/mês", desc: "Time, biblioteca de dados e analytics", cta: "Assinar Pro" },
  { name: "Enterprise", price: "Sob consulta", desc: "SSO, marketplace privado, webhooks e SLA", cta: "Falar com vendas" },
];

export default function PricingPage() {
  return (
    <div className="min-h-dvh">
      <PublicHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-semibold text-text">Planos</h1>
        <div className="mt-6"><BannerSlot placement="pricing.top" /></div>
        <p className="mt-1 text-[15px] text-text-muted">
          Assinatura + take rate por ordem. Operadores têm plano próprio.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {PLANS.map((p) => (
            <div key={p.name} className="card flex flex-col">
              <h2 className="text-lg font-semibold text-text">{p.name}</h2>
              <p className="mt-2 text-2xl font-semibold text-text">{p.price}</p>
              <p className="mt-2 flex-1 text-[14px] text-text-muted">{p.desc}</p>
              <Link href="/sign-up" className="btn-primary mt-6 w-full justify-center">
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
