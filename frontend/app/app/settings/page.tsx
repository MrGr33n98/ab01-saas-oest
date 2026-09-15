export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold text-text">Configurações</h1>
      <div className="mt-8 space-y-6">
        <div className="card">
          <h2 className="font-semibold text-text">Organização</h2>
          <div className="mt-4 space-y-3">
            <div>
              <label className="label">Nome</label>
              <input className="input max-w-md" defaultValue="" />
            </div>
            <div>
              <label className="label">Slug</label>
              <input className="input max-w-md" defaultValue="" />
            </div>
          </div>
        </div>
        <div className="card">
          <h2 className="font-semibold text-text">Preferências de notificação</h2>
          <p className="mt-2 text-[14px] text-text-muted">Quote recebida, status de missão, deliverable pronto, pagamento</p>
        </div>
      </div>
    </div>
  );
}
