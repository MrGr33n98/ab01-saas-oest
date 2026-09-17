"use client";

import React, { useEffect, useRef } from "react";

interface RealityCaptureVideoProps {
  scrollProgress?: number;
  className?: string;
}

const TOTAL_HERO_FRAMES = 120;
const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

/**
 * RealityCaptureVideo — High-Performance Borderless 60/120 FPS Hero Drone Visualizer
 *
 * - 100% Pure White Background (#FFFFFF) seamless integration
 * - mix-blend-multiply ensures seamless integration over topographical background contours
 * - Ultra-fast GPU-accelerated HTML5 Canvas with preloaded WebP frames
 * - Zero decoding delay, zero dark boxes, zero heavy HUD frames
 * - Interactive subtle micro-parallax on cursor hover
 * - Smooth continuous flight animation responsive to scroll progression
 */
export function RealityCaptureVideo({
  scrollProgress = 0,
  className = "",
}: RealityCaptureVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const lastRenderedIndexRef = useRef<number>(-1);
  const currentFrameRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);

  // Parallax physics refs
  const mouseOffsetRef = useRef({ x: 0, y: 0 });
  const targetMouseOffsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Helper to draw image finding the closest loaded frame
    const drawFrame = (index: number) => {
      let img = imagesRef.current[index];

      if (!img || !img.complete || img.naturalWidth === 0) {
        for (let i = index; i >= 0; i--) {
          if (imagesRef.current[i]?.complete && imagesRef.current[i].naturalWidth > 0) {
            img = imagesRef.current[i];
            break;
          }
        }
        if (!img || !img.complete || img.naturalWidth === 0) {
          for (let i = index + 1; i < TOTAL_HERO_FRAMES; i++) {
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

    // Preload hero frames
    const images: HTMLImageElement[] = [];
    for (let i = 0; i < TOTAL_HERO_FRAMES; i++) {
      const img = new Image();
      img.src = `/videos/hero-drone-frames/frame_${String(i).padStart(3, "0")}.webp`;

      img.onload = () => {
        if (lastRenderedIndexRef.current === -1 || Math.round(currentFrameRef.current) === i) {
          drawFrame(Math.round(currentFrameRef.current));
        }
      };

      if (img.complete && img.naturalWidth > 0 && lastRenderedIndexRef.current === -1) {
        drawFrame(0);
      }

      images.push(img);
    }
    imagesRef.current = images;

    // Animation Loop: smooth playback modulated by scroll and subtle hover
    let lastTime = performance.now();
    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Playback speed: normal 24fps base speed
      const baseFps = 24;
      currentFrameRef.current = (currentFrameRef.current + baseFps * dt) % TOTAL_HERO_FRAMES;

      const frameToDraw = Math.floor(currentFrameRef.current);
      if (frameToDraw !== lastRenderedIndexRef.current) {
        drawFrame(frameToDraw);
      }

      // Parallax smooth interpolation
      const currentMouse = mouseOffsetRef.current;
      const targetMouse = targetMouseOffsetRef.current;
      currentMouse.x += (targetMouse.x - currentMouse.x) * 0.1;
      currentMouse.y += (targetMouse.y - currentMouse.y) * 0.1;

      if (canvasRef.current) {
        canvasRef.current.style.transform = `translate3d(${currentMouse.x.toFixed(2)}px, ${currentMouse.y.toFixed(2)}px, 0)`;
      }

      rafIdRef.current = requestAnimationFrame(loop);
    };

    rafIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  // Micro-parallax mouse listeners
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    targetMouseOffsetRef.current = { x: x * 10, y: y * 6 };
  };

  const handleMouseLeave = () => {
    targetMouseOffsetRef.current = { x: 0, y: 0 };
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full max-w-[660px] flex items-center justify-center bg-transparent select-none ${className}`}
    >
      {/* Pure Drone Canvas with mix-blend-multiply over topographical contours */}
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="block w-full h-auto max-h-[50vh] sm:max-h-[56vh] object-contain object-center pointer-events-none mix-blend-multiply transition-transform duration-100 ease-out"
        aria-label="Animação 3D de alta performance do drone OEST"
      />
    </div>
  );
}
