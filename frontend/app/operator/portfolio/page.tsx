"use client";

import { useEffect, useState } from "react";
import { apiFetch, type ApiError } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type PortfolioItem = {
  id: string;
  title: string;
  description?: string;
  item_type: "gallery" | "before_after" | "ortho_sample" | "case_study";
  media_assets?: Array<{ url: string; caption?: string; gsd_cm?: number; sensor?: string }>;
  before_after_assets?: {
    before_url?: string;
    after_url?: string;
    before_label?: string;
    after_label?: string;
  };
  location_city?: string;
  location_state?: string;
  area_hectares?: number;
  featured?: boolean;
};

export default function OperatorPortfolioDashboardPage() {
  const { success, error: toastError } = useToast();

  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    item_type: "before_after" as PortfolioItem["item_type"],
    before_url: "",
    after_url: "",
    before_label: "Imagem Bruta de Campo",
    after_label: "Ortomosaico Processado",
    media_url: "",
    sensor: "",
    gsd_cm: "",
    location_city: "",
    location_state: "MT",
    area_hectares: "",
    featured: false,
  });
  const [busy, setBusy] = useState(false);

  function loadPortfolio() {
    setLoading(true);
    apiFetch<{ data: PortfolioItem[] }>("/operator/portfolio")
      .then((res) => setItems(res.data || []))
      .catch((err: ApiError) => setError(err.detail || err.title || "Erro ao carregar portfólio"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadPortfolio();
  }, []);

  function openCreate() {
    setEditingItem(null);
    setFormData({
      title: "",
      description: "",
      item_type: "before_after",
      before_url: "",
      after_url: "",
      before_label: "Imagem Bruta de Campo",
      after_label: "Ortomosaico Processado",
      media_url: "",
      sensor: "",
      gsd_cm: "",
      location_city: "",
      location_state: "MT",
      area_hectares: "",
      featured: false,
    });
    setModalOpen(true);
  }

  function openEdit(item: PortfolioItem) {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || "",
      item_type: item.item_type,
      before_url: item.before_after_assets?.before_url || "",
      after_url: item.before_after_assets?.after_url || "",
      before_label: item.before_after_assets?.before_label || "Imagem Bruta",
      after_label: item.before_after_assets?.after_label || "Processado",
      media_url: item.media_assets?.[0]?.url || "",
      sensor: item.media_assets?.[0]?.sensor || "",
      gsd_cm: item.media_assets?.[0]?.gsd_cm ? String(item.media_assets[0].gsd_cm) : "",
      location_city: item.location_city || "",
      location_state: item.location_state || "MT",
      area_hectares: item.area_hectares ? String(item.area_hectares) : "",
      featured: !!item.featured,
    });
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        portfolio_item: {
          title: formData.title,
          description: formData.description,
          item_type: formData.item_type,
          before_after_assets: {
            before_url: formData.before_url,
            after_url: formData.after_url,
            before_label: formData.before_label,
            after_label: formData.after_label,
          },
          media_assets: formData.media_url
            ? [
                {
                  url: formData.media_url,
                  sensor: formData.sensor,
                  gsd_cm: formData.gsd_cm ? parseFloat(formData.gsd_cm) : null,
                  caption: formData.title,
                },
              ]
            : [],
          location_city: formData.location_city,
          location_state: formData.location_state,
          area_hectares: formData.area_hectares ? parseFloat(formData.area_hectares) : null,
          featured: formData.featured,
        },
      };

      if (editingItem) {
        await apiFetch(`/operator/portfolio/${editingItem.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        success("Item do portfólio atualizado com sucesso!");
      } else {
        await apiFetch("/operator/portfolio", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        success("Novo item adicionado ao portfólio público!");
      }
      setModalOpen(false);
      loadPortfolio();
    } catch (err) {
      const apiErr = err as ApiError;
      toastError(apiErr.detail || apiErr.title || "Erro ao salvar item");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Deseja realmente excluir este item do portfólio?")) return;
    try {
      await apiFetch(`/operator/portfolio/${id}`, { method: "DELETE" });
      success("Item excluído com sucesso.");
      loadPortfolio();
    } catch (err) {
      const apiErr = err as ApiError;
      toastError(apiErr.detail || apiErr.title || "Erro ao excluir");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-text">Portfólio & Amostras de Dados</h1>
          <p className="mt-1 text-sm text-text-muted">
            Adicione entregas reais, comparadores Antes/Depois e amostras 4K para conquistar clientes corporativos.
          </p>
        </div>
        <Button onClick={openCreate}>+ Adicionar Novo Estudo / Amostra</Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-text-muted">Carregando portfólio…</div>
      ) : error ? (
        <div className="rounded-card border border-danger/30 bg-danger/5 p-6 text-danger text-center">
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-card border border-dashed border-border bg-surface p-12 text-center space-y-3">
          <span className="text-4xl block">📸</span>
          <h3 className="text-lg font-bold text-text">Seu portfólio está vazio</h3>
          <p className="text-sm text-text-muted max-w-md mx-auto">
            Operadores com portfólio visual recebem até 3.5x mais convites de missões fechadas e cotações.
          </p>
          <Button onClick={openCreate} className="mt-2">+ Criar Primeiro Item</Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-card border border-border bg-surface p-5 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-text text-sm">{item.title}</h3>
                <Badge variant={item.item_type === "before_after" ? "accent" : "outline"}>
                  {item.item_type === "before_after" ? "Antes/Depois" : "Galeria"}
                </Badge>
              </div>

              {item.description && (
                <p className="text-xs text-text-muted line-clamp-2">{item.description}</p>
              )}

              <div className="text-[11px] text-text-muted space-y-1 pt-2 border-t border-border">
                {item.location_city && <div>📍 {item.location_city}, {item.location_state}</div>}
                {item.area_hectares && <div>📐 {item.area_hectares} hectares</div>}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button size="sm" variant="outline" onClick={() => openEdit(item)}>Editar</Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(item.id)}>Excluir</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? "Editar Item" : "Novo Item de Portfólio"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text mb-1">Título do Projeto</label>
            <Input
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Levantamento Fazenda Bela Vista (350 ha)"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text mb-1">Tipo de Apresentação</label>
            <Select
              value={formData.item_type}
              onChange={(e) => setFormData({ ...formData, item_type: e.target.value as any })}
            >
              <option value="before_after">Slider Interativo Antes / Depois</option>
              <option value="ortho_sample">Amostra de Ortomosaico / Topografia</option>
              <option value="gallery">Galeria de Fotos 4K</option>
              <option value="case_study">Estudo de Caso Técnico</option>
            </Select>
          </div>

          {formData.item_type === "before_after" ? (
            <div className="grid gap-3 sm:grid-cols-2 p-3 rounded bg-surface-soft border border-border">
              <div>
                <label className="block text-xs font-medium text-text mb-1">URL Imagem Antes (Bruta)</label>
                <Input
                  required
                  value={formData.before_url}
                  onChange={(e) => setFormData({ ...formData, before_url: e.target.value })}
                  placeholder="https://.../campo_bruto.jpg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text mb-1">URL Imagem Depois (Ortomosaico)</label>
                <Input
                  required
                  value={formData.after_url}
                  onChange={(e) => setFormData({ ...formData, after_url: e.target.value })}
                  placeholder="https://.../ortomosaico_curvas.jpg"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-text mb-1">URL da Imagem / Amostra 4K</label>
              <Input
                required
                value={formData.media_url}
                onChange={(e) => setFormData({ ...formData, media_url: e.target.value })}
                placeholder="https://.../amostra_4k.jpg"
              />
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-text mb-1">Cidade</label>
              <Input
                value={formData.location_city}
                onChange={(e) => setFormData({ ...formData, location_city: e.target.value })}
                placeholder="Ex: Sorriso"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text mb-1">Área (ha)</label>
              <Input
                type="number"
                value={formData.area_hectares}
                onChange={(e) => setFormData({ ...formData, area_hectares: e.target.value })}
                placeholder="350"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text mb-1">GSD (cm/px)</label>
              <Input
                value={formData.gsd_cm}
                onChange={(e) => setFormData({ ...formData, gsd_cm: e.target.value })}
                placeholder="Ex: 2.8"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text mb-1">Descrição / Metodologia de Execução</label>
            <Textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva o sensor utilizado, objetivos do levantamento e benefícios gerados..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={busy}>Salvar Item</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
