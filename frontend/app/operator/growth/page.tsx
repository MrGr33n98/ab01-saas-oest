"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiFetch, type ApiError } from "@/lib/api/client";

type Features = Record<string, boolean | string | null | undefined>;

const FEATURE_LABELS: Record<string, string> = {
  "profile.hero_custom": "Hero banner customizado",
  "profile.materials": "Materiais baixáveis",
  "profile.quote_request": "Botão solicitar orçamento",
  "marketplace.category_featured": "Destaque em categoria",
  "marketplace.ads_eligible": "Anúncios no marketplace",
  "analytics.advanced": "Analytics avançado",
};

export default function OperatorGrowthPage() {
  const [features, setFeatures] = useState<Features>({});
  const [plan, setPlan] = useState<string | null>(null);
  const [hero, setHero] = useState({ hero_title: "", hero_subtitle: "", hero_image_url: "" });
  const [quoteOn, setQuoteOn] = useState(false);
  const [material, setMaterial] = useState({ title: "", file_url: "" });
  const [materials, setMaterials] = useState<Array<{ id: string; title: string }>>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    try {
      const [ent, mats] = await Promise.all([
        apiFetch<{ data: { features: Features; plan?: string } }>("/operator/entitlements"),
        apiFetch<{ data: Array<{ id: string; title: string }> }>("/operator/materials").catch(() => ({
          data: [],
        })),
      ]);
      setFeatures(ent.data.features || {});
      setPlan(ent.data.plan || "free");
      setMaterials(mats.data || []);
    } catch (e) {
      setErr((e as ApiError).title || "Erro");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function saveHero() {
    setErr(null);
    try {
      await apiFetch("/operator/profile/premium", {
        method: "PATCH",
        body: JSON.stringify(hero),
      });
      setMsg("Hero salvo");
    } catch (e) {
      const x = e as ApiError & { feature?: string };
      setErr(x.detail || x.title || "Upgrade necessário");
    }
  }

  async function toggleQuote(v: boolean) {
    try {
      await apiFetch("/operator/profile/premium", {
        method: "PATCH",
        body: JSON.stringify({ quote_request_enabled: v }),
      });
      setQuoteOn(v);
      setMsg("Orçamento atualizado");
    } catch (e) {
      setErr((e as ApiError).detail || "Plano Starter+ necessário");
    }
  }

  async function addMaterial() {
    try {
      await apiFetch("/operator/materials", {
        method: "POST",
        body: JSON.stringify({ material }),
      });
      setMaterial({ title: "", file_url: "" });
      await load();
      setMsg("Material publicado");
    } catch (e) {
      setErr((e as ApiError).detail || "Plano Pro+ necessário");
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-text">Crescimento & plano</h1>
        <p className="mt-1 text-sm text-text-muted">
          Features pagas do perfil público · plano atual:{" "}
          <Badge variant="accent">{plan || "free"}</Badge>
        </p>
      </div>

      {msg && <p className="text-sm text-success">{msg}</p>}
      {err && <p className="text-sm text-danger">{err}</p>}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Régua de features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.keys(FEATURE_LABELS).map((k) => (
            <div
              key={k}
              className="flex items-center justify-between border-b border-border/60 py-2 text-sm"
            >
              <span>{FEATURE_LABELS[k]}</span>
              {features[k] ? (
                <Badge variant="success">Ativo</Badge>
              ) : (
                <Badge variant="secondary">Bloqueado</Badge>
              )}
            </div>
          ))}
          <p className="pt-2 text-[12px] text-text-muted">
            Free → Starter (orçamento) → Pro (hero, materiais, destaque, ads) → Enterprise
            (time).
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Solicitar orçamento (público)</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <Button
            size="sm"
            variant={quoteOn ? "secondary" : "primary"}
            onClick={() => toggleQuote(!quoteOn)}
          >
            {quoteOn ? "Desativar botão" : "Ativar botão"}
          </Button>
          <span className="text-xs text-text-muted">Requer Starter+</span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hero estilo LinkedIn</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <input
            className="input"
            placeholder="Título do hero"
            value={hero.hero_title}
            onChange={(e) => setHero({ ...hero, hero_title: e.target.value })}
          />
          <input
            className="input"
            placeholder="Subtítulo"
            value={hero.hero_subtitle}
            onChange={(e) => setHero({ ...hero, hero_subtitle: e.target.value })}
          />
          <input
            className="input"
            placeholder="URL da imagem (upload S3/presign depois)"
            value={hero.hero_image_url}
            onChange={(e) => setHero({ ...hero, hero_image_url: e.target.value })}
          />
          <Button onClick={saveHero}>Salvar hero</Button>
          <p className="text-xs text-text-muted">Pro+ · sem plano = placeholder da plataforma</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Materiais baixáveis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <input
            className="input"
            placeholder="Título"
            value={material.title}
            onChange={(e) => setMaterial({ ...material, title: e.target.value })}
          />
          <input
            className="input"
            placeholder="URL do arquivo"
            value={material.file_url}
            onChange={(e) => setMaterial({ ...material, file_url: e.target.value })}
          />
          <Button onClick={addMaterial}>Publicar material</Button>
          <ul className="text-sm text-text-muted">
            {materials.map((m) => (
              <li key={m.id}>• {m.title}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
