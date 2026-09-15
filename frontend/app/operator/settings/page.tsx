"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch, type ApiError } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

type ProfileData = {
  id: string;
  slug: string;
  name?: string;
  headline?: string;
  about?: string;
  verification_status?: string;
  city?: string;
  state_code?: string;
  accepting_jobs?: boolean;
  searchable?: boolean;
  hero_banner_url?: string;
  avatar_url?: string;
  banner_headline?: string;
  banner_subtitle?: string;
  banner_badges?: string[];
  website_url?: string;
  linkedin_url?: string;
  instagram_url?: string;
  anac_sisant_status?: string;
  reta_insurance_status?: string;
  mop_status?: string;
  canac_pilots_count?: number;
  rating_average?: number | null;
  rating_count?: number;
  missions_completed?: number;
};

const BANNER_PRESETS = [
  {
    name: "Infraestrutura & Obras",
    url: "/images/operator-hero-banner.jpg",
    thumb: "🏗️",
  },
  {
    name: "Usina Solar Fotovoltaica",
    url: "/images/solar-plant.jpg",
    thumb: "☀️",
  },
  {
    name: "Mineração & Cava",
    url: "/images/mining-pit.jpg",
    thumb: "⛰️",
  },
  {
    name: "Linhas de Transmissão",
    url: "/images/transmission-lines.jpg",
    thumb: "⚡",
  },
];

const AVATAR_PRESETS = [
  {
    name: "Nuvem Geo",
    url: "/images/nuvem-geo-logo.png",
    thumb: "🟢",
  },
  {
    name: "OEST Dark",
    url: "/images/oest-logo.png",
    thumb: "🔷",
  },
];

