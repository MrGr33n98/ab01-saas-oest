"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/client";
import { Button } from "@/components/ui/button";

type BadgeRow = { id: string; key: string; name: string; icon?: string; active: boolean };

export default function AdminBadgesPage() {
  const [badges, setBadges] = useState<BadgeRow[]>([]);
  const [profileId, setProfileId] = useState("");
  const [badgeId, setBadgeId] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    apiFetch<{ data: BadgeRow[] }>("/admin/badges").then((r) => setBadges(r.data || [])).catch(() => {});
  }, []);

  async function grant() {
    try {
      await apiFetch("/admin/badges/grant", {
        method: "POST",
        body: JSON.stringify({
          operator_profile_id: profileId,
          verification_badge_id: badgeId,
        }),
      });
      setMsg("Selo concedido");
    } catch {
      setMsg("Falha ao conceder");
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <h1 className="text-2xl font-semibold">Admin · Selos de verificação</h1>
      <ul className="space-y-2 text-sm">
        {badges.map((b) => (
          <li key={b.id} className="flex justify-between border-b border-border py-2">
            <span>
              {b.name} <span className="text-text-muted">({b.key})</span>
            </span>
            <button type="button" className="text-xs underline" onClick={() => setBadgeId(b.id)}>
              selecionar
            </button>
          </li>
        ))}
      </ul>
      <div className="space-y-2 rounded-card border border-border p-4">
        <input
          className="input"
          placeholder="operator_profile_id"
          value={profileId}
          onChange={(e) => setProfileId(e.target.value)}
        />
        <input className="input" placeholder="badge id" value={badgeId} onChange={(e) => setBadgeId(e.target.value)} />
        <Button onClick={grant}>Conceder selo</Button>
        {msg && <p className="text-sm">{msg}</p>}
      </div>
    </div>
  );
}
