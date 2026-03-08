"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Search, Plus, Edit2, Trash2, Package } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import {
  useGetAdminProducts,
  useDeleteProduct,
  useToggleProductActive,
  useToggleProductFeatured,
  useUpdateProductStock,
} from "@/hooks/products";
import { useGetPublicCategories } from "@/hooks/products";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import Pagination from "@/components/shared/pagination";

const PAGE_SIZE = 20;

function formatCurrency(value: string | number) {
  return `${Number(value).toLocaleString("fr-DZ")} DA`;
}

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
}

function ToggleSwitch({ checked, onChange, disabled }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
        checked ? "bg-primary-600" : "bg-secondary-300"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-4" : "translate-x-1"
        }`}
      />
    </button>
  );
}

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

export default function ProductsPage() {
  const t = useTranslations("productsAdmin");

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isActive, setIsActive] = useState("");
  const [page, setPage] = useState(1);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editingStockId, setEditingStockId] = useState<number | null>(null);
  const [stockValue, setStockValue] = useState("");

  const { data, isLoading, isError } = useGetAdminProducts(
    search,
    page,
    categoryId,
    isActive,
    "-created_at"
  );
  const { data: categoriesData } = useGetPublicCategories();

  const deleteProduct = useDeleteProduct();
  const toggleActive = useToggleProductActive();
  const toggleFeatured = useToggleProductFeatured();
  const updateStock = useUpdateProductStock();

  const products = data?.results ?? [];
  const total = data?.count ?? 0;
  const categories = categoriesData?.results ?? [];

  async function handleDelete() {
    if (deleteId == null) return;
    try {
      await deleteProduct.mutateAsync(deleteId);
      toast.success("Produit supprimé");
      setDeleteId(null);
    } catch {
      toast.error(t("errorLoading"));
    }
  }

  async function handleToggleActive(id: number, current: boolean) {
    try {
      await toggleActive.mutateAsync({ id, is_active: !current });
    } catch {
      toast.error(t("errorLoading"));
    }
  }

  async function handleToggleFeatured(id: number, current: boolean) {
    try {
      await toggleFeatured.mutateAsync({ id, is_featured: !current });
    } catch {
      toast.error(t("errorLoading"));
    }
  }

  async function handleStockSave(id: number) {
    const val = parseInt(stockValue, 10);
    if (isNaN(val) || val < 0) return;
    try {
      await updateStock.mutateAsync({ id, stock: val });
      setEditingStockId(null);
      setStockValue("");
    } catch {
      toast.error(t("errorLoading"));
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
        <Link
          href="/dashboard/products/new"
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
        >
          <Plus size={16} />
          {t("add")}
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-secondary-100 bg-white p-4 shadow-sm">
        {/* Search */}
        <div className="relative min-w-[200px] flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={t("search")}
            className="h-9 w-full rounded-lg border border-secondary-200 pl-9 pr-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>

        {/* Category */}
        <select
          value={categoryId}
          onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-secondary-200 px-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
        >
          <option value="">{t("filterAll")}</option>
          {categories.map((cat) => (
            <option key={cat.id} value={String(cat.id)}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Active filter */}
        <select
          value={isActive}
          onChange={(e) => { setIsActive(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-secondary-200 px-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
        >
          <option value="">{t("filterAll")}</option>
          <option value="true">{t("filterActive")}</option>
          <option value="false">{t("filterInactive")}</option>
        </select>
      </div>

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
                  {t("category")}
                </th>
                <th className="px-4 py-3 text-right font-semibold text-secondary-500">
                  {t("price")}
                </th>
                <th className="px-4 py-3 text-right font-semibold text-secondary-500">
                  {t("stock")}
                </th>
                <th className="px-4 py-3 text-center font-semibold text-secondary-500">
                  {t("status")}
                </th>
                <th className="px-4 py-3 text-center font-semibold text-secondary-500">
                  {t("featured")}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-secondary-500">
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-50">
              {isLoading ? (
                <TableSkeleton rows={8} cols={7} />
              ) : isError ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-sm text-red-500"
                  >
                    {t("errorLoading")}
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-sm text-secondary-400"
                  >
                    {t("noProducts")}
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-secondary-50/50"
                  >
                    {/* Name + thumbnail */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.main_image || product.images[0] ? (
                          <img
                            src={product.main_image ?? product.images[0]}
                            alt={product.name}
                            className="h-9 w-9 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                            <Package size={16} />
                          </div>
                        )}
                        <span className="max-w-[160px] truncate font-medium text-secondary-900">
                          {product.name}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3">
                      {product.category ? (
                        <span className="inline-flex rounded-full bg-secondary-100 px-2.5 py-0.5 text-xs font-medium text-secondary-600">
                          {product.category.name}
                        </span>
                      ) : (
                        <span className="text-secondary-300">—</span>
                      )}
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold text-primary-600">
                        {formatCurrency(product.price)}
                      </span>
                      {product.compare_price && (
                        <span className="ml-1 text-xs text-secondary-400 line-through">
                          {formatCurrency(product.compare_price)}
                        </span>
                      )}
                    </td>

                    {/* Stock — inline edit */}
                    <td className="px-4 py-3 text-right">
                      {editingStockId === product.id ? (
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="number"
                            min={0}
                            value={stockValue}
                            onChange={(e) => setStockValue(e.target.value)}
                            className="w-16 rounded-lg border border-secondary-200 px-2 py-1 text-sm outline-none focus:border-primary-500"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleStockSave(product.id)}
                            disabled={updateStock.isPending}
                            className="rounded-lg bg-primary-600 px-2 py-1 text-xs font-semibold text-white hover:bg-primary-700"
                          >
                            OK
                          </button>
                          <button
                            type="button"
                            onClick={() => { setEditingStockId(null); setStockValue(""); }}
                            className="rounded-lg border border-secondary-200 px-2 py-1 text-xs text-secondary-500 hover:bg-secondary-50"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingStockId(product.id);
                            setStockValue(String(product.stock));
                          }}
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold hover:opacity-80 ${
                            product.stock === 0
                              ? "bg-red-100 text-red-600"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {product.stock}
                        </button>
                      )}
                    </td>

                    {/* Active toggle */}
                    <td className="px-4 py-3 text-center">
                      <ToggleSwitch
                        checked={product.is_active}
                        onChange={() =>
                          handleToggleActive(product.id, product.is_active)
                        }
                        disabled={toggleActive.isPending}
                      />
                    </td>

                    {/* Featured toggle */}
                    <td className="px-4 py-3 text-center">
                      <ToggleSwitch
                        checked={product.is_featured}
                        onChange={() =>
                          handleToggleFeatured(product.id, product.is_featured)
                        }
                        disabled={toggleFeatured.isPending}
                      />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/dashboard/products/${product.id}/edit`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary-500 hover:bg-secondary-100 hover:text-secondary-700"
                        >
                          <Edit2 size={14} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteId(product.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <Pagination
          page={page}
          total={total}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      )}

      {/* Delete confirmation */}
      {deleteId != null && (
        <DeleteDialog
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleteProduct.isPending}
          t={t}
        />
      )}
    </div>
  );
}
