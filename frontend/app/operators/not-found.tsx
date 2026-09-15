import Link from "next/link";
import { PublicHeader } from "@/components/layout/public-header";

export default function OperatorNotFound() {
  return (
    <div className="min-h-dvh">
      <PublicHeader />
      <main className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold text-text">Operador não encontrado</h1>
        <p className="mt-2 text-[15px] text-text-muted">
          Este perfil não existe, não é público ou foi desativado.
        </p>
        <Link href="/operators" className="btn-primary mt-8 inline-flex">
          Ver operadores
        </Link>
      </main>
    </div>
  );
}
