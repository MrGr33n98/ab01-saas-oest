"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import type { BannerAd } from "@/types/ads";
import { fetchBannerAds, trackBannerEvent } from "@/lib/api/ads";

type Props = {
  placement: string;
  category?: string;
  className?: string;
  /** leaderboard | sidebar | inline | footer | ticker */
  variant?: "leaderboard" | "sidebar" | "inline" | "footer" | "ticker";
};

/**
 * Universal Platform Ad Slot — Fetches live creative for placement key.
 * Features automatic viewability impression tracking and responsive styling.
 */
export function BannerSlot({
  placement,
  category,
  className = "",
  variant = "leaderboard",
}: Props) {
  const [banner, setBanner] = useState<BannerAd | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const impressed = useRef(false);

  useEffect(() => {
    let cancelled = false;
    fetchBannerAds({ placement, category, limit: 1 }).then((banners) => {
      if (!cancelled && banners.length > 0) {
        setBanner(banners[0]);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [placement, category]);

  // Viewability tracking via IntersectionObserver
  useEffect(() => {
    if (!banner || impressed.current || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !impressed.current) {
          impressed.current = true;
          trackBannerEvent(banner.id, {
            event_type: "impression",
            placement,
            category_slug: category,
          });
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [banner, placement, category]);

  if (!banner) return null;

  const handleClick = () => {
    trackBannerEvent(banner.id, {
      event_type: "click",
      placement,
      category_slug: category,
    });
  };

  // 1. Ticker Variant (Header Top Bar)
  if (variant === "ticker") {
    return (
      <aside
        ref={containerRef}
        className={`w-full overflow-hidden text-xs py-2 px-4 flex items-center justify-center gap-3 transition-opacity ${className}`}
        style={{
          backgroundColor: banner.background_color || "#111820",
          color: banner.text_color || "#FFFFFF",
        }}
        data-placement={placement}
      >
        <div className="flex items-center gap-2 truncate">
          <span className="inline-flex items-center gap-1 rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
            {banner.eyebrow || "Anúncio"}
          </span>
          <span className="font-medium truncate">{banner.title || banner.name}</span>
        </div>
        <a
          href={banner.cta_url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={handleClick}
          className="shrink-0 font-bold underline hover:opacity-80 inline-flex items-center gap-0.5"
        >
          {banner.cta_label || "Saiba mais"}
          <ArrowUpRight className="h-3 w-3" />
        </a>
      </aside>
    );
  }

  // 2. Sidebar Variant (Vertical Card)
  if (variant === "sidebar") {
    return (
      <aside
        ref={containerRef}
        className={`relative overflow-hidden rounded-2xl border border-border/80 shadow-xs p-4 flex flex-col justify-between transition-all hover:shadow-md ${className}`}
        style={{
          backgroundColor: banner.background_color || "#111820",
          color: banner.text_color || "#FFFFFF",
        }}
        data-placement={placement}
      >
        <div>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
              <Sparkles className="h-2.5 w-2.5 text-emerald-400" />
              Patrocinado
            </span>
            {banner.eyebrow && (
              <span className="text-[10px] font-mono uppercase tracking-wider opacity-60">
                {banner.eyebrow}
              </span>
            )}
          </div>

          {banner.image_url && (
            <div className="mt-3 relative h-28 w-full overflow-hidden rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={banner.image_url}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <h4 className="mt-3 text-sm font-bold leading-tight">
            {banner.title || banner.name}
          </h4>
          {banner.subtitle && (
            <p className="mt-1.5 text-xs opacity-80 leading-relaxed line-clamp-3">
              {banner.subtitle}
            </p>
          )}
        </div>

        <a
          href={banner.cta_url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={handleClick}
          className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-3 py-2 text-xs font-bold text-black shadow-xs transition-colors"
        >
          <span>{banner.cta_label || "Saiba mais"}</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </aside>
    );
  }

  // 3. Footer Variant (Full-width before Footer)
  if (variant === "footer") {
    return (
      <aside
        ref={containerRef}
        className={`relative overflow-hidden rounded-2xl border border-border/80 shadow-md p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 ${className}`}
        style={{
          backgroundColor: banner.background_color || "#10170D",
          color: banner.text_color || "#F4F7F2",
        }}
        data-placement={placement}
      >
        <div className="max-w-2xl space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
              <Sparkles className="h-3 w-3 text-emerald-400" />
              Destaque OEST
            </span>
            {banner.eyebrow && (
              <span className="text-[11px] font-mono tracking-wider opacity-70 uppercase">
                {banner.eyebrow}
              </span>
            )}
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight leading-snug">
            {banner.title || banner.name}
          </h3>
          {banner.subtitle && (
            <p className="text-xs sm:text-sm opacity-85 leading-relaxed">
              {banner.subtitle}
            </p>
          )}
        </div>

        <a
          href={banner.cta_url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={handleClick}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-6 py-3 text-xs sm:text-sm font-bold text-black shadow-md transition-transform active:scale-95"
        >
          <span>{banner.cta_label || "Falar com Especialista"}</span>
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </aside>
    );
  }

  // 4. Leaderboard / Standard Horizontal Variant
  return (
    <aside
      ref={containerRef}
      className={`relative overflow-hidden rounded-xl border border-border/80 shadow-xs min-h-[72px] sm:min-h-[88px] transition-all hover:shadow-md ${className}`}
      aria-label="Anúncio"
      data-placement={placement}
    >
      <a
        href={banner.cta_url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="flex h-full w-full items-center justify-between gap-4 px-4 py-3 sm:px-6 transition-opacity hover:opacity-95"
        style={{
          backgroundColor: banner.background_color || "#0D192E",
          color: banner.text_color || "#FFFFFF",
        }}
        onClick={handleClick}
      >
        <div className="flex items-center gap-4 min-w-0">
          {banner.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={banner.image_url}
              alt=""
              className="hidden sm:block h-12 w-12 shrink-0 rounded-lg object-cover border border-white/10"
            />
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider opacity-70 font-semibold">
                {banner.eyebrow || "Publicidade"}
              </span>
            </div>
            <p className="truncate text-[14px] sm:text-[15px] font-bold leading-tight">
              {banner.title || banner.name}
            </p>
            {banner.subtitle && (
              <p className="mt-0.5 line-clamp-1 text-[12px] opacity-80">
                {banner.subtitle}
              </p>
            )}
          </div>
        </div>

        <span className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-emerald-500 text-black px-4 py-2 text-xs font-bold shadow-xs">
          <span>{banner.cta_label || "Saiba mais"}</span>
          <ArrowUpRight className="h-3 w-3" />
        </span>
      </a>
    </aside>
  );
}
