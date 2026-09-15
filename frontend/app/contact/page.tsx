import { PublicHeader } from "@/components/layout/public-header";

export const metadata = { title: "Contato" };

export default function ContactPage() {
  return (
    <div className="min-h-dvh">
      <PublicHeader />
      <main className="mx-auto max-w-lg px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-semibold text-text">Contato</h1>
        <form className="mt-8 space-y-4">
          <div>
            <label className="label" htmlFor="name">Nome</label>
            <input id="name" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="email">E-mail</label>
            <input id="email" type="email" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="msg">Mensagem</label>
            <textarea id="msg" className="input min-h-[120px]" />
          </div>
          <button type="submit" className="btn-primary w-full justify-center">Enviar</button>
        </form>
      </main>
    </div>
  );
}
