import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/public-header";

export const metadata: Metadata = {
  title: "Termos de uso",
  description: "Termos de uso da plataforma DroneHub.",
};

export default function TermsPage() {
  return (
    <div className="min-h-dvh">
      <PublicHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 prose prose-neutral">
        <h1>Termos de uso</h1>
        <p className="text-text-muted">Última atualização: setembro de 2026</p>
        <p>
          Ao criar conta na DroneHub, você concorda em usar a plataforma de forma
          lícita para publicar missões, enviar propostas e trocar entregáveis
          geoespaciais. Dados de pagamento são processados por provedores
          certificados (ex.: Stripe). Operadores devem manter certificações e
          cobertura verdadeiras. Disputas seguem o fluxo de mediação da
          plataforma antes de medidas judiciais no Brasil.
        </p>
        <p>
          Este texto é um baseline MVP — substitua por revisão jurídica antes do
          go-live comercial.
        </p>
        <p>
          <Link href="/legal/privacy">Política de privacidade</Link>
        </p>
      </main>
    </div>
  );
}
