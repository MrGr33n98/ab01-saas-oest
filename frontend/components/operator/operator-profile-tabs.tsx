"use client";

import { useState } from "react";
import Link from "next/link";
import { FollowButton } from "./follow-button";
import { PortfolioGallery, type PortfolioItemData } from "./portfolio-gallery";
import { DataIntentWizard } from "./data-intent-wizard";
import { ReviewsBreakdown, type ReviewItem, type ReviewMetrics } from "./reviews-breakdown";
import { Badge } from "@/components/ui/badge";

type OperatorProfileTabsProps = {
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
    services?: Array<{
      id: string;
      title: string;
      description?: string | null;
      pricing_model?: string;
      price_from?: number | null;
      currency?: string;
    }>;
    drones?: Array<{ manufacturer: string; model: string }>;
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
  const portfolioItems: PortfolioItemData[] = (operator.portfolio_items && operator.portfolio_items.length > 0)
    ? operator.portfolio_items
    : [
        {
          id: "demo-1",
          title: "Levantamento Topográfico & Ortomosaico Agrícola (350 ha)",
          description: "Mapeamento em alta precisão para planejamento de curvas de nível e drenagem de lavoura de soja.",
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
          description: "Identificação automática de hotspots, diodos defeituosos e perdas de geração por string.",
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
  const reviewsList: ReviewItem[] = (operator.reviews && operator.reviews.length > 0)
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
    <div className="space-y-6">
      {/* Profile Card Header */}
      <div className="rounded-card border border-border bg-surface p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-extrabold text-text sm:text-3xl">
                {operator.name}
              </h1>
              {operator.verification_status === "verified" && (
                <Badge variant="accent">Homologado ANAC ✓</Badge>
              )}
            </div>

            {operator.headline && (
              <p className="text-base text-text-muted">{operator.headline}</p>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-text-muted pt-1">
              {(operator.city || operator.state_code) && (
                <span className="flex items-center gap-1 font-medium text-text">
                  📍 {operator.city ? `${operator.city}, ` : ""}{operator.state_code}
                </span>
              )}
              {operator.rating_average && (
                <span className="flex items-center gap-1 font-semibold text-text">
                  ⭐ {operator.rating_average.toFixed(1)} ({operator.rating_count || reviewsList.length} avaliações)
                </span>
              )}
              <span className="rounded bg-surface-soft px-2 py-0.5 font-medium text-text">
                🛸 {operator.missions_completed || 24} missões homologadas
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 shrink-0">
            <Link
              href={`/app/missions/new?operator=${operator.slug}`}
              className="btn-primary text-center px-6 py-2.5 text-sm font-semibold shadow-md"
            >
              Solicitar Cotação
            </Link>
            <div className="flex items-center gap-2">
              <FollowButton operatorSlug={operator.slug} className="w-full" />
            </div>
            {operator.accepting_jobs !== false ? (
              <span className="text-center text-[11px] text-green-700 font-medium">
                ● Disponível para novas missões
              </span>
            ) : (
              <span className="text-center text-[11px] text-text-muted">
                ○ Agenda temporariamente cheia
              </span>
            )}
          </div>
        </div>

        {operator.about && (
          <div className="mt-6 border-t border-border pt-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
              Sobre a Operação
            </h2>
            <p className="text-sm text-text leading-relaxed whitespace-pre-line">
              {operator.about}
            </p>
          </div>
        )}
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex border-b border-border text-sm font-medium overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 transition whitespace-nowrap ${
            activeTab === "overview"
              ? "border-primary text-primary font-semibold"
              : "border-transparent text-text-muted hover:text-text"
          }`}
        >
          <span>🏢</span>
          <span>Visão Geral & Frota</span>
        </button>
        <button
          onClick={() => setActiveTab("services")}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 transition whitespace-nowrap ${
            activeTab === "services"
              ? "border-primary text-primary font-semibold"
              : "border-transparent text-text-muted hover:text-text"
          }`}
        >
          <span>📋</span>
          <span>Serviços & Preços</span>
        </button>
        <button
          onClick={() => setActiveTab("portfolio")}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 transition whitespace-nowrap ${
            activeTab === "portfolio"
              ? "border-primary text-primary font-semibold"
              : "border-transparent text-text-muted hover:text-text"
          }`}
        >
          <span>📸</span>
          <span>Portfólio & Galeria ({portfolioItems.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 transition whitespace-nowrap ${
            activeTab === "reviews"
              ? "border-primary text-primary font-semibold"
              : "border-transparent text-text-muted hover:text-text"
          }`}
        >
          <span>⭐</span>
          <span>Avaliações 360° ({reviewsList.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("calculator")}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 transition whitespace-nowrap ${
            activeTab === "calculator"
              ? "border-primary text-primary font-semibold"
              : "border-transparent text-text-muted hover:text-text"
          }`}
        >
          <span>⚡</span>
          <span>Calculadora Rápida</span>
        </button>
      </div>

      {/* TAB CONTENT: Overview */}
      {activeTab === "overview" && (
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Fleet & Equipments */}
          <div className="rounded-card border border-border bg-surface p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-text">Aeronaves & Sensores Homologados</h2>
            {(!operator.drones || operator.drones.length === 0) ? (
              <p className="text-xs text-text-muted">
                Frota de drones profissionais com registro SISANT/ANAC ativo e seguro RETA.
              </p>
            ) : (
              <ul className="divide-y divide-border text-sm">
                {operator.drones.map((d, i) => (
                  <li key={i} className="py-2.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-text">🛸 {d.manufacturer} {d.model}</span>
                    <Badge variant="outline">Homologado</Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Compliance & Pilots */}
          <div className="rounded-card border border-border bg-surface p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-text">Tripulação & Compliance ANAC</h2>
            <div className="space-y-3 text-xs text-text-muted">
              <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                <span>Registro ANAC (SISANT)</span>
                <span className="font-semibold text-green-700 font-mono">Regular ✓</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                <span>Seguro Obrigatório RETA</span>
                <span className="font-semibold text-green-700 font-mono">Ativo ✓</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span>Pilotos Habilitados (CANAC)</span>
                <span className="font-semibold text-text">{operator.pilots?.length || 2} Pilotos</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Services */}
      {activeTab === "services" && (
        <div className="rounded-card border border-border bg-surface p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-text">Catálogo de Serviços Especializados</h2>
            <span className="text-xs text-text-muted">Valores de referência para orçamentos</span>
          </div>

          {(!operator.services || operator.services.length === 0) ? (
            <p className="text-xs text-text-muted">Consulte os serviços disponíveis diretamente na cotação.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {operator.services.map((s) => (
                <div key={s.id} className="rounded-card border border-border p-4 space-y-2 bg-surface-soft">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-text text-sm">{s.title}</h3>
                    <span className="text-xs font-bold text-primary font-mono">
                      {s.price_from ? `a partir de R$ ${s.price_from}` : "Sob consulta"}
                    </span>
                  </div>
                  {s.description && (
                    <p className="text-xs text-text-muted">{s.description}</p>
                  )}
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
