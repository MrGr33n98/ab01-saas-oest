"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Code2,
  Terminal,
  Copy,
  Check,
  Zap,
  ArrowUpRight,
  Braces,
} from "lucide-react";
import { useTranslations } from "@/lib/i18n/client";

const CODE_EXAMPLES = {
  curl: `curl -X POST https://api.oest.com.br/v1/missions \\
  -H "Authorization: Bearer oest_live_9981az" \\
  -H "Content-Type: application/json" \\
  -d '{
    "category": "energia",
    "polygon_geojson": { ... },
    "sensor": "lidar_3d",
    "target_gsd_cm": 1.5,
    "webhook_url": "https://company.com/webhook/oest"
  }'`,
  python: `from oest import OestClient

client = OestClient(api_key="oest_live_9981az")

mission = client.missions.create(
    category="infraestrutura",
    aoi_kml_url="https://s3.company.com/dom_rodovia.kml",
    payload="rgb_photogrammetry",
    min_resolution_cm=2.0,
    notify_email="gis-team@company.com"
)

print(f"Mission ID: {mission.id} · Status: {mission.status}")`,
  response: `{
  "status": "success",
  "data": {
    "mission_id": "mst_oest_2026_994",
    "status": "DISPATCHED",
    "assigned_operator": "AeroVision MT (ANAC 4821)",
    "estimated_gsd": 1.2,
    "deliverables": [
      "https://cdn.oest.com.br/raw/ortho.tif",
      "https://cdn.oest.com.br/raw/pointcloud.las"
    ],
    "created_at": "2026-09-15T14:30:00Z"
  }
}`,
};

export function PlatformApiSection() {
  const { locale } = useTranslations();
  const isEn = locale === "en";

  const [activeTab, setActiveTab] = useState<"curl" | "python" | "response">(
    "python"
  );
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(CODE_EXAMPLES[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      id="api-integrations"
      className="border-t border-white/10 bg-[#060D18] py-24 sm:py-32 text-white"
    >
      <div className="mx-auto max-w-[1320px] px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: API Capabilities & Enterprise Narrative */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                <Terminal className="h-4 w-4" />
              </span>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-400">
                {isEn ? "Developer API & Webhooks" : "API REST & Webhooks para Desenvolvedores"}
              </p>
            </div>

            <h2 className="mt-4 text-[36px] sm:text-[48px] font-bold leading-[0.98] tracking-[-0.045em] text-white">
              {isEn
                ? "Connect directly to OEST's platform."
                : "Integre a OEST diretamente ao seu sistema."}
            </h2>

            <p className="mt-5 text-[16px] leading-relaxed text-white/70 font-normal">
              {isEn
                ? "Automate recurring asset surveys, trigger drone flights via code, and ingest orthomosaics directly into your enterprise pipeline with our high-throughput REST API."
                : "Automatize inspeções recorrentes, dispare missões de drone programaticamente e receba ortomosaicos e nuvens de pontos diretamente no seu pipeline de engenharia com nossa API REST."}
            </p>

            <div className="mt-8 space-y-3.5 text-[13px] text-white/80 font-medium">
              <div className="flex items-center gap-2.5">
                <Zap className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{isEn ? "Webhooks for mission milestones & delivery" : "Webhooks para marcos de voo e entrega"}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Zap className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{isEn ? "GeoJSON / KML polygon ingestion" : "Ingestão direta de GeoJSON, KML e Shapefiles"}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Zap className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{isEn ? "Python & Node.js official SDKs" : "SDKs oficiais em Python e Node.js"}</span>
              </div>
            </div>

            <div className="mt-9">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[13px] font-bold text-black shadow-md hover:bg-white/90 transition-all active:scale-95"
              >
                <span>{isEn ? "Explore API Documentation" : "Ver Documentação da API"}</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: High-End Developer Interactive Sandbox */}
          <div className="lg:col-span-7">
            <div className="overflow-hidden rounded-2xl border border-white/15 bg-[#0A121E] shadow-2xl ring-1 ring-white/10">
              {/* Terminal Tab Bar */}
              <div className="flex items-center justify-between border-b border-white/10 bg-[#050A12] px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-[11px] font-mono text-white/40">
                    api.oest.com.br
                  </span>
                </div>

                {/* Code Tabs */}
                <div className="flex items-center gap-1 rounded-lg bg-white/10 p-0.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab("python")}
                    className={`rounded-md px-3 py-1 text-[11px] font-mono font-semibold transition-colors ${
                      activeTab === "python"
                        ? "bg-emerald-500 text-black shadow-xs"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    Python
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("curl")}
                    className={`rounded-md px-3 py-1 text-[11px] font-mono font-semibold transition-colors ${
                      activeTab === "curl"
                        ? "bg-emerald-500 text-black shadow-xs"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    cURL
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("response")}
                    className={`rounded-md px-3 py-1 text-[11px] font-mono font-semibold transition-colors ${
                      activeTab === "response"
                        ? "bg-emerald-500 text-black shadow-xs"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    JSON Response
                  </button>
                </div>
              </div>

              {/* Code Snippet Container */}
              <div className="relative p-5">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="absolute right-4 top-4 flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 text-[11px] font-mono text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">{isEn ? "Copied" : "Copiado"}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>{isEn ? "Copy" : "Copiar"}</span>
                    </>
                  )}
                </button>

                <pre className="overflow-x-auto text-[13px] font-mono leading-relaxed text-white/90">
                  <code>{CODE_EXAMPLES[activeTab]}</code>
                </pre>
              </div>

              {/* Terminal Footer Indicator */}
              <div className="flex items-center justify-between border-t border-white/10 bg-[#050A12] px-5 py-2.5 text-[11px] font-mono text-white/50">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span>v1.4 API STABLE · LATENCY &lt; 45ms</span>
                </div>
                <span>REST + WEBHOOKS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
