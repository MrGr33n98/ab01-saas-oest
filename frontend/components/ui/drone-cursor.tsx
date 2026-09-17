"use client";

import React, { useEffect, useRef, useState } from "react";

// ============================================================================
// OEST DRONE CURSOR CONFIGURATION CONSTANTS
// Change dimensions, hotspot offsets, smoothing, tilt and colors here.
// ============================================================================
export const DRONE_CURSOR_CONFIG = {
  // Base visual dimensions (in pixels)
  SIZE_DEFAULT: 48,      // Default resting drone width (height scales ~32.6px)
  SIZE_HOVER: 54,        // Interactive hover size on links, buttons, inputs
  SIZE_CLICK: 42,        // Compressed size on mousedown
  SIZE_MISSION: 56,      // Special size for primary mission CTA buttons
  SIZE_DRAG: 50,         // Dragging payload size

  // Hotspot Calibration Offsets (pixels from top-left of drone image to click point)
  // At 48px width, the drone's front camera/gimbal is located at approx (X: 20px, Y: 21px)
  HOTSPOT_X: 20,
  HOTSPOT_Y: 21,

  // Physics & Smoothing (0.30 - 0.50)
  // Higher = more instantaneous response; Lower = more floating drone inertia
  SMOOTHING: 0.38,

  // Directional Tilt / Roll (-4deg to +4deg max)
  MAX_TILT_DEG: 4,
  TILT_SENSITIVITY: 0.45,

  // OEST Brand Colors
  COLOR_NAVY: "#081525",
  COLOR_BLUE: "#2A57B8",
  COLOR_BLUE_HALO: "rgba(42, 87, 184, 0.16)",
  COLOR_GREEN: "#1A9E60",
  COLOR_GREEN_HALO: "rgba(26, 158, 96, 0.22)",
  COLOR_MAP_RETICLE: "rgba(42, 87, 184, 0.35)",
} as const;

export type CursorMode = "default" | "interactive" | "mission" | "map" | "drag";

