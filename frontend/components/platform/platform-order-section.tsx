"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Upload,
  Layers,
  Camera,
  Flame,
  Scan,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Sliders,
} from "lucide-react";
import { useTranslations } from "@/lib/i18n/client";

export function PlatformOrderSection() {
  const { locale } = useTranslations();
  const isEn = locale === "en";

  const [activeSensor, setActiveSensor] = useState("lidar");
  const [areaHectares, setAreaHectares] = useState(85);

  return (
    <section id="order-effortlessly" className="border-t border-oest-ink/10 bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Interactive Double-Bezel Order Tasking Card */}
          <div className="lg:col-span-6">
            <div className="rounded-[32px] border border-oest-ink/12 bg-white p-2 shadow-2xl ring-1 ring-black/5">
              <div className="rounded-[24px] border border-oest-ink/8 bg-surface p-6 sm:p-7 shadow-xs">
                {/* Header Row */}
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-oest-blue text-white font-bold text-xs">
                      01
                    </span>
                    <div>
                      <h4 className="text-[14px] font-bold text-oest-ink">
                        {isEn ? "Task a Drone Mission" : "Solicitar Nova Missão"}
                      </h4>
                      <p className="text-[11px] text-text-muted">
                        {isEn ? "Instant operational matching" : "Matching operacional automatizado"}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                    {isEn ? "READY TO DISPATCH" : "PRONTO PARA DESPACHO"}
                  </span>
                </div>

                {/* 1. Sensor Selector */}
                <div className="mt-5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    {isEn ? "Sensor & Payload" : "Sensor e Payload"}
                  </label>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {[
                      { id: "rgb", label: "RGB 45MP", icon: Camera },
                      { id: "lidar", label: "LiDAR 3D", icon: Scan },
                      { id: "thermal", label: "FLIR Térmico", icon: Flame },
                    ].map((s) => {
                      const Icon = s.icon;
                      const active = activeSensor === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setActiveSensor(s.id)}
                          className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-[12px] font-semibold transition-all ${
                            active
                              ? "border-oest-green bg-emerald-50 text-oest-green shadow-xs"
                              : "border-border bg-white text-text-muted hover:border-text-muted hover:text-text"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          <span>{s.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Interactive Area Slider */}
                <div className="mt-5">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    <span>{isEn ? "Area of Interest (Hectares)" : "Área de Interesse (Hectares)"}</span>
                    <span className="font-mono text-oest-ink text-[13px] font-bold">
                      {areaHectares} ha
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="500"
                    step="5"
                    value={areaHectares}
                    onChange={(e) => setAreaHectares(Number(e.target.value))}
                    className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-surface-soft accent-oest-green"
                  />
                </div>

                {/* 3. KML / KMZ Upload Dropper */}
                <div className="mt-5 rounded-xl border border-dashed border-border bg-surface-soft/60 p-4 text-center transition hover:bg-surface-soft">
                  <Upload className="mx-auto h-5 w-5 text-oest-blue mb-1.5" />
                  <p className="text-[12px] font-semibold text-text">
                    {isEn ? "Drop KML/KMZ or Shapefile" : "Arraste o arquivo KML/KMZ ou Shapefile"}
                  </p>
                  <p className="text-[10px] text-text-muted mt-0.5">
                    {isEn ? "Auto-detect boundary and flight path" : "Detecção automática de coordenadas e limites"}
                  </p>
                </div>

                {/* Card Footer Summary */}
                <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-text-muted">
                      {isEn ? "Turnaround" : "Prazo Estimado"}
                    </span>
                    <p className="text-[12px] font-bold text-text">
                      {isEn ? "48h after capture" : "48h pós-voo"}
                    </p>
                  </div>
                  <Link
                    href="/app/missions/new"
                    className="inline-flex items-center gap-2 rounded-xl bg-oest-green px-5 py-2.5 text-[12px] font-bold text-white shadow-sm hover:bg-oest-green-hover transition-colors"
                  >
                    <span>{isEn ? "Place Flight Order" : "Solicitar Cotação"}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Deep-Dive Headline & Bullets */}
          <div className="lg:col-span-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-oest-blue">
              {isEn ? "Simplicity at Scale" : "Simplicidade em Escala"}
            </p>
            <h2 className="mt-3 text-[36px] sm:text-[48px] font-bold leading-[0.98] tracking-[-0.045em] text-oest-ink">
              {isEn
                ? "Order reality data effortlessly."
                : "Solicite dados de realidade sem complicação."}
            </h2>
            <p className="mt-5 text-[16px] leading-relaxed text-oest-ink/75 font-normal">
              {isEn
                ? "Forget endless quoting and complex regulatory checks. Specify what you need, define your area, and let OEST match your mission with the right certified pilot and sensor."
                : "Elimine negociações fragmentadas e incertezas regulatórias. Defina o perímetro, escolha os sensores necessários e deixe o Mission OS da OEST orquestrar toda a operação de ponta a ponta."}
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mt-0.5">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-oest-ink">
                    {isEn ? "Automated matching & pricing" : "Matching e estimativa automatizados"}
                  </h4>
                  <p className="text-[13px] text-oest-ink/65 leading-relaxed mt-0.5">
                    {isEn
                      ? "Smart radius matching finds certified operators nearest to your site, reducing mobilization costs."
                      : "Algoritmo por raio de proximidade localiza os operadores homologados mais próximos, reduzindo custos de deslocamento."}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mt-0.5">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-oest-ink">
                    {isEn ? "Comprehensive sensor fleet" : "Amplo catálogo de sensores industriais"}
                  </h4>
                  <p className="text-[13px] text-oest-ink/65 leading-relaxed mt-0.5">
                    {isEn
                      ? "Select from RGB full-frame, LiDAR 3D, radiometric FLIR, or multispectral sensors tailored to your industry."
                      : "Escolha câmeras full-frame de alta resolução, sensores LiDAR de penetração vegetal, termografia FLIR ou multiespectral."}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mt-0.5">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-oest-ink">
                    {isEn ? "Precise AOI boundary definition" : "Definição precisa de perímetro AOI"}
                  </h4>
                  <p className="text-[13px] text-oest-ink/65 leading-relaxed mt-0.5">
                    {isEn
                      ? "Import custom KML, KMZ, or Shapefile polygons to calculate exact survey acreage and flight times."
                      : "Importe polígonos KML, KMZ ou Shapefile para cálculo exato de hectares, trajetórias de voo e cobertura."}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-9">
              <Link
                href="/app/missions/new"
                className="btn-oest-green px-6 py-3 text-[13px] font-semibold"
              >
                <span>{isEn ? "Start New Mission" : "Iniciar Nova Missão"}</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
