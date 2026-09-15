"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MapAoiEditor } from "@/components/mission/map-aoi-editor";
import { apiFetch, type ApiError } from "@/lib/api/client";
import { DATA_PRODUCTS } from "@/lib/categories";

const STEPS = [
  { id: "goal", title: "Objetivo", hint: "O que você precisa obter?" },
  { id: "products", title: "Produtos de dados", hint: "Entregáveis (catálogo MVP)" },
  { id: "aoi", title: "Área (AOI)", hint: "GeoJSON — área calculada no servidor" },
  { id: "schedule", title: "Prazo", hint: "Deadline da entrega" },
  { id: "review", title: "Revisar e publicar", hint: "Confirme e publique no marketplace" },
] as const;

const GOALS = [
  { id: "mapping", label: "Mapear uma área", desc: "Ortomosaico, DTM/DSM" },
  { id: "inspection", label: "Inspecionar ativo", desc: "Torres, linhas, fachadas" },
  { id: "agriculture", label: "Monitorar lavoura", desc: "NDVI e índices" },
  { id: "mining", label: "Medir volume", desc: "Pilhas e cortes" },
] as const;

type CatalogProduct = { id: string; slug: string; name: string };
type Envelope<T> = { data: T; meta?: { request_id?: string } };

export default function MissionWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<string | null>("mapping");
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(["orthomosaic"]);
  const [deadline, setDeadline] = useState("");
  const [title, setTitle] = useState("Nova missão");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [missionId, setMissionId] = useState<string | null>(null);
  const [areaHa, setAreaHa] = useState<number | null>(null);
  const [catalog, setCatalog] = useState<CatalogProduct[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = STEPS[step];

  const ensureProjectAndMission = useCallback(async () => {
    if (missionId) return missionId;
    setBusy(true);
    setError(null);
    try {
      let pid = projectId;
      if (!pid) {
        const proj = await apiFetch<Envelope<{ id: string }>>("/projects", {
          method: "POST",
          body: JSON.stringify({
            name: `Projeto ${new Date().toLocaleDateString("pt-BR")}`,
            industry: goal === "agriculture" ? "agriculture" : "general",
          }),
        });
        pid = proj.data.id;
        setProjectId(pid);
      }
      const mission = await apiFetch<Envelope<{ id: string }>>("/missions", {
        method: "POST",
        body: JSON.stringify({
          project_id: pid,
          title: title || "Nova missão",
          mission_type: goal || "mapping",
          priority: "normal",
          deadline_at: deadline || undefined,
          budget: { min: 5000, max: 15000, currency: "BRL" },
        }),
      });
      setMissionId(mission.data.id);
      return mission.data.id;
    } catch (e) {
      const err = e as ApiError;
      setError(err.detail || err.title || `Erro ${err.status}`);
      throw e;
    } finally {
      setBusy(false);
    }
  }, [missionId, projectId, goal, title, deadline]);

  useEffect(() => {
    apiFetch<Envelope<CatalogProduct[]>>("/marketplace/data-products", { skipAuth: true })
      .then((r) => setCatalog(r.data || []))
      .catch(() =>
        setCatalog(DATA_PRODUCTS.map((p) => ({ id: "", slug: p.slug, name: p.name })))
      );
  }, []);

  const toggleProduct = (slug: string) => {
    setSelectedSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const saveAoi = async (geojson: { type: string; coordinates: unknown }) => {
    const mid = await ensureProjectAndMission();
    setBusy(true);
    setError(null);
    try {
      const res = await apiFetch<Envelope<{ area_hectares: number }>>(
        `/missions/${mid}/geometry`,
        { method: "POST", body: JSON.stringify({ geometry: geojson }) }
      );
      setAreaHa(res.data.area_hectares ?? null);
    } catch (e) {
      const err = e as ApiError;
      setError(err.detail || err.title || "Falha ao salvar AOI");
      throw e;
    } finally {
      setBusy(false);
    }
  };

  const attachProducts = async (mid: string) => {
    let items = selectedSlugs
      .map((slug) => catalog.find((c) => c.slug === slug))
      .filter((c): c is CatalogProduct => !!c && !!c.id);

    if (items.length === 0) {
      const r = await apiFetch<Envelope<CatalogProduct[]>>("/marketplace/data-products");
      setCatalog(r.data || []);
      items = selectedSlugs
        .map((slug) => (r.data || []).find((c) => c.slug === slug))
        .filter((c): c is CatalogProduct => !!c && !!c.id);
      if (items.length === 0) {
        throw { status: 422, title: "Catálogo sem IDs — rode db:seed" } as ApiError;
      }
    }

    for (const p of items) {
      await apiFetch(`/missions/${mid}/products`, {
        method: "POST",
        body: JSON.stringify({ data_product_id: p.id, quantity: 1 }),
      });
    }
  };

  const publish = async () => {
    setBusy(true);
    setError(null);
    try {
      const mid = await ensureProjectAndMission();
      await attachProducts(mid);
      if (areaHa == null) {
        setError("Defina o AOI antes de publicar");
        return;
      }
      if (!deadline) {
        setError("Informe o deadline");
        return;
      }
      await apiFetch(`/missions/${mid}/publish`, {
        method: "POST",
        body: JSON.stringify({}),
        idempotencyKey: `publish:${mid}:${crypto.randomUUID()}`,
      });
      router.push(`/app/missions/${mid}`);
    } catch (e) {
      const err = e as ApiError;
      setError(err.detail || err.title || `Publish falhou (${err.status})`);
    } finally {
      setBusy(false);
    }
  };

  const canContinue = useMemo(() => {
    if (step === 0) return !!goal;
    if (step === 1) return selectedSlugs.length > 0;
    if (step === 2) return areaHa != null;
    if (step === 3) return !!deadline;
    return true;
  }, [step, goal, selectedSlugs, areaHa, deadline]);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <p className="text-[13px] font-medium uppercase tracking-wider text-text-muted">
          Nova missão · passo {step + 1} de {STEPS.length}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-text">{current.title}</h1>
        <p className="mt-1 text-[15px] text-text-muted">{current.hint}</p>
      </div>

      <div className="mb-8 flex gap-1">
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            className={`h-1 flex-1 rounded-full ${i <= step ? "bg-accent" : "bg-border"}`}
          />
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-input border border-danger/30 bg-danger/5 px-4 py-3 text-[14px] text-danger">
          {error}
        </div>
      )}

      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label className="label">Título da missão</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {GOALS.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setGoal(g.id)}
                className={`card text-left ${
                  goal === g.id ? "border-accent-ink ring-1 ring-accent-ink" : "hover:border-border-strong"
                }`}
              >
                <p className="font-medium text-text">{g.label}</p>
                <p className="mt-1 text-[13px] text-text-muted">{g.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {(catalog.length
            ? catalog
            : DATA_PRODUCTS.map((p) => ({ slug: p.slug, name: p.name, id: "" }))
          ).map((p) => (
            <button
              key={p.slug}
              type="button"
              onClick={() => toggleProduct(p.slug)}
              className={`card text-left ${
                selectedSlugs.includes(p.slug)
                  ? "border-accent-ink ring-1 ring-accent-ink"
                  : "hover:border-border-strong"
              }`}
            >
              <p className="font-medium text-text">{p.name}</p>
              <p className="mt-1 text-[12px] text-text-muted">{p.slug}</p>
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="card">
          {areaHa != null && (
            <p className="mb-4 text-[14px] text-text">
              Área (servidor): <span className="font-semibold tabular-nums">{areaHa} ha</span>
            </p>
          )}
          <MapAoiEditor onSave={saveAoi} initialAreaHa={areaHa} />
        </div>
      )}

      {step === 3 && (
        <div className="card space-y-3">
          <label className="label" htmlFor="deadline">Deadline</label>
          <input
            id="deadline"
            type="datetime-local"
            className="input max-w-sm"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>
      )}

      {step === 4 && (
        <div className="card space-y-2 text-[15px]">
          <p><span className="text-text-muted">Título:</span> {title}</p>
          <p><span className="text-text-muted">Tipo:</span> {goal}</p>
          <p><span className="text-text-muted">Produtos:</span> {selectedSlugs.join(", ")}</p>
          <p><span className="text-text-muted">Área:</span> {areaHa != null ? `${areaHa} ha` : "—"}</p>
          <p><span className="text-text-muted">Deadline:</span> {deadline || "—"}</p>
          {missionId && <p className="text-[12px] text-text-muted">{missionId}</p>}
        </div>
      )}

      <div className="mt-10 flex justify-between">
        <Button variant="ghost" disabled={step === 0 || busy} onClick={() => setStep((s) => s - 1)}>
          Voltar
        </Button>
        {step < STEPS.length - 1 ? (
          <Button
            disabled={!canContinue || busy}
            onClick={async () => {
              try {
                if (step === 0) await ensureProjectAndMission();
                setStep((s) => s + 1);
              } catch { /* error set */ }
            }}
          >
            Continuar
          </Button>
        ) : (
          <Button disabled={busy || !canContinue} onClick={publish}>
            {busy ? "Publicando…" : "Publicar missão"}
          </Button>
        )}
      </div>
    </div>
  );
}
