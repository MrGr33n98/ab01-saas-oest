"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  BarChart3,
  GitFork,
  Train,
  Zap,
  Building2,
  Anchor,
  Layers,
  Sparkles,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import type { CategoryDetail } from "@/lib/categories";
import type { BannerAd } from "@/types/ads";
import { fetchBannerAds, trackBannerEvent } from "@/lib/api/ads";
import { useTranslations } from "@/lib/i18n/client";

const SUB_ICONS: Record<string, LucideIcon> = {
  road: GitFork,
  train: Train,
  zap: Zap,
  "building-2": Building2,
  anchor: Anchor,
};

type SlideItem =
  | { type: "editorial"; category: CategoryDetail }
  | { type: "ad"; ad: BannerAd };

export function CategoryHeroCarousel({ category }: { category: CategoryDetail }) {
  const { t } = useTranslations();
  const [ads, setAds] = useState<BannerAd[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const trackedImpressions = useRef<Set<string>>(new Set());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch sponsored banners targeted for this category
  useEffect(() => {
    let active = true;
    fetchBannerAds({
      placement: "category.hero_carousel",
      category: category.slug,
      limit: 3,
    }).then((banners) => {
      if (active && banners.length > 0) {
        setAds(banners);
      }
    });

    return () => {
      active = false;
    };
  }, [category.slug]);

  // Combine native editorial slide with ad slides
  const slides: SlideItem[] = [
    { type: "editorial", category },
    ...ads.map((ad) => ({ type: "ad" as const, ad })),
  ];

  const totalSlides = slides.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Autoplay functionality (7 seconds per slide)
  useEffect(() => {
    if (totalSlides <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 7000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [totalSlides, isPaused, nextSlide]);

  // Track impression for ad slides when displayed
  useEffect(() => {
    const currentSlide = slides[currentIndex];
    if (currentSlide && currentSlide.type === "ad") {
      const banner = currentSlide.ad;
      if (!trackedImpressions.current.has(banner.id)) {
        trackedImpressions.current.add(banner.id);
        trackBannerEvent(banner.id, {
          event_type: "impression",
          placement: "category.hero_carousel",
          category_slug: category.slug,
        });
      }
    }
  }, [currentIndex, slides, category.slug]);

  const currentSlide = slides[currentIndex];

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-border/80 bg-oest-navy shadow-md transition-all"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-roledescription="carousel"
      aria-label={`${category.name}`}
    >
      {/* Slide Content Display */}
      {currentSlide.type === "editorial" ? (
        /* SLIDE 0: Native Category Editorial Content */
        <div className="relative min-h-[280px] sm:min-h-[300px] flex flex-col justify-between p-6 sm:p-8">
          {/* Background Image & Overlays */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
            style={{
              backgroundImage: `url(${
                category.hero.image_url || "/images/operator-hero-banner.jpg"
              })`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#08121B]/95 via-[#08121B]/85 to-[#08121B]/50" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/30" />

          {/* Top Status & Category Eyebrow */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-white/70 uppercase">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 backdrop-blur-xs text-[11px] text-white/90">
                {t("categories.certifiedBadge")}
              </span>
              {category.eyebrow && (
                <>
                  <span className="h-1 w-1 rounded-full bg-white/40" />
                  <span>{category.eyebrow}</span>
                </>
              )}
            </div>

            {totalSlides > 1 && (
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-0.5 text-[11px] font-medium text-white/70 backdrop-blur-xs border border-white/10">
                1 {t("common.apply")} {totalSlides}
              </span>
            )}
          </div>

          {/* Headline & Body */}
          <div className="relative z-10 mt-3 max-w-2xl">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl leading-[1.08]">
              {category.headline}
            </h1>
            <p className="mt-2.5 text-[14px] leading-relaxed text-white/80 sm:text-[15px]">
              {category.subheadline}
            </p>

            {/* Sub-segments Pills */}
            {category.use_cases && category.use_cases.length > 0 && (
              <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-medium text-white/80">
                {category.use_cases.map((uc) => {
                  const Icon = (uc.icon_key && SUB_ICONS[uc.icon_key]) || Layers;
                  return (
                    <div
                      key={uc.id}
                      className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1 backdrop-blur-xs border border-white/10 transition-colors hover:bg-white/15"
                    >
                      <Icon className="h-3.5 w-3.5 text-white/80" />
                      <span>{uc.title}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Row / Stats */}
          <div className="relative z-10 mt-6 flex items-center justify-between border-t border-white/10 pt-4">
            <div className="flex items-center gap-3 text-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-white">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div>
                <span className="text-sm font-bold tabular-nums">
                  {category.counts.operators} {t("nav.operators")} {t("categories.certifiedBadge").toLowerCase()}
                </span>
              </div>
            </div>

            <Link
              href={`/app/missions/new?category=${category.slug}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#1A9E60] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#15804d]"
            >
              <span>{t("nav.requestMission")}</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        /* SLIDE 1..N: Sponsored Ad Banner Slide */
        <div
          className="relative min-h-[280px] sm:min-h-[300px] flex flex-col justify-between p-6 sm:p-8 animate-in fade-in-50 duration-300"
          style={{
            backgroundColor: currentSlide.ad.background_color || "#08121B",
            color: currentSlide.ad.text_color || "#FFFFFF",
          }}
        >
          {/* Background Image if present */}
          {currentSlide.ad.image_url && (
            <>
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${currentSlide.ad.image_url})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#08121B]/95 via-[#08121B]/85 to-[#08121B]/50" />
            </>
          )}

          {/* Top Row: Sponsor Badge & Eyebrow */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300 backdrop-blur-xs">
                <Sparkles className="h-3 w-3 text-emerald-400" />
                {t("categories.featuredBadge")}
              </span>
              {currentSlide.ad.eyebrow && (
                <span className="text-xs font-mono font-semibold tracking-wider opacity-75 uppercase">
                  {currentSlide.ad.eyebrow}
                </span>
              )}
            </div>

            {totalSlides > 1 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-0.5 text-[11px] font-medium text-white/70 backdrop-blur-xs border border-white/10">
                {currentIndex + 1} / {totalSlides}
              </span>
            )}
          </div>

          {/* Middle: Ad Headline & Subtitle */}
          <div className="relative z-10 mt-3 max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl leading-[1.08] text-white">
              {currentSlide.ad.title || currentSlide.ad.name}
            </h2>
            {currentSlide.ad.subtitle && (
              <p className="mt-2.5 text-[14px] leading-relaxed opacity-90 sm:text-[15px] max-w-xl">
                {currentSlide.ad.subtitle}
              </p>
            )}
          </div>

          {/* Bottom Row: CTA Button & Sponsorship Indicator */}
          <div className="relative z-10 mt-6 flex items-center justify-between border-t border-white/10 pt-4">
            <span className="text-xs opacity-60">
              OEST Ads • {category.name}
            </span>

            <a
              href={currentSlide.ad.cta_url}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={() => {
                if (currentSlide.type === "ad") {
                  trackBannerEvent(currentSlide.ad.id, {
                    event_type: "click",
                    placement: "category.hero_carousel",
                    category_slug: category.slug,
                  });
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-5 py-2 text-xs font-bold text-black shadow-md transition-transform active:scale-95"
            >
              <span>{currentSlide.ad.cta_label || t("nav.requestMission")}</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Carousel Navigation Arrows (Visible on 2+ slides) */}
      {totalSlides > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Slide anterior"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 border border-white/15 text-white/90 backdrop-blur-md opacity-0 group-hover:opacity-100 hover:bg-black/70 hover:scale-105 transition-all focus:opacity-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Próximo slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 border border-white/15 text-white/90 backdrop-blur-md opacity-0 group-hover:opacity-100 hover:bg-black/70 hover:scale-105 transition-all focus:opacity-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1 backdrop-blur-md border border-white/10">
            {slides.map((s, idx) => (
              <button
                key={s.type === "editorial" ? "editorial" : s.ad.id}
                type="button"
                onClick={() => goToSlide(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === idx
                    ? "w-6 bg-emerald-400"
                    : "w-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
