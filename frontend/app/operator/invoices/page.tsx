"use client";

import { useEffect, useState } from "react";
import { Download, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { operatorApi, type OperatorInvoice } from "@/lib/api/operator";
import type { ApiError } from "@/lib/api/client";

export default function OperatorInvoicesPage() {
  const [invoices, setInvoices] = useState<OperatorInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { operatorApi.invoices().then(({ data }) => setInvoices(data)).catch((reason: ApiError) => setError(reason.detail || reason.title || "Não foi possível carregar as faturas.")).finally(() => setLoading(false)); }, []);
  return <div className="mx-auto max-w-6xl pb-12"><div className="flex flex-col gap-3 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">Finance</p><h1 className="mt-2 text-3xl font-bold text-slate-950">Invoices</h1><p className="mt-2 text-sm text-slate-600">Histórico dos valores devidos pela plataforma para sua operação.</p></div><Button variant="secondary" disabled><Download className="h-4 w-4" />Exportar CSV</Button></div>{error && <p className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}<div className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-4">Referência</th><th className="px-5 py-4">Missão</th><th className="px-5 py-4">Emissão</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Valor</th></tr></thead><tbody className="divide-y divide-slate-100">{loading && <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-500">Carregando…</td></tr>}{!loading && invoices.length === 0 && <tr><td colSpan={5} className="px-5 py-14 text-center"><ReceiptText className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 text-slate-500">Nenhuma fatura ainda.</p></td></tr>}{invoices.map((invoice) => <tr key={invoice.id} className="text-slate-700"><td className="px-5 py-4 font-semibold text-slate-950">{invoice.reference}</td><td className="px-5 py-4 font-mono text-xs">{invoice.mission_id.slice(0, 8)}</td><td className="px-5 py-4">{new Date(invoice.issued_at).toLocaleDateString("pt-BR")}</td><td className="px-5 py-4"><span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-800">{invoice.status}</span></td><td className="px-5 py-4 text-right font-bold text-slate-950">{invoice.amount ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: invoice.currency }).format(invoice.amount) : "—"}</td></tr>)}</tbody></table></div></div></div>;
}
