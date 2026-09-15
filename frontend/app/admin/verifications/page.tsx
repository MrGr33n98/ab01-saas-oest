"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch, type ApiError } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";

type PendingVerification = {
  id: string;
  slug: string;
  headline?: string;
  verification_status: string;
  created_at: string;
  organization?: {
    id: string;
    name: string;
    legal_name?: string;
    tax_id?: string;
    city?: string;
    state_code?: string;
  };
};

export default function AdminVerificationsPage() {
  const { success, error: toastError } = useToast();

  const [items, setItems] = useState<PendingVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  function loadQueue() {
    setLoading(true);
    apiFetch<{ data: PendingVerification[] }>("/admin/verifications")
      .then((res) => setItems(res.data || []))
      .catch((err: ApiError) => setError(err.detail || err.title || "Erro ao carregar fila"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadQueue();
  }, []);

  async function handleQuickVerify(id: string, name: string) {
    if (!confirm(`Deseja aprovar a verificação de ${name}?`)) return;

    setBusyId(id);
    try {
      await apiFetch(`/admin/operators/${id}/verify`, { method: "POST" });
      success("Operador aprovado!", "E-mail de confirmação enviado ao operador.");
      loadQueue();
    } catch (err) {
      const e = err as ApiError;
      toastError("Falha na aprovação", e.detail || e.title);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-semibold text-text">Fila de Verificações</h1>
        <p className="mt-1 text-[15px] text-text-muted">
          Operadores aguardando homologação cadastral, conferência de CNPJ e conformidade regulatória.
        </p>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-card bg-surface border border-border" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-card border border-danger/30 bg-danger/5 p-4 text-center text-sm text-danger">
          {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="rounded-card border border-dashed border-border bg-surface p-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface-soft text-2xl">
            ✅
          </div>
          <h3 className="text-lg font-medium text-text">Fila de verificação zerada</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-text-muted">
            Todos os operadores cadastrados já foram avaliados pela equipe.
          </p>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="space-y-4">
          {items.map((item) => {
            const org = item.organization;
            const displayName = org?.legal_name || org?.name || item.headline || "Operador";

            return (
              <div
                key={item.id}
                className="flex flex-col gap-4 rounded-card border border-border bg-surface p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-text">{displayName}</h3>
                    <span className="rounded bg-yellow-50 px-2 py-0.5 text-[11px] font-semibold text-yellow-800 border border-yellow-200">
                      Pendente
                    </span>
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
                    {org?.tax_id && <span>CNPJ: <strong className="text-text font-mono">{org.tax_id}</strong></span>}
                    {(org?.city || org?.state_code) && (
                      <span>Localização: {org.city ? `${org.city} - ` : ""}{org.state_code}</span>
                    )}
                    <span>
                      Solicitado em: {new Date(item.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/operators/${item.id}`}
                    className="rounded-input border border-border px-3 py-2 text-xs font-medium text-text hover:bg-surface-soft text-center"
                  >
                    Ver detalhes completos →
                  </Link>

                  <Button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => handleQuickVerify(item.id, displayName)}
                  >
                    {busyId === item.id ? "Aprovando…" : "Aprovar ✓"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
