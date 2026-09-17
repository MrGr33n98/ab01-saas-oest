"use client";

import { FormEvent, useEffect, useState } from "react";
import { Check, Copy, KeyRound, Plus, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { enterpriseApi, type EnterpriseApiKey } from "@/lib/api/enterprise";
import type { ApiError } from "@/lib/api/client";

const SCOPE_OPTIONS = [
  ["missions:read", "Consultar missões"],
  ["missions:write", "Criar e atualizar missões"],
  ["orders:read", "Consultar pedidos"],
  ["deliverables:read", "Consultar entregáveis"],
  ["webhooks:read", "Consultar webhooks"],
  ["webhooks:write", "Gerenciar webhooks"],
] as const;

const statusStyles: Record<EnterpriseApiKey["status"], string> = {
  requested: "bg-[#fff1df] text-[#ad6213]",
  approved: "bg-[#eef2ff] text-[#4e63c8]",
  active: "bg-[#e9f8ef] text-[#168054]",
  revoked: "bg-[#fff0f1] text-[#c34f58]",
  cancelled: "bg-[#f1f2f4] text-[#68707d]",
};

const statusLabels: Record<EnterpriseApiKey["status"], string> = {
  requested: "Solicitada",
  approved: "Aprovada",
  active: "Ativa",
  revoked: "Revogada",
  cancelled: "Cancelada",
};

function formatDate(value?: string | null) {
  return value ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(value)) : "—";
}