export default function OperatorSettingsPage() {
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  const [form, setForm] = useState({
    name: "",
    headline: "",
    about: "",
    city: "",
    state_code: "",
    hero_banner_url: "/images/operator-hero-banner.jpg",
    avatar_url: "/images/nuvem-geo-logo.png",
    banner_headline: "Dados do mundo real. Decisões de alto impacto.",
    banner_subtitle: "Mapeamento aéreo, LiDAR e inteligência geoespacial para infraestrutura, engenharia e grandes projetos.",
    banner_badges_raw: "Todo o Brasil, Alta Precisão, Resultados Comprovados",
    website_url: "https://www.aerovision.com.br",
    linkedin_url: "https://linkedin.com/company/aerovision-drones",
    instagram_url: "https://instagram.com/aerovision.drones",
    anac_sisant_status: "Regular",
    reta_insurance_status: "Ativo",
    mop_status: "Conforme",
    canac_pilots_count: 2,
    accepting_jobs: true,
    searchable: true,
  });

  useEffect(() => {
    setLoading(true);
    apiFetch<{ data: ProfileData }>("/operator/profile")
      .then((res) => {
        const d = res.data;
        setProfile(d);
        setForm({
          name: d.name || "AeroVision Geotecnologia",
          headline: d.headline || "",
          about: d.about || "",
          city: d.city || "Sinop",
          state_code: d.state_code || "MT",
          hero_banner_url: d.hero_banner_url || "/images/operator-hero-banner.jpg",
          avatar_url: d.avatar_url || "/images/nuvem-geo-logo.png",
          banner_headline: d.banner_headline || "Dados do mundo real. Decisões de alto impacto.",
          banner_subtitle:
            d.banner_subtitle ||
            "Mapeamento aéreo, LiDAR e inteligência geoespacial para infraestrutura, engenharia e grandes projetos.",
          banner_badges_raw: (d.banner_badges || ["Todo o Brasil", "Alta Precisão", "Resultados Comprovados"]).join(", "),
          website_url: d.website_url || "https://www.aerovision.com.br",
          linkedin_url: d.linkedin_url || "https://linkedin.com/company/aerovision-drones",
          instagram_url: d.instagram_url || "https://instagram.com/aerovision.drones",
          anac_sisant_status: d.anac_sisant_status || "Regular",
          reta_insurance_status: d.reta_insurance_status || "Ativo",
          mop_status: d.mop_status || "Conforme",
          canac_pilots_count: d.canac_pilots_count || 2,
          accepting_jobs: d.accepting_jobs !== false,
          searchable: d.searchable !== false,
        });
      })
      .catch((err: ApiError) => {
        toastError("Erro ao carregar perfil", err.detail || err.title);
      })
      .finally(() => setLoading(false));
  }, [toastError]);

  // Handle local file upload for Banner (converts to DataURL for immediate browser preview & storage)
  function handleBannerFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setForm((prev) => ({ ...prev, hero_banner_url: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  }

  // Handle local file upload for Avatar/Logo
  function handleAvatarFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setForm((prev) => ({ ...prev, avatar_url: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const badges = form.banner_badges_raw
        .split(",")
        .map((b) => b.trim())
        .filter(Boolean);

      await apiFetch("/operator/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name: form.name,
          headline: form.headline,
          about: form.about,
          city: form.city,
          state_code: form.state_code,
          hero_banner_url: form.hero_banner_url,
          avatar_url: form.avatar_url,
          banner_headline: form.banner_headline,
          banner_subtitle: form.banner_subtitle,
          banner_badges: badges,
          website_url: form.website_url,
          linkedin_url: form.linkedin_url,
          instagram_url: form.instagram_url,
          anac_sisant_status: form.anac_sisant_status,
          reta_insurance_status: form.reta_insurance_status,
          mop_status: form.mop_status,
          canac_pilots_count: Number(form.canac_pilots_count) || 2,
          accepting_jobs: form.accepting_jobs,
          searchable: form.searchable,
        }),
      });

      success("Perfil e Assets Salvos!", "As imagens, banner e dados foram atualizados na sua página pública.");
    } catch (err) {
      const e = err as ApiError;
      toastError("Falha ao atualizar", e.detail || e.title);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl py-8">
        <div className="h-64 animate-pulse rounded-card bg-surface border border-border" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16">
      {/* Header with Title & Quick Link to Public Page */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-text">Gestão & Customização do Perfil</h1>
          <p className="mt-1 text-sm text-text-muted">
            Personalize seu Hero Banner panorâmico, logomarca, textos de impacto e compliance regulatório exibidos na página pública.
          </p>
        </div>
        {profile?.slug && (
          <Link
            href={`/operators/${profile.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#2A57B8] px-4 py-2 text-xs font-semibold text-[#2A57B8] transition hover:bg-[#2A57B8]/10"
          >
            <span>Ver Página Pública</span>
            <span>↗</span>
          </Link>
        )}
      </div>

      {/* LIVE PREVIEW BANNER (LinkedIn Style) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Pré-visualização em Tempo Real (Estilo LinkedIn Company Page)
          </h2>
          <span className="text-[11px] text-emerald-700 font-medium">● Atualização ao vivo</span>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
          {/* Panoramic Cover */}
          <div className="relative h-44 sm:h-56 w-full overflow-hidden bg-oest-navy">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${form.hero_banner_url})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-oest-ink/90 via-oest-ink/60 to-transparent" />
            <div className="relative z-10 flex h-full flex-col justify-center px-6 sm:px-8">
              <h3 className="text-lg sm:text-2xl font-bold text-white leading-tight max-w-lg">
                {form.banner_headline || "Dados do mundo real. Decisões de alto impacto."}
              </h3>
              <p className="text-xs text-white/80 mt-1 max-w-md line-clamp-2">
                {form.banner_subtitle}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {form.banner_badges_raw.split(",").slice(0, 3).map((b, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-black/40 border border-white/20 px-2.5 py-0.5 text-[10px] text-white backdrop-blur-xs"
                  >
                    {b.trim()}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Profile Card Header with Overlapping Logo */}
          <div className="relative p-5 sm:p-6 bg-surface">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="relative -mt-12 sm:-mt-16 h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-xl border-4 border-white bg-white p-1.5 shadow-lg">
                <img
                  src={form.avatar_url}
                  alt="Avatar Preview"
                  className="h-full w-full rounded-lg object-contain"
                />
              </div>

              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-base sm:text-lg font-bold text-text truncate">
                    {form.name}
                  </h4>
                  <span className="rounded-full bg-[#b6ff55] px-2 py-0.5 text-[10px] font-bold text-[#10170d]">
                    Homologado ANAC ✓
                  </span>
                </div>
                <p className="text-xs text-text-muted">{form.headline || "Especialista em Drones e Geotecnologia"}</p>
                <div className="flex items-center gap-3 text-[11px] text-text-muted pt-0.5">
                  <span>📍 {form.city}, {form.state_code}</span>
                  <span>⭐ 4.9 (119 avaliações)</span>
                  <span>💼 26 missões</span>
                </div>
              </div>

              <div className="flex gap-2 shrink-0">
                <span className="inline-flex items-center rounded-md bg-[#b6ff55] px-3.5 py-2 text-xs font-bold text-[#10170d]">
                  ⚡ Solicitar Cotação
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FORM SECTIONS */}
      <form onSubmit={handleSave} className="space-y-8">
        {/* SECTION 1: Visual Assets (Banner & Avatar) */}
        <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-border pb-3">
            <h2 className="text-base font-bold text-text">01. Apresentação Visual (Banner & Logomarca)</h2>
            <p className="text-xs text-text-muted mt-0.5">
              Suba suas próprias fotos de operações ou selecione presets profissionais de alta resolução.
            </p>
          </div>

          {/* Hero Banner Controls */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-text">
              Hero Cover Banner (Panorâmico)
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleBannerFileUpload}
                id="banner-file-input"
                className="hidden"
              />
              <label
                htmlFor="banner-file-input"
                className="btn-secondary cursor-pointer text-xs font-semibold py-2.5 px-4 rounded-lg flex items-center gap-2 border border-border hover:bg-surface-soft"
              >
                <span>📁</span>
                <span>Fazer Upload de Novo Banner</span>
              </label>
              <span className="text-xs text-text-muted">ou escolha um preset temático:</span>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 pt-1">
              {BANNER_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.name}
                  onClick={() => setForm({ ...form, hero_banner_url: preset.url })}
                  className={`flex items-center gap-2 rounded-lg border p-2.5 text-left text-xs transition ${
                    form.hero_banner_url === preset.url
                      ? "border-[#2A57B8] bg-[#2A57B8]/10 font-bold text-[#2A57B8]"
                      : "border-border bg-surface hover:bg-surface-soft text-text"
                  }`}
                >
                  <span className="text-base">{preset.thumb}</span>
                  <span className="truncate">{preset.name}</span>
                </button>
              ))}
            </div>

            <Input
              label="Ou informe a URL direta do Banner"
              value={form.hero_banner_url}
              onChange={(e) => setForm({ ...form, hero_banner_url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          {/* Avatar / Logo Controls */}
          <div className="space-y-3 pt-4 border-t border-border">
            <label className="text-xs font-bold uppercase tracking-wider text-text">
              Logomarca / Avatar da Empresa
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarFileUpload}
                id="avatar-file-input"
                className="hidden"
              />
              <label
                htmlFor="avatar-file-input"
                className="btn-secondary cursor-pointer text-xs font-semibold py-2.5 px-4 rounded-lg flex items-center gap-2 border border-border hover:bg-surface-soft"
              >
                <span>🖼️</span>
                <span>Fazer Upload de Logomarca</span>
              </label>
              <span className="text-xs text-text-muted">ou selecione um modelo:</span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 pt-1">
              {AVATAR_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.name}
                  onClick={() => setForm({ ...form, avatar_url: preset.url })}
                  className={`flex items-center gap-2 rounded-lg border p-2.5 text-left text-xs transition ${
                    form.avatar_url === preset.url
                      ? "border-[#2A57B8] bg-[#2A57B8]/10 font-bold text-[#2A57B8]"
                      : "border-border bg-surface hover:bg-surface-soft text-text"
                  }`}
                >
                  <span className="text-base">{preset.thumb}</span>
                  <span className="truncate">{preset.name}</span>
                </button>
              ))}
            </div>

            <Input
              label="Ou informe a URL direta da Logomarca"
              value={form.avatar_url}
              onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          {/* Banner Text Overlays */}
          <div className="grid gap-4 sm:grid-cols-2 pt-4 border-t border-border">
            <Input
              label="Título de Destaque no Banner"
              placeholder="Ex: Dados do mundo real. Decisões de alto impacto."
              value={form.banner_headline}
              onChange={(e) => setForm({ ...form, banner_headline: e.target.value })}
            />

            <Input
              label="Badges de Destaque (separados por vírgula)"
              placeholder="Ex: Todo o Brasil, Alta Precisão, Resultados Comprovados"
              value={form.banner_badges_raw}
              onChange={(e) => setForm({ ...form, banner_badges_raw: e.target.value })}
            />
          </div>

          <Textarea
            label="Subtítulo no Banner"
            placeholder="Mapeamento aéreo, LiDAR e inteligência geoespacial para infraestrutura, engenharia e grandes projetos."
            rows={2}
            value={form.banner_subtitle}
            onChange={(e) => setForm({ ...form, banner_subtitle: e.target.value })}
          />
        </div>

        {/* SECTION 2: General & Company Info */}
        <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-border pb-3">
            <h2 className="text-base font-bold text-text">02. Informações Gerais & Localização</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Nome Comercial da Empresa"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <Input
              label="Headline Profissional"
              placeholder="Ex: Nuvem de Pontos LiDAR, DTM e Acompanhamento de Obras"
              value={form.headline}
              onChange={(e) => setForm({ ...form, headline: e.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Cidade Sede"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />

            <Input
              label="Estado (UF)"
              value={form.state_code}
              onChange={(e) => setForm({ ...form, state_code: e.target.value.toUpperCase() })}
              maxLength={2}
            />
          </div>

          <Textarea
            label="Sobre a Operação"
            rows={4}
            value={form.about}
            onChange={(e) => setForm({ ...form, about: e.target.value })}
            placeholder="Apresente sua estrutura, anos de atuação no mercado, tecnologias e segmentos atendidos..."
          />

          <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-border">
            <Checkbox
              label="Recebendo novas missões e cotações"
              description="Sua empresa aparecerá como 'Disponível para novas missões'."
              checked={form.accepting_jobs}
              onChange={(e) => setForm({ ...form, accepting_jobs: e.target.checked })}
            />

            <Checkbox
              label="Visível no Marketplace público"
              description="Listar nos diretórios públicos e buscas geoespaciais."
              checked={form.searchable}
              onChange={(e) => setForm({ ...form, searchable: e.target.checked })}
            />
          </div>
        </div>

        {/* SECTION 3: Social & Web Links */}
        <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-border pb-3">
            <h2 className="text-base font-bold text-text">03. Contatos & Redes Sociais</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Website Oficial"
              placeholder="https://www.nuvemgeo.com.br"
              value={form.website_url}
              onChange={(e) => setForm({ ...form, website_url: e.target.value })}
            />

            <Input
              label="LinkedIn da Empresa"
              placeholder="https://linkedin.com/company/nuvemgeo"
              value={form.linkedin_url}
              onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
            />

            <Input
              label="Instagram"
              placeholder="https://instagram.com/nuvemgeo"
              value={form.instagram_url}
              onChange={(e) => setForm({ ...form, instagram_url: e.target.value })}
            />
          </div>
        </div>

        {/* SECTION 4: ANAC Compliance */}
        <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-border pb-3">
            <h2 className="text-base font-bold text-text">04. Tripulação & Compliance ANAC</h2>
            <p className="text-xs text-text-muted mt-0.5">
              Certificações exibidas na aba de Visão Geral & Frota para empresas contratantes.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <Input
              label="Registro ANAC (SISANT)"
              value={form.anac_sisant_status}
              onChange={(e) => setForm({ ...form, anac_sisant_status: e.target.value })}
            />

            <Input
              label="Seguro Obrigatório (RETA)"
              value={form.reta_insurance_status}
              onChange={(e) => setForm({ ...form, reta_insurance_status: e.target.value })}
            />

            <Input
              label="Manual de Operações (MOP)"
              value={form.mop_status}
              onChange={(e) => setForm({ ...form, mop_status: e.target.value })}
            />

            <Input
              label="Pilotos Habilitados (CANAC)"
              type="number"
              value={String(form.canac_pilots_count)}
              onChange={(e) => setForm({ ...form, canac_pilots_count: Number(e.target.value) })}
            />
          </div>
        </div>

        {/* Sticky Actions Bar */}
        <div className="sticky bottom-4 flex items-center justify-between rounded-xl border border-border bg-white/95 p-4 shadow-xl backdrop-blur-md">
          <div className="text-xs text-text-muted">
            Clique em salvar para atualizar sua página pública instantaneamente.
          </div>
          <div className="flex items-center gap-3">
            {profile?.slug && (
              <Link
                href={`/operators/${profile.slug}`}
                target="_blank"
                className="text-xs font-semibold text-[#2A57B8] hover:underline"
              >
                Visualizar Perfil ↗
              </Link>
            )}
            <Button type="submit" disabled={busy} className="bg-[#b6ff55] text-[#10170d] font-bold px-6 py-2.5">
              {busy ? "Salvando…" : "Salvar Alterações"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
