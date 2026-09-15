"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch, type ApiError } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type OperatorDetail = {
  id: string;
  slug: string;
  headline?: string;
  about?: string;
  verification_status: string;
  accepting_jobs: boolean;
  rating_average?: number | null;
  missions_completed?: number;
  created_at: string;
  organization?: {
    id: string;
    name: string;
    legal_name?: string;
    tax_id?: string;
    email?: string;
    city?: string;
    state_code?: string;
    verified: boolean;
  };
  drones?: Array<{ id: string; manufacturer: string; model: string; status: string }>;
  pilots?: Array<{ id: string; name: string; anac_license?: string; status: string }>;
};

export default function AdminOperatorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { success, error: toastError } = useToast();

  const [operator, setOperator] = useState<OperatorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reject modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [busyAction, setBusyAction] = useState(false);

  function loadDetails() {
    setLoading(true);
    apiFetch<{ data: OperatorDetail }>(`/admin/operators/${id}`)
      .then((res) => setOperator(res.data))
      .catch((err: ApiError) => setError(err.detail || err.title || "Erro ao carregar detalhes"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadDetails();
  }, [id]);

  async function handleVerify() {
    if (!confirm("Confirmar homologação e verificação deste operador?")) return;

    setBusyAction(true);
    try {
      await apiFetch(`/admin/operators/${id}/verify`, { method: "POST" });
      success("Operador verificado com sucesso!", "Selo de homologação concedido.");
      loadDetails();
    } catch (err) {
      const e = err as ApiError;
      toastError("Falha na aprovação", e.detail || e.title);
    } finally {
      setBusyAction(false);
    }
  }

  async function handleReject() {
    if (!rejectReason.trim()) return;

    setBusyAction(true);
    try {
      await apiFetch(`/admin/operators/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason: rejectReason.trim() }),
      });
      success("Operador rejeitado", "Motivo registrado no log de auditoria.");
      setRejectModalOpen(false);
      loadDetails();
    } catch (err) {
      const e = err as ApiError;
      toastError("Falha na rejeição", e.detail || e.title);
    } finally {
      setBusyAction(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl py-8 space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-border/40" />
        <div className="h-64 animate-pulse rounded-card bg-surface border border-border" />
      </div>
    );
  }

  if (error || !operator) {
    return (
      <div className="mx-auto max-w-xl py-12 text-center">
        <p className="text-danger font-medium">{error || "Operador não encontrado."}</p>
        <Link href="/admin/verifications" className="btn-primary mt-4 inline-block">
          Voltar para a fila
        </Link>
      </div>
    );
  }

  const org = operator.organization;

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Link href="/admin/verifications" className="hover:underline">
              Verificações
            </Link>
            <span>/</span>
            <span className="text-text">{org?.legal_name || org?.name || "Operador"}</span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-text">
            {org?.legal_name || org?.name || "Operador"}
          </h1>
          <p className="mt-0.5 text-sm text-text-muted">{operator.headline || "Perfil de operador de drones"}</p>
        </div>

        <div className="flex items-center gap-2">
          {operator.verification_status !== "verified" && (
            <Button
              type="button"
              disabled={busyAction}
              onClick={handleVerify}
            >
              Aprovar Homologação ✓
            </Button>
          )}
          {operator.verification_status !== "rejected" && (
            <button
              type="button"
              disabled={busyAction}
              onClick={() => {
                setRejectReason("");
                setRejectModalOpen(true);
              }}
              className="rounded-input border border-danger/40 bg-danger/10 px-3 py-2 text-xs font-semibold text-danger hover:bg-danger/20"
            >
              Rejeitar Cadastro
            </button>
          )}
        </div>
      </div>

      {/* Status banner */}
      <div className="flex items-center justify-between rounded-card border border-border bg-surface p-4">
        <div>
          <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Status</span>
          <p className="text-sm font-bold text-text mt-0.5 capitalize">
            {operator.verification_status === "verified"
              ? "✓ Homologado & Verificado"
              : operator.verification_status === "pending"
              ? "⏳ Pendente de análise cadastral"
              : "✕ Rejeitado"}
          </p>
        </div>
        <span className="text-xs text-text-muted">
          Cadastrado em {new Date(operator.created_at).toLocaleDateString("pt-BR")}
        </span>
      </div>

      {/* Org Information */}
      <div className="rounded-card border border-border bg-surface p-6 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-text border-b border-border pb-3">
          Dados da Empresa (Pessoa Jurídica / Física)
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 text-sm">
          <div>
            <span className="text-xs text-text-muted block">Razão Social / Nome Fantasia</span>
            <span className="font-medium text-text">{org?.legal_name || org?.name || "—"}</span>
          </div>

          <div>
            <span className="text-xs text-text-muted block">CNPJ / CPF</span>
            <span className="font-medium text-text font-mono">{org?.tax_id || "Não informado"}</span>
          </div>

          <div>
            <span className="text-xs text-text-muted block">E-mail corporativo</span>
            <span className="font-medium text-text">{org?.email || "—"}</span>
          </div>

          <div>
            <span className="text-xs text-text-muted block">Localização / Base</span>
            <span className="font-medium text-text">
              {org?.city ? `${org.city} - ` : ""}{org?.state_code || "Brasil"}
            </span>
          </div>
        </div>

        {operator.about && (
          <div className="border-t border-border pt-3">
            <span className="text-xs text-text-muted block mb-1">Apresentação Institucional</span>
            <p className="text-sm text-text bg-surface-soft p-3 rounded">{operator.about}</p>
          </div>
        )}
      </div>

      {/* Fleet & Pilots */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Drones */}
        <div className="rounded-card border border-border bg-surface p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-semibold text-text uppercase tracking-wider">
            Frota Cadastrada ({operator.drones?.length || 0})
          </h3>
          {(!operator.drones || operator.drones.length === 0) ? (
            <p className="text-xs text-text-muted">Nenhum drone registrado.</p>
          ) : (
            <ul className="divide-y divide-border text-xs">
              {operator.drones.map((d) => (
                <li key={d.id} className="py-2 flex justify-between">
                  <span className="font-medium text-text">{d.manufacturer} {d.model}</span>
                  <span className="text-text-muted capitalize">{d.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Pilots */}
        <div className="rounded-card border border-border bg-surface p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-semibold text-text uppercase tracking-wider">
            Pilotos Habilitados ({operator.pilots?.length || 0})
          </h3>
          {(!operator.pilots || operator.pilots.length === 0) ? (
            <p className="text-xs text-text-muted">Nenhum piloto registrado.</p>
          ) : (
            <ul className="divide-y divide-border text-xs">
              {operator.pilots.map((p) => (
                <li key={p.id} className="py-2 flex justify-between">
                  <span className="font-medium text-text">{p.name}</span>
                  <span className="font-mono text-text-muted">
                    {p.anac_license ? `ANAC: ${p.anac_license}` : "Sem licença"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Modal de Rejeição */}
      <Modal
        open={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Rejeitar cadastro de operador"
        description="Informe o motivo da rejeição para registro na trilha de auditoria."
      >
        <div className="space-y-4">
          <Textarea
            label="Justificativa da recusa"
            placeholder="Ex: CNPJ inapto na Receita Federal, falta de seguro RETA obrigatório, documentação ilegível..."
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
              onClick={handleReject}
            >
              {busyAction ? "Processando…" : "Confirmar rejeição"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
