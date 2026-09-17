import { LandingHeader } from "@/components/landing/landing-header";
import { PlatformHero } from "@/components/platform/platform-hero";
import { PlatformFeaturesBar } from "@/components/platform/platform-features-bar";
import { PlatformMetricsGrid } from "@/components/platform/platform-metrics-grid";
import { PlatformOrderSection } from "@/components/platform/platform-order-section";
import { PlatformTrackSection } from "@/components/platform/platform-track-section";
import { PlatformShareSection } from "@/components/platform/platform-share-section";
import { PlatformApiSection } from "@/components/platform/platform-api-section";
import { PlatformDeliverablesSection } from "@/components/platform/platform-deliverables-section";
import { PlatformCtaBanner } from "@/components/platform/platform-cta-banner";
import { LandingFooter } from "@/components/landing/landing-footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plataforma OEST — Reality Data & Drone Mission OS",
  description:
    "A infraestrutura líder de dados de realidade e sensoriamento remoto com drones no Brasil. Solicite missões, acompanhe telemetria ao vivo e receba dados prontos para GIS e BIM.",
  alternates: {
    canonical: "https://oest.com.br/platform",
  },
};

export default function PlatformPage() {
  return (
    <div className="relative min-h-dvh flex flex-col bg-transparent text-oest-ink selection:bg-oest-blue selection:text-white">
      {/* 01. Global Responsive Header */}
      <LandingHeader />

      <main className="flex-1">
        {/* 02. Dark Luxury Hero with Interactive Mobile Device */}
        <PlatformHero />

        {/* 03. Core Marketplace 4-Feature Highlights Bar */}
        <PlatformFeaturesBar />

        {/* 04. 3-Pillar High-Impact Metrics & Capabilities Grid (Lime, Silver, Cobalt) */}
        <PlatformMetricsGrid />

        {/* 05. Deep-Dive 1: Order reality data effortlessly */}
        <PlatformOrderSection />

        {/* 06. Deep-Dive 2: Track and review orders with live telemetry */}
        <PlatformTrackSection />

        {/* 07. Deep-Dive 3: Share and export data with ease */}
        <PlatformShareSection />

        {/* 08. Deep-Dive 4: Developer API & Webhooks */}
        <PlatformApiSection />

        {/* 09. Deep-Dive 5: Comprehensive Data Deliverables Catalog */}
        <PlatformDeliverablesSection />

        {/* 10. High-Conversion Full-Bleed Lime Banner */}
        <PlatformCtaBanner />
      </main>

      {/* 11. Global Footer */}
      <LandingFooter />
    </div>
  );
}
