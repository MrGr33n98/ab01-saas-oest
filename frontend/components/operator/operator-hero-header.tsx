"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { FollowButton } from "./follow-button";

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

  // Context line without repeating identical headline
  const contextSubtitle =
    operator.headline && operator.headline !== operator.name
      ? operator.headline
      : "Levantamentos de alta precisão, ortomosaicos, LiDAR e agricultura de precisão.";

  return (
    <div className="space-y-0">
      {/* 01. Compact Hero Banner (Desktop: 240px, Tablet: 200px, Mobile: 160px) */}
      <div className="relative h-[160px] sm:h-[200px] md:h-[240px] w-full overflow-hidden rounded-[20px] bg-oest-navy shadow-sm">
        {/* Full-bleed background image with Next.js Image optimization */}
        <Image
          src={bannerImage}
          alt={operator.name}
          fill
          priority
          sizes="(max-width: 1180px) 100vw, 1180px"
          className="object-cover object-center"
        />

        {/* Horizontal Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#08121B]/85 via-[#08121B]/55 to-black/15" />

        {/* Topography Contour Line Overlay */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full opacity-15"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M-40 100 C 140 30, 280 180, 580 70 S 880 150, 1200 80"
            fill="none"
            stroke="#b6ff55"
            strokeWidth="1.2"
            strokeDasharray="4 6"
          />
          <path
            d="M-40 140 C 180 70, 380 220, 720 110 S 1020 180, 1300 120"
            fill="none"
            stroke="#ffffff"
            strokeWidth="0.8"
            strokeOpacity="0.4"
          />
        </svg>

        {/* Banner Content (Headline + Subcopy + Pills) */}
        <div className="relative z-10 flex h-full flex-col justify-between p-5 sm:p-7 md:p-8">
          <div className="max-w-[460px] space-y-1">
            <h1 className="text-xl sm:text-2xl md:text-[32px] font-bold tracking-tight text-white leading-[1.02] drop-shadow-sm">
              {bannerHeadline}
            </h1>
            <p className="text-xs sm:text-[13px] text-white/80 leading-relaxed line-clamp-2 max-w-[420px]">
              {bannerSubtitle}
            </p>
          </div>

          {/* Compact Pills in Banner Footer */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {bannerBadges.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center rounded-full border border-white/20 bg-black/35 px-2.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-xs shadow-2xs"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 02. Compact Profile Summary Card (Overlap: -48px, Height: 180-210px) */}
      <div className="relative z-20 -mt-12 mx-3 sm:mx-6 rounded-[16px] border border-[#E4E9E7] bg-white p-5 sm:p-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
        <div className="grid grid-cols-1 md:grid-cols-[108px_minmax(0,1fr)_220px] gap-5 items-center">
          {/* Column 1: Avatar (108x108 with clean border and subtle shadow) */}
          <div className="relative -mt-14 md:-mt-0 h-[84px] w-[84px] sm:h-[108px] sm:w-[108px] shrink-0 rounded-[18px] border border-[#E4E9E7] bg-white p-2 shadow-[0_8px_24px_rgba(0,0,0,0.08)] flex items-center justify-center">
            <img
              src={avatarImage}
              alt={operator.name}
              className="h-full w-full rounded-[12px] object-contain"
            />
          </div>

          {/* Column 2: Identity / Trust / Meta */}
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl md:text-[26px] font-bold text-text leading-[1.08] tracking-tight">
                {operator.name}
              </h2>
            </div>

            <p className="text-[13px] sm:text-sm text-text-muted leading-snug line-clamp-1">
              {contextSubtitle}
            </p>

            {/* Badges & Status Row */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              {operator.verification_status === "verified" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-bold text-accent-ink shadow-2xs">
                  <ShieldCheck className="h-3 w-3" />
                  Homologado ANAC ✓
                </span>
              )}
              {operator.accepting_jobs !== false && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Disponível para novas missões
                </span>
              )}
            </div>

            {/* Inline Metadata (Reviews, Missions, Location) */}
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-text-muted pt-1">
              <span className="inline-flex items-center gap-1 font-semibold text-text">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                <span>{operator.rating_average ? operator.rating_average.toFixed(1) : "5.0"}</span>
                <span className="font-normal text-text-muted">({operator.rating_count || 28} avaliações)</span>
              </span>
              <span className="text-border-strong">•</span>
              <span className="font-medium text-text">
                {operator.missions_completed || 34} missões homologadas
              </span>
              {(operator.city || operator.state_code) && (
                <>
                  <span className="text-border-strong">•</span>
                  <span className="inline-flex items-center gap-0.5 text-text">
                    <MapPin className="h-3 w-3 text-text-muted" />
                    <span>{operator.city ? `${operator.city}, ` : ""}{operator.state_code}</span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Column 3: Compact CTA Column (220px) */}
          <div className="flex flex-col gap-2 shrink-0 md:w-[220px]">
            <Link
              href={`/app/missions/new?operator=${operator.slug}`}
              className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-lg bg-accent text-[13px] font-bold text-accent-ink shadow-sm transition hover:brightness-95 active:translate-y-0.5"
            >
              <Zap className="h-3.5 w-3.5 fill-accent-ink" />
              <span>Solicitar Cotação</span>
            </Link>

            <FollowButton operatorSlug={operator.slug} className="w-full h-11" />

            <p className="text-center text-[11px] text-emerald-700 font-medium">
              ● Disponível agora
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
