"use client";

import { useState, useEffect } from "react";
import { apiFetch, type ApiError } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";

type FollowButtonProps = {
  operatorSlug: string;
  initialFollowing?: boolean;
  className?: string;
};

export function FollowButton({
  operatorSlug,
  initialFollowing = false,
  className = "",
}: FollowButtonProps) {
  const { success, error: toastError } = useToast();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check real status if authenticated
    apiFetch<{ data: { following: boolean } }>(`/operators/${operatorSlug}/follow_status`)
      .then((res) => {
        if (res.data?.following !== undefined) {
          setFollowing(res.data.following);
        }
      })
      .catch(() => {
        // Unauthenticated or not in org context
      });
  }, [operatorSlug]);

  async function handleToggleFollow() {
    setLoading(true);
    const nextState = !following;
    setFollowing(nextState); // Optimistic update

    try {
      if (nextState) {
        await apiFetch(`/operators/${operatorSlug}/follow`, { method: "POST" });
        success("Operador salvo na sua carteira de fornecedores homologados!");
      } else {
        await apiFetch(`/operators/${operatorSlug}/unfollow`, { method: "DELETE" });
        success("Operador removido da sua carteira de favoritos.");
      }
    } catch (err) {
      setFollowing(!nextState); // Rollback on error
      const apiErr = err as ApiError;
      toastError(apiErr.detail || apiErr.title || "Faça login com uma conta corporativa para favoritar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant={following ? "secondary" : "outline"}
      onClick={handleToggleFollow}
      loading={loading}
      className={`text-xs gap-1.5 transition ${className}`}
    >
      {following ? (
        <>
          <span className="text-accent-ink font-bold">✓</span>
          <span>Salvo na Carteira</span>
        </>
      ) : (
        <>
          <span>⭐</span>
          <span>Favoritar Fornecedor</span>
        </>
      )}
    </Button>
  );
}
