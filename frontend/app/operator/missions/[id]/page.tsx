"use client";

import { useEffect, useState, useRef, use } from "react";
import Link from "next/link";
import { apiFetch, getApiBase, type ApiError } from "@/lib/api/client";
import { loadSession } from "@/lib/api/auth-store";

type Deliverable = {
  id: string;
  title?: string;
  status: string;
  version?: number;
  data_product_id?: string;
  rejection_reason?: string | null;
};

type Mission = {
  id: string;
  title: string;
  status: string;
  products?: Array<{ data_product_id: string; name?: string; quantity: number }>;
};

const STATUS_LABELS: Record<string, string> = {
  uploaded: "Enviado",
  processing: "Processando",
  available: "Disponível para revisão",
  in_review: "Em revisão",
  approved: "Aprovado ✓",
  rejected: "Rejeitado — revisão solicitada",
  published: "Publicado",
};

export default function OperatorMissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [mission, setMission] = useState<Mission | null>(null);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiFetch<{ data: Mission }>(`/missions/${id}`),
      apiFetch<{ data: Deliverable[] }>(`/missions/${id}/deliverables`),
    ])
      .then(([mRes, dRes]) => {
        setMission(mRes.data);
        setDeliverables(dRes.data);
      })
      .catch((e: ApiError) => setError(e.detail ?? "Missão não encontrada"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 animate-pulse">
        <div className="h-8 w-64 rounded bg-border/30" />
        <div className="h-48 rounded-card bg-border/20" />
      </div>
    );
  }

  if (error || !mission) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="rounded-card border border-danger/30 bg-danger/5 p-6 text-center">
          <p className="text-danger">{error ?? "Missão não encontrada"}</p>
          <Link href="/operator/missions" className="mt-3 inline-block text-[13px] text-text-muted hover:text-text">
            ← Voltar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <div className="flex items-center gap-2 text-[13px] text-text-muted mb-1">
          <Link href="/operator/missions" className="hover:text-text">Missões</Link>
          <span>/</span>
          <span>{mission.title}</span>
        </div>
        <h1 className="text-2xl font-semibold text-text">{mission.title}</h1>
      </div>

      {/* Upload section */}
      <div className="card space-y-4">
        <h2 className="text-[16px] font-semibold text-text">Enviar entrega</h2>
        <p className="text-[14px] text-text-muted">
          Faça upload dos arquivos processados para revisão do cliente.
        </p>
        <DeliverableUpload
          missionId={id}
          products={mission.products}
          onUploaded={(d) => setDeliverables((prev) => [d, ...prev])}
        />
      </div>

      {/* Deliverables list */}
      <div>
        <h2 className="text-[16px] font-semibold text-text mb-4">
          Entregas enviadas ({deliverables.length})
        </h2>
        {deliverables.length === 0 ? (
          <div className="card py-8 text-center">
            <p className="text-[14px] text-text-muted">Nenhuma entrega enviada ainda.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {deliverables.map((d) => (
              <div key={d.id} className="card">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[15px] font-semibold text-text">
                      {d.title ?? `Entrega v${d.version ?? 1}`}
                    </p>
                    <p className="text-[13px] text-text-muted mt-0.5">
                      {STATUS_LABELS[d.status] ?? d.status}
                    </p>
                    {d.rejection_reason && (
                      <div className="mt-2 rounded-input border border-danger/30 bg-danger/5 px-3 py-2">
                        <p className="text-[12px] font-medium text-danger">Revisão solicitada:</p>
                        <p className="text-[13px] text-text mt-0.5">{d.rejection_reason}</p>
                      </div>
                    )}
                  </div>
                  <span className={`shrink-0 text-[12px] font-medium px-2 py-0.5 rounded-full border ${
                    d.status === "approved" ? "bg-green-50 text-green-700 border-green-200" :
                    d.status === "rejected" ? "bg-red-50 text-red-700 border-red-200" :
                    "bg-surface-soft text-text-muted border-border"
                  }`}>
                    v{d.version ?? 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Deliverable Upload Component ──────────────────────────────────────────────
function DeliverableUpload({
  missionId,
  products,
  onUploaded,
}: {
  missionId: string;
  products?: Array<{ data_product_id: string; name?: string; quantity: number }>;
  onUploaded: (d: Deliverable) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedProduct, setSelectedProduct] = useState(products?.[0]?.data_product_id ?? "");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function upload() {
    if (!file) return;
    setError(null);
    setProgress(0);

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

      const { upload_url, storage_key } = sessionRes.data;

      // 2. Upload to S3 presigned URL with progress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 90));
        });
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload failed: ${xhr.status}`));
        });
        xhr.addEventListener("error", () => reject(new Error("Upload error")));
        xhr.open("PUT", upload_url);
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
        xhr.send(file);
      });

      setProgress(95);

      // 3. Finalize deliverable
      const finalRes = await apiFetch<{ data: Deliverable }>(`/missions/${missionId}/deliverables/finalize`, {
        method: "POST",
        body: JSON.stringify({
          storage_key,
          data_product_id: selectedProduct || undefined,
          title: title || file.name,
          file_size_bytes: file.size,
        }),
      });

      setProgress(100);
      setDone(true);
      onUploaded(finalRes.data);
      setFile(null);
      setTitle("");
      if (fileRef.current) fileRef.current.value = "";
      setTimeout(() => { setProgress(null); setDone(false); }, 3000);
    } catch (e) {
      const err = e as ApiError;
      setError(err.detail ?? (e instanceof Error ? e.message : "Erro no upload"));
      setProgress(null);
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-[13px] text-danger border border-danger/30 rounded-input bg-danger/5 px-3 py-2">{error}</p>
      )}

      {done && (
        <p className="text-[13px] text-success font-medium">✓ Entrega enviada com sucesso!</p>
      )}

      {products && products.length > 0 && (
        <div>
          <label className="label">Produto de dados</label>
          <select className="input" value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
            <option value="">Selecione o produto...</option>
            {products.map((p) => (
              <option key={p.data_product_id} value={p.data_product_id}>
                {p.name ?? p.data_product_id}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="label">Título (opcional)</label>
        <input
          className="input"
          placeholder="Ex: Ortomosaico RGB — Zona A"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div>
        <label className="label">Arquivo *</label>
        <div
          className="flex flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-border bg-surface-soft p-8 text-center cursor-pointer hover:border-border-strong transition-colors"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files[0];
            if (f) setFile(f);
          }}
        >
          {file ? (
            <>
              <span className="text-2xl">📄</span>
              <p className="text-[14px] font-medium text-text">{file.name}</p>
              <p className="text-[12px] text-text-muted">
                {(file.size / 1024 / 1024).toFixed(1)} MB
              </p>
            </>
          ) : (
            <>
              <span className="text-3xl">☁️</span>
              <p className="text-[14px] font-medium text-text">Arraste ou clique para selecionar</p>
              <p className="text-[12px] text-text-muted">GeoTIFF, LAS, SHP, ZIP, MP4...</p>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }}
          />
        </div>
      </div>

      {progress !== null && (
        <div className="w-full bg-border rounded-full h-2">
          <div
            className="bg-accent h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
          <p className="mt-1 text-[12px] text-text-muted">{progress}%</p>
        </div>
      )}

      <button
        onClick={upload}
        disabled={!file || progress !== null}
        className="btn btn-primary w-full sm:w-auto"
      >
        {progress !== null ? `Enviando… ${progress}%` : "Enviar entrega"}
      </button>
    </div>
  );
}
