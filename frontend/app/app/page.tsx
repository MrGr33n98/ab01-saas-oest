"use client";

import Link from "next/link";
import { ActivationChecklist } from "@/components/onboarding/activation-checklist";
import { Button } from "@/components/ui/button";

export default function CustomerAppHome() {
  const items = [
    { id: "mission", label: "Publicar primeira missão", done: false, href: "/app/missions/new" },
    { id: "team", label: "Convidar colega (opcional)", done: false, href: "/app/team" },
    { id: "billing", label: "Revisar faturamento", done: false, href: "/app/billing" },
  ];
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-text">Workspace</h1>
        <p className="mt-1 text-text-muted">Publique missões e acompanhe propostas e entregas.</p>
        <Link href="/app/missions/new" className="mt-4 inline-block"><Button>Nova missão</Button></Link>
      </div>
      <ActivationChecklist title="Ativação do cliente" items={items} />
    </div>
  );
}
