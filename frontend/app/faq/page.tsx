import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/layout/public-shell";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { FaqSection } from "@/components/seo/faq-section";
import { SITE_FAQ } from "@/lib/seo/content";

export const metadata: Metadata = {
  title: "FAQ — perguntas frequentes",
  description:
    "Como funcionam missões, pagamento Pix/cartão, operadores verificados, ortomosaico, MT/MS/GO e compradores internacionais no DroneHub.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "FAQ · DroneHub",
    description: "Respostas diretas sobre marketplace e Mission OS de drones.",
  },
};

export default function FaqPage() {
  return (
    <PublicShell>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Breadcrumbs
          items={[
            { name: "Início", href: "/" },
            { name: "FAQ" },
          ]}
        />
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-text">
          Perguntas frequentes
        </h1>
        <p className="mt-3 text-[16px] text-text-muted">
          Respostas objetivas para quem compra dados ou opera missões. Para
          suporte de conta, use o{" "}
          <Link href="/contact" className="underline">
            contato
          </Link>
          .
        </p>
        <FaqSection items={SITE_FAQ} title="" />
        <p className="mt-12 text-sm text-text-muted">
          Pronto para operar?{" "}
          <Link href="/sign-up" className="font-medium text-text underline">
            Criar conta
          </Link>{" "}
          ou{" "}
          <Link href="/app/missions/new" className="font-medium text-text underline">
            publicar missão
          </Link>
          .
        </p>
      </main>
    </PublicShell>
  );
}
