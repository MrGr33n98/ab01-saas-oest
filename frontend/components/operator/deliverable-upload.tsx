"use client";

import { useState } from "react";
import { apiFetch, type ApiError } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DeliverableUploadProps {
  missionId: string;
  onSuccess?: () => void;
}

export function DeliverableUpload({ missionId, onSuccess }: DeliverableUploadProps) {
  const { success, error: toastError } = useToast();

  const [title, setTitle] = useState("");
  const [dataProductId, setDataProductId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setProgress(10);
    try {
      // 1. Create upload session
      const sessionRes = await apiFetch<{
        data: { asset_id: string; upload_url: string; storage_key: string };
      }>(`/missions/${missionId}/deliverables/upload-sessions`, {
        method: "POST",
        body: JSON.stringify({
          filename: file.name,
          content_type: file.type || "application/octet-stream",
          byte_size: file.size,
        }),
      });

      setProgress(50);
      const { storage_key, upload_url } = sessionRes.data;

      // 2. Upload to storage url (or simulate in local dev if mock url)
      if (upload_url && !upload_url.includes("example.com")) {
        await fetch(upload_url, {
          method: "PUT",
          headers: { "Content-Type": file.type || "application/octet-stream" },
          body: file,
        });
      }

      setProgress(85);

      // 3. Finalize deliverable
      await apiFetch(`/missions/${missionId}/deliverables/finalize`, {
        method: "POST",
        body: JSON.stringify({
          data_product_id: dataProductId || "orthomosaic-geotiff",
          title: title || file.name,
          storage_key: storage_key,
          file_size_bytes: file.size,
          checksum_sha256: "mock-sha256-" + Date.now(),
        }),
      });

      setProgress(100);
      success("Entregável enviado!", "Os dados foram enviados para conferência do cliente.");
      setTitle("");
      setFile(null);
      onSuccess?.();
    } catch (err) {
      const e = err as ApiError;
      toastError("Falha no envio do entregável", e.detail || e.title);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-card border border-border bg-surface p-5 space-y-4">
      <h3 className="text-base font-semibold text-text">Enviar novo entregável</h3>
      <p className="text-xs text-text-muted">
        Envie ortomosaicos (.tif), nuvem de pontos (.las), modelos 3D (.obj) ou relatórios em PDF.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Título do entregável"
          placeholder="Ex: Ortomosaico RGB Alta Resolução"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div>
          <label className="label mb-1 block">Tipo de dado</label>
          <select
            className="input w-full"
            value={dataProductId}
            onChange={(e) => setDataProductId(e.target.value)}
          >
            <option value="orthomosaic-geotiff">Ortomosaico GeoTIFF</option>
            <option value="point-cloud-las">Nuvem de Pontos (.LAS)</option>
            <option value="digital-elevation-model">Modelo Digital de Elevação (DEM)</option>
            <option value="multispectral-ndvi">Índices de Vegetação (NDVI/NDRE)</option>
            <option value="inspection-report-pdf">Relatório Técnico em PDF</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label mb-1 block">Arquivo</label>
        <input
          type="file"
          required
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full text-xs text-text file:mr-4 file:rounded-input file:border-0 file:bg-surface-soft file:px-4 file:py-2 file:text-xs file:font-semibold file:text-text hover:file:bg-border"
        />
        {file && (
          <p className="mt-1 text-[11px] text-text-muted">
            Selecionado: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
          </p>
        )}
      </div>

      {uploading && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-text-muted">
            <span>Enviando…</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-soft">
            <div
              className="h-full bg-accent-ink transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <Button type="submit" disabled={!file || uploading}>
        {uploading ? "Enviando arquivo…" : "Confirmar e enviar dados"}
      </Button>
    </form>
  );
}
