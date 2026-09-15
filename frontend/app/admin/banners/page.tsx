"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { apiFetch, type ApiError } from "@/lib/api/client";

type Placement = {
  id: string;
  key: string;
  name: string;
  page_context: string;
  width_hint?: number;
  height_hint?: number;
};

type Banner = {
  id: string;
  name: string;
  status: string;
  title?: string;
  subtitle?: string;
  cta_label?: string;
  cta_url: string;
  image_url?: string;
  background_color?: string;
  text_color?: string;
  priority?: number;
  weight?: number;
  target_audience?: string;
  placement_keys?: string[];
  impression_count?: number;
  click_count?: number;
  ctr?: number;
  targeting?: { category_slugs?: string[] };
};

const emptyForm = {
  name: "",
  status: "draft",
  title: "",
  subtitle: "",
  cta_label: "Saiba mais",
  cta_url: "https://",
  image_url: "",
  background_color: "#10170D",
  text_color: "#F4F7F2",
  priority: 10,
  weight: 1,
  target_audience: "all",
  placement_keys: [] as string[],
  category_slugs: "",
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [b, p] = await Promise.all([
        apiFetch<{ data: Banner[] }>("/admin/banners"),
        apiFetch<{ data: Placement[] }>("/admin/banners/placements"),
      ]);
      setBanners(b.data || []);
      setPlacements(p.data || []);
    } catch (e) {
      const err = e as ApiError;
      setError(err.detail || err.title || "Acesso admin necessário");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function togglePlacement(key: string) {
    setForm((f) => ({
      ...f,
      placement_keys: f.placement_keys.includes(key)
        ? f.placement_keys.filter((k) => k !== key)
        : [...f.placement_keys, key],
    }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    const body = {
      banner: {
        name: form.name,
        status: form.status,
        title: form.title,
        subtitle: form.subtitle,
        cta_label: form.cta_label,
        cta_url: form.cta_url,
        image_url: form.image_url || null,
        background_color: form.background_color,
        text_color: form.text_color,
        priority: Number(form.priority),
        weight: Number(form.weight),
        target_audience: form.target_audience,
        placement_keys: form.placement_keys,
        targeting: {
          category_slugs: form.category_slugs
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        },
      },
    };
    try {
      if (editingId) {
        await apiFetch(`/admin/banners/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
      } else {
        await apiFetch("/admin/banners", {
          method: "POST",
          body: JSON.stringify(body),
        });
      }
      setForm(emptyForm);
      setEditingId(null);
      await load();
    } catch (e) {
      const err = e as ApiError;
      setError(err.detail || err.title || "Falha ao salvar");
    } finally {
      setSaving(false);
    }
  }

  function edit(b: Banner) {
    setEditingId(b.id);
    setForm({
      name: b.name,
      status: b.status,
      title: b.title || "",
      subtitle: b.subtitle || "",
      cta_label: b.cta_label || "Saiba mais",
      cta_url: b.cta_url,
      image_url: b.image_url || "",
      background_color: b.background_color || "#10170D",
      text_color: b.text_color || "#F4F7F2",
      priority: b.priority ?? 10,
      weight: b.weight ?? 1,
      target_audience: b.target_audience || "all",
      placement_keys: b.placement_keys || [],
      category_slugs: (b.targeting?.category_slugs || []).join(", "),
    });
  }

  async function endBanner(id: string) {
    try {
      await apiFetch(`/admin/banners/${id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      const err = e as ApiError;
      setError(err.detail || err.title || "Falha");
    }
  }

  const byContext = placements.reduce<Record<string, Placement[]>>((acc, p) => {
    (acc[p.page_context] ||= []).push(p);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold text-text">Banners & Ads</h1>
        <p className="mt-1 text-[15px] text-text-muted">
          Admin de domínio (não ActiveAdmin). Gerencie campanhas e slots da plataforma.
        </p>
      </div>

      {error && (
        <div className="rounded-input border border-danger/30 bg-danger/5 px-4 py-3 text-[14px] text-danger">
          {error}
        </div>
      )}

      <section className="card space-y-4">
        <h2 className="font-semibold text-text">
          {editingId ? "Editar campanha" : "Nova campanha"}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Nome interno</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Status</label>
            <select
              className="input"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {["draft", "scheduled", "active", "paused", "ended"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Título</label>
            <input
              className="input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <label className="label">CTA URL</label>
            <input
              className="input"
              value={form.cta_url}
              onChange={(e) => setForm({ ...form, cta_url: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Subtítulo</label>
            <input
              className="input"
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Image URL</label>
            <input
              className="input"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Categorias (slugs, vírgula)</label>
            <input
              className="input"
              placeholder="mapping, agriculture"
              value={form.category_slugs}
              onChange={(e) => setForm({ ...form, category_slugs: e.target.value })}
            />
          </div>
        </div>

        <div>
          <p className="label">Slots (placements)</p>
          <div className="mt-2 max-h-48 space-y-3 overflow-y-auto rounded-input border border-border p-3">
            {Object.entries(byContext).map(([ctx, list]) => (
              <div key={ctx}>
                <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
                  {ctx}
                </p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {list.map((p) => (
                    <label
                      key={p.key}
                      className={`cursor-pointer rounded-full border px-2.5 py-1 text-[12px] ${
                        form.placement_keys.includes(p.key)
                          ? "border-accent-ink bg-accent text-accent-ink"
                          : "border-border text-text-muted"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={form.placement_keys.includes(p.key)}
                        onChange={() => togglePlacement(p.key)}
                      />
                      {p.key}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button disabled={saving || !form.name || !form.cta_url} onClick={save}>
            {saving ? "Salvando…" : editingId ? "Atualizar" : "Criar"}
          </Button>
          {editingId && (
            <Button
              variant="ghost"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
            >
              Cancelar
            </Button>
          )}
        </div>
      </section>

      <section>
        <h2 className="font-semibold text-text">Campanhas</h2>
        <ul className="mt-4 divide-y divide-border rounded-card border border-border">
          {banners.length === 0 && (
            <li className="px-4 py-8 text-center text-[14px] text-text-muted">
              Nenhuma campanha. Rode db:migrate + db:seed ou crie acima.
            </li>
          )}
          {banners.map((b) => (
            <li
              key={b.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div>
                <p className="font-medium text-text">
                  {b.name}{" "}
                  <span className="text-[12px] font-normal text-text-muted">{b.status}</span>
                </p>
                <p className="text-[12px] text-text-muted">
                  impr. {b.impression_count ?? 0} · clicks {b.click_count ?? 0}
                  {b.ctr != null ? ` · CTR ${(b.ctr * 100).toFixed(2)}%` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => edit(b)}>
                  Editar
                </Button>
                {b.status !== "ended" && (
                  <Button size="sm" variant="ghost" onClick={() => endBanner(b.id)}>
                    Encerrar
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2 className="font-semibold text-text">Mapa de slots</h2>
        <p className="mt-1 text-[13px] text-text-muted">
          Pontos de inventário onde anunciantes podem comprar presença.
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 text-[13px]">
          {placements.map((p) => (
            <li key={p.key} className="rounded-input border border-border px-3 py-2">
              <span className="font-mono text-[11px] text-text-muted">{p.key}</span>
              <p className="text-text">{p.name}</p>
              <p className="text-text-muted">
                {p.width_hint}×{p.height_hint} · {p.page_context}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
