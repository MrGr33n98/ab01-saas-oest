"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";

type BeforeAfterSliderProps = {
  beforeUrl: string;
  afterUrl: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
};

export function BeforeAfterSlider({
  beforeUrl,
  afterUrl,
  beforeLabel = "Antes (Imagem Bruta)",
  afterLabel = "Depois (Ortomosaico Processado)",
  className = "",
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const width = rect.width;
    const position = Math.max(0, Math.min(100, (x / width) * 100));
    setSliderPosition(position);
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return;
      handleMove(e.touches[0].clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden rounded-card border border-border bg-surface shadow-md ${className}`}
      style={{ minHeight: "380px" }}
      onMouseDown={() => setIsDragging(true)}
      onTouchStart={() => setIsDragging(true)}
    >
      {/* Background (After / Processed Image) */}
      <div className="absolute inset-0 h-full w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={afterUrl}
          alt={afterLabel}
          className="h-full w-full object-cover"
        />
        <div className="absolute bottom-3 right-3 rounded bg-bg/85 px-2.5 py-1 text-xs font-semibold text-text shadow backdrop-blur-sm">
          {afterLabel}
        </div>
      </div>

      {/* Foreground (Before / Raw Image) with Clip-Path */}
      <div
        className="absolute inset-0 h-full w-full overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={beforeUrl}
          alt={beforeLabel}
          className="h-full w-full object-cover"
        />
        <div className="absolute bottom-3 left-3 rounded bg-bg/85 px-2.5 py-1 text-xs font-semibold text-text shadow backdrop-blur-sm">
          {beforeLabel}
        </div>
      </div>

      {/* Divider Bar and Handle */}
      <div
        className="absolute top-0 bottom-0 z-20 w-0.5 bg-primary cursor-ew-resize"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary bg-surface shadow-lg text-primary text-xs font-bold">
          ⇄
        </div>
      </div>
    </div>
  );
}
