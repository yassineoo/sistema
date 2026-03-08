import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { axiosAPI } from "@/lib/constant";
import { useGetItem, useCreateItem } from "./query";
import type { CommandeStatus, CommandeListItem, CommandeImage, Versement } from "@/types/schema";

export type { Versement };

export interface CommandesPage {
  count: number;
  next: string | null;
  previous: string | null;
  results: CommandeListItem[];
}

export const useCommandes = (page?: number, page_size?: number, filters?: Record<string, unknown>) =>
  useQuery<CommandesPage>({
    queryKey: ["getItems", "commandes", page, page_size, filters],
    queryFn: async () => {
      const res = await axiosAPI.get("/commandes/", {
        params: { page, page_size, ...filters },
      });
      return res.data as CommandesPage;
    },
  });

export const useCommande = (id: number) =>
  useGetItem("commandes", id);

export const useCreateCommande = () => {
  const mutation = useCreateItem("commandes");
  const original = mutation.mutate;
  return {
    ...mutation,
    mutate: (...args: Parameters<typeof original>) => {
      original(...args);
    },
  };
};

export const useUpdateCommandeStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: CommandeStatus }) => {
      const res = await axiosAPI.patch(`/commandes/${id}/status/`, { status });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["getItems", "commandes"], exact: false });
      toast.success("Statut mis à jour");
    },
    onError: () => toast.error("Erreur lors du changement de statut"),
  });
};

// ── Versements ────────────────────────────────────────────────────────────────
// Versements are now embedded in the commandes list response — no separate fetch needed.
// Mutations below invalidate the commandes query so the parent list refetches with
// updated versements[] after every create / delete.

export const useCreateVersement = (commandeId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { amount: number; date: string }) => {
      const res = await axiosAPI.post("/commandes/versements/", {
        ...data,
        commande: commandeId,
      });
      return res.data as Versement;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["getItems", "commandes"], exact: false });
    },
  });
};

export const useDeleteCommande = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await axiosAPI.delete(`/commandes/${id}/`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["getItems", "commandes"], exact: false });
    },
  });
};

export const useDeleteVersement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await axiosAPI.delete(`/commandes/versements/${id}/`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["getItems", "commandes"], exact: false });
    },
  });
};

// ── Client order history ───────────────────────────────────────────────────────
export const useClientCommandeHistory = (clientId: number) =>
  useQuery({
    queryKey: ["commandes", "client", clientId],
    queryFn: async () => {
      const res = await axiosAPI.get(`/commandes/client/${clientId}/`);
      return res.data as CommandeListItem[];
    },
    enabled: !!clientId,
  });

// ── Images ────────────────────────────────────────────────────────────────────
export const useUploadCommandeImages = (commandeId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (files: File[]) => {
      const form = new FormData();
      files.forEach((f) => form.append("images", f));
      const res = await axiosAPI.patch(`/commandes/${commandeId}/images/`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data as CommandeImage[];
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["getItems", "commandes", commandeId] });
    },
    onError: () => toast.error("Erreur lors du téléchargement"),
  });
};

export const useDeleteCommandeImage = (commandeId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (imageId: number) => {
      await axiosAPI.delete(`/commandes/${commandeId}/images/${imageId}/`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["getItems", "commandes", commandeId] });
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });
};
