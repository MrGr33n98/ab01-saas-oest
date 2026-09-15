"use client";

import { useEffect, useState } from "react";
import { apiFetch, type ApiError } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type ServiceOffering = {
  id: string;
  title: string;
  pricing_model?: string;
  price_from?: number | null;
  currency?: string;
  active?: boolean;
};

const PRICING_MODELS = [
  { value: "per_hectare", label: "Por Hectare (R$/ha)" },
  { value: "per_hour", label: "Por Hora de Voo (R$/h)" },
  { value: "per_mission", label: "Preço Fixo por Missão (R$)" },
  { value: "quote_only", label: "Sob Consulta" },
];

export default function OperatorServicesPage() {
  const { success, error: toastError } = useToast();

  const [services, setServices] = useState<ServiceOffering[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceOffering | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    pricing_model: "per_hectare",
    price_from: "",
    currency: "BRL",
  });
  const [busy, setBusy] = useState(false);

  function loadServices() {
    setLoading(true);
    apiFetch<{ data: ServiceOffering[] }>("/operator/services")
      .then((res) => setServices(res.data || []))
      .catch((err: ApiError) => setError(err.detail || err.title || "Erro ao carregar serviços"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadServices();
  }, []);

  function openCreate() {
    setEditingService(null);
    setFormData({
      title: "",
      description: "",
      pricing_model: "per_hectare",
      price_from: "",
      currency: "BRL",
    });
    setModalOpen(true);
  }

  function openEdit(srv: ServiceOffering) {
    setEditingService(srv);
    setFormData({
      title: srv.title,
      description: "",
      pricing_model: srv.pricing_model || "per_hectare",
      price_from: srv.price_from ? String(srv.price_from) : "",
      currency: srv.currency || "BRL",
    });
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        service: {
          title: formData.title,
          description: formData.description,
          pricing_model: formData.pricing_model,
          price_from: formData.price_from ? parseFloat(formData.price_from) : null,
          currency: formData.currency,
        },
      };

      if (editingService) {
        await apiFetch(`/operator/services/${editingService.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        success("Serviço atualizado com sucesso!");
      } else {
        await apiFetch("/operator/services", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        success("Serviço adicionado com sucesso!");
      }
      setModalOpen(false);
      loadServices();
    } catch (err) {
      const e = err as ApiError;
      toastError("Falha ao salvar serviço", e.detail || e.title);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(srv: ServiceOffering) {
    if (!confirm(`Deseja remover o serviço "${srv.title}"?`)) return;

    try {
      await apiFetch(`/operator/services/${srv.id}`, { method: "DELETE" });
      success("Serviço removido");
      loadServices();
    } catch (err) {
      const e = err as ApiError;
      toastError("Erro ao remover", e.detail || e.title);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-semibold text-text">Catálogo de Serviços</h1>
          <p className="mt-1 text-[15px] text-text-muted">
            Configure as modalidades de serviço que sua empresa oferece e seus valores base de referência.
          </p>
        </div>
        <Button type="button" onClick={openCreate}>
          + Novo serviço
        </Button>
      </div>

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-card bg-surface border border-border" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-card border border-danger/30 bg-danger/5 p-4 text-center text-sm text-danger">
          {error}
        </div>
      )}

      {!loading && !error && services.length === 0 && (
        <div className="rounded-card border border-dashed border-border bg-surface p-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface-soft text-2xl">
            🛠️
          </div>
          <h3 className="text-lg font-medium text-text">Nenhum serviço cadastrado</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-text-muted">
            Cadastre os serviços que você executa (topografia, ortomosaico, pulverização) para ser encontrado pelos clientes.
          </p>
          <Button type="button" onClick={openCreate} className="mt-4">
            Cadastrar primeiro serviço
          </Button>
        </div>
      )}

      {!loading && !error && services.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => {
            const pricingModelLabel =
              PRICING_MODELS.find((m) => m.value === s.pricing_model)?.label || s.pricing_model;

            return (
              <div
                key={s.id}
                className="flex flex-col justify-between rounded-card border border-border bg-surface p-5 shadow-sm space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-semibold text-text">{s.title}</h3>
                    <span className="rounded bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700 border border-green-200">
                      Ativo
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-text-muted">{pricingModelLabel}</p>

                  <div className="mt-4 rounded-input bg-surface-soft p-3">
                    <span className="text-[11px] text-text-muted block">A partir de</span>
                    <span className="text-lg font-bold text-text">
                      {s.price_from
                        ? `R$ ${s.price_from.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                        : "Sob Consulta"}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-border pt-3 text-xs">
                  <button
                    type="button"
                    onClick={() => openEdit(s)}
                    className="rounded px-2.5 py-1 text-text hover:bg-surface-soft"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(s)}
                    className="rounded px-2.5 py-1 text-danger hover:bg-danger/10"
                  >
                    Remover
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Cadastro de Serviço */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingService ? "Editar serviço" : "Novo serviço"}
        description="Defina os detalhes e o modelo de cobrança deste serviço."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Título do serviço"
            required
            placeholder="Ex: Mapeamento Aéreo & Ortomosaico RGB"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <Select
            label="Modelo de precificação"
            value={formData.pricing_model}
            onChange={(e) => setFormData({ ...formData, pricing_model: e.target.value })}
            options={PRICING_MODELS}
          />

          <Input
            label="Preço inicial de referência (R$)"
            type="number"
            step="0.01"
            min="0"
            placeholder="Ex: 25.00"
            value={formData.price_from}
            onChange={(e) => setFormData({ ...formData, price_from: e.target.value })}
          />

          <Textarea
            label="Descrição detalhada"
            placeholder="Explique o que está incluso no serviço, entregáveis gerados e diferenciais operacionais..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              className="rounded-input border border-border px-4 py-2 text-sm text-text hover:bg-surface-soft"
              onClick={() => setModalOpen(false)}
              disabled={busy}
            >
              Cancelar
            </button>
            <Button type="submit" disabled={busy || !formData.title}>
              {busy ? "Salvando…" : "Salvar serviço"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
