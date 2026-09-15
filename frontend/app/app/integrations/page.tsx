export default function IntegrationsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold text-text">Integrações</h1>
      <p className="mt-2 text-[15px] text-text-muted">Webhooks e API keys (feature-gated)</p>
      <div className="mt-8 card">
        <h2 className="font-semibold text-text">Webhooks</h2>
        <p className="mt-1 text-[14px] text-text-muted">Receba mission.completed, deliverable.approved, etc.</p>
        <button type="button" className="btn-secondary mt-4">Adicionar endpoint</button>
      </div>
    </div>
  );
}
