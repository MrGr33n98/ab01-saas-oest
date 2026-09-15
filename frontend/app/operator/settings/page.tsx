"use client";

import { useEffect, useState } from "react";
import { apiFetch, type ApiError } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

type ProfileData = {
  id: string;
  slug: string;
  headline?: string;
  about?: string;
  verification_status?: string;
  accepting_jobs?: boolean;
  searchable?: boolean;
  rating_average?: number | null;
  missions_completed?: number;
};

export default function OperatorSettingsPage() {
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  const [form, setForm] = useState({
    headline: "",
    about: "",
    accepting_jobs: true,
    searchable: true,
    minimum_job_value: "",
  });

  useEffect(() => {
    setLoading(true);
    apiFetch<{ data: ProfileData }>("/operator/profile")
      .then((res) => {
        setProfile(res.data);
        setForm({
          headline: res.data.headline || "",
          about: res.data.about || "",
          accepting_jobs: res.data.accepting_jobs !== false,
          searchable: res.data.searchable !== false,
          minimum_job_value: "",
        });
      })
      .catch((err: ApiError) => {
        toastError("Erro ao carregar perfil", err.detail || err.title);
      })
      .finally(() => setLoading(false));
  }, [toastError]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await apiFetch("/operator/profile", {
        method: "PATCH",
        body: JSON.stringify({
          headline: form.headline,
          about: form.about,
          accepting_jobs: form.accepting_jobs,
          searchable: form.searchable,
          minimum_job_value: form.minimum_job_value ? parseFloat(form.minimum_job_value) : null,
        }),
      });
      success("Perfil atualizado!", "Suas alterações já estão ativas na plataforma.");
    } catch (err) {
      const e = err as ApiError;
      toastError("Falha ao atualizar", e.detail || e.title);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl py-8">
        <div className="h-48 animate-pulse rounded-card bg-surface border border-border" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-semibold text-text">Configurações do Operador</h1>
        <p className="mt-1 text-[15px] text-text-muted">
          Informações públicas do perfil exibidas para contratantes no marketplace DroneHub.
        </p>
      </div>

      <form onSubmit={handleSave} className="rounded-card border border-border bg-surface p-6 shadow-sm space-y-6">
        {profile?.verification_status && (
          <div className="flex items-center justify-between rounded-input border border-border bg-surface-soft p-4">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-text-muted">
                Status de Verificação
              </p>
              <p className="text-sm font-medium text-text mt-0.5">
                {profile.verification_status === "verified"
                  ? "✓ Operador Verificado & Homologado"
                  : profile.verification_status === "pending"
                  ? "⏳ Em análise pela equipe de compliance"
                  : "Não verificado"}
              </p>
            </div>
            {profile.slug && (
              <a
                href={`/operators/${profile.slug}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-accent-ink hover:underline font-medium"
              >
                Ver perfil público ↗
              </a>
            )}
          </div>
        )}

        <Input
          label="Headline profissional"
          placeholder="Ex: Topografia RTK, Mapeamento Agrícola & Pulverização em MT"
          value={form.headline}
          onChange={(e) => setForm({ ...form, headline: e.target.value })}
        />

        <Textarea
          label="Sobre a empresa / operação"
          placeholder="Apresente os anos de experiência, especialidades, equipamentos de ponta, certificações e capacidade operacional..."
          rows={5}
          value={form.about}
          onChange={(e) => setForm({ ...form, about: e.target.value })}
        />

        <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-border">
          <Checkbox
            label="Recebendo jobs e missões"
            description="Quando desmarcado, você não receberá novos convites de cotação."
            checked={form.accepting_jobs}
            onChange={(e) => setForm({ ...form, accepting_jobs: e.target.checked })}
          />

          <Checkbox
            label="Visível no Marketplace público"
            description="Exibir sua empresa na busca e listagem pública de operadores."
            checked={form.searchable}
            onChange={(e) => setForm({ ...form, searchable: e.target.checked })}
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <Button type="submit" disabled={busy}>
            {busy ? "Salvando…" : "Salvar alterações"}
          </Button>
        </div>
      </form>
    </div>
  );
}
