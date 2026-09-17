"use client";

import Link from "next/link";
import {
  Send,
  Search,
  Share2,
  Code2,
  ArrowRight,
} from "lucide-react";
import { useTranslations } from "@/lib/i18n/client";

export function PlatformFeaturesBar() {
  const { locale } = useTranslations();
  const isEn = locale === "en";

  const features = isEn
    ? [
        {
          icon: Send,
          title: "Easy order management",
          description:
            "Define your area of interest (AOI) via KML or polygon, select required sensors, resolution, and get verified proposals in hours.",
          href: "#order-effortlessly",
        },
        {
          icon: Search,
          title: "Track & review orders",
          description:
            "Track pilot mobilization, flight authorizations (DECEA), live RTK calibration, and review raw point clouds before final delivery.",
          href: "#track-orders",
        },
        {
          icon: Share2,
          title: "Effortless data sharing",
          description:
            "Direct cloud streaming and batch export in GeoTIFF, LAS, LAZ, DXF, and 3D Tiles ready for your GIS and engineering stack.",
          href: "#share-data",
        },
        {
          icon: Code2,
          title: "API integration",
          description:
            "Automate recurring missions, trigger webhooks upon processing completion, and inject data directly into your enterprise ERP/BIM.",
          href: "#api-integrations",
        },
      ]
    : [
        {
          icon: Send,
          title: "Gestão simples de pedidos",
          description:
            "Defina seu perímetro de interesse (KML/KMZ), selecione sensores, acurácia e receba propostas de operadores verificados em poucas horas.",
          href: "#order-effortlessly",
        },
        {
          icon: Search,
          title: "Acompanhe e audite missões",
          description:
            "Monitore mobilização de campo, autorizações DECEA/SARPAS, telemetria RTK e inspecione dados brutos antes da aprovação final.",
          href: "#track-orders",
        },
        {
          icon: Share2,
          title: "Compartilhamento ágil",
          description:
            "Streaming em nuvem e exportação em lote nos formatos GeoTIFF, LAS/LAZ, DXF e 3D Tiles prontos para seu software GIS e BIM.",
          href: "#share-data",
        },
        {
          icon: Code2,
          title: "Integração via API",
          description:
            "Automatize solicitações recorrentes, receba webhooks em tempo real e integre arquivos diretamente no ERP e SIG da sua empresa.",
          href: "#api-integrations",
        },
      ];

  return (
    <section id="marketplace-features" className="border-y border-oest-ink/10 bg-white py-18 sm:py-24">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-8">
        {/* Section Title */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-oest-blue">
            {isEn ? "OEST Core Workflow" : "Fluxo Central OEST"}
          </p>
          <h2 className="mt-3 text-[32px] sm:text-[42px] font-bold tracking-[-0.04em] text-oest-ink">
            {isEn
              ? "OEST's Marketplace & Mission Features"
              : "Recursos do Marketplace & Mission OS da OEST"}
          </h2>
          <p className="mt-3 text-[15px] sm:text-[16px] text-oest-ink/70">
            {isEn
              ? "Everything you need to orchestrate reality data operations from field capture to final CAD/GIS integration."
              : "Tudo o que sua equipe precisa para solicitar, acompanhar e integrar dados de drones com segurança e conformidade."}
          </p>
        </div>

        {/* 4 Feature Columns Grid */}
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="group relative flex flex-col justify-between rounded-2xl border border-oest-ink/10 bg-surface-soft/40 p-6 transition-all duration-300 hover:border-oest-blue/40 hover:bg-white hover:shadow-lg"
              >
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-oest-blue/10 text-oest-blue transition-colors group-hover:bg-oest-blue group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-[18px] font-bold tracking-tight text-oest-ink group-hover:text-oest-blue transition-colors">
                    {feat.title}
                  </h3>
                  <p className="mt-2.5 text-[13px] leading-relaxed text-oest-ink/65">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-oest-ink/10">
                  <a
                    href={feat.href}
                    className="inline-flex items-center gap-1.5 text-[12px] font-bold text-oest-blue group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>{isEn ? "Learn more" : "Saiba mais"}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
