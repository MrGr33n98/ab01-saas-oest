"use client";

import { useEffect, useState } from "react";
import { apiFetch, type ApiError } from "@/lib/api/client";

type Drone = {
  id: string;
  manufacturer: string;
  model: string;
  serial_number?: string;
  status: string;
  max_flight_minutes?: number;
  max_payload_grams?: number;
  registration_number?: string;
};

type Payload = {
  id: string;
  name: string;
  sensor_type: string;
  manufacturer?: string;
  model?: string;
  status: string;
};

const DRONE_STATUSES = ["active", "maintenance", "inactive", "retired"];
const SENSOR_TYPES = ["rgb_camera", "multispectral", "thermal", "lidar", "hyperspectral", "other"];

export default function FleetPage() {
  const [tab, setTab] = useState<"drones" | "payloads">("drones");

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold text-text">Frota</h1>
      <p className="mt-1 text-[15px] text-text-muted">Gerencie drones e sensores da sua operação.</p>

      <div className="mt-6 flex gap-1 border-b border-border">
        {(["drones", "payloads"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-[14px] font-medium transition-colors border-b-2 -mb-px capitalize ${
              tab === t
                ? "border-accent-ink text-text"
                : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            {t === "drones" ? "Drones" : "Sensores / Payloads"}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "drones" ? <DronesTab /> : <PayloadsTab />}
      </div>
    </div>
  );
}

// ── Drones ──────────────────────────────────────────────────────────────────
function DronesTab() {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    manufacturer: "",
    model: "",
    serial_number: "",
    registration_number: "",
    max_flight_minutes: "",
    max_payload_grams: "",
    status: "active",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch<{ data: Drone[] }>("/operator/fleet/drones")
      .then((r) => setDrones(r.data))
      .catch((e: ApiError) => setError(e.detail ?? "Erro ao carregar drones"))
      .finally(() => setLoading(false));
  }, []);

  async function addDrone() {
    setSaving(true);
    setError(null);
    try {
      const res = await apiFetch<{ data: Drone }>("/operator/fleet/drones", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          max_flight_minutes: form.max_flight_minutes ? parseInt(form.max_flight_minutes) : undefined,
          max_payload_grams: form.max_payload_grams ? parseInt(form.max_payload_grams) : undefined,
        }),
      });
      setDrones((prev) => [...prev, res.data]);
      setShowForm(false);
      setForm({ manufacturer: "", model: "", serial_number: "", registration_number: "", max_flight_minutes: "", max_payload_grams: "", status: "active" });
    } catch (e) {
      const err = e as ApiError;
      setError(err.detail ?? "Erro ao cadastrar drone");
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      await apiFetch(`/operator/fleet/drones/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setDrones((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
    } catch {
      setError("Erro ao atualizar status");
    }
  }

  if (loading) return <div className="h-48 animate-pulse rounded-card bg-border/20" />;

  return (
    <div className="space-y-4">
      {error && <p className="text-[13px] text-danger border border-danger/30 rounded-input bg-danger/5 px-3 py-2">{error}</p>}

      <div className="flex justify-end">
        <button onClick={() => setShowForm((v) => !v)} className="btn btn-primary">
          {showForm ? "Cancelar" : "+ Adicionar drone"}
        </button>
      </div>

      {showForm && (
        <div className="card space-y-4">
          <h3 className="text-[15px] font-semibold text-text">Novo drone</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Fabricante *</label>
              <input className="input" placeholder="DJI, Autel, Wingtra..." value={form.manufacturer} onChange={(e) => setForm((f) => ({ ...f, manufacturer: e.target.value }))} />
            </div>
            <div>
              <label className="label">Modelo *</label>
              <input className="input" placeholder="Matrice 300, P4 RTK..." value={form.model} onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))} />
            </div>
            <div>
              <label className="label">Número de série</label>
              <input className="input" value={form.serial_number} onChange={(e) => setForm((f) => ({ ...f, serial_number: e.target.value }))} />
            </div>
            <div>
              <label className="label">Registro ANAC</label>
              <input className="input" placeholder="XX-XXXX" value={form.registration_number} onChange={(e) => setForm((f) => ({ ...f, registration_number: e.target.value }))} />
            </div>
            <div>
              <label className="label">Autonomia (min)</label>
              <input type="number" className="input" placeholder="30" value={form.max_flight_minutes} onChange={(e) => setForm((f) => ({ ...f, max_flight_minutes: e.target.value }))} />
            </div>
            <div>
              <label className="label">Payload máx. (g)</label>
              <input type="number" className="input" placeholder="1000" value={form.max_payload_grams} onChange={(e) => setForm((f) => ({ ...f, max_payload_grams: e.target.value }))} />
            </div>
          </div>
          <button onClick={addDrone} disabled={saving || !form.manufacturer || !form.model} className="btn btn-primary">
            {saving ? "Salvando…" : "Salvar drone"}
          </button>
        </div>
      )}

      {drones.length === 0 && !showForm && (
        <div className="card py-12 text-center">
          <div className="text-3xl mb-3">🚁</div>
          <p className="text-[15px] font-medium text-text">Nenhum drone cadastrado</p>
          <p className="mt-1 text-[13px] text-text-muted">Adicione seus drones para participar do matching.</p>
        </div>
      )}

      {drones.map((d) => (
        <div key={d.id} className="card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[15px] font-semibold text-text">{d.manufacturer} {d.model}</p>
              <div className="mt-1 flex flex-wrap gap-2 text-[13px] text-text-muted">
                {d.serial_number && <span>S/N: {d.serial_number}</span>}
                {d.registration_number && <><span>·</span><span>ANAC: {d.registration_number}</span></>}
                {d.max_flight_minutes && <><span>·</span><span>{d.max_flight_minutes}min autonomia</span></>}
                {d.max_payload_grams && <><span>·</span><span>{d.max_payload_grams}g payload</span></>}
              </div>
            </div>
            <select
              value={d.status}
              onChange={(e) => updateStatus(d.id, e.target.value)}
              className="input !w-auto text-[13px]"
            >
              {DRONE_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Payloads ─────────────────────────────────────────────────────────────────
function PayloadsTab() {
  const [payloads, setPayloads] = useState<Payload[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    sensor_type: "rgb_camera",
    manufacturer: "",
    model: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch<{ data: Payload[] }>("/operator/fleet/payloads")
      .then((r) => setPayloads(r.data))
      .catch((e: ApiError) => setError(e.detail ?? "Erro ao carregar sensores"))
      .finally(() => setLoading(false));
  }, []);

  async function addPayload() {
    setSaving(true);
    setError(null);
    try {
      const res = await apiFetch<{ data: Payload }>("/operator/fleet/payloads", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setPayloads((prev) => [...prev, res.data]);
      setShowForm(false);
      setForm({ name: "", sensor_type: "rgb_camera", manufacturer: "", model: "" });
    } catch (e) {
      const err = e as ApiError;
      setError(err.detail ?? "Erro ao cadastrar sensor");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="h-48 animate-pulse rounded-card bg-border/20" />;

  return (
    <div className="space-y-4">
      {error && <p className="text-[13px] text-danger border border-danger/30 rounded-input bg-danger/5 px-3 py-2">{error}</p>}

      <div className="flex justify-end">
        <button onClick={() => setShowForm((v) => !v)} className="btn btn-primary">
          {showForm ? "Cancelar" : "+ Adicionar sensor"}
        </button>
      </div>

      {showForm && (
        <div className="card space-y-4">
          <h3 className="text-[15px] font-semibold text-text">Novo sensor / payload</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Nome *</label>
              <input className="input" placeholder="Zenmuse P1, Sequoia..." value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="label">Tipo de sensor *</label>
              <select className="input" value={form.sensor_type} onChange={(e) => setForm((f) => ({ ...f, sensor_type: e.target.value }))}>
                {SENSOR_TYPES.map((s) => (
                  <option key={s} value={s}>{s.replace("_", " ")}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Fabricante</label>
              <input className="input" value={form.manufacturer} onChange={(e) => setForm((f) => ({ ...f, manufacturer: e.target.value }))} />
            </div>
            <div>
              <label className="label">Modelo</label>
              <input className="input" value={form.model} onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))} />
            </div>
          </div>
          <button onClick={addPayload} disabled={saving || !form.name} className="btn btn-primary">
            {saving ? "Salvando…" : "Salvar sensor"}
          </button>
        </div>
      )}

      {payloads.length === 0 && !showForm && (
        <div className="card py-12 text-center">
          <div className="text-3xl mb-3">📷</div>
          <p className="text-[15px] font-medium text-text">Nenhum sensor cadastrado</p>
          <p className="mt-1 text-[13px] text-text-muted">Adicione câmeras, LiDAR e sensores especializados.</p>
        </div>
      )}

      {payloads.map((p) => (
        <div key={p.id} className="card">
          <p className="text-[15px] font-semibold text-text">{p.name}</p>
          <div className="mt-1 flex flex-wrap gap-2 text-[13px] text-text-muted">
            <span className="capitalize">{p.sensor_type.replace("_", " ")}</span>
            {p.manufacturer && <><span>·</span><span>{p.manufacturer}</span></>}
            {p.model && <><span>·</span><span>{p.model}</span></>}
          </div>
        </div>
      ))}
    </div>
  );
}
