"use client";

import { useState } from "react";
import Link from "next/link";
import { apiFetch, type ApiError } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type DataIntentConfig = {
  wizard_enabled: boolean;
  headline?: string;
  min_base_price?: number;
  price_per_hectare_rgb?: number;
  price_per_hectare_multispectral?: number;
  price_per_hectare_lidar?: number;
  thermal_asset_base_price?: number;
  typical_delivery_days?: number;
};

type WizardProps = {
  operatorSlug: string;
  operatorName: string;
  config?: DataIntentConfig | null;
};

const SERVICES = [
  { value: "rgb", label: "Mapeamento Topográfico RGB / Ortomosaico" },
  { value: "multispectral", label: "Agricultura de Precisão / NDVI Multiespectral" },
  { value: "lidar", label: "Nuvem de Pontos LiDAR de Alta Densidade" },
  { value: "thermal", label: "Inspeção Térmica / Termografia Solar & Industrial" },
];

export function DataIntentWizard({ operatorSlug, operatorName, config }: WizardProps) {
  const { success, error: toastError } = useToast();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [serviceType, setServiceType] = useState<string>("rgb");
  const [areaHectares, setAreaHectares] = useState<string>("100");
  const [city, setCity] = useState<string>("");
  const [stateCode, setStateCode] = useState<string>("MT");

  const [contactName, setContactName] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [contactPhone, setContactPhone] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const [calculating, setCalculating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [estimate, setEstimate] = useState<{
    minPrice: number;
    maxPrice: number;
    days: number;
  } | null>(null);

  async function handleCalculate(e: React.FormEvent) {
    e.preventDefault();
    setCalculating(true);
    try {
      const res = await apiFetch<{
        data: {
          estimated_min_price: number;
          estimated_max_price: number;
          estimated_days: number;
        };
      }>(`/operators/${operatorSlug}/calculate_intent`, {
        method: "POST",
        body: JSON.stringify({
          service_type: serviceType,
          area_hectares: parseFloat(areaHectares) || 0,
        }),
      });

      setEstimate({
        minPrice: res.data.estimated_min_price,
        maxPrice: res.data.estimated_max_price,
        days: res.data.estimated_days,
      });
      setStep(3);
    } catch (err) {
      // Fallback local calculation
      const area = parseFloat(areaHectares) || 100;
      const base = config?.min_base_price || 1500;
      const rate = serviceType === "multispectral" ? 45 : serviceType === "lidar" ? 85 : 25;
      const min = base + area * rate;
      setEstimate({
        minPrice: min,
        maxPrice: min * 1.2,
        days: config?.typical_delivery_days || 5,
      });
      setStep(3);
    } finally {
      setCalculating(false);
    }
  }

  async function handleSubmitLead(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiFetch(`/operators/${operatorSlug}/inquiries`, {
        method: "POST",
        body: JSON.stringify({
          contact_name: contactName,
          contact_email: contactEmail,
          contact_phone: contactPhone,
          service_type: serviceType,
          city,
          state_code: stateCode,
          estimated_area_ha: parseFloat(areaHectares) || 0,
          notes,
        }),
      });

      success("Solicitação enviada com sucesso! O operador entrará em contato em breve.");
      setStep(4);
    } catch (err) {
      const apiErr = err as ApiError;
      toastError(apiErr.detail || apiErr.title || "Erro ao enviar solicitação.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-sm sm:p-8 space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-fg text-xs font-bold">
            ⚡
          </span>
          <h2 className="text-lg font-bold text-text">
            {config?.headline || "Calculadora Rápida de Orçamento & Estimativa"}
          </h2>
        </div>
        <p className="mt-1 text-xs text-text-muted">
          Estime instantaneamente o investimento para sua área com {operatorName}.
        </p>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center gap-2 border-b border-border pb-4 text-xs font-medium">
        <span className={`px-2.5 py-1 rounded ${step === 1 ? "bg-primary text-primary-fg" : "bg-surface-soft text-text-muted"}`}>
          1. Serviço
        </span>
        <span className="text-text-muted">→</span>
        <span className={`px-2.5 py-1 rounded ${step === 2 ? "bg-primary text-primary-fg" : "bg-surface-soft text-text-muted"}`}>
          2. Área & Local
        </span>
        <span className="text-text-muted">→</span>
        <span className={`px-2.5 py-1 rounded ${step >= 3 ? "bg-primary text-primary-fg" : "bg-surface-soft text-text-muted"}`}>
          3. Estimativa & Contato
        </span>
      </div>

      {/* Step 1: Service Selection */}
      {step === 1 && (
        <div className="space-y-4">
          <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted">
            Qual tipo de dado você precisa?
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            {SERVICES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setServiceType(s.value)}
                className={`flex flex-col text-left rounded-card p-4 border transition ${
                  serviceType === s.value
                    ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary"
                    : "border-border bg-surface hover:border-border-strong"
                }`}
              >
                <span className="font-semibold text-text text-sm">{s.label}</span>
              </button>
            ))}
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={() => setStep(2)}>
              Avançar para Área & Local →
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Area and Location */}
      {step === 2 && (
        <form onSubmit={handleCalculate} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-text mb-1.5">
                Área Estimada (em hectares)
              </label>
              <Input
                type="number"
                min="1"
                step="1"
                required
                value={areaHectares}
                onChange={(e) => setAreaHectares(e.target.value)}
                placeholder="Ex: 150"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text mb-1.5">
                Município / Estado
              </label>
              <div className="flex gap-2">
                <Input
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ex: Sinop"
                />
                <Select
                  value={stateCode}
                  onChange={(e) => setStateCode(e.target.value)}
                  className="w-24"
                >
                  <option value="MT">MT</option>
                  <option value="MS">MS</option>
                  <option value="GO">GO</option>
                  <option value="PR">PR</option>
                  <option value="SP">SP</option>
                  <option value="MG">MG</option>
                  <option value="BA">BA</option>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="outline" type="button" onClick={() => setStep(1)}>
              ← Voltar
            </Button>
            <Button type="submit" loading={calculating}>
              Calcular Estimativa Instantânea ⚡
            </Button>
          </div>
        </form>
      )}

      {/* Step 3: Estimate Output & Lead Form */}
      {step === 3 && estimate && (
        <div className="space-y-6">
          <div className="rounded-card border border-primary/40 bg-primary/5 p-6 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Estimativa Calculada
            </span>
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
              <div className="text-2xl font-bold text-text font-mono">
                R$ {estimate.minPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} – R$ {estimate.maxPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs font-medium text-text-muted">
                ⏱️ Prazo típico: {estimate.days} dias úteis
              </div>
            </div>
            <p className="text-xs text-text-muted">
              *Estimativa preliminar baseada em {areaHectares} ha em {city || "Mato Grosso"}. O valor final é confirmado na proposta formal.
            </p>
          </div>

          <form onSubmit={handleSubmitLead} className="space-y-4">
            <h3 className="text-sm font-semibold text-text">
              Deseja receber a proposta formal de {operatorName}?
            </h3>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-text mb-1">Seu Nome / Empresa</label>
                <Input
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Ex: João da Silva"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text mb-1">E-mail Corporativo</label>
                <Input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="joao@fazenda.com.br"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text mb-1">WhatsApp / Telefone</label>
                <Input
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="(66) 99999-0000"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text mb-1">Observações adicionais (opcional)</label>
              <Textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Necessidade de pontos de controle ou urgência antes do plantio..."
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-between pt-2">
              <Link
                href={`/app/missions/new?operator=${operatorSlug}&type=${serviceType}`}
                className="btn-primary text-center px-6 py-2 text-sm"
              >
                🚀 Criar Missão Oficial com Este Operador
              </Link>
              <Button type="submit" variant="secondary" loading={submitting}>
                Enviar Contato Rápido
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Step 4: Success Message */}
      {step === 4 && (
        <div className="text-center py-8 space-y-4">
          <span className="text-4xl block">🎉</span>
          <h3 className="text-lg font-bold text-text">Solicitação Enviada!</h3>
          <p className="text-sm text-text-muted max-w-md mx-auto">
            {operatorName} recebeu sua solicitação para {areaHectares} hectares e retornará com os detalhes da operação.
          </p>
          <div className="pt-4 flex justify-center gap-4">
            <Button variant="outline" onClick={() => setStep(1)}>
              Fazer Novo Cálculo
            </Button>
            <Link href={`/app/missions/new?operator=${operatorSlug}`} className="btn-primary">
              Ir para o Workspace de Missões
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
