"use client";

import { useState } from "react";
import { MapPin, Maximize2, Target, Camera } from "lucide-react";
import { BeforeAfterSlider } from "./before-after-slider";
import { Badge } from "@/components/ui/badge";

export type PortfolioItemData = {
  id: string;
  title: string;
  description?: string;
  item_type: "gallery" | "before_after" | "ortho_sample" | "case_study";
  media_assets?: Array<{ url: string; type?: string; caption?: string; gsd_cm?: number; sensor?: string }>;
  before_after_assets?: {
    before_url?: string;
    after_url?: string;
    before_label?: string;
    after_label?: string;
  };
  location_city?: string;
  location_state?: string;
  area_hectares?: number;
  category_name?: string;
  featured?: boolean;
};

export function PortfolioGallery({ items = [] }: { items: PortfolioItemData[] }) {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<PortfolioItemData | null>(null);

  const filteredItems = items.filter((item) => {
    if (activeFilter === "all") return true;
    return item.item_type === activeFilter;
  });

  if (!items || items.length === 0) {
    return (
      <div className="rounded-card border border-border bg-surface p-8 text-center text-text-muted">
        <span className="text-3xl block mb-2">📸</span>
        <p className="text-sm font-medium">Portfólio em atualização pelo operador.</p>
        <p className="text-xs mt-1">Amostras de dados e estudos de caso serão exibidos aqui.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2 text-xs">
        <button
          onClick={() => setActiveFilter("all")}
          className={`rounded-full px-3 py-1.5 font-medium transition ${
            activeFilter === "all"
              ? "bg-primary text-primary-fg"
              : "bg-surface border border-border text-text-muted hover:text-text"
          }`}
        >
          Todos ({items.length})
        </button>
        <button
          onClick={() => setActiveFilter("before_after")}
          className={`rounded-full px-3 py-1.5 font-medium transition ${
            activeFilter === "before_after"
              ? "bg-primary text-primary-fg"
              : "bg-surface border border-border text-text-muted hover:text-text"
          }`}
        >
          Antes & Depois
        </button>
        <button
          onClick={() => setActiveFilter("ortho_sample")}
          className={`rounded-full px-3 py-1.5 font-medium transition ${
            activeFilter === "ortho_sample"
              ? "bg-primary text-primary-fg"
              : "bg-surface border border-border text-text-muted hover:text-text"
          }`}
        >
          Ortomosaicos & Topografia
        </button>
        <button
          onClick={() => setActiveFilter("case_study")}
          className={`rounded-full px-3 py-1.5 font-medium transition ${
            activeFilter === "case_study"
              ? "bg-primary text-primary-fg"
              : "bg-surface border border-border text-text-muted hover:text-text"
          }`}
        >
          Estudos de Caso
        </button>
      </div>

      {/* Grid of Portfolio Items */}
      <div className="grid gap-6 sm:grid-cols-2">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="group overflow-hidden rounded-card border border-border bg-surface shadow-sm transition hover:border-border-strong hover:shadow-md"
          >
            {item.item_type === "before_after" && item.before_after_assets?.before_url && item.before_after_assets?.after_url ? (
              <div className="p-3">
                <BeforeAfterSlider
                  beforeUrl={item.before_after_assets.before_url}
                  afterUrl={item.before_after_assets.after_url}
                  beforeLabel={item.before_after_assets.before_label}
                  afterLabel={item.before_after_assets.after_label}
                />
              </div>
            ) : (
              <div
                className="relative aspect-video w-full cursor-pointer overflow-hidden bg-surface-soft"
                onClick={() => setSelectedItem(item)}
              >
                {item.media_assets?.[0]?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.media_assets[0].url}
                    alt={item.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-text-muted text-sm">
                    Visualização 4K
                  </div>
                )}
                {item.featured && (
                  <div className="absolute top-2 left-2">
                    <Badge variant="accent">Destaque</Badge>
                  </div>
                )}
              </div>
            )}

            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-text text-sm group-hover:text-primary transition">
                  {item.title}
                </h3>
                {item.category_name && (
                  <span className="text-[11px] font-medium text-text-muted">
                    {item.category_name}
                  </span>
                )}
              </div>

              {item.description && (
                <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-text-muted border-t border-border/50">
                {(item.location_city || item.location_state) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{item.location_city ? `${item.location_city}, ` : ""}{item.location_state}</span>
                  </span>
                )}
                {item.area_hectares && (
                  <span className="flex items-center gap-1">
                    <Maximize2 className="h-3 w-3" />
                    <span>{item.area_hectares} ha</span>
                  </span>
                )}
                {item.media_assets?.[0]?.gsd_cm && (
                  <span className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    <span>GSD {item.media_assets[0].gsd_cm} cm/px</span>
                  </span>
                )}
                {item.media_assets?.[0]?.sensor && (
                  <span className="flex items-center gap-1">
                    <Camera className="h-3 w-3" />
                    <span className="truncate max-w-[160px]">{item.media_assets[0].sensor}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative max-w-3xl w-full rounded-card border border-border bg-surface p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-text">{selectedItem.title}</h2>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-text-muted hover:text-text text-xl"
              >
                ✕
              </button>
            </div>

            {selectedItem.media_assets?.[0]?.url && (
              <div className="overflow-hidden rounded-md max-h-[65vh] flex items-center justify-center bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedItem.media_assets[0].url}
                  alt={selectedItem.title}
                  className="max-h-[60vh] w-auto object-contain"
                />
              </div>
            )}

            {selectedItem.description && (
              <p className="text-sm text-text-muted leading-relaxed">
                {selectedItem.description}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
