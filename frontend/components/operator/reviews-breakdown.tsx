"use client";

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
  const overallAvg = metrics?.overall_average || (reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.overall_rating, 0) / reviews.length) : null);

  if (reviews.length === 0) {
    return (
      <div className="rounded-card border border-border bg-surface p-8 text-center text-text-muted">
        <span className="text-3xl block mb-2">⭐</span>
        <p className="text-sm font-medium">Nenhuma avaliação registrada ainda.</p>
        <p className="text-xs mt-1">As avaliações entram automaticamente após a conclusão e homologação de missões.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Summary Card */}
      <div className="rounded-card border border-border bg-surface p-6 shadow-sm">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5 items-center">
          {/* Main Rating */}
          <div className="text-center sm:border-r border-border sm:pr-6 lg:col-span-2">
            <div className="text-4xl font-extrabold text-text">
              {overallAvg ? overallAvg.toFixed(1) : "—"}
            </div>
            <div className="flex justify-center text-amber-500 text-lg my-1">
              {"★".repeat(Math.round(overallAvg || 5))}
              {"☆".repeat(5 - Math.round(overallAvg || 5))}
            </div>
            <p className="text-xs text-text-muted">
              Baseado em {metrics?.total_count || reviews.length} missões homologadas
            </p>
          </div>

          {/* Sub-Criteria Radar Bars */}
          <div className="space-y-2.5 lg:col-span-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-text-muted">🎯 Acurácia Técnica & GSD</span>
              <span className="font-semibold text-text">{metrics?.technical_accuracy_average?.toFixed(1) || "5.0"} / 5.0</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-surface-soft overflow-hidden">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${((metrics?.technical_accuracy_average || 5) / 5) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-text-muted">⏱️ Pontualidade de Entrega</span>
              <span className="font-semibold text-text">{metrics?.timeliness_average?.toFixed(1) || "4.9"} / 5.0</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-surface-soft overflow-hidden">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${((metrics?.timeliness_average || 4.9) / 5) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-text-muted">💬 Comunicação & Suporte</span>
              <span className="font-semibold text-text">{metrics?.communication_average?.toFixed(1) || "5.0"} / 5.0</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-surface-soft overflow-hidden">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${((metrics?.communication_average || 5) / 5) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-text-muted">🛡️ Segurança & Compliance ANAC</span>
              <span className="font-semibold text-text">{metrics?.safety_compliance_average?.toFixed(1) || "5.0"} / 5.0</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-surface-soft overflow-hidden">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${((metrics?.safety_compliance_average || 5) / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Individual Review Items */}
      <div className="space-y-4">
        {reviews.map((r) => (
          <div
            key={r.id}
            className="rounded-card border border-border bg-surface p-5 shadow-sm space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <div className="flex items-center gap-2">
                <span className="text-amber-500 font-bold text-sm">
                  {"★".repeat(r.overall_rating)}
                  {"☆".repeat(5 - r.overall_rating)}
                </span>
                <span className="font-semibold text-sm text-text">
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

            <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-text-muted border-t border-border/50">
              {r.customer_organization_name && (
                <span>🏢 {r.customer_organization_name}</span>
              )}
              {r.delivered_gsd_cm && (
                <span>🎯 GSD Entregue: {r.delivered_gsd_cm} cm/px</span>
              )}
              {r.verified && (
                <span className="text-green-600 font-medium">✓ Missão Auditada & Verificada</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
