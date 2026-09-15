"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { apiFetch, type ApiError } from "@/lib/api/client";
import { PayOrderButton } from "@/components/mission/pay-order-button";

// ── types ──────────────────────────────────────────────────────────────────
type Product = {
  data_product_id: string;
  quantity: number;
  name?: string;
  slug?: string;
};
type Order = {
  id: string;
  status: string;
  payment_status?: string | null;
  total?: number | null;
  currency?: string;
};
type Operator = {
  slug?: string;
  name?: string;
  verified?: boolean;
  headline?: string;
};
type Deliverable = {
  id: string;
  title?: string;
  status: string;
  version?: number;
  data_product_id?: string;
  rejection_reason?: string | null;
  download_ready?: boolean;
};
type TimelineEvent = {
  from_status?: string | null;
  to_status: string;
  note?: string | null;
  created_at: string;
};
type NextAction = {
  key: string;
  label: string;
  href?: string | null;
};
type Workspace = {
  id: string;
  title: string;
  description?: string;
  status: string;
  mission_type?: string;
  area_hectares?: number | null;
  deadline_at?: string | null;
  currency?: string;
  estimated_budget_min?: number | null;
  estimated_budget_max?: number | null;
  products: Product[];
  next_action?: NextAction | null;
  order?: Order | null;
  operator?: Operator | null;
  deliverables: Deliverable[];
  timeline: TimelineEvent[];
  quotes_summary?: { open_count: number };
};

// ── helpers ────────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  draft: "bg-surface-soft text-text-muted border-border",
  planning: "bg-surface-soft text-text-muted border-border",
  published: "bg-blue-50 text-blue-700 border-blue-200",
  quoting: "bg-blue-50 text-blue-700 border-blue-200",
  operator_selected: "bg-yellow-50 text-yellow-700 border-yellow-200",
  scheduled: "bg-purple-50 text-purple-700 border-purple-200",
  in_progress: "bg-orange-50 text-orange-700 border-orange-200",
  processing: "bg-orange-50 text-orange-700 border-orange-200",
  review: "bg-yellow-50 text-yellow-800 border-yellow-300",
  completed: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Rascunho",
  planning: "Planejamento",
  published: "Publicada",
  quoting: "Recebendo propostas",
  operator_selected: "Operador selecionado",
  scheduled: "Agendada",
  in_progress: "Em execução",
  processing: "Processando",
  review: "Em revisão",
  completed: "Concluída",
  cancelled: "Cancelada",
};

const DELIVERABLE_STATUS: Record<string, string> = {
  draft: "Rascunho",
  uploaded: "Enviado",
  processing: "Processando",
  available: "Disponível",
  in_review: "Em revisão",
  approved: "Aprovado ✓",
  rejected: "Rejeitado ✗",
  published: "Publicado",
};

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_COLORS[status] ?? "bg-surface-soft text-text-muted border-border";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

