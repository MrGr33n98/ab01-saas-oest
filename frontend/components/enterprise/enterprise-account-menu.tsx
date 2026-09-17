"use client";

import Link from "next/link";
import { FileText, LogOut, Map, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Dropdown, DropdownMenu, DropdownTrigger } from "@/components/ui/dropdown";
import { clearSession, loadSession } from "@/lib/api/auth-store";

function initials(email?: string) {
  const local = email?.split("@")[0] || "EU";
  return local.slice(0, 2).toUpperCase();
}

export function EnterpriseAccountMenu() {
  const router = useRouter();
  const [email, setEmail] = useState<string | undefined>();

  useEffect(() => {
    setEmail(loadSession()?.email);
  }, []);

  function signOut() {
    clearSession();
    router.push("/sign-in");
  }

  return (
    <Dropdown>
      <DropdownTrigger>
        <button
          type="button"
          aria-label="Abrir menu da conta"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#edf0f4] text-[11px] font-bold text-[#323946] transition hover:bg-[#e2e6ec]"
        >
          {initials(email)}
        </button>
      </DropdownTrigger>
      <DropdownMenu className="w-72 border-[#e1e4e9] p-2 shadow-[0_14px_35px_rgba(20,25,35,0.16)]" align="right">
        <p className="px-3 py-2 text-sm font-bold text-[#131722]">{email || "Minha conta"}</p>
        <div className="my-1 border-t border-[#eef0f3]" />
        <Link href="/app/enterprise" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-[#202431] hover:bg-[#f2f3f5]">
          <UserRound className="h-4 w-4" /> Meu perfil e empresa
        </Link>
        <Link href="/app/data-library" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-[#202431] hover:bg-[#f2f3f5]">
          <FileText className="h-4 w-4" /> Minha biblioteca
        </Link>
        <Link href="/app/integrations" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-[#202431] hover:bg-[#f2f3f5]">
          <Map className="h-4 w-4" /> Integrações
        </Link>
        <div className="my-1 border-t border-[#eef0f3]" />
        <button onClick={signOut} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium text-[#ec5b61] hover:bg-[#fff1f1]">
          <LogOut className="h-4 w-4" /> Sair
        </button>
      </DropdownMenu>
    </Dropdown>
  );
}
