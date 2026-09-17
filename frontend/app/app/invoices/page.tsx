"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ReceiptText } from "lucide-react";
import { enterpriseApi, type EnterpriseInvoice } from "@/lib/api/enterprise";
import type { ApiError } from "@/lib/api/client";

const FILTERS = ["all", "pending", "paid", "failed"] as const;
const labels: Record<(typeof FILTERS)[number], string> = { all: "Todas", pending: "Pendentes", paid: "Pagas", failed: "Falhas" };

function money(amount: number, currency: string) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: currency || "BRL" }).format(amount || 0);
}

export default function EnterpriseInvoicesPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [items, setItems] = useState<EnterpriseInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    enterpriseApi.invoices(filter).then((response) => setItems(response.data || [])).catch((reason: ApiError) => setError(reason.detail || "Não foi possível carregar as faturas.")).finally(() => setLoading(false));
  }, [filter]);

  return <div className="mx-auto max-w-[1500px] pb-16 lg:pb-0"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8490a0]">Financeiro</p><h1 className="mt-1 text-2xl font-extrabold tracking-[-0.04em] text-[#151821]">Faturas</h1></div><div className="flex flex-wrap gap-2">{FILTERS.map((item) => <button key={item} onClick={() => setFilter(item)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${filter === item ? "border-[#b9e874] bg-[#f5ffec] text-[#4d7311]" : "border-[#d8dce2] bg-white text-[#555d69] hover:bg-[#f7f8f9]"}`}>{labels[item]}</button>)}</div></div>{error && <div className="mt-5 rounded-lg border border-[#f1c5c7] bg-[#fff4f4] px-4 py-3 text-sm text-[#bd4047]">{error}</div>}<div className="mt-5 overflow-hidden rounded-xl border border-[#dde1e7] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]"><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="border-b border-[#dfe2e7] bg-[#fafbfc] text-[12px] font-bold text-[#5d6572]"><tr><th className="px-4 py-3">Referência</th><th className="px-4 py-3">Pedido</th><th className="px-4 py-3">Valor</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Emitida em</th></tr></thead><tbody>{loading && <tr><td colSpan={5} className="px-4 py-12 text-center text-[#87909e]">Carregando faturas…</td></tr>}{!loading && !items.length && <tr><td colSpan={5} className="px-4 py-14 text-center"><ReceiptText className="mx-auto mb-3 h-7 w-7 text-[#a0a7b2]" /><p className="font-semibold text-[#565d69]">Nenhuma fatura encontrada</p><p className="mt-1 text-xs text-[#8b929e]">As faturas e comprovantes de pagamento aparecerão aqui.</p></td></tr>}{items.map((item) => <tr key={item.id} className="border-b border-[#edf0f3] last:border-0"><td className="px-4 py-3.5 font-semibold text-[#2c323d]">{item.reference}</td><td className="px-4 py-3.5 text-[#59616d]">{item.order_id.slice(0, 8)}</td><td className="px-4 py-3.5 font-semibold text-[#2c323d]">{money(item.amount, item.currency)}</td><td className="px-4 py-3.5"><span className="rounded-full bg-[#edf4ff] px-2.5 py-1 text-[11px] font-bold text-[#4b6eb4]">{item.status}</span></td><td className="px-4 py-3.5 text-[#626a76]">{new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(item.issued_at))}</td></tr>)}</tbody></table></div></div><div className="mt-4 flex justify-end gap-2"><button disabled className="flex items-center gap-1 rounded-lg border border-[#e2e5e9] bg-white px-3 py-2 text-sm text-[#9aa0ab]"><ChevronLeft className="h-4 w-4" /> Anterior</button><button disabled className="flex items-center gap-1 rounded-lg border border-[#e2e5e9] bg-white px-3 py-2 text-sm text-[#9aa0ab]">Próxima <ChevronRight className="h-4 w-4" /></button></div></div>;
}
