import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">Projetos</h1>
          <p className="mt-1 text-[15px] text-text-muted">Agrupe missões por projeto</p>
        </div>
        <Button>Novo projeto</Button>
      </div>
      <div className="mt-10 card py-16 text-center">
        <p className="font-medium text-text">Nenhum projeto</p>
        <p className="mt-1 text-[14px] text-text-muted">Crie um projeto para organizar missões.</p>
      </div>
    </div>
  );
}