// ── tab components ─────────────────────────────────────────────────────────
function OverviewTab({ ws }: { ws: Workspace }) {
  return (
    <div className="space-y-6">
      {/* Next action card */}
      {ws.next_action && (
        <div className="rounded-card border border-accent/30 bg-accent/5 p-4">
          <p className="text-[13px] font-medium text-accent-ink uppercase tracking-wide">Próxima ação</p>
          <p className="mt-1 text-[15px] font-semibold text-text">{ws.next_action.label}</p>
          {ws.next_action.href && (
            <Link href={ws.next_action.href} className="mt-2 inline-block text-[13px] font-medium text-accent-ink underline underline-offset-2">
              Ir agora →
            </Link>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <InfoCard label="Tipo" value={ws.mission_type ?? "—"} />
        <InfoCard label="Área" value={ws.area_hectares ? `${ws.area_hectares.toFixed(1)} ha` : "—"} />
        <InfoCard label="Prazo" value={ws.deadline_at ? new Date(ws.deadline_at).toLocaleDateString("pt-BR") : "—"} />
        {ws.estimated_budget_min && (
          <InfoCard
            label="Orçamento estimado"
            value={`${ws.currency ?? "BRL"} ${ws.estimated_budget_min.toLocaleString("pt-BR")}–${ws.estimated_budget_max?.toLocaleString("pt-BR") ?? "?"}`}
          />
        )}
      </div>

      {/* Products */}
      {ws.products.length > 0 && (
        <div>
          <h3 className="mb-3 text-[13px] font-medium text-text-muted">Produtos solicitados</h3>
          <div className="flex flex-wrap gap-2">
            {ws.products.map((p, i) => (
              <span key={i} className="rounded-full border border-border bg-surface-soft px-3 py-1 text-[13px] text-text">
                {p.name ?? p.slug ?? p.data_product_id}
                {p.quantity > 1 && <span className="ml-1 text-text-muted">×{p.quantity}</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Operator */}
      {ws.operator && (
        <div className="rounded-card border border-border bg-surface p-4">
          <p className="text-[13px] font-medium text-text-muted">Operador selecionado</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-surface-soft border border-border" />
            <div>
              <p className="text-[15px] font-semibold text-text">
                {ws.operator.name ?? ws.operator.slug}
                {ws.operator.verified && (
                  <span className="ml-2 text-[11px] font-medium text-success">✓ verificado</span>
                )}
              </p>
              {ws.operator.headline && <p className="text-[13px] text-text-muted">{ws.operator.headline}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Payment */}
      {ws.order && (
        <div className="rounded-card border border-border bg-surface p-4">
          <p className="text-[13px] font-medium text-text-muted">Pedido #{ws.order.id.slice(0, 8)}</p>
          <div className="mt-2 flex items-center justify-between gap-4">
            <div>
              <p className="text-[15px] font-semibold text-text">
                {ws.order.currency ?? "BRL"} {ws.order.total?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) ?? "—"}
              </p>
              <StatusBadge status={ws.order.payment_status ?? ws.order.status} />
            </div>
            <PayOrderButton orderId={ws.order.id} paymentStatus={ws.order.payment_status} />
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <p className="text-[12px] font-medium text-text-muted uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-[15px] font-semibold text-text">{value}</p>
    </div>
  );
}

function QuotesTab({ missionId }: { missionId: string }) {
  const [data, setData] = useState<{
    mission: { id: string; title: string; status: string };
    quotes: Array<{
      id: string;
      status: string;
      total?: number;
      currency?: string;
      proposal_text?: string;
      estimated_delivery_at?: string;
      acceptible?: boolean;
      lock_version?: number;
      operator: {
        organization_name?: string;
        headline?: string;
        verified?: boolean;
        rating_average?: number;
        rating_count?: number;
        missions_completed?: number;
      };
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ data: typeof data }>(`/missions/${missionId}/quote-comparison`)
      .then((r) => setData(r.data))
      .catch(() => setError("Não foi possível carregar as propostas"))
      .finally(() => setLoading(false));
  }, [missionId]);

  async function acceptQuote(quoteId: string, lockVersion?: number) {
    setAccepting(quoteId);
    setError(null);
    try {
      await apiFetch(`/quotes/${quoteId}/accept`, {
        method: "POST",
        idempotencyKey: `accept-${quoteId}`,
        body: JSON.stringify({ lock_version: lockVersion }),
      });
      window.location.reload();
    } catch (e) {
      const err = e as ApiError;
      setError(err.detail ?? err.title ?? "Erro ao aceitar proposta");
      setAccepting(null);
    }
  }

  if (loading) return <div className="h-48 animate-pulse rounded-card bg-border/20" />;
  if (error) return <p className="text-danger text-sm">{error}</p>;
  if (!data || data.quotes.length === 0) {
    return (
      <div className="rounded-card border border-border bg-surface py-16 text-center">
        <p className="text-[15px] font-medium text-text">Nenhuma proposta recebida ainda</p>
        <p className="mt-1 text-[13px] text-text-muted">
          Os operadores elegíveis foram notificados e enviarão propostas em breve.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-danger text-sm">{error}</p>}
      {data.quotes.map((q) => (
        <div key={q.id} className="rounded-card border border-border bg-surface p-5 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[15px] font-semibold text-text">
                {q.operator.organization_name ?? "Operador"}
                {q.operator.verified && (
                  <span className="ml-2 text-[11px] text-success">✓ verificado</span>
                )}
              </p>
              {q.operator.headline && (
                <p className="text-[13px] text-text-muted">{q.operator.headline}</p>
              )}
              {q.operator.rating_average != null && (
                <p className="text-[12px] text-text-muted">
                  ★ {q.operator.rating_average.toFixed(1)} ({q.operator.rating_count} avaliações) · {q.operator.missions_completed} missões
                </p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-[20px] font-bold text-text">
                {q.currency ?? "BRL"} {q.total?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) ?? "—"}
              </p>
              <StatusBadge status={q.status} />
            </div>
          </div>

          {q.proposal_text && (
            <p className="text-[14px] text-text-muted border-l-2 border-border pl-3">{q.proposal_text}</p>
          )}

          {q.estimated_delivery_at && (
            <p className="text-[13px] text-text-muted">
              Entrega estimada: {new Date(q.estimated_delivery_at).toLocaleDateString("pt-BR")}
            </p>
          )}

          {q.acceptible && (
            <button
              onClick={() => acceptQuote(q.id, q.lock_version)}
              disabled={accepting === q.id}
              className="btn btn-primary w-full sm:w-auto"
            >
              {accepting === q.id ? "Aceitando…" : "Aceitar esta proposta"}
            </button>
          )}

          {q.status === "accepted" && (
            <p className="text-[13px] font-medium text-success">✓ Proposta aceita</p>
          )}
        </div>
      ))}
    </div>
  );
}

function DeliverablesTab({ missionId }: { missionId: string }) {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectionModal, setRejectionModal] = useState<{ id: string; title?: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ data: Deliverable[] }>(`/missions/${missionId}/deliverables`)
      .then((r) => setDeliverables(r.data))
      .catch(() => setError("Erro ao carregar entregas"))
      .finally(() => setLoading(false));
  }, [missionId]);

  async function approve(id: string) {
    setProcessing(id);
    try {
      await apiFetch(`/deliverables/${id}/approve`, { method: "POST", body: "{}" });
      setDeliverables((prev) => prev.map((d) => (d.id === id ? { ...d, status: "approved" } : d)));
    } catch (e) {
      const err = e as ApiError;
      setError(err.detail ?? "Erro ao aprovar entrega");
    } finally {
      setProcessing(null);
    }
  }

  async function reject(id: string, reason: string) {
    setProcessing(id);
    try {
      await apiFetch(`/deliverables/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
      setDeliverables((prev) => prev.map((d) => (d.id === id ? { ...d, status: "rejected", rejection_reason: reason } : d)));
      setRejectionModal(null);
      setRejectionReason("");
    } catch (e) {
      const err = e as ApiError;
      setError(err.detail ?? "Erro ao rejeitar entrega");
    } finally {
      setProcessing(null);
    }
  }

  if (loading) return <div className="h-48 animate-pulse rounded-card bg-border/20" />;
  if (error) return <p className="text-danger text-sm">{error}</p>;

  if (deliverables.length === 0) {
    return (
      <div className="rounded-card border border-border bg-surface py-16 text-center">
        <p className="text-[15px] font-medium text-text">Nenhuma entrega ainda</p>
        <p className="mt-1 text-[13px] text-text-muted">
          O operador enviará os arquivos de entrega quando a missão estiver concluída.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {deliverables.map((d) => {
        const canReview = d.status === "in_review" || d.status === "available";
        return (
          <div key={d.id} className="rounded-card border border-border bg-surface p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[15px] font-semibold text-text">{d.title ?? `Entrega v${d.version ?? 1}`}</p>
                <p className="text-[13px] text-text-muted mt-0.5">
                  Status: <span className="font-medium">{DELIVERABLE_STATUS[d.status] ?? d.status}</span>
                </p>
                {d.rejection_reason && (
                  <p className="mt-1 text-[13px] text-danger border-l-2 border-danger pl-2">{d.rejection_reason}</p>
                )}
              </div>
              {d.download_ready && (
                <button
                  onClick={() =>
                    apiFetch<{ data: { url: string } }>(`/deliverables/${d.id}/download_url`)
                      .then((r) => window.open(r.data.url, "_blank"))
                      .catch(() => setError("Erro ao gerar URL de download"))
                  }
                  className="btn btn-secondary text-[13px] px-3 py-1.5"
                >
                  ↓ Download
                </button>
              )}
            </div>

            {canReview && (
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => approve(d.id)}
                  disabled={processing === d.id}
                  className="btn btn-primary flex-1 sm:flex-none"
                >
                  {processing === d.id ? "Aprovando…" : "✓ Aprovar entrega"}
                </button>
                <button
                  onClick={() => setRejectionModal({ id: d.id, title: d.title })}
                  className="btn btn-secondary flex-1 sm:flex-none"
                >
                  Solicitar revisão
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Rejection modal */}
      {rejectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-card border border-border bg-surface p-6 shadow-xl">
            <h2 className="text-[16px] font-semibold text-text">Solicitar revisão</h2>
            <p className="mt-1 text-[13px] text-text-muted">
              Descreva o que precisa ser corrigido nesta entrega.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              placeholder="Ex: O ortomosaico está com falhas na extremidade norte. Por favor refaça o voo da área 3."
              className="input mt-4 resize-none"
            />
            <div className="mt-4 flex gap-3 justify-end">
              <button
                onClick={() => { setRejectionModal(null); setRejectionReason(""); }}
                className="btn btn-ghost"
              >
                Cancelar
              </button>
              <button
                onClick={() => reject(rejectionModal.id, rejectionReason)}
                disabled={!rejectionReason.trim() || processing === rejectionModal.id}
                className="btn btn-primary"
              >
                {processing === rejectionModal.id ? "Enviando…" : "Solicitar revisão"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TimelineTab({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return <p className="text-[14px] text-text-muted">Nenhum evento registrado ainda.</p>;
  }
  return (
    <ol className="relative border-l border-border ml-3 space-y-6">
      {events.map((e, i) => (
        <li key={i} className="ml-4">
          <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-border bg-surface" />
          <p className="text-[13px] text-text-muted">
            {new Date(e.created_at).toLocaleString("pt-BR")}
          </p>
          <p className="mt-0.5 text-[14px] font-medium text-text">
            {e.from_status && <span className="text-text-muted">{STATUS_LABELS[e.from_status] ?? e.from_status} → </span>}
            {STATUS_LABELS[e.to_status] ?? e.to_status}
          </p>
          {e.note && <p className="text-[13px] text-text-muted mt-0.5">{e.note}</p>}
        </li>
      ))}
    </ol>
  );
}

// ── main page ──────────────────────────────────────────────────────────────
const TABS = ["overview", "quotes", "deliverables", "timeline"] as const;
type Tab = (typeof TABS)[number];

const TAB_LABELS: Record<Tab, string> = {
  overview: "Visão geral",
  quotes: "Propostas",
  deliverables: "Entregas",
  timeline: "Timeline",
};

export default function MissionWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [ws, setWs] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  useEffect(() => {
    apiFetch<{ data: Workspace }>(`/missions/${id}`)
      .then((r) => setWs(r.data))
      .catch((e: ApiError) => setError(e.detail ?? e.title ?? "Missão não encontrada"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 animate-pulse">
        <div className="h-8 w-48 rounded bg-border/30" />
        <div className="h-48 rounded-card bg-border/20" />
      </div>
    );
  }

  if (error || !ws) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="rounded-card border border-danger/30 bg-danger/5 p-6 text-center">
          <p className="text-[15px] font-medium text-danger">{error ?? "Missão não encontrada"}</p>
          <Link href="/app/missions" className="mt-3 inline-block text-[13px] text-text-muted hover:text-text">
            ← Voltar para missões
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[13px] text-text-muted mb-1">
            <Link href="/app/missions" className="hover:text-text">Missões</Link>
            <span>/</span>
            <span className="truncate">{ws.title}</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-text truncate">{ws.title}</h1>
          <div className="mt-2 flex items-center gap-2">
            <StatusBadge status={ws.status} />
            {ws.area_hectares && (
              <span className="text-[13px] text-text-muted">{ws.area_hectares.toFixed(1)} ha</span>
            )}
            {ws.quotes_summary?.open_count != null && ws.quotes_summary.open_count > 0 && (
              <span className="text-[13px] text-text-muted">
                · {ws.quotes_summary.open_count} proposta{ws.quotes_summary.open_count !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-[14px] font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? "border-accent-ink text-text"
                : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            {TAB_LABELS[tab]}
            {tab === "quotes" && ws.quotes_summary?.open_count != null && ws.quotes_summary.open_count > 0 && (
              <span className="ml-1.5 rounded-full bg-accent text-accent-ink text-[10px] font-bold px-1.5 py-0.5">
                {ws.quotes_summary.open_count}
              </span>
            )}
            {tab === "deliverables" && ws.deliverables.length > 0 && (
              <span className="ml-1.5 rounded-full bg-surface-soft text-text-muted text-[10px] font-bold px-1.5 py-0.5">
                {ws.deliverables.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "overview" && <OverviewTab ws={ws} />}
        {activeTab === "quotes" && <QuotesTab missionId={id} />}
        {activeTab === "deliverables" && <DeliverablesTab missionId={id} />}
        {activeTab === "timeline" && <TimelineTab events={ws.timeline} />}
      </div>
    </div>
  );
}
