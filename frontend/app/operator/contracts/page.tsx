"use client";

import { useEffect, useState } from "react";
import { FileSignature, ExternalLink } from "lucide-react";
import { operatorApi, type OperatorContract } from "@/lib/api/operator";
import type { ApiError } from "@/lib/api/client";

export default function OperatorContractsPage() {
  const [contracts, setContracts] = useState<OperatorContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { operatorApi.contracts().then(({ data }) => setContracts(data)).catch((reason: ApiError) => setError(reason.detail || reason.title || "Não foi possível carregar os contratos.")).finally(() => setLoading(false)); }, []);
  return <div className="mx-auto max-w-5xl pb-12"><div className="rounded-3xl bg-slate-950 px-7 py-8 text-white"><p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-300">Legal</p><h1 className="mt-2 text-3xl font-bold">Contracts</h1><p className="mt-2 text-sm text-slate-300">Documentos enviados e contratos de operação da sua organização.</p></div>{error && <p className="mt-6 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}<section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">{loading && <div className="p-10 text-center text-sm text-slate-500">Carregando…</div>}{!loading && contracts.length === 0 && <div className="px-6 py-16 text-center"><FileSignature className="mx-auto h-10 w-10 text-slate-300" /><h2 className="mt-4 font-semibold text-slate-800">Nenhum contrato disponível</h2><p className="mt-1 text-sm text-slate-500">Quando a plataforma disponibilizar um contrato para assinatura, ele aparecerá aqui.</p></div>}{contracts.map((contract) => <div key={contract.id} className="flex flex-col gap-3 border-b border-slate-100 p-5 last:border-0 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold text-slate-950">{contract.title}</h2><p className="mt-1 text-sm text-slate-500">{contract.contract_type} {contract.version ? `· ${contract.version}` : ""} {contract.signed_at ? `· Assinado em ${new Date(contract.signed_at).toLocaleDateString("pt-BR")}` : ""}</p></div><div className="flex items-center gap-3"><span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-800">{contract.status}</span>{contract.document_url && <a className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-700" href={contract.document_url} target="_blank" rel="noreferrer">Abrir <ExternalLink className="h-3.5 w-3.5" /></a>}</div></div>)}</section></div>;
}
