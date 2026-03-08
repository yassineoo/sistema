"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Edit2, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";
import {
  useGetCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/categories";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import type { Category } from "@/types/api";

interface DeleteDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
  t: ReturnType<typeof useTranslations>;
}

function DeleteDialog({ onConfirm, onCancel, loading, t }: DeleteDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
      >
        <h3 className="text-base font-semibold text-secondary-900">
          {t("deleteConfirm")}
        </h3>
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-secondary-200 px-4 py-2 text-sm font-medium text-secondary-600 hover:bg-secondary-50"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-60"
          >
            {loading ? "..." : t("confirm")}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

interface EditRowProps {
  category: Category;
  onSave: (id: number, data: { name: string; description: string; is_active: boolean }) => Promise<void>;
  onCancel: () => void;
  isPending: boolean;
  t: ReturnType<typeof useTranslations>;
}

function EditRow({ category, onSave, onCancel, isPending, t }: EditRowProps) {
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description ?? "");
  const [isActive, setIsActive] = useState(category.is_active);

  async function handleSave() {
    if (!name.trim()) return;
    await onSave(category.id, { name: name.trim(), description, is_active: isActive });
  }

  return (
    <tr className="bg-primary-50/50">
      <td className="px-4 py-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-8 w-full rounded-lg border border-secondary-200 px-2 text-sm outline-none focus:border-primary-500"
          autoFocus
        />
      </td>
      <td className="px-4 py-3 text-xs text-secondary-400">{category.slug}</td>
      <td className="px-4 py-3">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("descriptionPlaceholder")}
          className="h-8 w-full rounded-lg border border-secondary-200 px-2 text-sm outline-none focus:border-primary-500"
        />
      </td>
      <td className="px-4 py-3 text-center">
        <label className="flex cursor-pointer items-center justify-center gap-1.5">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 accent-primary-600"
          />
          <span className="text-xs text-secondary-600">
            {isActive ? t("active") : t("inactive")}
          </span>
        </label>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60"
          >
            <Check size={14} />
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-secondary-200 text-secondary-500 hover:bg-secondary-50"
          >
            <X size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function CategoriesPage() {
  const t = useTranslations("categoriesAdmin");

  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createIsActive, setCreateIsActive] = useState(true);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading, isError } = useGetCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const categories = data?.results ?? [];

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!createName.trim()) return;
    try {
      await createCategory.mutateAsync({
        name: createName.trim(),
        description: createDescription.trim() || undefined,
        is_active: createIsActive,
      });
      toast.success(t("created"));
      setCreateName("");
      setCreateDescription("");
      setCreateIsActive(true);
      setCreateOpen(false);
    } catch {
      toast.error(t("error"));
    }
  }

  async function handleUpdate(
    id: number,
    data: { name: string; description: string; is_active: boolean }
  ) {
    try {
      await updateCategory.mutateAsync({
        id,
        payload: {
          name: data.name,
          description: data.description || undefined,
          is_active: data.is_active,
        },
      });
      toast.success(t("updated"));
      setEditingId(null);
    } catch {
      toast.error(t("error"));
    }
  }

  async function handleDelete() {
    if (deleteId == null) return;
    try {
      await deleteCategory.mutateAsync(deleteId);
      toast.success(t("deleted"));
      setDeleteId(null);
    } catch {
      toast.error(t("error"));
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-secondary-500">{t("subtitle")}</p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
        >
          {createOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {t("add")}
        </button>
      </div>

      {/* Create form (collapsible) */}
      <AnimatePresence>
        {createOpen && (
          <motion.div
            key="create-form"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <form
              onSubmit={handleCreate}
              className="rounded-2xl border border-primary-100 bg-primary-50/30 p-5 shadow-sm space-y-4"
            >
              <h2 className="text-base font-semibold text-secondary-900">
                {t("add")}
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-secondary-700">
                    {t("name")} *
                  </label>
                  <input
                    type="text"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder={t("namePlaceholder")}
                    className="h-9 w-full rounded-xl border border-secondary-200 px-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-secondary-700">
                    {t("description")}
                  </label>
                  <input
                    type="text"
                    value={createDescription}
                    onChange={(e) => setCreateDescription(e.target.value)}
                    placeholder={t("descriptionPlaceholder")}
                    className="h-9 w-full rounded-xl border border-secondary-200 px-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={createIsActive}
                    onChange={(e) => setCreateIsActive(e.target.checked)}
                    className="h-4 w-4 accent-primary-600"
                  />
                  <span className="text-sm font-medium text-secondary-700">
                    {t("isActive")}
                  </span>
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCreateOpen(false)}
                    className="rounded-xl border border-secondary-200 px-4 py-2 text-sm font-medium text-secondary-600 hover:bg-secondary-50"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={createCategory.isPending}
                    className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
                  >
                    {createCategory.isPending ? t("saving") : t("save")}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-secondary-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-secondary-100 bg-secondary-50/50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-secondary-500">
                  {t("name")}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-secondary-500">
                  {t("slug")}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-secondary-500">
                  {t("description")}
                </th>
                <th className="px-4 py-3 text-center font-semibold text-secondary-500">
                  {t("status")}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-secondary-500">
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-50">
              {isLoading ? (
                <TableSkeleton rows={6} cols={5} />
              ) : isError ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-red-500"
                  >
                    {t("errorLoading")}
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-secondary-400"
                  >
                    {t("noCategories")}
                  </td>
                </tr>
              ) : (
                categories.map((cat) =>
                  editingId === cat.id ? (
                    <EditRow
                      key={cat.id}
                      category={cat}
                      onSave={handleUpdate}
                      onCancel={() => setEditingId(null)}
                      isPending={updateCategory.isPending}
                      t={t}
                    />
                  ) : (
                    <motion.tr
                      key={cat.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-secondary-50/50"
                    >
                      <td className="px-4 py-3 font-medium text-secondary-900">
                        {cat.name}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-secondary-500">
                        {cat.slug}
                      </td>
                      <td className="px-4 py-3 max-w-[200px] truncate text-secondary-600">
                        {cat.description ?? (
                          <span className="text-secondary-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            cat.is_active
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-secondary-100 text-secondary-500"
                          }`}
                        >
                          {cat.is_active ? t("active") : t("inactive")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingId(cat.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary-500 hover:bg-secondary-100 hover:text-secondary-700"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteId(cat.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete dialog */}
      {deleteId != null && (
        <DeleteDialog
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleteCategory.isPending}
          t={t}
        />
      )}
    </div>
  );
}
