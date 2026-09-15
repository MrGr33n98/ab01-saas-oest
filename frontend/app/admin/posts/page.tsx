"use client";

import { useEffect, useState } from "react";
import { apiFetch, type ApiError } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  published: boolean;
  published_at?: string;
  locale: string;
  created_at: string;
};

export default function AdminPostsPage() {
  const { success, error: toastError } = useToast();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    body: "",
    locale: "pt-BR",
  });
  const [busy, setBusy] = useState(false);

  function loadPosts() {
    setLoading(true);
    apiFetch<{ data: Post[] }>("/admin/posts")
      .then((res) => setPosts(res.data || []))
      .catch((err: ApiError) => setError(err.detail || err.title || "Erro ao carregar posts"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadPosts();
  }, []);

  function openCreate() {
    setEditingPost(null);
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      body: "",
      locale: "pt-BR",
    });
    setModalOpen(true);
  }

  function handleTitleChange(title: string) {
    const slug = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    setFormData((f) => ({ ...f, title, slug: f.slug === "" || f.slug.startsWith(slug.slice(0, 5)) ? slug : f.slug }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (editingPost) {
        await apiFetch(`/admin/posts/${editingPost.id}`, {
          method: "PATCH",
          body: JSON.stringify({ post: formData }),
        });
        success("Artigo atualizado!");
      } else {
        await apiFetch("/admin/posts", {
          method: "POST",
          body: JSON.stringify({ post: formData }),
        });
        success("Artigo criado com sucesso!");
      }
      setModalOpen(false);
      loadPosts();
    } catch (err) {
      const e = err as ApiError;
      toastError("Falha ao salvar post", e.detail || e.title);
    } finally {
      setBusy(false);
    }
  }

  async function handlePublishToggle(post: Post) {
    try {
      await apiFetch(`/admin/posts/${post.id}/publish`, { method: "POST" });
      success(post.published ? "Artigo revertido para rascunho" : "Artigo publicado com sucesso!");
      loadPosts();
    } catch (err) {
      const e = err as ApiError;
      toastError("Falha na publicação", e.detail || e.title);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-semibold text-text">Gestão de Conteúdo (CMS)</h1>
          <p className="mt-1 text-[15px] text-text-muted">
            Crie e gerencie artigos técnicos, guias regulatórios e estudos de caso para o blog.
          </p>
        </div>
        <Button type="button" onClick={openCreate}>
          + Novo artigo
        </Button>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-card bg-surface border border-border" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-card border border-danger/30 bg-danger/5 p-4 text-center text-sm text-danger">
          {error}
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="rounded-card border border-dashed border-border bg-surface p-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface-soft text-2xl">
            📝
          </div>
          <h3 className="text-lg font-medium text-text">Nenhum post publicado</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-text-muted">
            Comece criando o primeiro artigo para gerar autoridade em SEO e indexação orgânica.
          </p>
          <Button type="button" onClick={openCreate} className="mt-4">
            Criar primeiro artigo
          </Button>
        </div>
      )}

      {!loading && !error && posts.length > 0 && (
        <div className="space-y-3">
          {posts.map((p) => (
            <div
              key={p.id}
              className="flex flex-col gap-3 rounded-card border border-border bg-surface p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-text">{p.title}</h3>
                  <span
                    className={`rounded px-2 py-0.5 text-[11px] font-semibold ${
                      p.published
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-surface-soft text-text-muted border border-border"
                    }`}
                  >
                    {p.published ? "Publicado" : "Rascunho"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-text-muted">
                  slug: <code className="font-mono text-text">/blog/{p.slug}</code> · {p.locale}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`/blog/${p.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded px-2.5 py-1 text-xs text-text hover:bg-surface-soft"
                >
                  Ver no blog ↗
                </a>
                <Button
                  type="button"
                  variant={p.published ? "secondary" : "primary"}
                  onClick={() => handlePublishToggle(p)}
                >
                  {p.published ? "Despublicar" : "Publicar ✓"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Editor */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingPost ? "Editar Artigo" : "Novo Artigo"}
        description="Preencha os campos para indexação e publicação no blog."
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Título do artigo"
            required
            placeholder="Ex: Como Escolher um Drone para Mapeamento Topográfico"
            value={formData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
          />

          <Input
            label="Slug da URL"
            required
            placeholder="como-escolher-drone-topografia"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          />

          <Textarea
            label="Resumo (Excerpt / Meta description)"
            placeholder="Breve introdução para meta description de SEO e card de compartilhamento..."
            rows={2}
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
          />

          <Textarea
            label="Conteúdo completo (HTML / Markdown)"
            placeholder="Escreva o artigo completo com seções, cabeçalhos e parágrafos técnicos..."
            rows={8}
            value={formData.body}
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              className="rounded-input border border-border px-4 py-2 text-sm text-text hover:bg-surface-soft"
              onClick={() => setModalOpen(false)}
              disabled={busy}
            >
              Cancelar
            </button>
            <Button type="submit" disabled={busy || !formData.title || !formData.slug}>
              {busy ? "Salvando…" : "Salvar artigo"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
