export default function CompliancePage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold text-text">Compliance</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="card">
          <h2 className="font-semibold text-text">Certificações</h2>
          <p className="mt-2 text-[14px] text-text-muted">ANAC / equivalentes por país</p>
          <button type="button" className="btn-secondary mt-4">Enviar documento</button>
        </div>
        <div className="card">
          <h2 className="font-semibold text-text">Seguros</h2>
          <p className="mt-2 text-[14px] text-text-muted">Apólices e validade</p>
          <button type="button" className="btn-secondary mt-4">Enviar apólice</button>
        </div>
      </div>
    </div>
  );
}
