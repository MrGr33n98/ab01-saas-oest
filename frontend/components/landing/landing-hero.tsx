"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { RealityCaptureVideo } from "@/components/landing/reality-capture-video";
import { useTranslations } from "@/lib/i18n/client";

export function LandingHero() {
  const { t, locale } = useTranslations();
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const proof = locale === "en" ? [
    "Asset-oriented mission request",
    "Radius & capability matching",
    "GIS/BIM-ready point clouds & data",
  ] : [
    "Solicitação orientada por ativo",
    "Matching por capacidade e raio",
    "Dados e nuvens prontos para GIS/BIM",
  ];

  // Smooth scroll progression tracking without layout locking
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const section = sectionRef.current;
          if (!section) {
            ticking = false;
            return;
          }

          const rect = section.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          // Progress goes smoothly from 0 (entering) to 1 (leaving top)
          const totalDistance = windowHeight + rect.height;
          const currentDistance = windowHeight - rect.top;
          const progress = Math.min(1, Math.max(0, currentDistance / totalDistance));
          setScrollProgress(progress);

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-transparent pb-20 pt-28 sm:pb-28 sm:pt-36 lg:pb-32"
    >
      <div className="mx-auto max-w-[1340px] w-full px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Left Column: Core Headline, Subheadline, CTAs, Proof */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            {/* Refined Aerospace Eyebrow Tag */}
            <div className="mb-6 flex items-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-oest-blue/20 bg-[#EEF3FD] px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-oest-blue shadow-sm">
                <span className="h-2 w-2 rounded-full bg-oest-yellow" />
                {t("landing.eyebrow")}
              </span>
            </div>

            {/* 2-Line High-Impact Headline */}
            <h1 className="max-w-2xl text-[44px] sm:text-[58px] lg:text-[72px] font-bold leading-[0.94] tracking-[-0.045em] text-oest-ink">
              {t("landing.title")}
            </h1>

            {/* Precise Subtitle */}
            <p className="mt-6 max-w-xl text-[16px] sm:text-[18px] leading-relaxed text-oest-ink/75 font-normal">
              {t("landing.subtitle")}
            </p>

            {/* CTAs: Button-in-Button Architecture */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <Link
                href="/app/missions/new"
                data-cursor="mission"
                className="group relative inline-flex items-center justify-between gap-4 rounded-full bg-oest-green px-6 py-3 text-[14px] font-semibold text-white tracking-wide shadow-md transition-all duration-300 hover:bg-oest-green-hover hover:shadow-lg active:scale-[0.98]"
              >
                <span>{t("landing.ctaPrimary")}</span>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-white transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  →
                </span>
              </Link>

              <Link
                href="#plataforma"
                className="inline-flex items-center justify-center rounded-full border border-oest-ink/20 bg-transparent px-6 py-3 text-[14px] font-semibold text-oest-ink tracking-wide transition-all duration-300 hover:bg-oest-ink/5 hover:border-oest-ink/40 active:scale-[0.98]"
              >
                {t("landing.ctaSecondary")}
              </Link>
            </div>

            {/* Trust & Methodology Micro-Pillars */}
            <ul className="mt-10 flex max-w-xl flex-wrap gap-x-6 gap-y-3 border-t border-oest-ink/10 pt-5 text-[12px] font-medium text-oest-ink/70">
              {proof.map((item) => (
                <li className="flex items-center gap-2" key={item}>
                  <span className="h-1.5 w-1.5 rounded-full bg-oest-green" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column: High-End Reality Capture Video & Spatial Drone Motion */}
          <div className="relative lg:col-span-6 flex items-center justify-center">
            <RealityCaptureVideo scrollProgress={scrollProgress} />
          </div>
        </div>
      </div>
    </section>
  );
}
