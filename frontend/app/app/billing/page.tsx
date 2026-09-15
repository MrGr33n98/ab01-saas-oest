export default function BillingPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold text-text">Billing</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="card">
          <p className="text-[13px] text-text-muted">Plano atual</p>
          <p className="mt-1 text-lg font-semibold text-text">Starter</p>
          <button type="button" className="btn-primary mt-4">Fazer upgrade</button>
        </div>
        <div className="card">
          <p className="text-[13px] text-text-muted">Uso do período</p>
          <p className="mt-1 text-[15px] text-text-muted">Missões, armazenamento e API conforme limites do plano</p>
        </div>
      </div>
    </div>
  );
}
