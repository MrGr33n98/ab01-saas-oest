"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, ChevronRight, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { operatorApi, type OperatorOnboarding, type OperatorOnboardingSection } from "@/lib/api/operator";
import type { ApiError } from "@/lib/api/client";

const STEPS: Array<{ id: OperatorOnboardingSection; title: string; description: string }> = [
  { id: "address", title: "Address & location", description: "Informe a sua base e a área onde pode operar." },
  { id: "equipment", title: "Equipment & hardware", description: "Conte quais aeronaves, sensores e softwares você domina." },
  { id: "business", title: "Business & company", description: "Dados legais, seguro e autorização de operador." },
  { id: "experience", title: "Experience & skills", description: "Especialidades e setores onde você entrega resultado." },
  { id: "documents", title: "Documents", description: "Indique o status dos documentos obrigatórios." },
  { id: "pricing", title: "Pricing", description: "Faixas de preço ajudam a qualificar o convite certo." },
];

const EMPTY: OperatorOnboarding = {
  status: "draft",
  completion_percentage: 0,
  completed_sections: [],
  ready_to_submit: false,
  sections: {
    address: { complete: false, data: {} }, equipment: { complete: false, data: {} }, business: { complete: false, data: {} },
    experience: { complete: false, data: {} }, documents: { complete: false, data: {} }, pricing: { complete: false, data: {} },
  },
};

