"use client";

import { FormEvent, useEffect, useState } from "react";
import { Building2, CheckCircle2, Pencil, Save, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { enterpriseApi, type EnterpriseProfile } from "@/lib/api/enterprise";
import type { ApiError } from "@/lib/api/client";

const EMPTY_PROFILE: EnterpriseProfile = {
  user: { id: "", first_name: "", last_name: "", email: "", user_type: "enterprise" },
  organization: { id: "", name: "", legal_name: "", tax_id: "", email: "", country_code: "BR", state_code: "", city: "", organization_type: "enterprise" },
  profile: { industry: "", phone_e164: "", billing_email: "", payment_currency: "BRL", billing_address: {}, email_notifications: true },
};

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return <label className="block text-[12px] font-semibold text-[#303642]">{label}{required && <span className="text-[#ec5b61]"> *</span>}<span className="mt-1.5 block">{children}</span></label>;
}

const inputClass = "h-10 w-full rounded-md border border-[#d8dce2] bg-white px-3 text-sm text-[#252a33] outline-none transition placeholder:text-[#b2b7c0] focus:border-[#8fad48] focus:ring-2 focus:ring-[#b6ef62]/30";

export default function EnterpriseProfilePage() {
  const [data, setData] = useState<EnterpriseProfile>(EMPTY_PROFILE);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    enterpriseApi.profile()
      .then((response) => setData({ ...EMPTY_PROFILE, ...response.data, profile: { ...EMPTY_PROFILE.profile, ...response.data.profile } }))
      .catch((reason: ApiError) => setError(reason.detail || "Não foi possível carregar o perfil."))
      .finally(() => setBusy(false));
  }, []);

  function setUser(key: keyof EnterpriseProfile["user"], value: string) {
    setData((current) => ({ ...current, user: { ...current.user, [key]: value } }));
  }
  function setOrganization(key: keyof EnterpriseProfile["organization"], value: string) {
    setData((current) => ({ ...current, organization: { ...current.organization, [key]: value } }));
  }
  function setProfile(key: keyof EnterpriseProfile["profile"], value: string | boolean) {
    setData((current) => ({ ...current, profile: { ...current.profile, [key]: value } }));
  }
  function setAddress(key: string, value: string) {
    setData((current) => ({ ...current, profile: { ...current.profile, billing_address: { ...current.profile.billing_address, [key]: value } } }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await enterpriseApi.updateProfile({ user: data.user, organization: data.organization, profile: data.profile });
      setData(response.data);
      setEditing(false);
      setMessage("Perfil atualizado com sucesso.");
    } catch (reason) {
      const apiError = reason as ApiError;
      setError(apiError.detail || "Não foi possível salvar as alterações.");
    } finally {
      setSaving(false);
    }
  }

  if (busy) return <div className="mx-auto max-w-[920px] animate-pulse space-y-4"><div className="h-36 rounded-xl bg-[#e8ebef]" /><div className="h-[520px] rounded-xl bg-[#e8ebef]" /></div>;

  return (
    <div className="mx-auto max-w-[920px] pb-16 lg:pb-0">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8490a0]">Enterprise</p><h1 className="mt-1 text-2xl font-extrabold tracking-[-0.04em] text-[#151821]">Meu perfil e empresa</h1></div>
        {!editing && <Button size="sm" onClick={() => setEditing(true)}><Pencil className="h-3.5 w-3.5" /> Editar perfil</Button>}
      </div>

      {error && <div className="mb-4 rounded-lg border border-[#f1c5c7] bg-[#fff4f4] px-4 py-3 text-sm text-[#bd4047]">{error}</div>}
      {message && <div className="mb-4 flex items-center gap-2 rounded-lg border border-[#cdebc9] bg-[#f4fff2] px-4 py-3 text-sm text-[#29733c]"><CheckCircle2 className="h-4 w-4" />{message}</div>}

      <form onSubmit={submit} className="overflow-hidden rounded-xl border border-[#dfe2e7] bg-white shadow-[0_3px_12px_rgba(16,24,40,0.06)]">
        <div className="relative overflow-hidden bg-gradient-to-r from-[#6c9907] to-[#acd849] px-5 py-6 text-white sm:px-7">
          <div className="absolute -right-6 -top-5 h-28 w-28 rounded-full border-[18px] border-white/15" />
          <div className="relative flex items-center gap-4"><div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/50 bg-white/15 text-xl font-extrabold">{`${data.user.first_name?.[0] || "E"}${data.user.last_name?.[0] || ""}`}</div><div><h2 className="text-xl font-extrabold tracking-[-0.03em]">{data.organization.name || "Sua empresa"}</h2><p className="mt-0.5 text-sm text-white/85">Workspace enterprise</p></div></div>
        </div>

        <div className="space-y-8 p-5 sm:p-7">
          <section>
            <div className="mb-4 flex items-center gap-2"><Building2 className="h-4 w-4 text-[#719b16]" /><h3 className="font-bold text-[#20242d]">Dados pessoais</h3></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nome" required><input disabled={!editing} className={inputClass} value={data.user.first_name || ""} onChange={(e) => setUser("first_name", e.target.value)} /></Field>
              <Field label="Sobrenome"><input disabled={!editing} className={inputClass} value={data.user.last_name || ""} onChange={(e) => setUser("last_name", e.target.value)} /></Field>
              <Field label="E-mail" required><input disabled={!editing} type="email" className={inputClass} value={data.user.email} onChange={(e) => setUser("email", e.target.value)} /></Field>
              <Field label="Notificações por e-mail"><button type="button" disabled={!editing} onClick={() => setProfile("email_notifications", !data.profile.email_notifications)} className={`flex h-10 w-full items-center justify-between rounded-md border px-3 text-sm ${data.profile.email_notifications ? "border-[#b8df83] bg-[#f6ffed] text-[#50730d]" : "border-[#d8dce2] text-[#6f7580]"}`}><span>{data.profile.email_notifications ? "Ativadas" : "Desativadas"}</span><span className={`h-5 w-9 rounded-full p-0.5 ${data.profile.email_notifications ? "bg-[#82b326]" : "bg-[#c9ced6]"}`}><span className={`block h-4 w-4 rounded-full bg-white transition ${data.profile.email_notifications ? "translate-x-4" : ""}`} /></span></button></Field>
            </div>
          </section>

          <section className="border-t border-[#eef0f3] pt-7"><h3 className="mb-4 font-bold text-[#20242d]">Dados da empresa</h3><div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome da empresa" required><input disabled={!editing} className={inputClass} value={data.organization.name} onChange={(e) => setOrganization("name", e.target.value)} /></Field>
            <Field label="Razão social"><input disabled={!editing} className={inputClass} value={data.organization.legal_name || ""} onChange={(e) => setOrganization("legal_name", e.target.value)} /></Field>
            <Field label="Setor"><select disabled={!editing} className={inputClass} value={data.profile.industry || ""} onChange={(e) => setProfile("industry", e.target.value)}><option value="">Selecione o setor</option><option>Agronegócio</option><option>Energia</option><option>Infraestrutura</option><option>Mineração</option><option>Meio ambiente</option><option>Outro</option></select></Field>
            <Field label="CNPJ / registro fiscal"><input disabled={!editing} className={inputClass} value={data.organization.tax_id || ""} onChange={(e) => setOrganization("tax_id", e.target.value)} /></Field>
            <Field label="E-mail da empresa"><input disabled={!editing} type="email" className={inputClass} value={data.organization.email || ""} onChange={(e) => setOrganization("email", e.target.value)} /></Field>
            <Field label="Telefone"><input disabled={!editing} className={inputClass} placeholder="+55 00 00000-0000" value={data.profile.phone_e164 || ""} onChange={(e) => setProfile("phone_e164", e.target.value)} /></Field>
          </div></section>

          <section className="border-t border-[#eef0f3] pt-7"><h3 className="mb-4 font-bold text-[#20242d]">Contato e localização</h3><div className="grid gap-4 sm:grid-cols-2">
            <Field label="País"><select disabled={!editing} className={inputClass} value={data.organization.country_code || "BR"} onChange={(e) => setOrganization("country_code", e.target.value)}><option value="BR">Brasil</option><option value="US">Estados Unidos</option><option value="PT">Portugal</option></select></Field>
            <Field label="Estado"><input disabled={!editing} className={inputClass} value={data.organization.state_code || ""} onChange={(e) => setOrganization("state_code", e.target.value.toUpperCase())} /></Field>
            <Field label="Cidade"><input disabled={!editing} className={inputClass} value={data.organization.city || ""} onChange={(e) => setOrganization("city", e.target.value)} /></Field>
            <Field label="CEP"><input disabled={!editing} className={inputClass} value={data.profile.billing_address.postal_code || ""} onChange={(e) => setAddress("postal_code", e.target.value)} /></Field>
            <div className="sm:col-span-2"><Field label="Endereço de cobrança"><input disabled={!editing} className={inputClass} value={data.profile.billing_address.street || ""} onChange={(e) => setAddress("street", e.target.value)} /></Field></div>
          </div></section>

          <section className="border-t border-[#eef0f3] pt-7"><h3 className="mb-4 font-bold text-[#20242d]">Faturamento</h3><div className="grid gap-4 sm:grid-cols-2"><Field label="E-mail de faturamento"><input disabled={!editing} type="email" className={inputClass} value={data.profile.billing_email || ""} onChange={(e) => setProfile("billing_email", e.target.value)} /></Field><Field label="Moeda de pagamento"><select disabled={!editing} className={inputClass} value={data.profile.payment_currency} onChange={(e) => setProfile("payment_currency", e.target.value)}><option value="BRL">BRL — Real brasileiro</option><option value="USD">USD — Dólar americano</option><option value="EUR">EUR — Euro</option></select></Field></div></section>

          {editing && <div className="flex flex-wrap justify-end gap-2 border-t border-[#eef0f3] pt-5"><Button type="button" variant="outline" onClick={() => setEditing(false)}>Cancelar</Button><Button type="submit" loading={saving}><Save className="h-4 w-4" /> Salvar alterações</Button></div>}
        </div>
      </form>

      <div className="mt-5 flex gap-3 rounded-lg border border-[#f0c2c5] bg-[#fff5f5] p-4 text-sm text-[#a53d43]"><ShieldAlert className="h-5 w-5 shrink-0" /><p><strong>Zona de cautela.</strong> A exclusão da empresa é irreversível e não está disponível nesta versão do console. Solicite pelo suporte para preservar dados, pedidos e auditoria.</p></div>
    </div>
  );
}
