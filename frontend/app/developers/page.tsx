"use client";

import React, { useState } from "react";
import Link from "next/link";

type TabLang = "curl" | "python" | "typescript";

export default function DevelopersPage() {
  const [activeSection, setActiveSection] = useState<string>("create-order");
  const [activeLang, setActiveLang] = useState<TabLang>("curl");
  const [copied, setCopied] = useState<boolean>(false);

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const curlExample = `curl -X POST https://api.oest.com.br/api/v1/enterprise/orders \\
  -H "Authorization: Bearer dh_live_7a8b9c0d1e2f3g4h5i6j7k8l9m0n" \\
  -H "Content-Type: application/json" \\
  -d '{
    "orderName": "Mapeamento Fazenda Rio Verde",
    "deliveryDeadline": "2026-10-15T18:00:00Z",
    "mapTypes": ["_2dMap", "digitalTerrainModel", "ndvi"],
    "description": "Levantamento multiespectral e curvas de nível para projeto de irrigação.",
    "locationMap": {
      "type": "Polygon",
      "coordinates": [
        [
          [-55.7230, -13.0450],
          [-55.7150, -13.0450],
          [-55.7150, -13.0520],
          [-55.7230, -13.0520],
          [-55.7230, -13.0450]
        ]
      ]
    },
    "specifications": {
      "gsd_cm_pixel": 2.5,
      "sensor_type": "multispectral",
      "accuracy": "rtk_centimetric"
    }
  }'`;

  const pythonExample = `import requests

API_URL = "https://api.oest.com.br/api/v1/enterprise/orders"
API_KEY = "dh_live_7a8b9c0d1e2f3g4h5i6j7k8l9m0n"

payload = {
    "orderName": "Mapeamento Fazenda Rio Verde",
    "deliveryDeadline": "2026-10-15T18:00:00Z",
    "mapTypes": ["_2dMap", "digitalTerrainModel", "ndvi"],
    "description": "Levantamento multiespectral e curvas de nível para projeto de irrigação.",
    "locationMap": {
        "type": "Polygon",
        "coordinates": [
            [
                [-55.7230, -13.0450],
                [-55.7150, -13.0450],
                [-55.7150, -13.0520],
                [-55.7230, -13.0520],
                [-55.7230, -13.0450]
            ]
        ]
    },
    "specifications": {
        "gsd_cm_pixel": 2.5,
        "sensor_type": "multispectral",
        "accuracy": "rtk_centimetric"
    }
}

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

response = requests.post(API_URL, json=payload, headers=headers)
print(response.json())`;

  const tsExample = `import axios from 'axios';

const API_KEY = 'dh_live_7a8b9c0d1e2f3g4h5i6j7k8l9m0n';

async function createDroneOrder() {
  const { data } = await axios.post(
    'https://api.oest.com.br/api/v1/enterprise/orders',
    {
      orderName: 'Mapeamento Fazenda Rio Verde',
      deliveryDeadline: '2026-10-15T18:00:00Z',
      mapTypes: ['_2dMap', 'digitalTerrainModel', 'ndvi'],
      description: 'Levantamento multiespectral e curvas de nível.',
      locationMap: {
        type: 'Polygon',
        coordinates: [
          [
            [-55.7230, -13.0450],
            [-55.7150, -13.0450],
            [-55.7150, -13.0520],
            [-55.7230, -13.0520],
            [-55.7230, -13.0450]
          ]
        ]
      },
      specifications: {
        gsd_cm_pixel: 2.5,
        sensor_type: 'multispectral',
        accuracy: 'rtk_centimetric'
      }
    },
    {
      headers: {
        Authorization: \`Bearer \${API_KEY}\`,
        'Content-Type': 'application/json'
      }
    }
  );

  console.log('Order created:', data);
}`;

  const jsonResponse = `{
  "data": {
    "id": "e89f2a41-3b7c-48d9-95e2-04fa18c5e123",
    "order_name": "Mapeamento Fazenda Rio Verde",
    "status": "published",
    "delivery_deadline": "2026-10-15T18:00:00Z",
    "map_types": ["_2dMap", "digitalTerrainModel", "ndvi"],
    "estimated_area_hectares": 64.25,
    "quotes_count": 0,
    "created_at": "2026-09-16T04:20:00Z",
    "deliverables_count": 0
  },
  "meta": {
    "request_id": "9b12a45c-e67d-4182-bf39-44ea92b8d910"
  }
}`;

  return (
    <div className="min-h-screen bg-[#070D0C] text-[#E8F0EE] font-sans antialiased selection:bg-[#3D8F6E] selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[#1A2E28] bg-[#0B1614]/90 px-6 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#3D8F6E] to-[#1A9E60] font-mono text-sm font-bold text-white shadow-lg shadow-[#3D8F6E]/20">
              DH
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold tracking-tight text-white">DroneHub</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#3D8F6E]">Developers</span>
            </div>
          </Link>
          <div className="hidden items-center gap-2 rounded-full border border-[#1A2E28] bg-[#0F1D1B] px-3 py-1 text-xs text-[#8AA39A] md:flex">
            <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse"></span>
            <span>REST API v1.0 • Enterprise DaaS</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium">
          <Link href="/enterprise/api-keys" className="hidden text-[#8AA39A] hover:text-white transition sm:block">
            Chaves de API
          </Link>
          <Link href="/app/missions" className="hidden text-[#8AA39A] hover:text-white transition sm:block">
            Missões Web
          </Link>
          <Link
            href="/enterprise/api-keys"
            className="rounded-lg bg-[#3D8F6E] px-3.5 py-1.5 font-medium text-white transition hover:bg-[#4CA983] shadow-md shadow-[#3D8F6E]/20"
          >
            Obter Chave de API
          </Link>
        </div>
      </header>

      {/* Main Grid */}
      <div className="mx-auto flex max-w-7xl">
        {/* Left Sidebar */}
        <aside className="sticky top-[57px] hidden h-[calc(100vh-57px)] w-64 flex-shrink-0 flex-col overflow-y-auto border-r border-[#1A2E28] bg-[#0B1614]/50 p-4 md:flex">
          <div className="space-y-6">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#5A736A]">Overview</p>
              <ul className="space-y-1 text-xs">
                <li>
                  <button
                    onClick={() => setActiveSection("overview")}
                    className={`w-full rounded-md px-2.5 py-1.5 text-left transition ${
                      activeSection === "overview" ? "bg-[#142622] font-semibold text-white" : "text-[#8AA39A] hover:text-white"
                    }`}
                  >
                    Introdução & DaaS
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSection("auth")}
                    className={`w-full rounded-md px-2.5 py-1.5 text-left transition ${
                      activeSection === "auth" ? "bg-[#142622] font-semibold text-white" : "text-[#8AA39A] hover:text-white"
                    }`}
                  >
                    Authentication
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#5A736A]">Orders & Data</p>
              <ul className="space-y-1 text-xs">
                <li>
                  <button
                    onClick={() => setActiveSection("create-order")}
                    className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left transition ${
                      activeSection === "create-order" ? "bg-[#142622] font-semibold text-white" : "text-[#8AA39A] hover:text-white"
                    }`}
                  >
                    <span>Create Order</span>
                    <span className="rounded bg-[#10B981]/20 px-1.5 py-0.5 font-mono text-[10px] text-[#10B981]">POST</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSection("list-orders")}
                    className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left transition ${
                      activeSection === "list-orders" ? "bg-[#142622] font-semibold text-white" : "text-[#8AA39A] hover:text-white"
                    }`}
                  >
                    <span>List Orders</span>
                    <span className="rounded bg-[#3B82F6]/20 px-1.5 py-0.5 font-mono text-[10px] text-[#3B82F6]">GET</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSection("get-order")}
                    className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left transition ${
                      activeSection === "get-order" ? "bg-[#142622] font-semibold text-white" : "text-[#8AA39A] hover:text-white"
                    }`}
                  >
                    <span>Order Details</span>
                    <span className="rounded bg-[#3B82F6]/20 px-1.5 py-0.5 font-mono text-[10px] text-[#3B82F6]">GET</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSection("cancel-order")}
                    className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left transition ${
                      activeSection === "cancel-order" ? "bg-[#142622] font-semibold text-white" : "text-[#8AA39A] hover:text-white"
                    }`}
                  >
                    <span>Cancel Order</span>
                    <span className="rounded bg-[#EF4444]/20 px-1.5 py-0.5 font-mono text-[10px] text-[#EF4444]">POST</span>
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#5A736A]">Delivery & Outputs</p>
              <ul className="space-y-1 text-xs">
                <li>
                  <button
                    onClick={() => setActiveSection("delivery")}
                    className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left transition ${
                      activeSection === "delivery" ? "bg-[#142622] font-semibold text-white" : "text-[#8AA39A] hover:text-white"
                    }`}
                  >
                    <span>Download Delivery</span>
                    <span className="rounded bg-[#3B82F6]/20 px-1.5 py-0.5 font-mono text-[10px] text-[#3B82F6]">GET</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSection("webhooks")}
                    className={`w-full rounded-md px-2.5 py-1.5 text-left transition ${
                      activeSection === "webhooks" ? "bg-[#142622] font-semibold text-white" : "text-[#8AA39A] hover:text-white"
                    }`}
                  >
                    Webhooks & Events
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </aside>

        {/* Center Content & Code Column */}
        <main className="flex-1 p-6 md:p-10">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            {/* Documentation Narrative (Left 7 Cols) */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                  {activeSection === "create-order" && "Create Order"}
                  {activeSection === "overview" && "Visão Geral da API"}
                  {activeSection === "auth" && "Autenticação & Segurança"}
                  {activeSection === "list-orders" && "Listar Pedidos"}
                  {activeSection === "get-order" && "Detalhes do Pedido"}
                  {activeSection === "cancel-order" && "Cancelar Pedido"}
                  {activeSection === "delivery" && "Download de Entregáveis"}
                  {activeSection === "webhooks" && "Webhooks & Notificações"}
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-[#A2B6AF]">
                  {activeSection === "create-order" &&
                    "Solicite dados brutos e produtos processados de drones para qualquer área de interesse geográfica através de um único endpoint RESTful."}
                  {activeSection === "overview" &&
                    "A Developer Data API da DroneHub permite que sistemas GIS, ERPs e aplicações corporativas solicitem coletas aéreas de alta precisão de forma 100% programática."}
                  {activeSection === "auth" &&
                    "Todas as requisições devem incluir sua chave de API corporativa no cabeçalho Authorization ou X-Api-Key."}
                  {activeSection === "list-orders" &&
                    "Consulte o histórico de todas as missões e pedidos efetuados pela sua organização com paginação e filtros de status."}
                  {activeSection === "get-order" &&
                    "Acompanhe o status em tempo real do voo, piloto alocado, área estimada em hectares e contagem de entregáveis."}
                  {activeSection === "cancel-order" &&
                    "Cancele ordens publicadas antes do início da execução dos voos em campo."}
                  {activeSection === "delivery" &&
                    "Acesse URLs seguras pré-assinadas com validade temporária para download de GeoTIFF, LAS, DTM, DSM e relatórios."}
                  {activeSection === "webhooks" &&
                    "Receba notificações em tempo real no seu servidor quando uma missão mudar de fase ou os dados ficarem prontos."}
                </p>
              </div>

              {/* Endpoint Banner */}
              <div className="flex items-center gap-3 rounded-lg border border-[#1A2E28] bg-[#0E1A17] p-3 font-mono text-xs text-[#E8F0EE]">
                <span className="rounded bg-[#10B981] px-2 py-0.5 font-bold text-black">POST</span>
                <span className="text-[#8AA39A]">https://api.oest.com.br/api/v1/enterprise/orders</span>
              </div>

              {/* Parameter Table / Requirements */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Parâmetros Obrigatórios da Requisição</h3>
                <div className="divide-y divide-[#1A2E28] rounded-xl border border-[#1A2E28] bg-[#0B1614] text-xs">
                  <div className="p-4 space-y-1">
                    <div className="flex items-baseline gap-2">
                      <code className="rounded bg-[#162924] px-1.5 py-0.5 font-mono font-semibold text-[#10B981]">orderName</code>
                      <span className="text-[11px] text-[#8AA39A]">string • obrigatório</span>
                    </div>
                    <p className="text-[#A2B6AF]">
                      Nome identificador do pedido para rastreamento interno (máximo de 200 caracteres).
                    </p>
                  </div>

                  <div className="p-4 space-y-1">
                    <div className="flex items-baseline gap-2">
                      <code className="rounded bg-[#162924] px-1.5 py-0.5 font-mono font-semibold text-[#10B981]">deliveryDeadline</code>
                      <span className="text-[11px] text-[#8AA39A]">ISO 8601 string • obrigatório</span>
                    </div>
                    <p className="text-[#A2B6AF]">
                      Data e horário limite desejado para a entrega final dos dados (ex: <code className="text-white">2026-10-15T18:00:00Z</code>).
                    </p>
                  </div>

                  <div className="p-4 space-y-1">
                    <div className="flex items-baseline gap-2">
                      <code className="rounded bg-[#162924] px-1.5 py-0.5 font-mono font-semibold text-[#10B981]">locationMap</code>
                      <span className="text-[11px] text-[#8AA39A]">GeoJSON Polygon • obrigatório</span>
                    </div>
                    <p className="text-[#A2B6AF]">
                      Polígono delimitando a área de interesse (AOI). Deve conter as coordenadas dos vértices em formato <code className="text-white">[longitude, latitude]</code> ou array de vértices.
                    </p>
                  </div>

                  <div className="p-4 space-y-1">
                    <div className="flex items-baseline gap-2">
                      <code className="rounded bg-[#162924] px-1.5 py-0.5 font-mono font-semibold text-[#10B981]">mapTypes</code>
                      <span className="text-[11px] text-[#8AA39A]">array de strings • obrigatório</span>
                    </div>
                    <p className="text-[#A2B6AF]">
                      Tipos de produtos finais requeridos. Atualmente suporta:
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1.5 font-mono text-[11px]">
                      {["_2dMap", "_3dMap", "elevationMap", "digitalTerrainModel", "digitalSurfaceModel", "topographicMap", "thermalMap", "ndvi", "streamedData"].map((t) => (
                        <span key={t} className="rounded bg-[#162924] px-2 py-0.5 text-[#3D8F6E] border border-[#234237]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 space-y-1">
                    <div className="flex items-baseline gap-2">
                      <code className="rounded bg-[#162924] px-1.5 py-0.5 font-mono font-semibold text-[#3D8F6E]">description</code>
                      <span className="text-[11px] text-[#8AA39A]">string • opcional</span>
                    </div>
                    <p className="text-[#A2B6AF]">
                      Instruções detalhadas de segurança, restrições operacionais e exigências específicas do cliente.
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Code Reference */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Respostas HTTP</h3>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 text-xs">
                  <div className="flex items-start gap-3 rounded-lg border border-[#1A2E28] bg-[#0B1614] p-3">
                    <span className="font-mono font-bold text-[#10B981]">201 Created</span>
                    <span className="text-[#A2B6AF]">Pedido criado e despachado para matching.</span>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg border border-[#1A2E28] bg-[#0B1614] p-3">
                    <span className="font-mono font-bold text-[#EF4444]">401 Unauthorized</span>
                    <span className="text-[#A2B6AF]">Chave de API inválida, expirada ou ausente.</span>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg border border-[#1A2E28] bg-[#0B1614] p-3">
                    <span className="font-mono font-bold text-[#F59E0B]">422 Unprocessable</span>
                    <span className="text-[#A2B6AF]">Polígono inválido ou parâmetros ausentes.</span>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg border border-[#1A2E28] bg-[#0B1614] p-3">
                    <span className="font-mono font-bold text-[#6B7280]">429 Rate Limited</span>
                    <span className="text-[#A2B6AF]">Limite de requisições excedido.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Code Playground (Right 5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="sticky top-20 rounded-2xl border border-[#1A2E28] bg-[#0B1614] shadow-2xl overflow-hidden">
                {/* Code Tabs Header */}
                <div className="flex items-center justify-between border-b border-[#1A2E28] bg-[#081210] px-4 py-2.5">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    {(["curl", "python", "typescript"] as TabLang[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setActiveLang(lang)}
                        className={`rounded px-2.5 py-1 capitalize transition ${
                          activeLang === lang
                            ? "bg-[#1A332C] font-semibold text-[#10B981]"
                            : "text-[#8AA39A] hover:text-white"
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() =>
                      copyCode(
                        activeLang === "curl"
                          ? curlExample
                          : activeLang === "python"
                          ? pythonExample
                          : tsExample
                      )
                    }
                    className="flex items-center gap-1.5 rounded bg-[#162924] px-2.5 py-1 text-xs text-[#8AA39A] transition hover:bg-[#203D35] hover:text-white"
                  >
                    {copied ? (
                      <span className="text-[#10B981] font-semibold">Copiado!</span>
                    ) : (
                      <span>Copiar</span>
                    )}
                  </button>
                </div>

                {/* Code Block */}
                <div className="p-4 overflow-x-auto text-[11px] font-mono leading-relaxed text-[#D1DED9] bg-[#070E0C]">
                  <pre>
                    {activeLang === "curl" && curlExample}
                    {activeLang === "python" && pythonExample}
                    {activeLang === "typescript" && tsExample}
                  </pre>
                </div>

                {/* Response Preview */}
                <div className="border-t border-[#1A2E28] bg-[#081210] p-3 text-xs font-semibold text-[#5A736A] uppercase tracking-wider flex items-center justify-between">
                  <span>Exemplo de Resposta (201 Created)</span>
                  <span className="font-mono lowercase text-[11px] text-[#10B981]">application/json</span>
                </div>
                <div className="p-4 overflow-x-auto text-[11px] font-mono leading-relaxed text-[#10B981] bg-[#050A09]">
                  <pre>{jsonResponse}</pre>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
