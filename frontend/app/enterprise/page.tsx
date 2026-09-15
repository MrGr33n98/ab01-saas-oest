import Link from "next/link";
import { PublicHeader } from "@/components/layout/public-header";

export const metadata = { title: "Enterprise" };

export default function EnterprisePage() {
  return (
    <div className="min-h-dvh">
      <PublicHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-semibold text-text">DroneHub Enterprise</h1>
        <p className="mt-2 max-w-2xl text-[15px] text-text-muted">
          Controle fornecedores, missões, gastos, compliance e permissões em uma única plataforma.
          Marketplace privado, SSO, webhooks e retenção customizada.
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {[
            "Rede de fornecedores aprovados",
            "Limiares de procurement",
            "Centros de custo",
            "Webhooks e API keys",
            "SSO / SAML",
            "Exportações e auditoria",
          ].map((f) => (
            <li key={f} className="card text-[15px] text-text">{f}</li>
          ))}
        </ul>
        <Link href="/contact" className="btn-primary mt-10 inline-flex">
          Falar com vendas
        </Link>
      </main>
    </div>
  );
}
