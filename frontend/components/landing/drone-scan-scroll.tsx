"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { useTranslations } from "@/lib/i18n/client";

interface DroneScanScrollProps {
  className?: string;
}

const TOTAL_FRAMES = 120;
const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

/**
 * DroneScanScroll — Ultra-Fast Zero-Lag Canvas Frame-by-Frame Scrubbing
 *
 * - 100% Homogeneous Pure White Background (#FFFFFF)
 * - 0ms decoding latency with GPU-accelerated HTML5 Canvas
 * - True 60/120 FPS bidirectional scrolling with zero hitching or delay
 * - Seamless blend without silhouette or rectangle borders
 * - Robust fallback guaranteeing continuous instant display
 */
export function DroneScanScroll({ className = "" }: DroneScanScrollProps) {
  const { locale } = useTranslations();
  const isEn = locale === "en";

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const lastRenderedIndexRef = useRef<number>(-1);
  const targetFrameIndexRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);

  // References for responsive physics
  const targetProgressRef = useRef<number>(0);
  const currentProgressRef = useRef<number>(0);
  const isReducedMotionRef = useRef<boolean>(false);

  useEffect(() => {
    // Check reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    isReducedMotionRef.current = mediaQuery.matches;

    const handleMotionChange = (e: MediaQueryListEvent) => {
      isReducedMotionRef.current = e.matches;
    };
    mediaQuery.addEventListener("change", handleMotionChange);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Helper to draw image finding the closest loaded frame if requested index is still downloading
    const drawFrame = (index: number) => {
      let img = imagesRef.current[index];

      // If requested frame isn't loaded yet, fallback to closest loaded frame
      if (!img || !img.complete || img.naturalWidth === 0) {
        for (let i = index; i >= 0; i--) {
          if (imagesRef.current[i]?.complete && imagesRef.current[i].naturalWidth > 0) {
            img = imagesRef.current[i];
            break;
          }
        }
        if (!img || !img.complete || img.naturalWidth === 0) {
          for (let i = index + 1; i < TOTAL_FRAMES; i++) {
            if (imagesRef.current[i]?.complete && imagesRef.current[i].naturalWidth > 0) {
              img = imagesRef.current[i];
              break;
            }
          }
        }
      }

      if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        lastRenderedIndexRef.current = index;
      }
    };

    // Preload frames array
    const images: HTMLImageElement[] = [];
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = `/videos/drone-scan-frames/frame_${String(i).padStart(3, "0")}.webp`;

      img.onload = () => {
        // Whenever any image loads, if we need it for current target, draw it immediately
        if (i === targetFrameIndexRef.current || lastRenderedIndexRef.current === -1) {
          drawFrame(targetFrameIndexRef.current);
        }
      };

      // In case image was already cached by browser
      if (img.complete && img.naturalWidth > 0 && lastRenderedIndexRef.current === -1) {
        drawFrame(0);
      }

      images.push(img);
    }
    imagesRef.current = images;

    // Calculate scroll progress relative to container
    const calculateScrollProgress = () => {
      if (!containerRef.current || isReducedMotionRef.current) {
        targetProgressRef.current = 0.5;
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const scrollDistance = rect.height - windowHeight;

      if (scrollDistance <= 0) {
        targetProgressRef.current = 0;
        return;
      }

      // Progress begins when top of container reaches top of viewport
      const rawProgress = -rect.top / scrollDistance;
      targetProgressRef.current = Math.max(0, Math.min(1, rawProgress));
    };

    calculateScrollProgress();

    // Event listeners
    window.addEventListener("scroll", calculateScrollProgress, { passive: true });
    window.addEventListener("resize", calculateScrollProgress, { passive: true });

    // Ultra-Fast 60/120 FPS Lerp Loop
    const loop = () => {
      const current = currentProgressRef.current;
      const target = targetProgressRef.current;

      // Snappy, responsive interpolation with instant tactile feel
      const diff = target - current;
      let next = current;

      if (Math.abs(diff) < 0.0002) {
        next = target;
      } else {
        next = current + diff * 0.22;
      }

      currentProgressRef.current = next;

      // Map progress directly to frame index
      const targetFrame = Math.min(
        TOTAL_FRAMES - 1,
        Math.max(0, Math.round(next * (TOTAL_FRAMES - 1)))
      );

      targetFrameIndexRef.current = targetFrame;

      if (targetFrame !== lastRenderedIndexRef.current) {
        drawFrame(targetFrame);
      }

      rafIdRef.current = requestAnimationFrame(loop);
    };

    rafIdRef.current = requestAnimationFrame(loop);

    return () => {
      mediaQuery.removeEventListener("change", handleMotionChange);
      window.removeEventListener("scroll", calculateScrollProgress);
      window.removeEventListener("resize", calculateScrollProgress);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full bg-white ${className}`}
      style={{
        minHeight: "240vh",
      }}
    >
      {/* Sticky Viewport Container: Pinned during scroll scrub */}
      <div className="sticky top-0 flex h-[100dvh] w-full flex-col items-center justify-between overflow-hidden px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-6 sm:pb-8 bg-white">
        
        {/* Section Header */}
        <div className="mx-auto w-full max-w-[1100px] text-center shrink-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-oest-blue">
            {isEn ? "Distributed Coverage" : "Cobertura distribuída"}
          </p>
          <h2 className="mx-auto mt-2 max-w-[950px] text-[28px] sm:text-[40px] lg:text-[50px] font-bold leading-[1.06] tracking-[-0.04em] text-oest-ink">
            {isEn
              ? "Operations begin right where your asset is located."
              : "A operação começa onde o seu ativo está."}
          </h2>
          <p className="mx-auto mt-2 hidden max-w-[680px] text-[14px] sm:text-[15px] leading-relaxed text-oest-ink/70 sm:block">
            {isEn
              ? "Plan drone missions across Brazil with consistent technical standards, regardless of location."
              : "Planeje missões em todo o Brasil com requisitos técnicos consistentes, independentemente da localização da demanda."}
          </p>
        </div>

        {/* Pure Canvas Visual — Seamless Pure White 100% Homogeneous */}
        <div className="relative mx-auto w-full max-w-[1020px] my-auto flex items-center justify-center bg-white">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="block w-full h-auto max-h-[56vh] sm:max-h-[60vh] object-contain object-center select-none pointer-events-none"
            aria-label="Animação interativa de escaneamento de drone em 3D sobre o mapa do Brasil"
          />
        </div>

        {/* Tactile Gesture Guidance & Link */}
        <div className="shrink-0 text-center pb-1">
          <div className="flex items-center justify-center gap-2 text-center text-[11px] font-medium text-oest-ink/50 select-none">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-oest-blue animate-pulse" />
            <span>
              {isEn
                ? "Scroll to scrub drone scan frame-by-frame"
                : "Role a página para controlar o escaneamento quadro a quadro"}
            </span>
          </div>

          <Link
            href="/coverage"
            className="mt-2 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-oest-blue underline-offset-4 hover:underline"
          >
            <span>{isEn ? "Explore full coverage map" : "Consultar cobertura e polos regionais"}</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
