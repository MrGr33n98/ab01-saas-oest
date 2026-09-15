import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/public-header";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description: "Como a DroneHub trata dados pessoais (LGPD).",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-dvh">
      <PublicHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 prose prose-neutral">
        <h1>Política de privacidade</h1>
        <p className="text-text-muted">Última atualização: setembro de 2026</p>
        <p>
          Tratamos dados de conta (e-mail, nome, organização), dados de missão
          (AOI, produtos) e logs técnicos para operar o marketplace. Base legal
          típica: execução de contrato e legítimo interesse. Não vendemos bases
          de contatos. Você pode solicitar acesso ou exclusão conforme a LGPD
          entrando em contato pelo canal de suporte.
        </p>
        <p>
          Hospedagem e subprocessadores (e-mail SES, pagamentos Stripe,
          armazenamento de arquivos) processam dados sob contratos adequados.
        </p>
        <p>
          <Link href="/legal/terms">Termos de uso</Link>
        </p>
      </main>
    </div>
  );
}
