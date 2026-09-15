"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  onSave: (geojson: { type: string; coordinates: unknown }) => Promise<void>;
};

/** MVP AOI: paste GeoJSON or use sample rectangle (full map draw later). */
export function AoiEditor({ onSave }: Props) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [areaHint, setAreaHint] = useState<string | null>(null);

  function loadSample() {
    // Rough rectangle near Cuiabá region (demo only)
    const sample = {
      type: "Polygon" as const,
      coordinates: [
        [
          [-56.1, -15.6],
          [-56.0, -15.6],
          [-56.0, -15.5],
          [-56.1, -15.5],
          [-56.1, -15.6],
        ],
      ],
    };
    setText(JSON.stringify(sample, null, 2));
    setError(null);
  }

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      const parsed = JSON.parse(text);
      if (!parsed.type || !parsed.coordinates) {
        throw new Error("GeoJSON deve ter type e coordinates");
      }
      if (parsed.type !== "Polygon" && parsed.type !== "MultiPolygon") {
        throw new Error("Apenas Polygon ou MultiPolygon");
      }
      await onSave(parsed);
      setAreaHint("AOI enviado — área calculada no servidor (hectares)");
    } catch (e) {
      setError(e instanceof Error ? e.message : "GeoJSON inválido");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={loadSample}>
          Usar polígono exemplo (MT)
        </Button>
      </div>
      <textarea
        className="input min-h-[180px] font-mono text-[13px]"
        placeholder='Cole GeoJSON Polygon ou MultiPolygon…'
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      {error && <p className="text-[13px] text-danger">{error}</p>}
      {areaHint && <p className="text-[13px] text-success">{areaHint}</p>}
      <Button type="button" disabled={saving || !text.trim()} onClick={handleSave}>
        {saving ? "Salvando…" : "Salvar AOI"}
      </Button>
      <p className="text-[12px] text-text-muted">
        A área em hectares é calculada no backend (PostGIS). O mapa interativo completo fica fora do MVP mínimo.
      </p>
    </div>
  );
}
