"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch, type ApiError } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type QuoteItem = {
  description: string;
  quantity?: number;
  unit?: string;
  unit_price?: number;
  total_price?: number;
};

type OperatorSummary = {
  profile_id?: string;
  slug?: string;
  headline?: string;
  verified?: boolean;
  rating_average?: number | null;
  rating_count?: number;
  missions_completed?: number;
  organization_name?: string;
  logo_url?: string | null;
};

type QuoteComparison = {
  id: string;
  status: string;
  subtotal?: number;
  platform_fee?: number;
  taxes?: number;
  total?: number;
  currency?: string;
  estimated_start_at?: string | null;
  estimated_delivery_at?: string | null;
  proposal_text?: string | null;
  lock_version?: number;
  submitted_at?: string;
  acceptible?: boolean;
  items?: QuoteItem[];
  operator?: OperatorSummary;
  coverage_fit?: { label: string; level: "full" | "none" | "unknown" };
  equipment_summary?: string[];
};

type ComparisonData = {
  mission: {
    id: string;
    title: string;
    status: string;
    area_hectares?: number;
    deadline_at?: string;
    currency?: string;
  };
  quotes: QuoteComparison[];
};

export default function MissionQuotesComparisonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { success, error: toastError } = useToast();

  const [data, setData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    apiFetch<{ data: ComparisonData }>(`/missions/${id}/quote-comparison`)
      .then((res) => setData(res.data))
      .catch((err: ApiError) => {
        setError(err.detail || err.title || "Erro ao carregar comparação de propostas");
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAccept(quote: QuoteComparison) {
    if (!confirm(`Deseja aceitar a proposta de R$ ${quote.total?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}?`)) {
      return;
    }

    setAcceptingId(quote.id);
    try {
      const res = await apiFetch<{ data: { quote_id: string; order_id: string } }>(
        `/quotes/${quote.id}/accept`,
        {
          method: "POST",
          headers: {
            "Idempotency-Key": `accept-${quote.id}-${Date.now()}`,
          },
          body: JSON.stringify({ lock_version: quote.lock_version }),
        }
      );

      success("Proposta aceita com sucesso!", "Redirecionando para o pedido e pagamento...");
      if (res?.data?.order_id) {
        router.push(`/app/orders?highlight=${res.data.order_id}`);
      } else {
        router.push(`/app/missions/${id}`);
      }
    } catch (err) {
      const e = err as ApiError;
      toastError("Falha ao aceitar proposta", e.detail || e.title || "Tente novamente mais tarde.");
    } finally {
      setAcceptingId(null);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl py-8">
        <div className="h-8 w-48 animate-pulse rounded bg-border/40" />
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 animate-pulse rounded-card bg-surface border border-border" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        <div className="rounded-card border border-danger/30 bg-danger/5 p-6 text-danger">
          <p className="font-semibold">Erro ao carregar propostas</p>
          <p className="mt-1 text-sm">{error || "Não foi possível carregar os dados."}</p>
          <Link href={`/app/missions/${id}`} className="btn-primary mt-4 inline-block">
            Voltar para a missão
          </Link>
        </div>
      </div>
    );
  }

  const { mission, quotes } = data;

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Link href="/app/missions" className="hover:underline">
              Missões
            </Link>
            <span>/</span>
            <Link href={`/app/missions/${mission.id}`} className="hover:underline">
              {mission.title}
            </Link>
            <span>/</span>
            <span className="text-text">Comparação de propostas</span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-text">Propostas recebidas</h1>
          <p className="mt-0.5 text-sm text-text-muted">
            {quotes.length} {quotes.length === 1 ? "proposta submetida" : "propostas submetidas"} para esta missão.
          </p>
        </div>
        <Link href={`/app/missions/${mission.id}`} className="rounded-input border border-border px-3 py-2 text-sm text-text hover:bg-surface-soft text-center">
          ← Voltar ao workspace
        </Link>
      </div>

      {quotes.length === 0 ? (
        <div className="rounded-card border border-dashed border-border bg-surface p-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface-soft text-2xl">
            📋
          </div>
          <h3 className="text-lg font-medium text-text">Nenhuma proposta recebida ainda</h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-text-muted">
            Sua missão está publicada e disponível para os operadores da região. Você receberá uma notificação assim que as primeiras propostas chegarem.
          </p>
          <Link href={`/app/missions/${mission.id}`} className="btn-primary mt-6 inline-block">
            Ver detalhes da missão
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quotes.map((q, idx) => {
            const isBestPrice = idx === 0 && quotes.length > 1;

            return (
              <div
                key={q.id}
                className={`relative flex flex-col justify-between rounded-card border bg-surface p-6 shadow-sm transition-all hover:shadow-md ${
                  isBestPrice ? "border-accent-ink ring-1 ring-accent-ink" : "border-border"
                }`}
              >
                {isBestPrice && (
                  <span className="absolute -top-3 left-6 rounded-full bg-accent-ink px-2.5 py-0.5 text-[11px] font-bold text-surface">
                    Melhor Preço
                  </span>
                )}

                <div>
                  {/* Operator Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-text">
                        {q.operator?.organization_name || "Operador homologado"}
                      </h3>
                      <p className="text-xs text-text-muted line-clamp-1">
                        {q.operator?.headline || "Operador de drones"}
                      </p>
                    </div>
                    {q.operator?.verified && (
                      <span className="rounded bg-accent/30 px-1.5 py-0.5 text-[10px] font-semibold text-accent-ink">
                        Verificado
                      </span>
                    )}
                  </div>

                  {/* Badges / Metrics */}
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {q.operator?.rating_average && (
                      <span className="flex items-center gap-1 rounded bg-surface-soft px-2 py-0.5 font-medium text-text">
                        ⭐ {q.operator.rating_average.toFixed(1)} ({q.operator.rating_count || 0})
                      </span>
                    )}
                    <span className="rounded bg-surface-soft px-2 py-0.5 text-text-muted">
                      {q.operator?.missions_completed || 0} missões feitas
                    </span>
                  </div>

                  {/* Coverage Fit */}
                  {q.coverage_fit && (
                    <div className="mt-3">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-[11px] font-medium ${
                          q.coverage_fit.level === "full"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-surface-soft text-text-muted border border-border"
                        }`}
                      >
                        {q.coverage_fit.label}
                      </span>
                    </div>
                  )}

                  {/* Pricing */}
                  <div className="mt-5 rounded-input border border-border bg-surface-soft p-4">
                    <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">
                      Valor total
                    </p>
                    <p className="mt-1 text-2xl font-bold text-text">
                      R$ {q.total?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "—"}
                    </p>
                    <div className="mt-2 space-y-1 border-t border-border pt-2 text-[12px] text-text-muted">
                      <div className="flex justify-between">
                        <span>Serviço</span>
                        <span>R$ {q.subtotal?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxa de plataforma</span>
                        <span>R$ {q.platform_fee?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Proposal Text */}
                  {q.proposal_text && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                        Proposta
                      </p>
                      <p className="mt-1 text-xs text-text bg-surface-soft/60 rounded p-2.5 max-h-24 overflow-y-auto">
                        {q.proposal_text}
                      </p>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs border-t border-border pt-3">
                    <div>
                      <span className="text-text-muted block text-[11px]">Início previsto:</span>
                      <span className="font-medium text-text">
                        {q.estimated_start_at
                          ? new Date(q.estimated_start_at).toLocaleDateString("pt-BR")
                          : "A combinar"}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-muted block text-[11px]">Entrega:</span>
                      <span className="font-medium text-text">
                        {q.estimated_delivery_at
                          ? new Date(q.estimated_delivery_at).toLocaleDateString("pt-BR")
                          : "A combinar"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Accept Action */}
                <div className="mt-6 pt-4 border-t border-border">
                  {q.status === "accepted" ? (
                    <div className="rounded-input border border-green-300 bg-green-50 p-2.5 text-center text-xs font-semibold text-green-800">
                      ✓ Proposta Aceita
                    </div>
                  ) : (
                    <Button
                      type="button"
                      className="w-full"
                      disabled={!q.acceptible || acceptingId !== null}
                      onClick={() => handleAccept(q)}
                    >
                      {acceptingId === q.id ? "Processando aceite…" : "Aceitar proposta"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
