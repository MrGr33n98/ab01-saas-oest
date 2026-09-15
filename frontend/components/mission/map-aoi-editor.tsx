"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type GeoJson = { type: string; coordinates: unknown };

type Props = {
  onSave: (geojson: GeoJson) => Promise<void>;
  initialAreaHa?: number | null;
};

/**
 * MVP map AOI: Leaflet via CDN (no extra npm dep in scaffold).
 * Draw rectangle roughly by clicking two corners, or paste GeoJSON / import text.
 * Hectares always come from server after save.
 */
export function MapAoiEditor({ onSave, initialAreaHa }: Props) {
  const mapId = useId().replace(/:/g, "");
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<{
    map: unknown;
    rect: unknown;
    L: typeof window extends { L: infer L } ? L : unknown;
  } | null>(null);
  const [corners, setCorners] = useState<[number, number][]>([]);
  const [geoText, setGeoText] = useState("");
  const [mode, setMode] = useState<"map" | "geojson">("map");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [areaHa, setAreaHa] = useState<number | null>(initialAreaHa ?? null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (mode !== "map") return;
    let cancelled = false;

    async function boot() {
      // Load Leaflet CSS/JS once
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }
      // @ts-expect-error dynamic
      if (!window.L) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          s.onload = () => resolve();
          s.onerror = () => reject(new Error("Falha ao carregar mapa"));
          document.body.appendChild(s);
        });
      }
      if (cancelled || !mapRef.current) return;
      // @ts-expect-error Leaflet global
      const L = window.L;
      const map = L.map(mapRef.current).setView([-15.55, -56.05], 10);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);
      leafletRef.current = { map, rect: null, L };
      setMapReady(true);

      map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
        setCorners((prev) => {
          const next: [number, number][] =
            prev.length >= 2
              ? [[e.latlng.lng, e.latlng.lat]]
              : [...prev, [e.latlng.lng, e.latlng.lat]];
          return next;
        });
      });
    }

    boot().catch((e) => setError(e.message));
    return () => {
      cancelled = true;
      try {
        // @ts-expect-error cleanup
        leafletRef.current?.map?.remove?.();
      } catch {
        /* ignore */
      }
      leafletRef.current = null;
    };
  }, [mode]);

  useEffect(() => {
    const ctx = leafletRef.current;
    if (!ctx || corners.length < 2) return;
    // @ts-expect-error L
    const L = ctx.L || window.L;
    const [a, b] = corners;
    const bounds = [
      [Math.min(a[1], b[1]), Math.min(a[0], b[0])],
      [Math.max(a[1], b[1]), Math.max(a[0], b[0])],
    ];
    // @ts-ignore
    if (ctx.rect) ctx.map.removeLayer(ctx.rect);
    const rect = L.rectangle(bounds, { color: "#10170D", weight: 2, fillOpacity: 0.15 }).addTo(ctx.map);
    // @ts-expect-error leaflet
    ctx.map.fitBounds(rect.getBounds(), { padding: [24, 24] });
    leafletRef.current = { ...ctx, rect };
  }, [corners]);

  const rectangleToPolygon = useCallback((): GeoJson | null => {
    if (corners.length < 2) return null;
    const [a, b] = corners;
    const minLng = Math.min(a[0], b[0]);
    const maxLng = Math.max(a[0], b[0]);
    const minLat = Math.min(a[1], b[1]);
    const maxLat = Math.max(a[1], b[1]);
    return {
      type: "Polygon",
      coordinates: [[
        [minLng, minLat],
        [maxLng, minLat],
        [maxLng, maxLat],
        [minLng, maxLat],
        [minLng, minLat],
      ]],
    };
  }, [corners]);

  async function handleSaveMap() {
    setError(null);
    const geo = rectangleToPolygon();
    if (!geo) {
      setError("Clique dois cantos no mapa para definir o retângulo da AOI");
      return;
    }
    setSaving(true);
    try {
      await onSave(geo);
      setAreaHa(null); // parent updates from server
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao salvar AOI");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveGeoJson() {
    setError(null);
    setSaving(true);
    try {
      const parsed = JSON.parse(geoText);
      if (!parsed.type || !parsed.coordinates) throw new Error("GeoJSON inválido");
      if (parsed.type !== "Polygon" && parsed.type !== "MultiPolygon") {
        throw new Error("Use Polygon ou MultiPolygon");
      }
      await onSave(parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : "GeoJSON inválido");
    } finally {
      setSaving(false);
    }
  }

  function onFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      // KML minimal extract — full KMZ needs unzip; MVP accepts GeoJSON file or raw KML coordinates note
      if (file.name.endsWith(".geojson") || file.name.endsWith(".json") || text.trim().startsWith("{")) {
        setGeoText(text);
        setMode("geojson");
        return;
      }
      setError("MVP: envie .geojson/.json. KML/KMZ completo na próxima iteração — ou cole GeoJSON.");
    };
    reader.readAsText(file);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={mode === "map" ? "primary" : "secondary"}
          onClick={() => setMode("map")}
        >
          Mapa
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === "geojson" ? "primary" : "secondary"}
          onClick={() => setMode("geojson")}
        >
          GeoJSON / arquivo
        </Button>
      </div>

      {mode === "map" && (
        <>
          <p className="text-[13px] text-text-muted">
            Clique <strong>dois cantos</strong> para desenhar um retângulo sobre a área.
            A área em hectares é calculada no servidor (PostGIS).
          </p>
          <div
            ref={mapRef}
            id={`map-${mapId}`}
            className="h-72 w-full overflow-hidden rounded-card border border-border bg-surface-soft"
          />
          {!mapReady && (
            <p className="text-[13px] text-text-muted">Carregando mapa…</p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setCorners([])}>
              Limpar
            </Button>
            <Button type="button" disabled={saving || corners.length < 2} onClick={handleSaveMap}>
              {saving ? "Salvando…" : "Salvar AOI do mapa"}
            </Button>
          </div>
        </>
      )}

      {mode === "geojson" && (
        <>
          <input
            type="file"
            accept=".geojson,.json,application/geo+json,application/json"
            className="text-[13px] text-text-muted"
            onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
          />
          <textarea
            className="input min-h-[160px] font-mono text-[12px]"
            placeholder="Cole GeoJSON Polygon ou MultiPolygon"
            value={geoText}
            onChange={(e) => setGeoText(e.target.value)}
          />
          <Button type="button" disabled={saving || !geoText.trim()} onClick={handleSaveGeoJson}>
            {saving ? "Salvando…" : "Salvar AOI"}
          </Button>
        </>
      )}

      {areaHa != null && (
        <p className="text-[14px] text-text">
          Área (servidor):{" "}
          <span className="font-semibold tabular-nums">{areaHa} ha</span>
        </p>
      )}
      {error && <p className="text-[13px] text-danger">{error}</p>}
    </div>
  );
}
