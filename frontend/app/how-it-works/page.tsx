import { PublicHeader } from "@/components/layout/public-header";

export const metadata = { title: "Como funciona" };

export default function HowItWorksPage() {
  const steps = [
    "Crie a missão e desenhe o AOI",
    "Receba matches e propostas de operadores elegíveis",
    "Aceite a quote e acompanhe a execução",
    "Receba, revise e aprove os deliverables",
    "Avalie o operador e reutilize a biblioteca de dados",
  ];
  return (
    <div className="min-h-dvh">
      <PublicHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-semibold text-text">Como funciona</h1>
        <ol className="mt-8 space-y-6">
          {steps.map((s, i) => (
            <li key={s} className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-ink">
                {i + 1}
              </span>
              <p className="pt-1 text-[15px] text-text">{s}</p>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}
