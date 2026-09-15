"use client";

import { useEffect, useState } from "react";
import { apiFetch, type ApiError } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

type Pilot = {
  id: string;
  full_name: string;
  license_number?: string;
  anac_license?: string;
  phone?: string;
  email?: string;
  verification_status: string;
  available: boolean;
  flight_hours_logged: number;
  created_at?: string;
};

export default function PilotsPage() {
  const { success, error: toastError } = useToast();

  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPilot, setEditingPilot] = useState<Pilot | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    license_number: "",
    anac_license: "",
    phone: "",
    email: "",
    available: true,
    flight_hours_logged: 0,
  });
  const [busy, setBusy] = useState(false);

  function loadPilots() {
    setLoading(true);
    apiFetch<{ data: Pilot[] }>("/operator/pilots")
      .then((res) => setPilots(res.data || []))
      .catch((err: ApiError) => setError(err.detail || err.title || "Erro ao carregar pilotos"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadPilots();
  }, []);

  function openCreate() {
    setEditingPilot(null);
    setFormData({
      full_name: "",
      license_number: "",
      anac_license: "",
      phone: "",
      email: "",
      available: true,
      flight_hours_logged: 0,
    });
    setModalOpen(true);
  }

  function openEdit(pilot: Pilot) {
    setEditingPilot(pilot);
    setFormData({
      full_name: pilot.full_name,
      license_number: pilot.license_number || "",
      anac_license: pilot.anac_license || "",
      phone: pilot.phone || "",
      email: pilot.email || "",
      available: pilot.available,
      flight_hours_logged: pilot.flight_hours_logged || 0,
    });
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (editingPilot) {
        await apiFetch(`/operator/pilots/${editingPilot.id}`, {
          method: "PATCH",
          body: JSON.stringify(formData),
        });
        success("Piloto atualizado com sucesso!");
      } else {
        await apiFetch("/operator/pilots", {
          method: "POST",
          body: JSON.stringify(formData),
        });
        success("Piloto cadastrado com sucesso!");
      }
      setModalOpen(false);
      loadPilots();
    } catch (err) {
      const e = err as ApiError;
      toastError("Falha ao salvar piloto", e.detail || e.title);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(pilot: Pilot) {
    if (!confirm(`Deseja remover o piloto ${pilot.full_name}?`)) return;

    try {
      await apiFetch(`/operator/pilots/${pilot.id}`, { method: "DELETE" });
      success("Piloto removido");
      loadPilots();
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
          <h1 className="text-2xl font-semibold text-text">Pilotos & Tripulação</h1>
          <p className="mt-1 text-[15px] text-text-muted">
            Cadastre os pilotos habilitados da sua equipe com licenças ANAC e horas de voo.
          </p>
        </div>
        <Button type="button" onClick={openCreate}>
          + Adicionar piloto
        </Button>
      </div>

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-card bg-surface border border-border" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-card border border-danger/30 bg-danger/5 p-4 text-center text-sm text-danger">
          {error}
        </div>
      )}

      {!loading && !error && pilots.length === 0 && (
        <div className="rounded-card border border-dashed border-border bg-surface p-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface-soft text-2xl">
            🧑‍✈️
          </div>
          <h3 className="text-lg font-medium text-text">Nenhum piloto cadastrado</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-text-muted">
            Adicione pilotos certificados para comprovar conformidade regulatória nas missões.
          </p>
          <Button type="button" onClick={openCreate} className="mt-4">
            Cadastrar primeiro piloto
          </Button>
        </div>
      )}

      {!loading && !error && pilots.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {pilots.map((p) => (
            <div
              key={p.id}
              className="flex flex-col justify-between rounded-card border border-border bg-surface p-5 shadow-sm space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-text">{p.full_name}</h3>
                    <p className="text-xs text-text-muted">
                      {p.email || "Sem e-mail cadastrado"} {p.phone ? `· ${p.phone}` : ""}
                    </p>
                  </div>
                  <span
                    className={`rounded px-2 py-0.5 text-[11px] font-semibold ${
                      p.available
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-surface-soft text-text-muted border border-border"
                    }`}
                  >
                    {p.available ? "Disponível" : "Indisponível"}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs border-t border-border pt-3">
                  <div>
                    <span className="text-text-muted block text-[11px]">Habilitação ANAC:</span>
                    <span className="font-medium text-text font-mono">
                      {p.anac_license || p.license_number || "Não informada"}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[11px]">Horas de voo:</span>
                    <span className="font-medium text-text">
                      {p.flight_hours_logged}h registradas
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-border pt-3 text-xs">
                <button
                  type="button"
                  onClick={() => openEdit(p)}
                  className="rounded px-2.5 py-1 text-text hover:bg-surface-soft"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(p)}
                  className="rounded px-2.5 py-1 text-danger hover:bg-danger/10"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal CRUD */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingPilot ? "Editar piloto" : "Novo piloto"}
        description="Informações cadastrais e regulatórias do piloto da operação."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Nome completo"
            required
            placeholder="Ex: Carlos Eduardo Silveira"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Licença ANAC / CANAC"
              placeholder="Ex: 123456"
              value={formData.anac_license}
              onChange={(e) => setFormData({ ...formData, anac_license: e.target.value })}
            />
            <Input
              label="Horas de voo"
              type="number"
              min="0"
              value={formData.flight_hours_logged}
              onChange={(e) => setFormData({ ...formData, flight_hours_logged: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Telefone / WhatsApp"
              placeholder="(65) 99999-0000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="E-mail"
              type="email"
              placeholder="carlos@empresa.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <Checkbox
            label="Disponível para operações em campo"
            description="Pilotos disponíveis aparecem como elegíveis para escalação nas missões."
            checked={formData.available}
            onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
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
            <Button type="submit" disabled={busy || !formData.full_name}>
              {busy ? "Salvando…" : "Salvar piloto"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
