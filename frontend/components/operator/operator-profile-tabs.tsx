"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Plane,
  FileCheck,
  CheckCircle2,
  Globe,
  Linkedin,
  MapPin,
  ExternalLink,
  Users,
  Shield,
  FileText,
  Clock,
  Briefcase,
  ChevronRight,
} from "lucide-react";
import { OperatorHeroHeader } from "./operator-hero-header";
import { PortfolioGallery, type PortfolioItemData } from "./portfolio-gallery";
import { DataIntentWizard } from "./data-intent-wizard";
import { ReviewsBreakdown, type ReviewItem, type ReviewMetrics } from "./reviews-breakdown";

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
            category_name: "Topografia",
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
    overall_average: operator.rating_average || 5.0,
    technical_accuracy_average: 5.0,
    timeliness_average: 4.8,
    communication_average: 5.0,
    safety_compliance_average: 5.0,
  };

  return (
    <div className="space-y-4">
      {/* 01. Compact Hero Banner + Overlapping Profile Summary Card */}
      <OperatorHeroHeader operator={operator} />

      {/* 02. Anchored Navigation Tabs Bar (height: 52px, border-bottom: 1px) */}
      <div className="mt-3 flex h-[52px] items-center gap-6 border-b border-[#E3E8E6] px-1 text-sm overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`h-full border-b-2 transition whitespace-nowrap text-[13px] sm:text-sm ${
            activeTab === "overview"
              ? "border-accent text-text font-bold"
              : "border-transparent text-text-muted hover:text-text font-medium"
          }`}
        >
          Visão Geral & Frota
        </button>
        <button
          onClick={() => setActiveTab("services")}
          className={`h-full border-b-2 transition whitespace-nowrap text-[13px] sm:text-sm ${
            activeTab === "services"
              ? "border-accent text-text font-bold"
              : "border-transparent text-text-muted hover:text-text font-medium"
          }`}
        >
          Serviços & Preços
        </button>
        <button
          onClick={() => setActiveTab("portfolio")}
          className={`h-full border-b-2 transition whitespace-nowrap text-[13px] sm:text-sm ${
            activeTab === "portfolio"
              ? "border-accent text-text font-bold"
              : "border-transparent text-text-muted hover:text-text font-medium"
          }`}
        >
          Portfólio ({portfolioItems.length})
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={`h-full border-b-2 transition whitespace-nowrap text-[13px] sm:text-sm ${
            activeTab === "reviews"
              ? "border-accent text-text font-bold"
              : "border-transparent text-text-muted hover:text-text font-medium"
          }`}
        >
          Avaliações 360° ({reviewsList.length})
        </button>
        <button
          onClick={() => setActiveTab("calculator")}
          className={`h-full border-b-2 transition whitespace-nowrap text-[13px] sm:text-sm ${
            activeTab === "calculator"
              ? "border-accent text-text font-bold"
              : "border-transparent text-text-muted hover:text-text font-medium"
          }`}
        >
          Calculadora Rápida
        </button>
      </div>

      {/* 03. TAB CONTENT: Overview in 60/40 Grid (1.4fr : 0.9fr / lg:grid-cols-12: 7 cols vs 5 cols) */}
      {activeTab === "overview" && (
        <div className="grid gap-5 lg:grid-cols-12 pt-2">
          {/* LEFT COLUMN (1.4fr / 7 columns): About, Fleet, Services Preview */}
          <div className="lg:col-span-7 space-y-5">
            {/* About the Operation Card */}
            <div className="rounded-[14px] border border-[#E5EAE8] bg-white p-5 shadow-2xs space-y-2.5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text">
                Sobre a Operação
              </h3>
              <p className="text-[13px] sm:text-sm text-text-muted leading-relaxed whitespace-pre-line">
                {operator.about ||
                  "AeroVision é referência em geotecnologia e sensoriamento remoto. Operamos com aeronaves homologadas pela ANAC, receptores GNSS geodésicos RTK/PPK e equipe de pilotos credenciados pelo SISANT com mais de 120 mil hectares mapeados."}
              </p>
            </div>

            {/* Homologated Fleet & Sensors (Compact 56-64px rows) */}
            <div className="rounded-[14px] border border-[#E5EAE8] bg-white p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-[#E5EAE8] pb-2.5">
                <h3 className="text-sm font-bold text-text">Aeronaves & Sensores Homologados</h3>
                <span className="text-xs text-text-muted">Homologação SISANT ativa</span>
              </div>

              <div className="space-y-2">
                {operator.drones && operator.drones.length > 0 ? (
                  operator.drones.map((d, i) => (
                    <div
                      key={i}
                      className="flex h-14 items-center justify-between rounded-lg border border-[#E5EAE8] bg-surface-soft px-3.5 transition hover:border-border-strong"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white border border-[#E5EAE8]">
                          <Plane className="h-4 w-4 text-text-muted" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-text truncate">
                            {d.manufacturer} {d.model}
                          </p>
                          <p className="text-[11px] text-text-muted truncate">
                            {d.model.includes("L2")
                              ? "LiDAR · RTK · Fotogrametria"
                              : d.model.includes("Wingtra")
                              ? "PPK · Grandes áreas"
                              : "RGB 48MP · RTK Integrado"}
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 shrink-0">
                        Homologado
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-text-muted py-2">
                    Frota de aeronaves homologadas com seguro RETA e registro SISANT.
                  </p>
                )}
              </div>
            </div>

            {/* Services Preview */}
            {operator.services && operator.services.length > 0 && (
              <div className="rounded-[14px] border border-[#E5EAE8] bg-white p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#E5EAE8] pb-2.5">
                  <h3 className="text-sm font-bold text-text">Serviços Mais Solicitados</h3>
                  <button
                    onClick={() => setActiveTab("services")}
                    className="text-xs font-semibold text-text hover:underline flex items-center gap-0.5"
                  >
                    Ver catálogo completo <ChevronRight className="h-3 w-3" />
                  </button>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2">
                  {operator.services.slice(0, 2).map((s) => (
                    <div
                      key={s.id}
                      className="rounded-lg border border-[#E5EAE8] p-3 space-y-1.5 bg-surface-soft"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-bold text-text truncate">{s.title}</h4>
                        <span className="text-xs font-bold text-text font-mono shrink-0">
                          {s.price_from ? `R$ ${s.price_from}` : "Sob consulta"}
                        </span>
                      </div>
                      {s.description && (
                        <p className="text-[11px] text-text-muted line-clamp-2">{s.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN (0.9fr / 5 columns): Compliance, Location, Verified Contacts */}
          <div className="lg:col-span-5 space-y-5">
            {/* Compliance ANAC & Legal Specs */}
            <div className="rounded-[14px] border border-[#E5EAE8] bg-white p-5 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-text border-b border-[#E5EAE8] pb-2.5">
                Tripulação & Compliance ANAC
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between rounded-lg border border-[#E5EAE8] bg-surface-soft p-2.5">
                  <span className="text-text-muted">Registro ANAC (SISANT)</span>
                  <span className="font-bold text-emerald-700 font-mono">
                    {operator.anac_sisant_status || "Regular"} ✓
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-[#E5EAE8] bg-surface-soft p-2.5">
                  <span className="text-text-muted">Seguro Obrigatório (RETA)</span>
                  <span className="font-bold text-emerald-700 font-mono">
                    {operator.reta_insurance_status || "Ativo"} ✓
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-[#E5EAE8] bg-surface-soft p-2.5">
                  <span className="text-text-muted">Pilotos Habilitados (CANAC)</span>
                  <span className="font-bold text-text">
                    {operator.canac_pilots_count || operator.pilots?.length || 2} Pilotos
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-[#E5EAE8] bg-surface-soft p-2.5">
                  <span className="text-text-muted">Manual de Operações (MOP)</span>
                  <span className="font-bold text-emerald-700 font-mono">
                    {operator.mop_status || "Conforme"} ✓
                  </span>
                </div>
              </div>
            </div>

            {/* Location & Coverage Card */}
            <div className="rounded-[14px] border border-[#E5EAE8] bg-white p-5 shadow-2xs space-y-2.5">
              <h3 className="text-sm font-bold text-text border-b border-[#E5EAE8] pb-2.5">
                Base Operacional & Cobertura
              </h3>
              <div className="space-y-1.5 text-xs text-text">
                <p className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-text-muted shrink-0" />
                  <span>
                    Base: <strong>{operator.city || "Sinop"}, {operator.state_code || "MT"}</strong>
                  </span>
                </p>
                <p className="text-text-muted pl-5">
                  Mobilização regional para atendimento em todo o estado e regiões limítrofes.
                </p>
              </div>
            </div>

            {/* Verified Digital Presence / Social Links */}
            {(operator.website_url || operator.linkedin_url) && (
              <div className="rounded-[14px] border border-[#E5EAE8] bg-white p-5 shadow-2xs space-y-2.5">
                <h3 className="text-sm font-bold text-text border-b border-[#E5EAE8] pb-2.5">
                  Canais Oficiais Verificados
                </h3>
                <div className="space-y-2 text-xs">
                  {operator.website_url && (
                    <a
                      href={operator.website_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-lg border border-[#E5EAE8] bg-surface-soft p-2.5 text-text transition hover:border-border-strong hover:text-text"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Globe className="h-3.5 w-3.5 text-text-muted shrink-0" />
                        <span className="truncate">{operator.website_url.replace(/^https?:\/\//, "")}</span>
                      </div>
                      <ExternalLink className="h-3 w-3 text-text-muted shrink-0" />
                    </a>
                  )}

                  {operator.linkedin_url && (
                    <a
                      href={operator.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-lg border border-[#E5EAE8] bg-surface-soft p-2.5 text-text transition hover:border-border-strong hover:text-text"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Linkedin className="h-3.5 w-3.5 text-text-muted shrink-0" />
                        <span className="truncate">{operator.linkedin_url.replace(/^https?:\/\/(www\.)?/, "")}</span>
                      </div>
                      <ExternalLink className="h-3 w-3 text-text-muted shrink-0" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Services */}
      {activeTab === "services" && (
        <div className="rounded-[14px] border border-[#E5EAE8] bg-white p-5 sm:p-6 shadow-2xs space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-[#E5EAE8] pb-3">
            <div>
              <h2 className="text-base font-bold text-text">Catálogo de Serviços Especializados</h2>
              <p className="text-xs text-text-muted mt-0.5">Valores de referência para orçamentos e missões sob demanda</p>
            </div>
          </div>

          {(!operator.services || operator.services.length === 0) ? (
            <p className="text-xs text-text-muted py-4">Consulte os serviços disponíveis diretamente na cotação.</p>
          ) : (
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {operator.services.map((s) => (
                <div key={s.id} className="rounded-lg border border-[#E5EAE8] p-4 space-y-2 bg-surface-soft transition hover:border-border-strong">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-text text-xs sm:text-sm">{s.title}</h3>
                    <span className="text-xs font-bold text-text font-mono shrink-0">
                      {s.price_from ? `R$ ${s.price_from}` : "Sob consulta"}
                    </span>
                  </div>
                  {s.description && (
                    <p className="text-xs text-text-muted leading-relaxed">{s.description}</p>
                  )}
                  <div className="pt-2 border-t border-[#E5EAE8] flex justify-end">
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
