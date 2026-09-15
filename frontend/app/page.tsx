import { LandingHeader } from "@/components/landing/landing-header";
import { LandingHero } from "@/components/landing/landing-hero";
import { MicroproofBar } from "@/components/landing/microproof-bar";
import { PlatformShowcase } from "@/components/landing/platform-showcase";
import { VisualPause } from "@/components/landing/visual-pause";
import { EnterprisePillars } from "@/components/landing/enterprise-pillars";
import { HowItWorksCards } from "@/components/landing/how-it-works-cards";
import { SectorsGrid } from "@/components/landing/sectors-grid";
import { BrazilCoverage } from "@/components/landing/brazil-coverage";
import { DataPipeline } from "@/components/landing/data-pipeline";
import { AudienceSplit } from "@/components/landing/audience-split";
import { SocialProof } from "@/components/landing/social-proof";
import { ActionCta } from "@/components/landing/action-cta";
import { FaqSection } from "@/components/landing/faq-section";
import { LandingFooter } from "@/components/landing/landing-footer";

export const metadata = {
  title: "OEST — Reality Data & Drone as a Service Platform",
  description:
    "Infraestrutura sob demanda para captura, orquestração e entrega de dados geoespaciais com frotas de drones homologadas em todo o território nacional.",
};

export default function LandingPage() {
  return (
    <div className="min-h-dvh flex flex-col bg-white text-oest-ink selection:bg-oest-blue selection:text-white">
      {/* 01. Header / Navigation */}
      <LandingHeader />

      <main className="flex-1">
        {/* 02. Hero Section */}
        <LandingHero />

        {/* 03. Microproof Metrics Bar */}
        <MicroproofBar />

        {/* 04. Platform Showcase / Mockup */}
        <PlatformShowcase />

        {/* 05. Cinematic Visual Pause */}
        <VisualPause />

        {/* 06. Enterprise Value Pillars */}
        <EnterprisePillars />

        {/* 07. How It Works (5 Cards) */}
        <HowItWorksCards />

        {/* 08. Sectors & Verticals */}
        <SectorsGrid />

        {/* 09. Brazil Coverage & Regional Hubs */}
        <BrazilCoverage />

        {/* 10. Data Products & GIS Integrations */}
        <DataPipeline />

        {/* 11. Dual Audience (Clients vs. Operators) */}
        <AudienceSplit />

        {/* 12. Sector proof without unapproved customer-logo claims */}
        <SocialProof />

        {/* 13. Action CTA Banner */}
        <ActionCta />

        {/* 14. FAQ Section (Full-bleed OEST Blue) */}
        <FaqSection />
      </main>

      {/* 15. Landing Footer */}
      <LandingFooter />
    </div>
  );
}
