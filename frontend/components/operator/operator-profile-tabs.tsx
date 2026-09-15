"use client";

import { useState } from "react";
import { OperatorHeroHeader } from "./operator-hero-header";
import { PortfolioGallery, type PortfolioItemData } from "./portfolio-gallery";
import { DataIntentWizard } from "./data-intent-wizard";
import { ReviewsBreakdown, type ReviewItem, type ReviewMetrics } from "./reviews-breakdown";
import { Badge } from "@/components/ui/badge";

export type OperatorProfileTabsProps = {
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
    services?: Array<{
      id: string;
      title: string;
      description?: string | null;
      pricing_model?: string;
      price_from?: number | null;
      currency?: string;
    }>;
    drones?: Array<{ manufacturer: string; model: string; aircraft_type?: string }>;
    pilots?: Array<{ full_name: string; experience_years?: number | null }>;
    portfolio_items?: PortfolioItemData[];
    reviews?: ReviewItem[];
    review_metrics?: ReviewMetrics;
    data_intent_config?: {
      wizard_enabled: boolean;
      headline?: string;
      min_base_price?: number;
      price_per_hectare_rgb?: number;
      typical_delivery_days?: number;
    } | null;
  };
};

export function OperatorProfileTabs({ operator }: OperatorProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "services" | "portfolio" | "reviews" | "calculator"
  >("overview");

  // Sample portfolio fallback if none yet
  const portfolioItems: PortfolioItemData[] =
    operator.portfolio_items && operator.portfolio_items.length > 0
      ? operator.portfolio_items
      : [
          {
            id: "demo-1",
            title: "Levantamento Topográfico & Ortomosaico Agrícola (350 ha)",
            description:
              "Mapeamento em alta precisão para planejamento de curvas de nível e drenagem de lavoura de soja.",
            item_type: "before_after",
            before_after_assets: {
              before_url: "/images/oest-solar-inspection.webp",
              after_url: "/images/oest-solar-inspection.png",
              before_label: "Imagem Bruta de Campo",
              after_label: "Ortomosaico Processado com Curvas",
            },
            location_city: operator.city || "Sinop",
            location_state: operator.state_code || "MT",
            area_hectares: 350,
            category_name: "Mapeamento",
            featured: true,
          },
          {
            id: "demo-2",
            title: "Inspeção Termográfica de Usina Fotovoltaica 15MW",
            description:
              "Identificação automática de hotspots, diodos defeituosos e perdas de geração por string.",
            item_type: "ortho_sample",
            media_assets: [
              {
                url: "/images/oest-solar-inspection.png",
                gsd_cm: 2.5,
                sensor: "Térmico Radiométrico FLIR + RGB 48MP",
                caption: "Análise Termográfica Radiométrica",
              },
            ],
            location_city: operator.city || "Cuiabá",
            location_state: operator.state_code || "MT",
            area_hectares: 45,
            category_name: "Inspeção Solar",
            featured: true,
          },
        ];

  // Sample reviews fallback if none yet
  const reviewsList: ReviewItem[] =
    operator.reviews && operator.reviews.length > 0
      ? operator.reviews
      : [
          {
            id: "rev-1",
            overall_rating: 5,
            technical_accuracy_rating: 5,
            timeliness_rating: 5,
            communication_rating: 5,
            safety_compliance_rating: 5,
            delivered_gsd_cm: 2.8,
            headline: "Entrega impecável dentro do prazo acordado",
            body: "O ortomosaico e o modelo digital de terreno foram entregues com altíssima precisão e excelente georreferenciamento.",
            customer_organization_name: "Agropecuária Rio Verde",
            published_at: new Date().toISOString(),
            verified: true,
          },
          {
            id: "rev-2",
            overall_rating: 5,
            technical_accuracy_rating: 5,
            timeliness_rating: 4,
            communication_rating: 5,
            safety_compliance_rating: 5,
            delivered_gsd_cm: 3.2,
            headline: "Equipe altamente profissional e segura",
            body: "Operação executada conforme plano de voo aprovado na ANAC e entregáveis prontos para importação no QGIS.",
            customer_organization_name: "Construtora Horizonte MT",
            published_at: new Date(Date.now() - 86400000 * 7).toISOString(),
            verified: true,
          },
        ];

  const reviewMetrics: ReviewMetrics = operator.review_metrics || {
    total_count: reviewsList.length,
    overall_average: operator.rating_average || 4.9,
    technical_accuracy_average: 5.0,
    timeliness_average: 4.8,
    communication_average: 5.0,
    safety_compliance_average: 5.0,
  };

  return (
    <div className="space-y-6">
      {/* 01. Panoramic Hero Cover Banner + LinkedIn Overlapping Profile Card */}
      <OperatorHeroHeader operator={operator} />

      {/* 02. Navigation Tabs Bar */}
      <div className="flex border-b border-border bg-surface px-2 rounded-lg text-sm font-medium overflow-x-auto shadow-sm">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 py-3.5 px-4 border-b-2 transition whitespace-nowrap ${
            activeTab === "overview"
              ? "border-[#2A57B8] text-[#2A57B8] font-bold"
              : "border-transparent text-text-muted hover:text-text"
          }`}
        >
          <span>📋</span>
          <span>Visão Geral & Frota</span>
        </button>
        <button
          onClick={() => setActiveTab("services")}
          className={`flex items-center gap-2 py-3.5 px-4 border-b-2 transition whitespace-nowrap ${
            activeTab === "services"
              ? "border-[#2A57B8] text-[#2A57B8] font-bold"
              : "border-transparent text-text-muted hover:text-text"
          }`}
        >
          <span>📑</span>
          <span>Serviços & Preços</span>
        </button>
        <button
          onClick={() => setActiveTab("portfolio")}
          className={`flex items-center gap-2 py-3.5 px-4 border-b-2 transition whitespace-nowrap ${
            activeTab === "portfolio"
              ? "border-[#2A57B8] text-[#2A57B8] font-bold"
              : "border-transparent text-text-muted hover:text-text"
          }`}
        >
          <span>🖼️</span>
          <span>Portfólio & Galeria ({portfolioItems.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={`flex items-center gap-2 py-3.5 px-4 border-b-2 transition whitespace-nowrap ${
            activeTab === "reviews"
              ? "border-[#2A57B8] text-[#2A57B8] font-bold"
              : "border-transparent text-text-muted hover:text-text"
          }`}
        >
          <span>⭐</span>
          <span>Avaliações 360° ({reviewsList.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("calculator")}
          className={`flex items-center gap-2 py-3.5 px-4 border-b-2 transition whitespace-nowrap ${
            activeTab === "calculator"
              ? "border-[#2A57B8] text-[#2A57B8] font-bold"
              : "border-transparent text-text-muted hover:text-text"
          }`}
        >
          <span>⚡</span>
          <span>Calculadora Rápida</span>
        </button>
      </div>

      {/* TAB CONTENT: Overview (2 Columns matching reference image) */}
      {activeTab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Column 1: Homologated Fleet & Sensors */}
          <div className="lg:col-span-6 rounded-xl border border-border bg-surface p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-border/70 pb-3">
              <span className="text-lg">🛸</span>
              <h2 className="text-base font-bold text-text">Aeronaves & Sensores Homologados</h2>
            </div>

            {(!operator.drones || operator.drones.length === 0) ? (
              <p className="text-xs text-text-muted py-4">
                Frota de drones profissionais com registro SISANT/ANAC ativo e seguro RETA.
              </p>
            ) : (
              <div className="space-y-3">
                {operator.drones.map((d, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-border/70 bg-surface-soft p-3.5 transition hover:border-[#2A57B8]/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white border border-border text-lg shadow-2xs">
                        {d.manufacturer === "DJI" ? "🛸" : "🛩️"}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text">
                          {d.manufacturer} {d.model}
                        </p>
                        <p className="text-[11px] text-text-muted">
                          {d.model.includes("L2")
                            ? "LiDAR | Fotogrametria | RGB"
                            : d.model.includes("Wingtra")
                            ? "Mapeamento de grandes áreas | PPK"
                            : "Sensor RGB 48MP | RTK Integrado"}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                      Homologado
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Crew & ANAC Compliance */}
          <div className="lg:col-span-6 rounded-xl border border-border bg-surface p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-border/70 pb-3">
              <span className="text-lg">🛡️</span>
              <h2 className="text-base font-bold text-text">Tripulação & Compliance ANAC</h2>
            </div>

            <div className="space-y-3.5 text-xs text-text">
              <div className="flex items-center justify-between rounded-lg border border-border/70 bg-surface-soft p-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-base">📋</span>
                  <span className="font-medium text-text">Registro ANAC (SISANT)</span>
                </div>
                <span className="font-bold text-emerald-700 font-mono flex items-center gap-1">
                  {operator.anac_sisant_status || "Regular"} ✓
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border/70 bg-surface-soft p-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🌐</span>
                  <span className="font-medium text-text">Seguro Obrigatório (RETA)</span>
                </div>
                <span className="font-bold text-emerald-700 font-mono flex items-center gap-1">
                  {operator.reta_insurance_status || "Ativo"} ✓
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border/70 bg-surface-soft p-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🧑‍✈️</span>
                  <span className="font-medium text-text">Pilotos Habilitados (CANAC)</span>
                </div>
                <span className="font-bold text-text">
                  {operator.canac_pilots_count || operator.pilots?.length || 2} Pilotos
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border/70 bg-surface-soft p-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-base">📖</span>
                  <span className="font-medium text-text">Manual de Operações (MOP)</span>
                </div>
                <span className="font-bold text-emerald-700 font-mono flex items-center gap-1">
                  {operator.mop_status || "Conforme"} ✓
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Services */}
      {activeTab === "services" && (
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border/70 pb-3">
            <div>
              <h2 className="text-base font-bold text-text">Catálogo de Serviços Especializados</h2>
              <p className="text-xs text-text-muted mt-0.5">Valores de referência para orçamentos e missões sob demanda</p>
            </div>
          </div>

          {(!operator.services || operator.services.length === 0) ? (
            <p className="text-xs text-text-muted py-4">Consulte os serviços disponíveis diretamente na cotação.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {operator.services.map((s) => (
                <div key={s.id} className="rounded-lg border border-border p-4 space-y-2.5 bg-surface-soft transition hover:border-[#2A57B8]/40 shadow-2xs">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-text text-sm">{s.title}</h3>
                    <span className="text-xs font-bold text-[#2A57B8] font-mono shrink-0">
                      {s.price_from ? `R$ ${s.price_from}` : "Sob consulta"}
                    </span>
                  </div>
                  {s.description && (
                    <p className="text-xs text-text-muted leading-relaxed">{s.description}</p>
                  )}
                  <div className="pt-2 border-t border-border/60 flex justify-end">
                    <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">
                      {s.pricing_model === "per_hectare" ? "Por Hectare" : "Por Missão"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Portfolio */}
      {activeTab === "portfolio" && (
        <PortfolioGallery items={portfolioItems} />
      )}

      {/* TAB CONTENT: Reviews 360 */}
      {activeTab === "reviews" && (
        <ReviewsBreakdown reviews={reviewsList} metrics={reviewMetrics} />
      )}

      {/* TAB CONTENT: Calculator / Data Intent */}
      {activeTab === "calculator" && (
        <DataIntentWizard
          operatorSlug={operator.slug}
          operatorName={operator.name}
          config={operator.data_intent_config}
        />
      )}
    </div>
  );
}
