"use client";

import { DroneScanScroll } from "@/components/landing/drone-scan-scroll";

/**
 * BrazilCoverage — Distributed Drone Operations & Interactive Reality Scan
 *
 * Replaces static illustration with the full scroll-scrubbed 60 FPS drone scan experience.
 */
export function BrazilCoverage() {
  return (
    <section id="cobertura" className="relative bg-white">
      <DroneScanScroll />
    </section>
  );
}
