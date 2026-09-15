"use client";

import { useEffect, useState } from "react";
import { apiFetch, type ApiError } from "@/lib/api/client";

type Quote = {
  id: string;
  mission_id: string;
  status: string;
  total?: number | null;
  currency?: string;
  proposal_text?: string | null;
  lock_version?: number;
  operator_organization_id?: string;
  customer_organization_id?: string;
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-surface-soft text-text-muted border-border",
  submitted: "bg-blue-50 text-blue-700 border-blue-200",
  viewed: "bg-purple-50 text-purple-700 border-purple-200",
  negotiating: "bg-yellow-50 text-yellow-700 border-yellow-200",
  accepted: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  cancelled: "bg-surface-soft text-text-muted border-border",
  expired: "bg-surface-soft text-text-muted border-border",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Rascunho",
  submitted: "Enviada",
  viewed: "Visualizada",
  negotiating: "Em negociação",
  accepted: "Aceita ✓",
  rejected: "Recusada",
  cancelled: "Cancelada",
  expired: "Expirada",
};

export default function OperatorProposalsPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Using the operator quotes endpoint (my submitted quotes)
    apiFetch<{ data: Quote[] }>("/operator/proposals")
      .then((r) => setQuotes(r.data))
      .catch((e: ApiError) => setError(e.detail ?? "Erro ao carregar propostas"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl">
      <div>
        <h1 className="text-2xl font-semibold text-text">Propostas enviadas</h1>
        <p className="mt-1 text-[15px] text-text-muted">
          Acompanhe o status das suas propostas.
        </p>
      </div>

      <div className="mt-6">
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-card bg-border/20" />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-card border border-danger/30 bg-danger/5 p-4 text-center">
            <p className="text-[14px] text-danger">{error}</p>
          </div>
        )}

        {!loading && !error && quotes.length === 0 && (
          <div className="card py-16 text-center">
            <div className="text-3xl mb-4">📤</div>
            <p className="text-[15px] font-medium text-text">Nenhuma proposta enviada ainda</p>
            <p className="mt-2 text-[14px] text-text-muted">
              Acesse os jobs disponíveis e envie sua primeira proposta.
            </p>
            <a href="/operator/jobs" className="btn btn-primary mt-6 inline-block">Ver jobs</a>
          </div>
        )}

        {!loading && !error && quotes.length > 0 && (
          <div className="space-y-3">
            {quotes.map((q) => {
              const cls = STATUS_COLORS[q.status] ?? "bg-surface-soft text-text-muted border-border";
              return (
                <div key={q.id} className="card">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[14px] text-text-muted">Missão #{q.mission_id.slice(0, 8)}</p>
                      {q.total != null && (
                        <p className="mt-1 text-[17px] font-bold text-text">
                          {q.currency ?? "BRL"} {q.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                      )}
                      {q.proposal_text && (
                        <p className="mt-1 text-[13px] text-text-muted line-clamp-2">{q.proposal_text}</p>
                      )}
                    </div>
                    <span className={`shrink-0 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}>
                      {STATUS_LABELS[q.status] ?? q.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
