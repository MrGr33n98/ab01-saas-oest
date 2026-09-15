"use client";

import Image from "next/image";
import Link from "next/link";
import { FollowButton } from "./follow-button";
import { Badge } from "@/components/ui/badge";

export type OperatorHeroHeaderProps = {
  operator: {
    id?: string;
    slug: string;
    name: string;
    headline?: string | null;
    about?: string | null;
    verification_status?: string;
    city?: string | null;
    state_code?: string | null;
    rating_average?: number | null;
    rating_count?: number;
    missions_completed?: number;
    accepting_jobs?: boolean;
    hero_banner_url?: string | null;
    avatar_url?: string | null;
    banner_headline?: string | null;
    banner_subtitle?: string | null;
    banner_badges?: string[] | null;
    website_url?: string | null;
    linkedin_url?: string | null;
    instagram_url?: string | null;
    anac_sisant_status?: string | null;
    reta_insurance_status?: string | null;
    mop_status?: string | null;
    canac_pilots_count?: number | null;
  };
};

export function OperatorHeroHeader({ operator }: OperatorHeroHeaderProps) {
  const bannerImage = operator.hero_banner_url || "/images/operator-hero-banner.jpg";
  const avatarImage = operator.avatar_url || "/images/nuvem-geo-logo.png";
  const bannerHeadline = operator.banner_headline || "Dados do mundo real. Decisões de alto impacto.";
  const bannerSubtitle =
    operator.banner_subtitle ||
    "Mapeamento aéreo, LiDAR e inteligência geoespacial para infraestrutura, engenharia e grandes projetos.";
  const bannerBadges = operator.banner_badges || ["Todo o Brasil", "Alta Precisão", "Resultados Comprovados"];

  return (
    <div className="space-y-0">
      {/* 01. Panoramic Hero Cover Banner */}
      <div className="relative h-[240px] sm:h-[300px] lg:h-[340px] w-full overflow-hidden rounded-2xl border border-border/40 bg-oest-navy shadow-lg">
        {/* Background Drone Photography */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
          style={{ backgroundImage: `url(${bannerImage})` }}
        />

        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-oest-ink/90 via-oest-ink/65 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-oest-ink/70 via-transparent to-black/20" />

        {/* Topography Contour Line Overlay (SVG) */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full opacity-20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M-50 120 C 150 40, 300 200, 600 80 S 900 160, 1300 90"
            fill="none"
            stroke="#b6ff55"
            strokeWidth="1.2"
            strokeDasharray="4 6"
          />
          <path
            d="M-50 160 C 200 80, 400 240, 750 120 S 1050 200, 1400 130"
            fill="none"
            stroke="#ffffff"
            strokeWidth="0.8"
            strokeOpacity="0.4"
          />
          <path
            d="M-50 200 C 250 120, 500 280, 900 160 S 1200 240, 1500 170"
            fill="none"
            stroke="#cad7f6"
            strokeWidth="0.8"
            strokeOpacity="0.3"
          />
        </svg>

        {/* Banner Text Content */}
        <div className="relative z-10 flex h-full flex-col justify-center px-6 sm:px-10 lg:px-12">
          <div className="max-w-2xl space-y-2.5">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight drop-shadow-md">
              {bannerHeadline}
            </h1>
            <p className="text-xs sm:text-sm text-white/85 leading-relaxed max-w-xl drop-shadow">
              {bannerSubtitle}
            </p>

            {/* Translucent Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {bannerBadges.map((badge, idx) => (
                <div
                  key={badge}
                  className="flex items-center gap-1.5 rounded-full border border-white/25 bg-black/40 px-3 py-1 text-[11px] font-medium text-white shadow-sm backdrop-blur-md"
                >
                  <span>{idx === 0 ? "📍" : idx === 1 ? "💎" : "📊"}</span>
                  <span>{badge}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 02. LinkedIn-style Overlapping Company Profile Card */}
      <div className="relative z-20 -mt-10 sm:-mt-14 mx-3 sm:mx-6 lg:mx-8 rounded-xl border border-border bg-surface p-6 sm:p-8 shadow-md">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          {/* Avatar / Logo + Company Core Info */}
          <div className="flex flex-col sm:flex-row items-start gap-5">
            {/* Square Logo Overlapping the Banner */}
            <div className="relative -mt-14 sm:-mt-20 h-28 w-28 sm:h-36 sm:w-36 shrink-0 rounded-2xl border-4 border-white bg-white p-2.5 shadow-xl transition-transform duration-300 hover:scale-105">
              <img
                src={avatarImage}
                alt={operator.name}
                className="h-full w-full rounded-xl object-contain"
              />
            </div>

            {/* Titles, Badges & Social Proof */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl lg:text-[26px] font-bold text-text tracking-tight">
                  {operator.name}
                </h2>
                {operator.verification_status === "verified" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#b6ff55] px-3 py-0.5 text-xs font-semibold text-[#10170d] shadow-sm">
                    Homologado ANAC ✓
                  </span>
                )}
              </div>

              {operator.headline && (
                <p className="text-sm font-medium text-text-muted leading-snug">
                  {operator.headline}
                </p>
              )}

              {/* Metrics Pill Row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-xs text-text-muted">
                {operator.rating_average && (
                  <span className="flex items-center gap-1 font-semibold text-text">
                    ⭐ <strong className="font-bold">{operator.rating_average.toFixed(1)}</strong> ({operator.rating_count || 119} avaliações)
                  </span>
                )}
                <span className="rounded bg-surface-soft px-2.5 py-1 font-medium text-text border border-border/60">
                  💼 {operator.missions_completed || 26} missões homologadas
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: B2B Conversion Actions */}
          <div className="flex flex-col gap-2.5 shrink-0 sm:min-w-[220px]">
            <Link
              href={`/app/missions/new?operator=${operator.slug}`}
              className="btn-primary inline-flex items-center justify-center gap-2 rounded-lg bg-[#b6ff55] px-6 py-3 text-sm font-bold text-[#10170d] shadow-sm transition hover:brightness-95 active:translate-y-0.5"
            >
              <span>⚡</span>
              <span>Solicitar Cotação</span>
            </Link>

            <FollowButton operatorSlug={operator.slug} className="w-full" />

            <div className="text-center pt-1">
              {operator.accepting_jobs !== false ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Disponível para novas missões
                </span>
              ) : (
                <span className="text-xs text-text-muted">
                  ○ Agenda temporariamente ocupada
                </span>
              )}
            </div>
          </div>
        </div>

        {/* About the Operation & Quick Contact Links (2 Columns) */}
        <div className="mt-7 grid gap-6 border-t border-border pt-6 lg:grid-cols-12">
          {/* About description */}
          <div className="lg:col-span-8 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Sobre a Operação
            </h3>
            <p className="text-sm text-text leading-relaxed whitespace-pre-line">
              {operator.about ||
                "Empresa especializada em engenharia geoespacial, sensoriamento remoto e missões com drones profissionais homologados pela ANAC e DECEA."}
            </p>
          </div>

          {/* Quick Contact & Verified Social Links */}
          <div className="lg:col-span-4 space-y-2.5 lg:border-l lg:border-border lg:pl-6">
            {(operator.city || operator.state_code) && (
              <div className="flex items-center gap-2 text-xs text-text">
                <span className="text-sm">📍</span>
                <span className="font-medium">
                  {operator.city ? `${operator.city}, ` : ""}
                  {operator.state_code || "Brasil"}
                </span>
              </div>
            )}

            {operator.website_url && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-sm">🌐</span>
                <a
                  href={operator.website_url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-oest-blue hover:underline break-all"
                >
                  {operator.website_url.replace(/^https?:\/\//, "")} ↗
                </a>
              </div>
            )}

            {operator.linkedin_url && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-sm">💼</span>
                <a
                  href={operator.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-oest-blue hover:underline break-all"
                >
                  {operator.linkedin_url.replace(/^https?:\/\/(www\.)?/, "")} ↗
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
