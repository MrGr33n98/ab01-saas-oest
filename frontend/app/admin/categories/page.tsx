"use client";

import { useState } from "react";
import { SERVICE_CATEGORIES } from "@/lib/categories";
import { Button } from "@/components/ui/button";

type CategoryItem = {
  slug: string;
  name: string;
  description: string;
  active: boolean;
  position: number;
};

export default function AdminCategoriesPage() {
  const [items, setItems] = useState<CategoryItem[]>(
    SERVICE_CATEGORIES.map((c, i) => ({ slug: c.slug, name: c.name, description: c.description, active: true, position: i }))
  );
  const [name, setName] = useState("");

  function addCategory() {
    if (!name.trim()) return;
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    setItems((prev) => [...prev, { slug, name, description: "", active: true, position: prev.length }]);
    setName("");
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold text-text">Categorias de serviço</h1>
      <p className="mt-1 text-[15px] text-text-muted">
        CRUD admin · API <code className="text-[12px]">/api/v1/admin/categories</code>
      </p>

      <div className="mt-6 flex gap-2">
        <input
          className="input max-w-xs"
          placeholder="Nova categoria"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button onClick={addCategory}>Adicionar</Button>
      </div>

      <div className="mt-8 overflow-hidden rounded-card border border-border">
        <table className="w-full text-left text-[14px]">
          <thead className="bg-surface-soft text-text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Ativa</th>
              <th className="px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.slug} className="border-t border-border">
                <td className="px-4 py-3 text-text">{c.name}</td>
                <td className="px-4 py-3 text-text-muted">{c.slug}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    className="text-[13px] text-text-muted underline"
                    onClick={() =>
                      setItems((prev) =>
                        prev.map((x) => (x.slug === c.slug ? { ...x, active: !x.active } : x))
                      )
                    }
                  >
                    {c.active ? "sim" : "não"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button type="button" className="text-[13px] text-danger">
                    Desativar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
