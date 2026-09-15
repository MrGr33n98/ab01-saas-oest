"use client";

import { Star, CheckCircle, ShieldCheck, Building2, Target } from "lucide-react";

export type ReviewItem = {
  id: string;
  overall_rating: number;
  technical_accuracy_rating?: number;
  timeliness_rating?: number;
  communication_rating?: number;
  safety_compliance_rating?: number;
  delivered_gsd_cm?: number;
  title?: string;
  headline?: string;
  body?: string;
  verified?: boolean;
  published_at?: string;
  customer_organization_name?: string;
};

export type ReviewMetrics = {
  total_count: number;
  overall_average: number | null;
  technical_accuracy_average?: number | null;
  timeliness_average?: number | null;
  communication_average?: number | null;
  safety_compliance_average?: number | null;
};

export function ReviewsBreakdown({
  reviews = [],
  metrics,
}: {
  reviews: ReviewItem[];
  metrics?: ReviewMetrics;
}) {
  const overallAvg =
    metrics?.overall_average ||
    (reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.overall_rating, 0) / reviews.length
      : null);

  if (reviews.length === 0) {
    return (
      <div className="rounded-[14px] border border-[#E5EAE8] bg-white p-8 text-center text-text-muted">
        <Star className="h-8 w-8 text-text-muted mx-auto mb-2 opacity-40" />
        <p className="text-sm font-medium">Nenhuma avaliação registrada ainda.</p>
        <p className="text-xs mt-1">As avaliações entram automaticamente após a homologação das missões.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Metrics Summary Card */}
      <div className="rounded-[14px] border border-[#E5EAE8] bg-white p-5 sm:p-6 shadow-2xs">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5 items-center">
          {/* Main Rating */}
          <div className="text-center sm:border-r border-[#E5EAE8] sm:pr-6 lg:col-span-2">
            <div className="text-4xl font-extrabold text-text">
              {overallAvg ? overallAvg.toFixed(1) : "5.0"}
            </div>
            <div className="flex justify-center items-center gap-1 my-1.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-4 w-4 ${
                    s <= Math.round(overallAvg || 5)
                      ? "fill-amber-400 text-amber-500"
                      : "text-border-strong"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-text-muted">
              Baseado em {metrics?.total_count || reviews.length} missões homologadas
            </p>
          </div>

          {/* Sub-Criteria Radar Bars */}
          <div className="space-y-2.5 lg:col-span-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Acurácia Técnica & GSD</span>
              <span className="font-semibold text-text">
                {metrics?.technical_accuracy_average?.toFixed(1) || "5.0"} / 5.0
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-surface-soft overflow-hidden">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${((metrics?.technical_accuracy_average || 5) / 5) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-text-muted">Pontualidade de Entrega</span>
              <span className="font-semibold text-text">
                {metrics?.timeliness_average?.toFixed(1) || "4.9"} / 5.0
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-surface-soft overflow-hidden">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${((metrics?.timeliness_average || 4.9) / 5) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-text-muted">Comunicação & Atendimento</span>
              <span className="font-semibold text-text">
                {metrics?.communication_average?.toFixed(1) || "5.0"} / 5.0
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-surface-soft overflow-hidden">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${((metrics?.communication_average || 5) / 5) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-text-muted">Segurança & Compliance ANAC</span>
              <span className="font-semibold text-text">
                {metrics?.safety_compliance_average?.toFixed(1) || "5.0"} / 5.0
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-surface-soft overflow-hidden">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${((metrics?.safety_compliance_average || 5) / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Individual Review Items */}
      <div className="space-y-3">
        {reviews.map((r) => (
          <div
            key={r.id}
            className="rounded-[14px] border border-[#E5EAE8] bg-white p-4 sm:p-5 shadow-2xs space-y-2.5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-3.5 w-3.5 ${
                        s <= r.overall_rating
                          ? "fill-amber-400 text-amber-500"
                          : "text-border-strong"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-xs sm:text-sm text-text">
                  {r.headline || r.title || "Excelente Execução Técnica"}
                </span>
              </div>
              {r.published_at && (
                <span className="text-[11px] text-text-muted font-mono">
                  {new Date(r.published_at).toLocaleDateString("pt-BR")}
                </span>
              )}
            </div>

            {r.body && (
              <p className="text-xs text-text-muted leading-relaxed">
                {r.body}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-text-muted border-t border-[#E5EAE8]">
              {r.customer_organization_name && (
                <span className="flex items-center gap-1 font-medium text-text">
                  <Building2 className="h-3 w-3 text-text-muted" />
                  <span>{r.customer_organization_name}</span>
                </span>
              )}
              {r.delivered_gsd_cm && (
                <span className="flex items-center gap-1">
                  <Target className="h-3 w-3 text-text-muted" />
                  <span>GSD Entregue: {r.delivered_gsd_cm} cm/px</span>
                </span>
              )}
              {r.verified && (
                <span className="flex items-center gap-1 text-emerald-700 font-medium">
                  <CheckCircle className="h-3 w-3 text-emerald-600" />
                  <span>Missão Auditada & Verificada</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
