import { useGetItems, useCreateItem, useUpdateItem, useDeleteItem } from "./query";

export const useClients = (filters?: Record<string, unknown>) =>
  useGetItems("clients", undefined, undefined, filters);

export const useCreateClient = () => useCreateItem("clients");

export const useUpdateClient = () => useUpdateItem("clients");

export const useDeleteClient = () => useDeleteItem("clients");
