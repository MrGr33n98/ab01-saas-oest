"use client";

import { useState } from "react";
import {
  Activity,
  CheckCircle2,
  Radio,
  MapPin,
  Clock,
  ShieldAlert,
  FileCheck,
  ChevronRight,
} from "lucide-react";
import { useTranslations } from "@/lib/i18n/client";

export function PlatformTrackSection() {
  const { locale } = useTranslations();
  const isEn = locale === "en";

  const [activeStep, setActiveStep] = useState(2);

  const steps = isEn
    ? [
        { label: "Dispatch & Authorization", status: "Completed", time: "08:30" },
        { label: "Field Capture & RTK Survey", status: "Completed", time: "11:15" },
        { label: "Cloud Processing & QA", status: "In Progress", time: "14:20" },
        { label: "LAS & GeoTIFF Delivery", status: "Pending", time: "Est. 17:00" },
      ]
    : [
        { label: "Despacho & Autorização DECEA", status: "Concluído", time: "08:30" },
        { label: "Captura de Campo & RTK", status: "Concluído", time: "11:15" },
        { label: "Processamento Nuvem & QA", status: "Em Execução", time: "14:20" },
        { label: "Entrega LAS & GeoTIFF", status: "Pendente", time: "Prev. 17:00" },
      ];

  return (
    <section id="track-orders" className="border-t border-oest-ink/10 bg-surface-soft/40 py-24 sm:py-32">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Explanatory Copy & Key Pillars */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-oest-blue">
              {isEn ? "Live Mission Visibility" : "Visibilidade & Governança"}
            </p>
            <h2 className="mt-3 text-[36px] sm:text-[48px] font-bold leading-[0.98] tracking-[-0.045em] text-oest-ink">
              {isEn
                ? "Track and review orders in real time."
                : "Acompanhe e audite missões em tempo real."}
            </h2>
            <p className="mt-5 text-[16px] leading-relaxed text-oest-ink/75 font-normal">
              {isEn
                ? "Gain full end-to-end transparency. Follow pilot deployment, flight authorization compliance, live GNSS telemetry, and verify processed point clouds before sign-off."
                : "Tenha transparência total de ponta a ponta. Acompanhe a aprovação de voo no SARPAS, o status da aeronave em campo, a calibração RTK e aprove os entregáveis finais com garantia técnica."}
            </p>

            <div className="mt-8 space-y-4">
              <div className="rounded-2xl border border-oest-ink/10 bg-white p-4.5 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-oest-blue">
                    <Radio className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-oest-ink">
                      {isEn ? "Live Telemetry & Flight Audit" : "Telemetria e Auditoria de Voo"}
                    </h4>
                    <p className="text-[12px] text-text-muted mt-0.5">
                      {isEn
                        ? "Inspect GNSS accuracy, satellite fix count, and ground control points (GCPs)."
                        : "Verifique acurácia posicional GNSS, número de satélites e pontos de controle em solo."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-oest-ink/10 bg-white p-4.5 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <FileCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-oest-ink">
                      {isEn ? "Automated Quality Assurance" : "Controle de Qualidade Automatizado"}
                    </h4>
                    <p className="text-[12px] text-text-muted mt-0.5">
                      {isEn
                        ? "Every dataset undergoes automated overlap, blur detection, and radiometric calibration checks."
                        : "Cada lote passa por validação automática de sobreposição (overlap), nitidez e calibração radiométrica."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: High-End Live Mission Dashboard Mockup */}
          <div className="lg:col-span-6 order-1 lg:order-2">
            <div className="rounded-[32px] border border-oest-ink/12 bg-white p-2 shadow-2xl ring-1 ring-black/5">
              <div className="overflow-hidden rounded-[24px] border border-oest-ink/10 bg-[#0A121E] text-white p-6 shadow-inner">
                {/* Mockup Header Bar */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <Activity className="h-4.5 w-4.5 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-[14px] font-bold text-white">
                          MISSION #OEST-8842
                        </h4>
                        <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[9px] font-mono font-bold text-emerald-400">
                          LIVE
                        </span>
                      </div>
                      <p className="text-[11px] text-white/50">
                        {isEn ? "Solar Plant Photogrammetry · SP" : "Usinas Solares Fotovoltaicas · SP"}
                      </p>
                    </div>
                  </div>

                  <span className="text-[12px] font-mono font-bold text-emerald-400">
                    78% COMPLETE
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-oest-blue via-emerald-400 to-[#D4F63C] w-[78%]" />
                </div>

                {/* Simulated Radar / Map Viewport */}
                <div className="relative mt-5 h-44 w-full overflow-hidden rounded-xl border border-white/10 bg-[#050C16]">
                  {/* Grid Lines */}
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage:
                        "linear-gradient(rgba(202,215,246,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(202,215,246,0.18) 1px, transparent 1px)",
                      backgroundSize: "24px 24px",
                    }}
                  />
                  {/* Flight Track SVG */}
                  <svg className="relative h-full w-full" viewBox="0 0 400 180" fill="none">
                    <path
                      d="M30 40 L370 35 L370 70 L30 75 L30 110 L370 105 L370 140 L30 145"
                      stroke="#2A57B8"
                      strokeWidth="2"
                      strokeDasharray="6 6"
                      strokeOpacity="0.8"
                    />
                    <circle cx="280" cy="106" r="6" fill="#1A9E60" />
                    <circle cx="280" cy="106" r="14" stroke="#1A9E60" className="animate-ping" />
                  </svg>
                  {/* Telemetry Tag */}
                  <div className="absolute bottom-2 left-2 rounded-lg bg-black/80 px-2.5 py-1 text-[10px] font-mono text-white/90 border border-white/10 backdrop-blur-sm">
                    <span className="text-emerald-400 font-bold">ALT:</span> 120m · <span className="text-emerald-400 font-bold">GSD:</span> 1.3cm/px · <span className="text-emerald-400 font-bold">SATS:</span> 28 FIX
                  </div>
                </div>

                {/* 4 Interactive Timeline Steps */}
                <div className="mt-5 space-y-2">
                  {steps.map((step, idx) => {
                    const isDone = idx < activeStep;
                    const isCurrent = idx === activeStep;
                    return (
                      <div
                        key={step.label}
                        className={`flex items-center justify-between rounded-xl p-2.5 text-[12px] transition-colors ${
                          isCurrent
                            ? "bg-white/10 border border-emerald-500/40 text-white"
                            : isDone
                            ? "bg-white/[0.03] text-white/80"
                            : "bg-transparent text-white/40"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {isDone ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          ) : isCurrent ? (
                            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                          ) : (
                            <div className="h-2 w-2 rounded-full bg-white/20" />
                          )}
                          <span className="font-medium">{step.label}</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-[10px]">
                          <span>{step.time}</span>
                          <span
                            className={
                              isDone
                                ? "text-emerald-400"
                                : isCurrent
                                ? "text-yellow-400 font-bold"
                                : "text-white/30"
                            }
                          >
                            {step.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
