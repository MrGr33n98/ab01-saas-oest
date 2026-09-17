"use client";

import { useTranslations } from "@/lib/i18n/client";

export function MicroproofBar() {
  const { locale } = useTranslations();
  const isEn = locale === "en";

  const proofPoints = isEn
    ? [
        ["Request", "Define scope, area of interest, and required deliverables."],
        ["Compare", "Review and compare technical proposals seamlessly."],
        ["Monitor", "Full mission visibility from launch to final delivery."],
        ["Integrate", "Ready-to-use GIS/BIM reality data for your workflow."],
      ]
    : [
        ["Solicite", "Escopo, área de interesse e entrega esperada."],
        ["Compare", "Propostas técnicas em um fluxo organizado."],
        ["Acompanhe", "Visibilidade da missão até a entrega."],
        ["Integre", "Arquivos e dados para a sua operação."],
      ];

  return (
    <section className="border-y border-oest-ink/10 bg-oest-ice/30 py-7">
      <div className="mx-auto grid max-w-[1320px] grid-cols-2 px-6 lg:grid-cols-4 lg:px-8">
        {proofPoints.map(([title, detail], index) => (
          <div
            className="border-oest-ink/15 py-2 pr-5 even:pl-5 odd:border-r lg:border-r lg:px-7 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0"
            key={title}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-oest-blue">
              0{index + 1}
            </p>
            <p className="mt-1 text-sm font-semibold text-oest-ink">{title}</p>
            <p className="mt-1 max-w-[210px] text-[12px] leading-relaxed text-oest-ink/65">
              {detail}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
