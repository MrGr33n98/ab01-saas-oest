"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { apiFetch, type ApiError } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Deliverable = {
  id: string;
  mission_id: string;
  data_product_id?: string;
  title: string;
  status: string;
  version: number;
  storage_key?: string;
  file_size_bytes?: number;
  rejection_reason?: string | null;
  created_at?: string;
};

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  draft: { label: "Rascunho", className: "bg-surface-soft text-text-muted border-border" },
  uploaded: { label: "Aguardando Revisão", className: "bg-blue-50 text-blue-700 border-blue-200" },
  processing: { label: "Processando", className: "bg-orange-50 text-orange-700 border-orange-200" },
  approved: { label: "Aprovado ✓", className: "bg-green-50 text-green-700 border-green-200" },
  rejected: { label: "Rejeitado", className: "bg-red-50 text-red-700 border-red-200" },
};

export default function MissionDeliverablesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { success, error: toastError } = useToast();

  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reject modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingItem, setRejectingItem] = useState<Deliverable | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [busyAction, setBusyAction] = useState(false);

  function loadDeliverables() {
    setLoading(true);
    apiFetch<{ data: Deliverable[] }>(`/missions/${id}/deliverables`)
      .then((res) => setDeliverables(res.data || []))
      .catch((err: ApiError) => {
        setError(err.detail || err.title || "Erro ao carregar entregáveis");
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadDeliverables();
  }, [id]);

  async function handleApprove(item: Deliverable) {
    if (!confirm(`Deseja aprovar a entrega "${item.title || 'Entregável v' + item.version}"?`)) return;

    setBusyAction(true);
    try {
      await apiFetch(`/deliverables/${item.id}/approve`, { method: "POST" });
      success("Entregável aprovado com sucesso!");
      loadDeliverables();
    } catch (err) {
      const e = err as ApiError;
      toastError("Falha ao aprovar entregável", e.detail || e.title);
    } finally {
      setBusyAction(false);
    }
  }

  function openRejectModal(item: Deliverable) {
    setRejectingItem(item);
    setRejectReason("");
    setRejectModalOpen(true);
  }

  async function handleConfirmReject() {
    if (!rejectingItem || !rejectReason.trim()) return;

    setBusyAction(true);
    try {
      await apiFetch(`/deliverables/${rejectingItem.id}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason: rejectReason.trim() }),
      });
      success("Entregável recusado com feedback enviado ao operador.");
      setRejectModalOpen(false);
      loadDeliverables();
    } catch (err) {
      const e = err as ApiError;
      toastError("Falha ao rejeitar", e.detail || e.title);
    } finally {
      setBusyAction(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Link href="/app/missions" className="hover:underline">
              Missões
            </Link>
            <span>/</span>
            <Link href={`/app/missions/${id}`} className="hover:underline">
              Workspace
            </Link>
            <span>/</span>
            <span className="text-text">Entregáveis</span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-text">Entregáveis da missão</h1>
          <p className="mt-0.5 text-sm text-text-muted">
            Arquivos de dados, ortomosaicos, modelos 3D e relatórios gerados nesta operação.
          </p>
        </div>
        <Link href={`/app/missions/${id}`} className="rounded-input border border-border px-3 py-2 text-sm text-text hover:bg-surface-soft text-center">
          ← Voltar ao workspace
        </Link>
      </div>

      {loading && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-card bg-surface border border-border" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-card border border-danger/30 bg-danger/5 p-6 text-center text-danger text-sm">
          {error}
        </div>
      )}

      {!loading && !error && deliverables.length === 0 && (
        <div className="rounded-card border border-dashed border-border bg-surface p-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface-soft text-2xl">
            📦
          </div>
          <h3 className="text-lg font-medium text-text">Nenhum entregável enviado ainda</h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-text-muted">
            Assim que o operador concluir a captura e o processamento em campo, os dados serão enviados aqui para sua conferência e aprovação.
          </p>
          <Link href={`/app/missions/${id}`} className="btn-primary mt-6 inline-block">
            Voltar para a missão
          </Link>
        </div>
      )}

      {!loading && !error && deliverables.length > 0 && (
        <div className="space-y-4">
          {deliverables.map((item) => {
            const badge = STATUS_BADGES[item.status] || {
              label: item.status,
              className: "bg-surface-soft text-text border-border",
            };

            return (
              <div
                key={item.id}
                className="rounded-card border border-border bg-surface p-5 shadow-sm space-y-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-text">
                        {item.title || `Entregável v${item.version}`}
                      </h3>
                      <span className={`rounded px-2 py-0.5 text-[11px] font-semibold border ${badge.className}`}>
                        {badge.label}
                      </span>
                      <span className="rounded bg-surface-soft px-1.5 py-0.5 text-[11px] text-text-muted">
                        v{item.version}
                      </span>
                    </div>
                    {item.file_size_bytes && (
                      <p className="mt-1 text-xs text-text-muted">
                        Tamanho: {(item.file_size_bytes / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    {item.storage_key && (
                      <a
                        href={`https://storage.dronehub.example/${item.storage_key}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-input border border-border px-3 py-1.5 text-xs font-medium text-text hover:bg-surface-soft"
                      >
                        Baixar arquivo ↗
                      </a>
                    )}

                    {item.status === "uploaded" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleApprove(item)}
                          disabled={busyAction}
                          className="rounded-input bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 transition-colors"
                        >
                          Aprovar entrega ✓
                        </button>
                        <button
                          type="button"
                          onClick={() => openRejectModal(item)}
                          disabled={busyAction}
                          className="rounded-input border border-danger/40 bg-danger/10 px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/20 transition-colors"
                        >
                          Solicitar revisão
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {item.rejection_reason && (
                  <div className="rounded-input border border-danger/30 bg-danger/5 p-3 text-xs text-danger">
                    <p className="font-semibold">Motivo do retorno para revisão:</p>
                    <p className="mt-0.5">{item.rejection_reason}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Rejeição / Revisão */}
      <Modal
        open={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Solicitar revisão do entregável"
        description="Explique detalhadamente ao operador o que precisa ser ajustado nos dados."
      >
        <div className="space-y-4">
          <Textarea
            label="Motivo ou ajustes necessários"
            placeholder="Ex: Resolução abaixo do contratado, área sudoeste cortada no ortomosaico, nuvem de pontos com ruído excessivo..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              className="rounded-input border border-border px-4 py-2 text-sm text-text hover:bg-surface-soft"
              onClick={() => setRejectModalOpen(false)}
              disabled={busyAction}
            >
              Cancelar
            </button>
            <Button
              type="button"
              disabled={!rejectReason.trim() || busyAction}
              onClick={handleConfirmReject}
            >
              {busyAction ? "Enviando…" : "Confirmar solicitação"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
