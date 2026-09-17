"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Radio,
  Compass,
  Layers,
} from "lucide-react";
import { useTranslations } from "@/lib/i18n/client";

export function PlatformHero() {
  const { locale } = useTranslations();
  const isEn = locale === "en";

  const phoneRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Micro-tilt interactive physics on mouse movement
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!phoneRef.current) return;
    const rect = phoneRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 14, y: -y * 14 });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <section className="relative overflow-hidden bg-[#050C16] pb-24 pt-32 sm:pb-32 sm:pt-40 lg:pb-36 lg:pt-44 text-white">
      {/* 1. Spatial Atmosphere, Radiant Heat Meshes & Luminous Topographic Isolines (Curvas de Nível) */}
      <div className="pointer-events-none absolute inset-0">
        {/* Cartographic Survey Grid */}
        <div
          className="absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(202,215,246,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(202,215,246,0.18) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        {/* Ambient Glowing Orbs */}
        <div className="absolute -left-36 top-16 h-[550px] w-[550px] rounded-full bg-[#2A57B8]/25 blur-[140px]" />
        <div className="absolute right-0 top-10 h-[600px] w-[600px] rounded-full bg-[#1A9E60]/22 blur-[160px]" />
        <div className="absolute bottom-0 left-1/3 h-[450px] w-[450px] rounded-full bg-[#3A6DE0]/20 blur-[130px]" />

        {/* Luminous Vector Topographic Isolines (Curvas de Nível) */}
        <div className="absolute inset-0 oest-hero-topo-anim opacity-80">
          <svg
            className="h-full w-full object-cover"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1920 1080"
            preserveAspectRatio="xMidYMid slice"
            fill="none"
          >
            <defs>
              <linearGradient id="heroTopoStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3A6DE0" stopOpacity="0.45" />
                <stop offset="50%" stopColor="#1A9E60" stopOpacity="0.40" />
                <stop offset="100%" stopColor="#CAD7F6" stopOpacity="0.35" />
              </linearGradient>

              <linearGradient id="heroIndexStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#CAD7F6" stopOpacity="0.80" />
                <stop offset="50%" stopColor="#1A9E60" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#3A6DE0" stopOpacity="0.80" />
              </linearGradient>
            </defs>

            {/* Top-Right Ridge Contours */}
            <g strokeWidth="1">
              <path
                d="M950,-80 C1140,80 1300,240 1520,250 C1700,260 1820,150 1980,110"
                stroke="url(#heroTopoStroke)"
              />
              <path
                d="M880,-40 C1080,110 1240,280 1460,290 C1650,300 1780,190 1950,150"
                stroke="url(#heroTopoStroke)"
              />
              <path
                d="M810,0 C1020,140 1180,320 1400,330 C1600,340 1740,230 1920,190"
                stroke="url(#heroIndexStroke)"
                strokeWidth="1.75"
              />
              <text x="1280" y="338" fill="#CAD7F6" fillOpacity="0.85" fontSize="11" fontWeight="600" fontFamily="monospace" letterSpacing="1">220m</text>

              <path
                d="M740,40 C960,170 1120,360 1340,370 C1550,380 1700,270 1890,230"
                stroke="url(#heroTopoStroke)"
              />
              <path
                d="M670,80 C900,200 1060,400 1280,410 C1500,420 1660,310 1860,270"
                stroke="url(#heroTopoStroke)"
              />
              <path
                d="M600,120 C840,230 1000,440 1220,450 C1450,460 1620,350 1830,310"
                stroke="url(#heroIndexStroke)"
                strokeWidth="1.75"
              />
              <text x="1110" y="458" fill="#1A9E60" fillOpacity="0.9" fontSize="11" fontWeight="600" fontFamily="monospace" letterSpacing="1">200m</text>

              <path
                d="M530,160 C780,260 940,480 1160,490 C1400,500 1580,390 1800,350"
                stroke="url(#heroTopoStroke)"
              />
              <path
                d="M460,200 C720,290 880,520 1100,530 C1350,540 1540,430 1770,390"
                stroke="url(#heroIndexStroke)"
                strokeWidth="1.75"
              />
              <text x="960" y="538" fill="#CAD7F6" fillOpacity="0.85" fontSize="11" fontWeight="600" fontFamily="monospace" letterSpacing="1">180m</text>
            </g>

            {/* Bottom-Left Contour Group */}
            <g strokeWidth="1">
              <path
                d="M-80,420 C180,410 380,580 580,690 C780,790 1040,830 1340,840 C1620,850 1810,760 2000,720"
                stroke="url(#heroTopoStroke)"
              />
              <path
                d="M-80,500 C160,480 350,640 540,750 C740,840 1000,880 1300,890 C1580,900 1780,810 1970,770"
                stroke="url(#heroIndexStroke)"
                strokeWidth="1.75"
              />
              <text x="560" y="756" fill="#1A9E60" fillOpacity="0.9" fontSize="11" fontWeight="600" fontFamily="monospace" letterSpacing="1">140m</text>

              <path
                d="M-80,580 C140,550 320,700 500,810 C700,900 960,940 1260,950 C1540,960 1750,870 1940,820"
                stroke="url(#heroTopoStroke)"
              />
              <path
                d="M-80,660 C120,620 290,760 460,870 C660,960 920,1000 1220,1010 C1500,1020 1720,930 1910,870"
                stroke="url(#heroIndexStroke)"
                strokeWidth="1.75"
              />
              <text x="470" y="876" fill="#CAD7F6" fillOpacity="0.85" fontSize="11" fontWeight="600" fontFamily="monospace" letterSpacing="1">100m</text>
            </g>

            {/* Geodetic Survey Marks */}
            <g>
              <circle cx="1400" cy="330" r="3.5" fill="#CAD7F6" fillOpacity="0.9" />
              <text x="1412" y="334" fill="#CAD7F6" fillOpacity="0.8" fontSize="10" fontFamily="monospace">▲ PT-01 (SIRGAS2000)</text>

              <circle cx="1100" cy="530" r="3.5" fill="#1A9E60" fillOpacity="0.9" />
              <text x="1112" y="534" fill="#1A9E60" fillOpacity="0.8" fontSize="10" fontFamily="monospace">▲ RN-08 (RTK FIX)</text>
            </g>
          </svg>
        </div>
      </div>

      <div className="relative mx-auto max-w-[1320px] px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Left Column: Vision, Headline, Narrative & CTAs */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Eyebrow Pill */}
            <div className="mb-6 flex items-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#CAD7F6] backdrop-blur-md shadow-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                {isEn ? "OEST MISSION OS · REALITY DATA PLATFORM" : "PLATAFORMA OEST · REALITY DATA & MISSION OS"}
              </span>
            </div>

            {/* Headline */}
            <h1 className="max-w-2xl text-[44px] sm:text-[60px] lg:text-[72px] font-bold leading-[0.94] tracking-[-0.045em] text-white">
              {isEn ? (
                <>
                  Get reality data <br />
                  <span className="bg-gradient-to-r from-white via-white/90 to-[#CAD7F6] bg-clip-text text-transparent">
                    anywhere, anytime.
                  </span>
                </>
              ) : (
                <>
                  Dados de realidade <br />
                  <span className="bg-gradient-to-r from-white via-white/90 to-[#CAD7F6] bg-clip-text text-transparent">
                    em qualquer lugar, a qualquer hora.
                  </span>
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="mt-6 max-w-xl text-[16px] sm:text-[18px] leading-relaxed text-white/70 font-normal">
              {isEn
                ? "The complete infrastructure to request, orchestrate, and receive high-precision geospatial drone data across Brazil with certified operators and automated QA."
                : "A infraestrutura sob demanda para solicitar, orquestrar e receber dados geoespaciais com frotas de drones homologadas em todo o território nacional."}
            </p>

            {/* Action Buttons */}
            <div className="mt-9 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                href="/app/missions/new"
                className="group relative inline-flex items-center justify-between gap-4 rounded-full bg-[#1A9E60] px-7 py-3.5 text-[14px] font-bold text-white tracking-wide shadow-[0_12px_28px_-6px_rgba(26,158,96,0.5)] transition-all duration-300 hover:bg-[#168a53] hover:shadow-[0_16px_32px_-6px_rgba(26,158,96,0.6)] active:scale-[0.98]"
              >
                <span>{isEn ? "Request Reality Data" : "Solicitar Dados de Realidade"}</span>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-white transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>

              <Link
                href="#marketplace-features"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/[0.04] px-6 py-3.5 text-[14px] font-semibold text-white tracking-wide backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/40 active:scale-[0.98]"
              >
                {isEn ? "Explore Capabilities" : "Explorar Funcionalidades"}
              </Link>
            </div>

            {/* Trust Micro-Checklist */}
            <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/10 pt-6 text-[12px] font-medium text-white/60">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>{isEn ? "500+ Verified Operators" : "500+ Operadores Homologados ANAC"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>{isEn ? "Full RETA Insurance" : "Seguro Aeronáutico RETA Obrigatório"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>{isEn ? "GIS / BIM Ready Exports" : "Compatível com ArcGIS, QGIS & Revit"}</span>
              </div>
            </div>
          </div>

          {/* Right Column: High-End Smartphone Asset with Micro-Tilt & Levitation Physics */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div
              ref={phoneRef}
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="relative w-full max-w-[420px] select-none"
              style={{ perspective: "1200px" }}
            >
              {/* Radiant Light Halos behind device */}
              <div className="absolute -inset-6 rounded-full bg-gradient-to-tr from-[#2A57B8]/40 via-[#1A9E60]/30 to-[#3A6DE0]/20 blur-3xl" />
              <div className="absolute -inset-2 rounded-[52px] bg-emerald-500/15 blur-xl" />

              {/* Floating Container with GSAP-like smooth levitation physics & 3D tilt */}
              <div
                className="relative transition-transform duration-300 ease-out oest-phone-float flex items-center justify-center"
                style={{
                  transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) scale(${
                    isHovered ? 1.025 : 1
                  })`,
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Real High-Resolution Smartphone Asset */}
                <Image
                  src="/images/cel-phone-oest.png"
                  alt="OEST Mission OS Mobile Interface — Escolha seus produtos de dados"
                  width={520}
                  height={800}
                  priority
                  className="h-auto w-full max-w-[380px] object-contain drop-shadow-[0_32px_70px_rgba(0,0,0,0.9)] transition-all duration-300"
                />

                {/* Left Floating Telemetry Pill */}
                <div
                  className="pointer-events-none absolute -left-4 top-1/4 hidden sm:flex items-center gap-2 rounded-2xl border border-white/15 bg-black/80 px-3.5 py-2 text-white shadow-2xl backdrop-blur-md"
                  style={{ transform: "translateZ(30px)" }}
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Radio className="h-3.5 w-3.5 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white leading-tight">
                      {isEn ? "Live Mission: 98 ha" : "Missão em Voo · 98 ha"}
                    </p>
                    <p className="text-[9px] font-mono text-emerald-400">
                      RTK FIX · GSD 1.4cm
                    </p>
                  </div>
                </div>

                {/* Right Floating Deliverable Layer Pill */}
                <div
                  className="pointer-events-none absolute -right-3 bottom-1/4 hidden sm:flex items-center gap-2 rounded-2xl border border-white/15 bg-black/80 px-3.5 py-2 text-white shadow-2xl backdrop-blur-md"
                  style={{ transform: "translateZ(35px)" }}
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#2A57B8]/30 text-[#CAD7F6] border border-[#2A57B8]/40">
                    <Layers className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white leading-tight">
                      {isEn ? "6 GIS Layers Ready" : "6 Camadas de Dados"}
                    </p>
                    <p className="text-[9px] font-mono text-[#CAD7F6]">
                      GeoTIFF · LAS · DWG
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* High-Performance Smooth Levitation Floating Animation */}
      <style jsx>{`
        @keyframes oestPhoneFloat {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-12px) rotate(0.6deg);
          }
        }

        @keyframes oestHeroTopoDrift {
          0%, 100% {
            transform: scale(1) translate3d(0, 0, 0);
          }
          50% {
            transform: scale(1.02) translate3d(-8px, -6px, 0);
          }
        }

        .oest-phone-float {
          animation: oestPhoneFloat 6.5s ease-in-out infinite;
          will-change: transform;
        }

        .oest-hero-topo-anim {
          animation: oestHeroTopoDrift 28s ease-in-out infinite;
          will-change: transform;
        }

        @media (prefers-reduced-motion: reduce) {
          .oest-phone-float,
          .oest-hero-topo-anim {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}

