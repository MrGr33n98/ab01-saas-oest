"use client";

import { ChevronDown, LayoutGrid, List, Map } from "lucide-react";

export type ViewMode = "grid" | "list" | "map";

export function CategoryFilters({
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  locationFilter,
  onLocationChange,
}: {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  locationFilter: string;
  onLocationChange: (loc: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      {/* Filter Dropdown Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Localização */}
        <div className="relative inline-block">
          <select
            value={locationFilter}
            onChange={(e) => onLocationChange(e.target.value)}
            className="h-8 appearance-none rounded-md border border-border bg-surface pl-3 pr-7 text-[12px] font-medium text-text hover:bg-surface-soft focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="">Localização</option>
            <option value="SP">São Paulo (SP)</option>
            <option value="MT">Mato Grosso (MT)</option>
            <option value="MG">Minas Gerais (MG)</option>
            <option value="PR">Paraná (PR)</option>
            <option value="GO">Goiás (GO)</option>
            <option value="RS">Rio Grande do Sul (RS)</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
        </div>

        {/* Serviços */}
        <div className="relative inline-block">
          <select
            className="h-8 appearance-none rounded-md border border-border bg-surface pl-3 pr-7 text-[12px] font-medium text-text hover:bg-surface-soft focus:outline-none focus:ring-1 focus:ring-accent"
            defaultValue=""
          >
            <option value="">Serviços</option>
            <option value="lidar">LiDAR Aéreo</option>
            <option value="fotogrametria">Fotogrametria</option>
            <option value="inspecao">Inspeção Visual / Térmica</option>
            <option value="topografia">Topografia / DTM</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
        </div>

        {/* Certificações */}
        <div className="relative inline-block">
          <select
            className="h-8 appearance-none rounded-md border border-border bg-surface pl-3 pr-7 text-[12px] font-medium text-text hover:bg-surface-soft focus:outline-none focus:ring-1 focus:ring-accent"
            defaultValue=""
          >
            <option value="">Certificações</option>
            <option value="anac">Homologado ANAC</option>
            <option value="decea">DECEA / SARPAS</option>
            <option value="crea">CREA / ART Registrado</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
        </div>

        {/* Disponibilidade */}
        <div className="relative inline-block">
          <select
            className="h-8 appearance-none rounded-md border border-border bg-surface pl-3 pr-7 text-[12px] font-medium text-text hover:bg-surface-soft focus:outline-none focus:ring-1 focus:ring-accent"
            defaultValue=""
          >
            <option value="">Disponibilidade</option>
            <option value="immediate">Disponível agora</option>
            <option value="7days">Próximos 7 dias</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
        </div>

        {/* Faixa de preço */}
        <div className="relative inline-block">
          <select
            className="h-8 appearance-none rounded-md border border-border bg-surface pl-3 pr-7 text-[12px] font-medium text-text hover:bg-surface-soft focus:outline-none focus:ring-1 focus:ring-accent"
            defaultValue=""
          >
            <option value="">Faixa de preço</option>
            <option value="under_5k">Até R$ 5.000</option>
            <option value="5k_15k">R$ 5.000 – R$ 15.000</option>
            <option value="above_15k">Acima de R$ 15.000</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
        </div>
      </div>

      {/* Right Controls: Sort & View Mode */}
      <div className="flex items-center justify-between gap-3 lg:justify-end">
        {/* Sort */}
        <div className="flex items-center gap-1.5 text-[12px] text-text-muted">
          <span className="hidden sm:inline">Ordenar por:</span>
          <div className="relative inline-block">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="h-8 appearance-none rounded-md border border-border bg-surface pl-2.5 pr-6 text-[12px] font-medium text-text hover:bg-surface-soft focus:outline-none"
            >
              <option value="relevance">Mais relevantes</option>
              <option value="rating">Melhor avaliação</option>
              <option value="missions">Mais missões feitas</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
          </div>
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="flex items-center rounded-md border border-border bg-surface p-0.5">
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            className={`p-1.5 rounded transition ${
              viewMode === "list"
                ? "bg-[#EBF7EE] text-[#1A9E60]"
                : "text-text-muted hover:text-text"
            }`}
            title="Visualização em Lista"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className={`p-1.5 rounded transition ${
              viewMode === "grid"
                ? "bg-[#EBF7EE] text-[#1A9E60]"
                : "text-text-muted hover:text-text"
            }`}
            title="Visualização em Grade"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("map")}
            className={`p-1.5 rounded transition ${
              viewMode === "map"
                ? "bg-[#EBF7EE] text-[#1A9E60]"
                : "text-text-muted hover:text-text"
            }`}
            title="Visualização no Mapa"
          >
            <Map className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
