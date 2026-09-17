"use client";

import { useState } from "react";
import { useTranslations } from "@/lib/i18n/client";

export function FaqSection() {
  const { locale } = useTranslations();
  const isEn = locale === "en";
  const [open, setOpen] = useState<number | null>(0);

  const faqs = isEn
    ? [
        ["How is mission pricing determined?", "Scope takes into account the asset, geographic area, capture sensor, precision level, required deliverables, and operational window."],
        ["How long does a mission take?", "Turnaround depends on project scope, mobilization, weather conditions, and processing pipelines. You can specify target deadlines during request."],
        ["How are operators selected and matched?", "The platform evaluates certified operational capacity, pilot equipment, geographic proximity, and sector-specific track record."],
        ["What geospatial data products can I request?", "Deliverables include orthomosaics, 3D point clouds (LAS/LAZ), Digital Terrain Models (DTM), radiometric thermography, and engineering reports."],
        ["Can I integrate reality data into GIS and BIM workflows?", "Yes, all data packages are exported in standard GIS/BIM formats (GeoTIFF, DWG, SHP, LAS, Revit) with official coordinate systems."],
        ["How do I join as a certified operator?", "Register your company, list your drone fleet and sensor payloads, verify certifications, and start receiving qualified mission requests."],
      ]
    : [
        ["Como o preço de uma missão é definido?", "O escopo considera o ativo, área, tipo de captura, nível de precisão, entregáveis e a janela operacional. A solicitação organiza essas variáveis para a comparação de propostas."],
        ["Quanto tempo leva uma missão?", "O prazo depende de escopo, mobilização, condições de campo e processamento. Ao solicitar, informe a janela desejada para que ela faça parte do contexto técnico."],
        ["Como são selecionados os operadores?", "A missão reúne os requisitos necessários para avaliar compatibilidade de capacidade, localização e especialidade operacional."],
        ["Quais dados posso solicitar?", "As entregas podem incluir imagens, ortomosaicos, nuvens de pontos, modelos de terreno, vetores e relatórios, conforme o que for definido no escopo."],
        ["Posso integrar os dados a outros sistemas?", "Planeje a entrega com o formato e a forma de consumo que o seu ecossistema exige — de GIS e BIM a arquivos para processos internos."],
        ["Como entrar para a rede de operadores?", "Cadastre a operação, informe capacidades e mantenha o perfil técnico pronto para oportunidades compatíveis."],
      ];

  return (
    <section className="bg-oest-blue py-24 text-white sm:py-32">
      <div className="mx-auto max-w-[1080px] px-6 lg:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-oest-yellow">
          {isEn ? "Frequently Asked Questions" : "Perguntas frequentes"}
        </p>
        <h2 className="mt-5 max-w-[850px] text-[42px] font-bold leading-[0.96] tracking-[-0.045em] sm:text-[56px]">
          {isEn
            ? "Everything you need to know to plan your next mission."
            : "O que você precisa saber para planejar a próxima missão."}
        </h2>
        <div className="mt-14 border-y border-white/25">
          {faqs.map(([question, answer], index) => {
            const isOpen = open === index;
            return (
              <article className="border-b border-white/25 last:border-b-0" key={question}>
                <button
                  aria-expanded={isOpen}
                  className="flex min-h-16 w-full items-center justify-between gap-8 py-5 text-left"
                  onClick={() => setOpen(isOpen ? null : index)}
                  type="button"
                >
                  <span className="text-[16px] font-medium leading-snug sm:text-[17px]">
                    {question}
                  </span>
                  <span aria-hidden className="text-[24px] font-light leading-none">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ${
                    isOpen ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-[760px] text-[14px] leading-relaxed text-white/78">
                      {answer}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
