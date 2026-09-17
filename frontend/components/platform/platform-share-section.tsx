"use client";

import { useState } from "react";
import {
  Download,
  Share2,
  FileCheck2,
  HardDrive,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { useTranslations } from "@/lib/i18n/client";

const DELIVERABLE_FILES = [
  {
    name: "orthomosaic_highres_sirgas2000.tif",
    type: "GeoTIFF",
    size: "1.42 GB",
    date: "Hoje, 14:32",
    date_en: "Today, 14:32",
    badge: "GSD 1.2cm",
  },
  {
    name: "point_cloud_dense_classified.laz",
    type: "LAS / LAZ",
    size: "3.88 GB",
    date: "Hoje, 14:30",
    date_en: "Today, 14:30",
    badge: "18.4M pts",
  },
  {
    name: "topographic_contours_1m_3d.dwg",
    type: "AutoCAD DWG",
    size: "48 MB",
    date: "Hoje, 14:28",
    date_en: "Today, 14:28",
    badge: "Civil 3D",
  },
  {
    name: "engineering_technical_report_art.pdf",
    type: "Laudo com ART",
    size: "12 MB",
    date: "Hoje, 14:25",
    date_en: "Today, 14:25",
    badge: "Assinado CREA",
  },
];

export function PlatformShareSection() {
  const { locale } = useTranslations();
  const isEn = locale === "en";

  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopy = (idx: number) => {
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <section id="share-data" className="border-t border-oest-ink/10 bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Interactive Deliverables Sharing Table Mockup */}
          <div className="lg:col-span-7">
            <div className="rounded-[32px] border border-oest-ink/12 bg-white p-2 shadow-2xl ring-1 ring-black/5">
              <div className="overflow-hidden rounded-[24px] border border-border bg-white shadow-xs">
                {/* Table Top Bar */}
                <div className="flex items-center justify-between border-b border-border bg-surface-soft/60 px-5 py-4">
                  <div>
                    <h4 className="text-[14px] font-bold text-oest-ink">
                      {isEn ? "Mission Deliverables & Cloud Export" : "Entregáveis da Missão & Nuvem"}
                    </h4>
                    <p className="text-[11px] text-text-muted">
                      {isEn ? "SIRGAS 2000 / UTM Zone 21S" : "SIRGAS 2000 / UTM Fuso 21S"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-800">
                      {isEn ? "4 FILES READY" : "4 ARQUIVOS PRONTOS"}
                    </span>
                  </div>
                </div>

                {/* Table Content Rows */}
                <div className="divide-y divide-border">
                  {DELIVERABLE_FILES.map((file, idx) => (
                    <div
                      key={file.name}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-surface-soft/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-oest-blue">
                          <FileCheck2 className="h-4.5 w-4.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-semibold text-text">
                            {file.name}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-text-muted mt-0.5">
                            <span className="font-mono">{file.type}</span>
                            <span>•</span>
                            <span className="font-mono">{file.size}</span>
                            <span>•</span>
                            <span className="rounded bg-surface-soft px-1.5 py-0.2 text-[9px] font-bold text-text-muted">
                              {file.badge}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => handleCopy(idx)}
                          className="flex h-8 items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 text-[11px] font-medium text-text-muted hover:border-border-strong hover:text-text transition-colors shadow-2xs"
                          title={isEn ? "Copy secure share link" : "Copiar link seguro de compartilhamento"}
                        >
                          {copiedIdx === idx ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-600" />
                              <span className="text-emerald-600 font-bold">{isEn ? "Copied" : "Copiado"}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>{isEn ? "Share Link" : "Link"}</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          className="flex h-8 items-center gap-1.5 rounded-lg bg-oest-blue px-3 text-[11px] font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
                        >
                          <Download className="h-3 w-3" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cloud Connectors Bar */}
                <div className="flex items-center justify-between border-t border-border bg-surface-soft/80 px-5 py-3 text-[11px] text-text-muted">
                  <span>
                    {isEn
                      ? "Direct streaming connectors available:"
                      : "Conectores diretos em nuvem disponíveis:"}
                  </span>
                  <div className="flex items-center gap-3 font-semibold text-oest-ink">
                    <span>ArcGIS</span>
                    <span>•</span>
                    <span>QGIS</span>
                    <span>•</span>
                    <span>Autodesk BIM 360</span>
                    <span>•</span>
                    <span>AWS S3</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Deep-Dive Headline & Copy */}
          <div className="lg:col-span-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-oest-blue">
              {isEn ? "Zero Friction Delivery" : "Entrega Sem Fricção"}
            </p>
            <h2 className="mt-3 text-[36px] sm:text-[48px] font-bold leading-[0.98] tracking-[-0.045em] text-oest-ink">
              {isEn
                ? "Share and integrate data with ease."
                : "Compartilhe e exporte dados com facilidade."}
            </h2>
            <p className="mt-5 text-[16px] leading-relaxed text-oest-ink/75 font-normal">
              {isEn
                ? "Empower your engineering and GIS teams with instant access to clean, classified reality data without clunky USB drives or broken transfer links."
                : "Entregue dados limpos, calibrados e classificados diretamente aos seus times de projeto e engenharia, sem pendrives físicos ou links quebrados."}
            </p>

            <ul className="mt-8 space-y-4 text-[14px] text-oest-ink/80">
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs mt-0.5">
                  ✓
                </span>
                <span>
                  <strong>{isEn ? "Standard Coordinate Systems:" : "Sistemas Oficiais de Coordenadas:"}</strong>{" "}
                  {isEn
                    ? "Full compliance with SIRGAS 2000, UTM projections, and local geodesic grids."
                    : "Conformidade rigorosa com SIRGAS 2000, projeções UTM e altitudes ortométricas."}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs mt-0.5">
                  ✓
                </span>
                <span>
                  <strong>{isEn ? "BIM & CAD Native Formats:" : "Formatos Nativos CAD & BIM:"}</strong>{" "}
                  {isEn
                    ? "Direct import into AutoCAD Civil 3D, Revit, Bentley, QGIS, and ArcGIS Pro."
                    : "Importação direta no AutoCAD Civil 3D, Revit, Bentley Synchro, QGIS e ArcGIS."}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs mt-0.5">
                  ✓
                </span>
                <span>
                  <strong>{isEn ? "Role-Based Team Access:" : "Controle de Acesso por Permissões:"}</strong>{" "}
                  {isEn
                    ? "Share specific folders with clients, contractors, or auditors with audit logs."
                    : "Compartilhe pastas com clientes, consultores ou auditores com registro de downloads."}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