export default function EnterpriseApiKeysPage() {
  const [keys, setKeys] = useState<EnterpriseApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequest, setShowRequest] = useState(false);
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<string[]>(["missions:read", "orders:read"]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = () => enterpriseApi.apiKeys().then((response) => setKeys(response.data || []));

  useEffect(() => {
    load().catch((reason: ApiError) => setError(reason.detail || "Não foi possível carregar as chaves.")).finally(() => setLoading(false));
  }, []);

  function toggleScope(scope: string) {
    setScopes((current) => current.includes(scope) ? current.filter((item) => item !== scope) : [...current, scope]);
  }

  async function requestKey(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await enterpriseApi.requestApiKey({ name, scopes });
      setName("");
      setScopes(["missions:read", "orders:read"]);
      setShowRequest(false);
      await load();
    } catch (reason) {
      const apiError = reason as ApiError;
      setError(apiError.detail || "Não foi possível solicitar a chave.");
    } finally {
      setBusy(false);
    }
  }

  async function activate(key: EnterpriseApiKey) {
    setBusy(true);
    setError(null);
    try {
      const response = await enterpriseApi.activateApiKey(key.id);
      setSecret(response.data.secret);
      await load();
    } catch (reason) {
      const apiError = reason as ApiError;
      setError(apiError.detail || "Não foi possível ativar a chave.");
    } finally {
      setBusy(false);
    }
  }

  async function cancel(key: EnterpriseApiKey) {
    setBusy(true);
    try { await enterpriseApi.cancelApiKey(key.id); await load(); } catch (reason) { const apiError = reason as ApiError; setError(apiError.detail || "Não foi possível cancelar a solicitação."); } finally { setBusy(false); }
  }

  async function revoke(key: EnterpriseApiKey) {
    setBusy(true);
    try { await enterpriseApi.revokeApiKey(key.id); await load(); } catch (reason) { const apiError = reason as ApiError; setError(apiError.detail || "Não foi possível revogar a chave."); } finally { setBusy(false); }
  }

  async function copySecret() {
    if (!secret) return;
    await navigator.clipboard?.writeText(secret);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mx-auto max-w-[1500px] pb-16 lg:pb-0">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8490a0]">Integrações</p><h1 className="mt-1 text-2xl font-extrabold tracking-[-0.04em] text-[#151821]">Chaves de API</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-[#727987]">Solicite, ative e revogue credenciais para integrar seu stack de dados à DroneHub. A chave é exibida apenas uma vez após a aprovação.</p></div>
        <Button onClick={() => { setError(null); setShowRequest(true); }}><Plus className="h-4 w-4" /> Solicitar chave de API</Button>
      </div>

      {error && <div className="mt-5 rounded-lg border border-[#f1c5c7] bg-[#fff4f4] px-4 py-3 text-sm text-[#bd4047]">{error}</div>}

      <div className="mt-6 overflow-hidden rounded-xl border border-[#dde1e7] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="overflow-x-auto"><table className="w-full min-w-[880px] text-left text-sm"><thead className="border-b border-[#dfe2e7] bg-[#fafbfc] text-[12px] font-bold text-[#5d6572]"><tr><th className="px-4 py-3">Nome</th><th className="px-4 py-3">Prefixo</th><th className="px-4 py-3">Escopos</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Solicitada em</th><th className="px-4 py-3">Último uso</th><th className="px-4 py-3 text-right">Ações</th></tr></thead><tbody>
          {loading && <tr><td colSpan={7} className="px-4 py-10 text-center text-[#87909e]">Carregando chaves…</td></tr>}
          {!loading && keys.length === 0 && <tr><td colSpan={7} className="px-4 py-14 text-center"><KeyRound className="mx-auto mb-3 h-7 w-7 text-[#a0a7b2]" /><p className="font-semibold text-[#4e5562]">Nenhuma chave de API solicitada</p><p className="mt-1 text-xs text-[#89909c]">Use uma chave para integrar missões, pedidos e entregáveis.</p></td></tr>}
          {keys.map((key) => <tr key={key.id} className="border-b border-[#edf0f3] last:border-0 hover:bg-[#fafbfc]"><td className="px-4 py-3.5 font-semibold text-[#242832]">{key.name}</td><td className="px-4 py-3.5 font-mono text-xs text-[#656d79]">{key.prefix || "—"}</td><td className="px-4 py-3.5"><div className="flex max-w-[260px] flex-wrap gap-1">{key.scopes.length ? key.scopes.map((scope) => <span key={scope} className="rounded bg-[#f0f1f3] px-1.5 py-0.5 font-mono text-[10px] text-[#585f6b]">{scope}</span>) : <span className="text-[#89909c]">Sem escopos</span>}</div></td><td className="px-4 py-3.5"><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusStyles[key.status]}`}>{statusLabels[key.status]}</span></td><td className="px-4 py-3.5 text-[#626a76]">{formatDate(key.requested_at)}</td><td className="px-4 py-3.5 text-[#626a76]">{formatDate(key.last_used_at)}</td><td className="px-4 py-3.5 text-right">{key.status === "approved" && <Button size="sm" loading={busy} onClick={() => activate(key)}>Ativar</Button>}{key.status === "requested" && <button disabled={busy} onClick={() => cancel(key)} className="text-xs font-semibold text-[#d14f58] hover:underline">Cancelar</button>}{key.status === "active" && <button disabled={busy} onClick={() => revoke(key)} className="text-xs font-semibold text-[#d14f58] hover:underline">Revogar</button>}</td></tr>)}
        </tbody></table></div>
      </div>

      <section className="mt-5 flex gap-3 rounded-xl border border-[#cfe8c4] bg-[#f6fff2] p-4"><ShieldCheck className="h-5 w-5 shrink-0 text-[#4d9224]" /><div><p className="text-sm font-bold text-[#386520]">Fluxo seguro de credenciais</p><p className="mt-1 text-xs leading-5 text-[#587346]">Solicite a chave, aguarde a aprovação da equipe DroneHub e então ative-a aqui. Apenas o hash criptográfico é armazenado; não conseguimos recuperar o segredo depois que a janela de ativação for fechada.</p></div></section>

      {showRequest && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#10141b]/45 p-4"><form onSubmit={requestKey} className="w-full max-w-lg rounded-xl bg-white p-5 shadow-2xl"><div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-extrabold text-[#1b202a]">Solicitar chave de API</h2><p className="mt-1 text-sm text-[#737a87]">A aprovação é feita pela equipe da plataforma.</p></div><button type="button" onClick={() => setShowRequest(false)} className="rounded p-1 text-[#7e8592] hover:bg-[#f2f3f5]"><X className="h-5 w-5" /></button></div><label className="mt-5 block text-xs font-bold text-[#37404d]">Nome da integração<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Pipeline de dados de produção" className="mt-1.5 h-10 w-full rounded-md border border-[#d8dce2] px-3 text-sm outline-none focus:border-[#87ad3a]" /></label><fieldset className="mt-5"><legend className="text-xs font-bold text-[#37404d]">Escopos solicitados</legend><div className="mt-2 grid gap-2 sm:grid-cols-2">{SCOPE_OPTIONS.map(([scope, label]) => <label key={scope} className="flex cursor-pointer items-center gap-2 rounded-md border border-[#e2e5e9] px-3 py-2 text-xs text-[#4d5563]"><input type="checkbox" checked={scopes.includes(scope)} onChange={() => toggleScope(scope)} />{label}</label>)}</div></fieldset><div className="mt-6 flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setShowRequest(false)}>Cancelar</Button><Button type="submit" loading={busy}>Enviar solicitação</Button></div></form></div>}
      {secret && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#10141b]/45 p-4"><div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl"><div className="flex items-start gap-3"><div className="rounded-full bg-[#e9f8ef] p-2 text-[#168054]"><Check className="h-5 w-5" /></div><div><h2 className="text-lg font-extrabold text-[#1b202a]">Copie sua chave agora</h2><p className="mt-1 text-sm text-[#737a87]">Ela não será exibida novamente.</p></div></div><code className="mt-5 block break-all rounded-lg border border-[#d9e8bb] bg-[#f8ffed] p-3 font-mono text-xs text-[#34441c]">{secret}</code><div className="mt-5 flex justify-end gap-2"><Button variant="outline" onClick={() => setSecret(null)}>Fechar</Button><Button onClick={copySecret}>{copied ? <><Check className="h-4 w-4" /> Copiada</> : <><Copy className="h-4 w-4" /> Copiar chave</>}</Button></div></div></div>}
    </div>
  );
}
