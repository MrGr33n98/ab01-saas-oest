"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Layers,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Camera,
  Scan,
  Flame,
  Sprout,
  FileSpreadsheet,
} from "lucide-react";
import { useTranslations } from "@/lib/i18n/client";

const FORMAT_ITEMS = [
  { pt: "Mapas e Ortomosaicos 2D (GeoTIFF, ECW)", en: "2D Orthomosaic maps (GeoTIFF, ECW)" },
  { pt: "Nuvens de Pontos 3D densas (LAS, LAZ, 3D Tiles)", en: "3D maps and Point Clouds (LAS, LAZ, 3D Tiles)" },
  { pt: "Modelos Digitais de Terreno (MDT)", en: "Digital Terrain Models (DTM)" },
  { pt: "Modelos Digitais de Superfície (MDS)", en: "Digital Surface Models (DSM)" },
  { pt: "Mapas topográficos e curvas CAD (DWG, DXF)", en: "Topographic maps & CAD Contours (DWG, DXF)" },
  { pt: "Arquivos de campo e fotos geotagged (RAW)", en: "Source files & geotagged captures (RAW files)" },
  { pt: "Índices multiespectrais (NDVI, NDRE)", en: "Multispectral vegetation indices (NDVI, NDRE)" },
  { pt: "Termografia radiométrica infravermelha (FLIR RJPG)", en: "Infrared & Radiometric Thermal (FLIR RJPG)" },
  { pt: "Varredura a laser LiDAR classificada", en: "Classified LiDAR laser scan data" },
  { pt: "Panoramas imersivos 360° e inspeção em alta resolução", en: "360° inspection panoramas & high-res assets" },
];

export function PlatformDeliverablesSection() {
  const { locale } = useTranslations();
  const isEn = locale === "en";

  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Micro-tilt interactive physics on mouse hover
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 10, y: -y * 10 });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <section id="data-deliverables" className="relative overflow-hidden bg-white py-24 sm:py-32 lg:py-36">
      {/* Subtle cartographic background contour glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-1/4 h-96 w-96 rounded-full bg-blue-50/70 blur-3xl" />
        <div className="absolute right-0 bottom-10 h-96 w-96 rounded-full bg-emerald-50/60 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1320px] px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: 3D Stacked Layers Isometric Visualization with Float Motion */}
          <div className="lg:col-span-6 flex justify-center">
            <div
              ref={containerRef}
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="relative w-full max-w-[540px] cursor-pointer select-none"
              style={{ perspective: "1200px" }}
            >
              {/* Dynamic Light Halo */}
              <div className="absolute -inset-6 rounded-full bg-gradient-to-tr from-blue-400/20 via-emerald-400/20 to-transparent blur-3xl" />

              {/* Floating Multi-Layer Container with GSAP-like smooth levitation physics */}
              <div
                className="relative rounded-3xl transition-transform duration-500 ease-out oest-float-anim"
                style={{
                  transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) scale(${
                    isHovered ? 1.03 : 1
                  })`,
                  transformStyle: "preserve-3d",
                }}
              >
                {/* 3D Stacked Levels Graphic */}
                <Image
                  src="/images/levels-oest.png"
                  alt="OEST Reality Data Stacked Levels: Drone Scan, RGB Photogrammetry, NDVI Thermal, DTM/DSM Topography, 3D Point Cloud, CAD Vectors"
                  width={1000}
                  height={1100}
                  priority
                  className="h-auto w-full object-contain drop-shadow-[0_24px_48px_rgba(8,21,37,0.18)] transition-all duration-300"
                />

                {/* Micro Layer Tags Overlay (Hover Badges) */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full border border-oest-ink/10 bg-white/90 px-4 py-1.5 shadow-md backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-bold text-oest-ink tracking-tight">
                    {isEn
                      ? "Multi-Layer Geospatial Stack"
                      : "Camadas Integradas: RGB · NDVI · MDT · LiDAR · CAD"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Typography & Formats Checklist (Matching Globhe) */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            {/* Eyebrow Tag */}
            <div className="mb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-oest-blue/20 bg-blue-50 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-oest-blue">
                <Sparkles className="h-3.5 w-3.5 text-oest-blue" />
                {isEn ? "Data Deliverables & Exports" : "Entregáveis & Formatos de Dados"}
              </span>
            </div>

            {/* Main Headline */}
            <h2 className="text-[40px] sm:text-[52px] lg:text-[58px] font-bold leading-[0.96] tracking-[-0.045em] text-oest-ink">
              {isEn ? "Data deliverables" : "Entregáveis de dados"}
            </h2>

            {/* Description */}
            <p className="mt-5 text-[16px] sm:text-[17px] leading-relaxed text-oest-ink/75 font-normal">
              {isEn
                ? "Access the plenitude of data formats we deliver, both standard and specialized formats, for any drone data application area. We also work with third-party platforms and specialists for rarer formats and individual processing."
                : "Acesse a plenitude de formatos e produtos geoespaciais que entregamos, desde ortofotos de alta precisão até nuvens de pontos 3D densas, modelos digitais e termografia. Compatibilidade nativa com os principais softwares de engenharia, SIG e BIM."}
            </p>

            {/* Formats Title */}
            <p className="mt-7 text-[13px] font-bold uppercase tracking-wider text-oest-ink">
              {isEn ? "Most common formats:" : "Formatos e produtos mais solicitados:"}
            </p>

            {/* 10 Bullet Points List */}
            <ul className="mt-3.5 grid gap-y-2.5 sm:grid-cols-1 text-[14px] text-oest-ink/80">
              {FORMAT_ITEMS.map((item) => (
                <li key={item.pt} className="flex items-start gap-2.5">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-oest-green" />
                  <span className="leading-snug">{isEn ? item.en : item.pt}</span>
                </li>
              ))}
            </ul>

            {/* Bottom Button */}
            <div className="mt-9">
              <Link
                href="/data-products"
                className="group inline-flex items-center gap-3 rounded-full bg-oest-ink px-7 py-3.5 text-[14px] font-bold text-white shadow-md transition-all duration-300 hover:bg-black hover:shadow-lg active:scale-[0.98]"
              >
                <span>{isEn ? "Explore our data deliverables" : "Explorar nossos entregáveis de dados"}</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded High-Performance Smooth Floating Animation */}
      <style jsx>{`
        @keyframes oestLevelsFloat {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(0.4deg);
          }
        }

        .oest-float-anim {
          animation: oestLevelsFloat 6s ease-in-out infinite;
          will-change: transform;
        }

        @media (prefers-reduced-motion: reduce) {
          .oest-float-anim {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}