export function DroneCursor() {
  const [isSupported, setIsSupported] = useState(false);

  // Core DOM refs for 60fps transform manipulation (no React state on mousemove)
  const containerRef = useRef<HTMLDivElement>(null);
  const droneWrapperRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);
  const reticleRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef<HTMLDivElement>(null);

  // Physics & Coordinate refs
  const targetPos = useRef({ x: -100, y: -100 });
  const currentPos = useRef({ x: -100, y: -100 });
  const prevTargetPos = useRef({ x: -100, y: -100 });
  const currentTilt = useRef(0);
  const rafId = useRef<number | null>(null);

  // State refs
  const modeRef = useRef<CursorMode>("default");
  const isMouseDownRef = useRef(false);
  const isVisibleRef = useRef(false);
  const isReducedMotionRef = useRef(false);

  useEffect(() => {
    // 1. Device & Pointer Capability Detection
    // Render ONLY on desktop devices with fine pointer (mouse/trackpad) and hover support
    if (typeof window === "undefined") return;

    const finePointerQuery = window.matchMedia("(pointer: fine) and (hover: hover)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const checkSupport = () => {
      const supported = finePointerQuery.matches;
      setIsSupported(supported);
      isReducedMotionRef.current = reducedMotionQuery.matches;

      if (supported) {
        document.documentElement.classList.add("has-custom-drone-cursor");
      } else {
        document.documentElement.classList.remove("has-custom-drone-cursor");
      }
    };

    checkSupport();

    try {
      finePointerQuery.addEventListener("change", checkSupport);
      reducedMotionQuery.addEventListener("change", checkSupport);
    } catch {
      finePointerQuery.addListener(checkSupport);
      reducedMotionQuery.addListener(checkSupport);
    }

    // 2. Mouse & Pointer Listeners
    const handleMouseMove = (e: MouseEvent) => {
      targetPos.current.x = e.clientX;
      targetPos.current.y = e.clientY;

      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        if (containerRef.current) {
          containerRef.current.style.opacity = "1";
        }
      }
    };

    const handleMouseDown = () => {
      isMouseDownRef.current = true;
      updateVisualState();

      // Trigger micro click pulse wave
      if (pulseRef.current && !isReducedMotionRef.current) {
        const pulse = pulseRef.current;
        pulse.classList.remove("oest-pulse-active");
        // Force DOM reflow to restart CSS animation
        void pulse.offsetWidth;
        pulse.classList.add("oest-pulse-active");
      }
    };

    const handleMouseUp = () => {
      isMouseDownRef.current = false;
      updateVisualState();
    };

    const handleMouseEnter = () => {
      isVisibleRef.current = true;
      if (containerRef.current) {
        containerRef.current.style.opacity = "1";
      }
    };

    const handleMouseLeave = () => {
      isVisibleRef.current = false;
      if (containerRef.current) {
        containerRef.current.style.opacity = "0";
      }
    };

    // 3. High Performance Hover Detection via Event Delegation
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target || !target.closest) return;

      // Check explicit data-cursor attributes first
      const dataCursorEl = target.closest("[data-cursor]") as HTMLElement | null;
      if (dataCursorEl) {
        const val = dataCursorEl.getAttribute("data-cursor") as CursorMode;
        if (val === "mission" || val === "map" || val === "drag" || val === "interactive") {
          modeRef.current = val;
          updateVisualState();
          return;
        }
      }

      // Check mission button class or text heuristic for primary CTAs
      const missionBtn = target.closest(
        'button.btn-oest-green, a.btn-oest-green, [data-mission="true"]'
      );
      if (missionBtn) {
        modeRef.current = "mission";
        updateVisualState();
        return;
      }

      // Check general interactive elements
      const interactiveEl = target.closest(
        'a, button, [role="button"], input, select, textarea, summary, label[for], [tabindex]:not([tabindex="-1"])'
      );
      if (interactiveEl) {
        modeRef.current = "interactive";
        updateVisualState();
        return;
      }

      // Default state
      modeRef.current = "default";
      updateVisualState();
    };

    const handleMouseOut = (e: MouseEvent) => {
      // If moving outside interactive element to body/plain container
      const related = e.relatedTarget as HTMLElement | null;
      if (!related || !related.closest) {
        modeRef.current = "default";
        updateVisualState();
        return;
      }

      const stillInInteractive = related.closest(
        'a, button, [role="button"], input, select, textarea, summary, label[for], [data-cursor], .btn-oest-green'
      );
      if (!stillInInteractive) {
        modeRef.current = "default";
        updateVisualState();
      }
    };

    // Helper: update visual size, halos, shadows directly on refs (no re-renders)
    const updateVisualState = () => {
      const mode = modeRef.current;
      const isDown = isMouseDownRef.current;
      const droneWrapper = droneWrapperRef.current;
      const halo = haloRef.current;
      const reticle = reticleRef.current;

      if (!droneWrapper) return;

      let scale = 1;
      let translateY = 0;
      let filter = "drop-shadow(0 3px 6px rgba(8, 21, 37, 0.18))";

      if (isDown) {
        if (mode === "drag") {
          scale = 1.04;
          translateY = -2;
          filter = "drop-shadow(0 8px 16px rgba(8, 21, 37, 0.32))";
        } else {
          scale = DRONE_CURSOR_CONFIG.SIZE_CLICK / DRONE_CURSOR_CONFIG.SIZE_DEFAULT; // ~0.86
        }
      } else {
        switch (mode) {
          case "mission":
            scale = DRONE_CURSOR_CONFIG.SIZE_MISSION / DRONE_CURSOR_CONFIG.SIZE_DEFAULT; // ~1.16
            translateY = -1;
            filter = "drop-shadow(0 4px 10px rgba(26, 158, 96, 0.32))";
            break;
          case "interactive":
            scale = DRONE_CURSOR_CONFIG.SIZE_HOVER / DRONE_CURSOR_CONFIG.SIZE_DEFAULT; // ~1.11
            translateY = -1;
            filter = "drop-shadow(0 4px 8px rgba(42, 87, 184, 0.28))";
            break;
          case "drag":
            scale = DRONE_CURSOR_CONFIG.SIZE_DRAG / DRONE_CURSOR_CONFIG.SIZE_DEFAULT; // ~1.05
            filter = "drop-shadow(0 6px 12px rgba(8, 21, 37, 0.24))";
            break;
          case "map":
            scale = 1.05;
            filter = "drop-shadow(0 4px 8px rgba(42, 87, 184, 0.28))";
            break;
          default:
            scale = 1;
            translateY = 0;
            filter = "drop-shadow(0 3px 6px rgba(8, 21, 37, 0.18))";
            break;
        }
      }

      droneWrapper.style.transform = `scale(${scale}) translateY(${translateY}px)`;
      droneWrapper.style.filter = filter;

      // Halo lighting update
      if (halo) {
        if (mode === "mission") {
          halo.style.opacity = "1";
          halo.style.backgroundColor = DRONE_CURSOR_CONFIG.COLOR_GREEN_HALO;
          halo.style.boxShadow = "0 0 16px rgba(26, 158, 96, 0.35)";
        } else if (mode === "interactive" || mode === "map") {
          halo.style.opacity = "1";
          halo.style.backgroundColor = DRONE_CURSOR_CONFIG.COLOR_BLUE_HALO;
          halo.style.boxShadow = "0 0 14px rgba(42, 87, 184, 0.25)";
        } else {
          halo.style.opacity = "0";
          halo.style.boxShadow = "none";
        }
      }

      // Map Reticle update
      if (reticle) {
        if (mode === "map") {
          reticle.style.opacity = "1";
          reticle.style.transform = "translate(-50%, -50%) scale(1)";
        } else {
          reticle.style.opacity = "0";
          reticle.style.transform = "translate(-50%, -50%) scale(0.6)";
        }
      }
    };

    // 4. 60 FPS RequestAnimationFrame Animation Loop with GPU translate3d
    const animate = () => {
      const smoothing = isReducedMotionRef.current ? 1 : DRONE_CURSOR_CONFIG.SMOOTHING;

      // Micro inertia interpolation
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * smoothing;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * smoothing;

      // Directional roll / tilt calculation based on horizontal delta
      if (!isReducedMotionRef.current) {
        const deltaX = targetPos.current.x - prevTargetPos.current.x;
        prevTargetPos.current.x = targetPos.current.x;

        const targetTilt = Math.max(
          -DRONE_CURSOR_CONFIG.MAX_TILT_DEG,
          Math.min(DRONE_CURSOR_CONFIG.MAX_TILT_DEG, deltaX * DRONE_CURSOR_CONFIG.TILT_SENSITIVITY)
        );
        currentTilt.current += (targetTilt - currentTilt.current) * 0.22;
      } else {
        currentTilt.current = 0;
      }

      // Apply transform to root cursor element
      if (containerRef.current) {
        const posX = currentPos.current.x - DRONE_CURSOR_CONFIG.HOTSPOT_X;
        const posY = currentPos.current.y - DRONE_CURSOR_CONFIG.HOTSPOT_Y;
        const rot = currentTilt.current;

        containerRef.current.style.transform = `translate3d(${posX.toFixed(2)}px, ${posY.toFixed(2)}px, 0) rotate(${rot.toFixed(2)}deg)`;
      }

      rafId.current = requestAnimationFrame(animate);
    };

    // Register all listeners with passive flag
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown, { passive: true });
    window.addEventListener("mouseup", handleMouseUp, { passive: true });
    window.addEventListener("mouseover", handleMouseOver, { passive: true });
    window.addEventListener("mouseout", handleMouseOut, { passive: true });
    document.documentElement.addEventListener("mouseenter", handleMouseEnter, { passive: true });
    document.documentElement.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    // Start RAF loop
    rafId.current = requestAnimationFrame(animate);

    // 5. Proper Cleanup
    return () => {
      document.documentElement.classList.remove("has-custom-drone-cursor");
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mouseout", handleMouseOut);
      document.documentElement.removeEventListener("mouseenter", handleMouseEnter);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);

      try {
        finePointerQuery.removeEventListener("change", checkSupport);
        reducedMotionQuery.removeEventListener("change", checkSupport);
      } catch {
        finePointerQuery.removeListener(checkSupport);
        reducedMotionQuery.removeListener(checkSupport);
      }

      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  // If not supported (touch / mobile / coarse pointer), render nothing to keep DOM lightweight
  if (!isSupported) {
    return null;
  }

  return (
    <>
      {/* Root Fixed Container — pointer-events: none is strictly enforced */}
      <div
        ref={containerRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[999999] select-none opacity-0 transition-opacity duration-150 will-change-transform"
        style={{
          width: `${DRONE_CURSOR_CONFIG.SIZE_DEFAULT}px`,
          height: `${DRONE_CURSOR_CONFIG.SIZE_DEFAULT}px`,
        }}
      >
        {/* Map Reticle (Appears directly below the drone camera gimbal when mode === 'map') */}
        <div
          ref={reticleRef}
          className="pointer-events-none absolute rounded-full border border-[#2A57B8]/60 opacity-0 transition-all duration-200"
          style={{
            left: `${DRONE_CURSOR_CONFIG.HOTSPOT_X}px`,
            top: `${DRONE_CURSOR_CONFIG.HOTSPOT_Y + 14}px`,
            width: "22px",
            height: "22px",
            transform: "translate(-50%, -50%) scale(0.6)",
            boxShadow: "0 0 8px rgba(42, 87, 184, 0.4)",
          }}
        >
          {/* Reticle Crosshair Lines */}
          <div className="absolute left-1/2 top-0 h-full w-[1px] -translate-x-1/2 bg-[#2A57B8]/70" />
          <div className="absolute top-1/2 left-0 h-[1px] w-full -translate-y-1/2 bg-[#2A57B8]/70" />
          <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2A57B8]" />
        </div>

        {/* Ambient Halo Ring (Blue / Green depending on mode) */}
        <div
          ref={haloRef}
          className="pointer-events-none absolute -inset-1.5 rounded-full opacity-0 transition-all duration-200 blur-[3px]"
          style={{
            backgroundColor: DRONE_CURSOR_CONFIG.COLOR_BLUE_HALO,
          }}
        />

        {/* Micro Click Pulse Ring */}
        <div
          ref={pulseRef}
          className="oest-click-pulse pointer-events-none absolute rounded-full border-2 border-[#2A57B8]"
          style={{
            left: `${DRONE_CURSOR_CONFIG.HOTSPOT_X}px`,
            top: `${DRONE_CURSOR_CONFIG.HOTSPOT_Y}px`,
            width: "32px",
            height: "32px",
            transform: "translate(-50%, -50%) scale(0.4)",
            opacity: 0,
          }}
        />

        {/* Drone Image Wrapper with smooth micro-scale & lift transitions */}
        <div
          ref={droneWrapperRef}
          className="pointer-events-none relative h-full w-full transition-all duration-150 ease-out"
          style={{
            transformOrigin: `${DRONE_CURSOR_CONFIG.HOTSPOT_X}px ${DRONE_CURSOR_CONFIG.HOTSPOT_Y}px`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/cursor.png"
            alt=""
            width={DRONE_CURSOR_CONFIG.SIZE_DEFAULT}
            height={Math.round(DRONE_CURSOR_CONFIG.SIZE_DEFAULT * 0.68)}
            draggable={false}
            className="pointer-events-none block h-auto w-full select-none object-contain"
          />
        </div>
      </div>

      {/* Global CSS for Click Pulse Animation */}
      <style jsx global>{`
        @keyframes oestDroneClickPulse {
          0% {
            transform: translate(-50%, -50%) scale(0.4);
            opacity: 0.35;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.6);
            opacity: 0;
          }
        }

        .oest-click-pulse.oest-pulse-active {
          animation: oestDroneClickPulse 220ms ease-out forwards;
        }
      `}</style>
    </>
  );
}
