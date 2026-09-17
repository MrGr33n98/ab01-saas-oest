"use client";

import { useTranslations } from "@/lib/i18n/client";
import { Check, ShieldCheck, Zap, Crosshair } from "lucide-react";

export function PlatformMetricsGrid() {
  const { locale } = useTranslations();
  const isEn = locale === "en";

  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-8">
        {/* Lime Accent Header Pill */}
        <div className="flex justify-center mb-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#D4F63C] px-5 py-2 text-[12px] font-bold uppercase tracking-wider text-black shadow-xs">
            <span className="h-2 w-2 rounded-full bg-black animate-pulse" />
            {isEn ? "Platform capabilities and metrics" : "Capacidade operacional e métricas OEST"}
          </span>
        </div>

        {/* 3 Asymmetric High-Impact Pillar Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Card 1: Lime Green Vibrant Tint */}
          <div className="flex flex-col justify-between rounded-3xl bg-[#E6F97D] p-8 text-black transition-transform duration-300 hover:-translate-y-1 shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black text-[#E6F97D]">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <span className="text-[11px] font-mono font-bold tracking-wider uppercase opacity-70">
                  01 / COBERTURA
                </span>
              </div>
              <h3 className="mt-8 text-[26px] font-bold leading-[1.05] tracking-[-0.035em]">
                {isEn ? "Truly national marketplace" : "Rede nacional homologada"}
              </h3>
              <p className="mt-3 text-[13px] leading-relaxed text-black/80 font-medium">
                {isEn
                  ? "Access over 500+ certified drone operators and pilots across all 27 Brazilian states with mandatory ANAC/SISANT validation."
                  : "Acesse mais de 500+ empresas e pilotos de drone cadastrados em todos os 27 estados com validação obrigatória ANAC/SISANT e seguro RETA."}
              </p>
            </div>

            <ul className="mt-8 space-y-2 border-t border-black/15 pt-6 text-[12px] font-semibold text-black/85">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-black shrink-0" />
                <span>{isEn ? "100% Verified Pilots (CANAC)" : "100% Pilotos Certificados (CANAC)"}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-black shrink-0" />
                <span>{isEn ? "Mandatory RETA Aviation Insurance" : "Seguro Aeronáutico RETA Ativo"}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-black shrink-0" />
                <span>{isEn ? "Calibrated Industrial Payloads" : "Sensores Industriais Calibrados"}</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Soft Clean Architecture (Silver / White) */}
          <div className="flex flex-col justify-between rounded-3xl border border-oest-ink/12 bg-[#F3F6FA] p-8 text-oest-ink transition-transform duration-300 hover:-translate-y-1 shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-oest-blue text-white">
                  <Zap className="h-5 w-5" />
                </span>
                <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-oest-ink/50">
                  02 / AGILIDADE
                </span>
              </div>
              <h3 className="mt-8 text-[26px] font-bold leading-[1.05] tracking-[-0.035em]">
                {isEn ? "Quick turnaround times" : "Prazos ágeis & mobilização em 24h"}
              </h3>
              <p className="mt-3 text-[13px] leading-relaxed text-oest-ink/75 font-medium">
                {isEn
                  ? "Receive technical matching proposals within 24 hours, rapid field deployment, and accelerated photogrammetry cloud processing."
                  : "Receba propostas técnicas compatíveis em até 24 horas, mobilização imediata para o campo e processamento automatizado em nuvem."}
              </p>
            </div>

            <ul className="mt-8 space-y-2 border-t border-oest-ink/15 pt-6 text-[12px] font-semibold text-oest-ink/80">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-oest-green shrink-0" />
                <span>{isEn ? "Fast DECEA / SARPAS flight authorizations" : "Aprovação ágil no DECEA / SARPAS"}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-oest-green shrink-0" />
                <span>{isEn ? "Automated spatial radius matching" : "Matching por raio e especialidade"}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-oest-green shrink-0" />
                <span>{isEn ? "Real-time delivery progress updates" : "Acompanhamento de entrega em tempo real"}</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Deep Royal / Electric Cobalt Blue */}
          <div className="flex flex-col justify-between rounded-3xl bg-[#2A57B8] p-8 text-white transition-transform duration-300 hover:-translate-y-1 shadow-md">
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#2A57B8]">
                  <Crosshair className="h-5 w-5" />
                </span>
                <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-white/70">
                  03 / PRECISÃO
                </span>
              </div>
              <h3 className="mt-8 text-[26px] font-bold leading-[1.05] tracking-[-0.035em]">
                {isEn ? "Centimeter reality precision" : "Acurácia centimétrica PEC-A"}
              </h3>
              <p className="mt-3 text-[13px] leading-relaxed text-white/80 font-medium">
                {isEn
                  ? "Survey-grade deliverables with RTK/PPK GNSS receivers, ground control points (GCPs), and official SIRGAS 2000 coordinates."
                  : "Entregas com padrão de exatidão cartográfica Classe A, suporte a GNSS RTK/PPK, pontos de apoio e laudos técnicos assinados por engenheiro."}
              </p>
            </div>

            <ul className="mt-8 space-y-2 border-t border-white/20 pt-6 text-[12px] font-semibold text-white/90">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#D4F63C] shrink-0" />
                <span>{isEn ? "GSD down to 1.2 cm per pixel" : "GSD milimétrico de até 1.2 cm/px"}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#D4F63C] shrink-0" />
                <span>{isEn ? "Dense LiDAR penetration (classified)" : "LiDAR denso com classificação de solo"}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#D4F63C] shrink-0" />
                <span>{isEn ? "Certified ART engineering reports" : "Laudos técnicos com ART e registro CREA"}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