function asText(value: unknown) {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function asList(value: unknown) {
  return Array.isArray(value) ? value.join(", ") : "";
}

function OperatorOnboardingContent() {
  const query = useSearchParams();
  const initialStep = Math.max(0, STEPS.findIndex((step) => step.id === query.get("section")));
  const [stepIndex, setStepIndex] = useState(initialStep);
  const [onboarding, setOnboarding] = useState<OperatorOnboarding>(EMPTY);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const step = STEPS[stepIndex];

  useEffect(() => {
    operatorApi.onboarding()
      .then(({ data }) => {
        setOnboarding(data);
        setForm(data.sections[STEPS[initialStep].id]?.data || {});
      })
      .catch((reason: ApiError) => setError(reason.detail || reason.title || "Não foi possível carregar o cadastro."))
      .finally(() => setLoading(false));
  }, [initialStep]);

  const currentData = useMemo(() => onboarding.sections[step.id]?.data || {}, [onboarding, step.id]);

  function setField(name: string, value: string | boolean) {
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function changeStep(nextIndex: number) {
    setStepIndex(nextIndex);
    setForm(onboarding.sections[STEPS[nextIndex].id]?.data || {});
    setNotice(null);
    setError(null);
  }

  async function save(moveForward = false) {
    setSaving(true);
    setError(null);
    try {
      const response = await operatorApi.saveOnboardingSection(step.id, form);
      setOnboarding(response.data);
      setForm(response.data.sections[step.id].data || {});
      setNotice("Etapa salva. Você pode continuar quando quiser.");
      if (moveForward && stepIndex < STEPS.length - 1) changeStep(stepIndex + 1);
    } catch (reason) {
      const apiError = reason as ApiError;
      setError(apiError.detail || apiError.title || "Não foi possível salvar esta etapa.");
    } finally {
      setSaving(false);
    }
  }

  const input = (name: string, label: string, options: { type?: string; placeholder?: string; required?: boolean } = {}) => (
    <label className="block text-sm font-medium text-slate-700">
      {label}{options.required && <span className="ml-1 text-violet-600">*</span>}
      <Input className="mt-1.5 h-11 border-slate-200 bg-white" type={options.type || "text"} placeholder={options.placeholder} value={asText(form[name] ?? currentData[name])} onChange={(event) => setField(name, event.target.value)} />
    </label>
  );

  const list = (name: string, label: string, placeholder: string) => (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <Input className="mt-1.5 h-11 border-slate-200 bg-white" placeholder={placeholder} value={asText(form[name] ?? asList(currentData[name]))} onChange={(event) => setField(name, event.target.value)} onBlur={(event) => setForm((previous) => ({ ...previous, [name]: event.target.value.split(",").map((value) => value.trim()).filter(Boolean) }))} />
      <span className="mt-1 block text-xs font-normal text-slate-500">Separe as opções por vírgula.</span>
    </label>
  );

  const toggle = (name: string, label: string) => {
    const value = Boolean(form[name] ?? currentData[name]);
    return <button type="button" onClick={() => setField(name, !value)} className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left text-sm transition ${value ? "border-violet-300 bg-violet-50 text-violet-900" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"}`}><span className={`flex h-5 w-5 items-center justify-center rounded border ${value ? "border-violet-600 bg-violet-600 text-white" : "border-slate-300"}`}>{value && <Check className="h-3.5 w-3.5" />}</span>{label}</button>;
  };

  function formForStep() {
    switch (step.id) {
      case "address":
        return <div className="grid gap-5 md:grid-cols-2">{input("full_name", "Nome completo", { required: true, placeholder: "Seu nome" })}{input("company_address", "Endereço da empresa", { required: true, placeholder: "Rua, número e complemento" })}{input("country_code", "País", { required: true, placeholder: "BR" })}{input("state_code", "Estado", { placeholder: "MT" })}{input("city", "Cidade", { required: true, placeholder: "Cuiabá" })}{input("phone_e164", "Telefone", { required: true, placeholder: "+55 65 99999-0000" })}{input("postal_code", "CEP", { placeholder: "78000-000" })}{input("max_travel_distance_km", "Distância máxima de deslocamento (km)", { type: "number", required: true, placeholder: "250" })}<div className="md:col-span-2">{list("available_countries", "Países onde pode operar", "Brasil, Paraguai" )}</div></div>;
      case "equipment":
        return <div className="grid gap-5 md:grid-cols-2"><div className="md:col-span-2">{list("drone_models", "Modelos de drone", "DJI Mavic 3 Enterprise, Matrice 350 RTK")}</div><div className="md:col-span-2">{list("sensors", "Sensores e câmeras", "RGB, Multiespectral, Térmica")}</div>{input("camera_resolution", "Resolução principal", { placeholder: "20 MP" })}{input("flight_hours", "Horas totais de voo", { type: "number", required: true, placeholder: "500" })}{input("ground_capture_equipment", "Equipamento de captura terrestre", { placeholder: "GNSS RTK, GCP" })}{input("base_station", "Estação base", { placeholder: "D-RTK 2" })}<div className="md:col-span-2">{input("mapping_software", "Software de mapeamento", { placeholder: "Pix4D, Agisoft, DJI Terra" })}</div><div className="md:col-span-2">{toggle("gcp_experience", "Tenho experiência com pontos de controle em solo (GCP).")}</div></div>;
      case "business":
        return <div className="grid gap-5 md:grid-cols-2">{input("legal_name", "Razão social ou nome legal", { required: true })}{input("company_registration", "Registro da empresa", { required: true, placeholder: "CNPJ ou registro local" })}{input("tax_id", "CPF/CNPJ", { placeholder: "Documento fiscal" })}{input("insurance_provider", "Seguradora", { placeholder: "Nome da seguradora" })}<div className="md:col-span-2">{input("authorization_reference", "Referência da autorização de operador", { placeholder: "ANAC / autoridade local" })}</div><div className="md:col-span-2 grid gap-3 sm:grid-cols-2">{toggle("has_insurance", "Possuo seguro válido para a operação.")}{toggle("has_operator_authorization", "Possuo autorização de operador válida.")}</div></div>;
      case "experience":
        return <div className="grid gap-5 md:grid-cols-2"><div className="md:col-span-2">{list("industries", "Setores de experiência", "Agronegócio, Energia, Construção")}</div><div className="md:col-span-2">{list("skills", "Habilidades", "Ortomosaico, Inspeção térmica, LiDAR")}</div>{input("years_operating", "Anos de operação", { type: "number", placeholder: "5" })}<label className="md:col-span-2 block text-sm font-medium text-slate-700">Observações<Textarea className="mt-1.5 min-h-28 border-slate-200" value={asText(form.notes ?? currentData.notes)} onChange={(event) => setField("notes", event.target.value)} placeholder="Projetos e certificações relevantes" /></label></div>;
      case "documents":
        return <div className="space-y-5"><p className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">Os arquivos são solicitados pela equipe de revisão após o envio. Nesta etapa, informe o status real de cada documento.</p>{["insurance_document_status", "operator_authorization_document_status", "pilot_license_document_status"].map((name) => <label key={name} className="block text-sm font-medium capitalize text-slate-700">{name.replaceAll("_", " ")}<select className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800" value={asText(form[name] ?? currentData[name])} onChange={(event) => setField(name, event.target.value)}><option value="">Selecione</option><option value="provided">Disponível para revisão</option><option value="verified">Já verificado</option><option value="missing">Ainda não disponível</option></select></label>)}</div>;
      case "pricing":
        return <div className="grid gap-5 md:grid-cols-2">{input("currency", "Moeda", { required: true, placeholder: "BRL" })}{input("daily_rate", "Diária padrão", { type: "number", required: true, placeholder: "2500" })}{input("thermal_daily_rate", "Diária termografia", { type: "number", placeholder: "3200" })}{input("lidar_daily_rate", "Diária LiDAR", { type: "number", placeholder: "4500" })}<div className="md:col-span-2">{input("minimum_job_value", "Valor mínimo do job", { type: "number", placeholder: "1500" })}</div></div>;
    }
  }

  if (loading) return <div className="mx-auto max-w-6xl animate-pulse rounded-3xl border border-slate-200 bg-white p-10"><div className="h-8 w-56 rounded bg-slate-100" /><div className="mt-8 h-80 rounded-2xl bg-slate-100" /></div>;

  return <div className="mx-auto max-w-6xl pb-12">
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><span className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">Operator registration</span><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Construa seu perfil operacional</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Cada etapa pode ser salva separadamente. Seu perfil só segue para revisão quando todos os dados essenciais estiverem completos.</p></div><div className="rounded-2xl bg-violet-50 px-4 py-3 text-right"><p className="text-xs font-semibold text-violet-700">PROGRESSO</p><p className="text-2xl font-bold text-violet-900">{onboarding.completion_percentage}%</p></div></div>
    <div className="grid gap-7 lg:grid-cols-[250px_minmax(0,1fr)]">
      <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"><div className="space-y-1">{STEPS.map((item, index) => { const complete = onboarding.sections[item.id].complete; const active = index === stepIndex; return <button key={item.id} onClick={() => changeStep(index)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${active ? "bg-violet-700 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}><span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${active ? "bg-white/20" : complete ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{complete && !active ? <Check className="h-3.5 w-3.5" /> : index + 1}</span><span className="flex-1">{item.title}</span>{active && <ChevronRight className="h-4 w-4" />}</button>; })}</div></aside>
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"><div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700"><ShieldCheck className="h-5 w-5" /></span><div><p className="text-xs font-bold uppercase tracking-wider text-violet-700">Passo {stepIndex + 1} de {STEPS.length}</p><h2 className="mt-1 text-xl font-bold text-slate-950">{step.title}</h2><p className="mt-1 text-sm text-slate-500">{step.description}</p></div></div><div className="mt-8">{formForStep()}</div>{notice && <p className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>}{error && <p className="mt-6 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}<div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6"><Button type="button" variant="ghost" disabled={stepIndex === 0 || saving} onClick={() => changeStep(stepIndex - 1)}><ArrowLeft className="h-4 w-4" />Anterior</Button><div className="flex gap-2"><Button type="button" variant="secondary" disabled={saving} onClick={() => save(false)}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}Salvar</Button><Button type="button" disabled={saving} onClick={() => save(true)}>{stepIndex === STEPS.length - 1 ? "Concluir etapa" : "Salvar e continuar"}<ArrowRight className="h-4 w-4" /></Button></div></div></section>
    </div>
  </div>;
}

export default function OperatorOnboardingPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl animate-pulse rounded-3xl border border-slate-200 bg-white p-10"><div className="h-8 w-56 rounded bg-slate-100" /><div className="mt-8 h-80 rounded-2xl bg-slate-100" /></div>}>
      <OperatorOnboardingContent />
    </Suspense>
  );
}
