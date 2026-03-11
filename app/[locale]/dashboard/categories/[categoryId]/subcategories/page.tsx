"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronDown, ChevronUp, Edit2, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";
import {
  useGetCategories,
  useGetSubcategories,
  useCreateSubcategory,
  useUpdateSubcategory,
  useDeleteSubcategory,
} from "@/hooks/categories";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { Link } from "@/i18n/navigation";
import type { Subcategory } from "@/types/api";

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
  subcategory: Subcategory;
  onSave: (id: number, name: string) => Promise<void>;
  onCancel: () => void;
  isPending: boolean;
  t: ReturnType<typeof useTranslations>;
}

function EditRow({ subcategory, onSave, onCancel, isPending, t }: EditRowProps) {
  const [name, setName] = useState(subcategory.name);

  async function handleSave() {
    if (!name.trim()) return;
    await onSave(subcategory.id, name.trim());
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
      <td className="px-4 py-3 text-xs text-secondary-400">{subcategory.slug}</td>
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

export default function SubcategoriesPage() {
  const params = useParams();
  const categoryId = Number(params.categoryId);
  const t = useTranslations("subcategoriesAdmin");

  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: categoriesData } = useGetCategories();
  const { data, isLoading, isError } = useGetSubcategories(categoryId);
  const createSubcategory = useCreateSubcategory();
  const updateSubcategory = useUpdateSubcategory();
  const deleteSubcategory = useDeleteSubcategory();

  const parentCategory = categoriesData?.results?.find((c) => c.id === categoryId);
  const subcategories = data?.results ?? [];

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!createName.trim()) return;
    try {
      await createSubcategory.mutateAsync({ name: createName.trim(), categoryId });
      toast.success(t("created"));
      setCreateName("");
      setCreateOpen(false);
    } catch {
      toast.error(t("error"));
    }
  }

  async function handleUpdate(id: number, name: string) {
    try {
      await updateSubcategory.mutateAsync({ categoryId, id, payload: { name } });
      toast.success(t("updated"));
      setEditingId(null);
    } catch {
      toast.error(t("error"));
    }
  }

  async function handleDelete() {
    if (deleteId == null) return;
    try {
      await deleteSubcategory.mutateAsync({ categoryId, id: deleteId });
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
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/categories"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-secondary-200 text-secondary-500 hover:bg-secondary-50"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">{t("title")}</h1>
            {parentCategory && (
              <p className="mt-0.5 text-sm text-secondary-500">
                {parentCategory.name}
              </p>
            )}
          </div>
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

      {/* Create form */}
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
              <div className="flex gap-3">
                <input
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder={t("namePlaceholder")}
                  className="h-9 flex-1 rounded-xl border border-secondary-200 px-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  required
                />
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="rounded-xl border border-secondary-200 px-4 py-2 text-sm font-medium text-secondary-600 hover:bg-secondary-50"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={createSubcategory.isPending}
                  className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
                >
                  {createSubcategory.isPending ? t("saving") : t("save")}
                </button>
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
                  Slug
                </th>
                <th className="px-4 py-3 text-left font-semibold text-secondary-500">
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-50">
              {isLoading ? (
                <TableSkeleton rows={4} cols={3} />
              ) : isError ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-sm text-red-500">
                    {t("errorLoading")}
                  </td>
                </tr>
              ) : subcategories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-sm text-secondary-400">
                    {t("noSubcategories")}
                  </td>
                </tr>
              ) : (
                subcategories.map((sub) =>
                  editingId === sub.id ? (
                    <EditRow
                      key={sub.id}
                      subcategory={sub}
                      onSave={handleUpdate}
                      onCancel={() => setEditingId(null)}
                      isPending={updateSubcategory.isPending}
                      t={t}
                    />
                  ) : (
                    <motion.tr
                      key={sub.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-secondary-50/50"
                    >
                      <td className="px-4 py-3 font-medium text-secondary-900">
                        {sub.name}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-secondary-500">
                        {sub.slug}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingId(sub.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary-500 hover:bg-secondary-100 hover:text-secondary-700"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteId(sub.id)}
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
          loading={deleteSubcategory.isPending}
          t={t}
        />
      )}
    </div>
  );
}
