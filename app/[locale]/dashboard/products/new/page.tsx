"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Link, useRouter } from "@/i18n/navigation";
import { useCreateProduct } from "@/hooks/products";
import { useGetPublicCategories } from "@/hooks/products";
import ProductCard from "@/components/shared/product-card";
import type { Product } from "@/types/api";

interface ProductFormValues {
  name: string;
  description: string;
  price: string;
  compare_price: string;
  category_id: string;
  stock: string;
  images: string[];
  main_image: string;
  is_active: boolean;
  is_featured: boolean;
}

const DEFAULT_VALUES: ProductFormValues = {
  name: "",
  description: "",
  price: "",
  compare_price: "",
  category_id: "",
  stock: "0",
  images: [""],
  main_image: "",
  is_active: true,
  is_featured: false,
};

function buildMockProduct(
  form: ProductFormValues,
  categoryName: string
): Product {
  return {
    id: 0,
    name: form.name || "Nom du produit",
    slug: "",
    description: form.description || null,
    price: form.price || "0",
    compare_price: form.compare_price || null,
    images: form.images.filter(Boolean),
    main_image: form.main_image || null,
    stock: parseInt(form.stock, 10) || 0,
    is_active: form.is_active,
    is_featured: form.is_featured,
    category: categoryName
      ? { id: 0, name: categoryName, slug: "", is_active: true }
      : null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function ProductFormInner({
  initialValues,
  onSubmit,
  isPending,
  submitLabel,
}: {
  initialValues: ProductFormValues;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  isPending: boolean;
  submitLabel: string;
}) {
  const t = useTranslations("productsAdmin.form");
  const router = useRouter();
  const { data: categoriesData } = useGetPublicCategories();
  const categories = categoriesData?.results ?? [];

  const [form, setForm] = useState<ProductFormValues>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormValues, string>>>({});

  const selectedCategory = categories.find(
    (c) => String(c.id) === form.category_id
  );

  function set<K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof ProductFormValues, string>> = {};
    if (!form.name.trim()) errs.name = "Requis";
    if (!form.price || isNaN(Number(form.price))) errs.price = "Prix invalide";
    if (form.compare_price && isNaN(Number(form.compare_price)))
      errs.compare_price = "Prix invalide";
    if (isNaN(parseInt(form.stock, 10)) || parseInt(form.stock, 10) < 0)
      errs.stock = "Stock invalide";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(form);
  }

  function addImageField() {
    set("images", [...form.images, ""]);
  }

  function removeImageField(index: number) {
    set(
      "images",
      form.images.filter((_, i) => i !== index)
    );
  }

  function updateImage(index: number, value: string) {
    const next = [...form.images];
    next[index] = value;
    set("images", next);
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-secondary-700">
            {t("name")} *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder={t("namePlaceholder")}
            className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-primary-100 ${
              errors.name
                ? "border-red-400 focus:border-red-400"
                : "border-secondary-200 focus:border-primary-500"
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-secondary-700">
            {t("description")}
          </label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder={t("descriptionPlaceholder")}
            rows={4}
            className="w-full resize-none rounded-xl border border-secondary-200 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>

        {/* Price + Compare Price */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-secondary-700">
              {t("price")} *
            </label>
            <input
              type="number"
              min={0}
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
              placeholder={t("pricePlaceholder")}
              className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-primary-100 ${
                errors.price
                  ? "border-red-400 focus:border-red-400"
                  : "border-secondary-200 focus:border-primary-500"
              }`}
            />
            {errors.price && (
              <p className="mt-1 text-xs text-red-500">{errors.price}</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-secondary-700">
              {t("comparePrice")}
            </label>
            <input
              type="number"
              min={0}
              value={form.compare_price}
              onChange={(e) => set("compare_price", e.target.value)}
              placeholder={t("comparePricePlaceholder")}
              className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-primary-100 ${
                errors.compare_price
                  ? "border-red-400 focus:border-red-400"
                  : "border-secondary-200 focus:border-primary-500"
              }`}
            />
          </div>
        </div>

        {/* Category + Stock */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-secondary-700">
              {t("category")}
            </label>
            <select
              value={form.category_id}
              onChange={(e) => set("category_id", e.target.value)}
              className="h-10 w-full rounded-xl border border-secondary-200 px-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            >
              <option value="">{t("categoryPlaceholder")}</option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-secondary-700">
              {t("stock")} *
            </label>
            <input
              type="number"
              min={0}
              value={form.stock}
              onChange={(e) => set("stock", e.target.value)}
              className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-primary-100 ${
                errors.stock
                  ? "border-red-400 focus:border-red-400"
                  : "border-secondary-200 focus:border-primary-500"
              }`}
            />
            {errors.stock && (
              <p className="mt-1 text-xs text-red-500">{errors.stock}</p>
            )}
          </div>
        </div>

        {/* Images */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-secondary-700">
            {t("images")}
          </label>
          <div className="space-y-2">
            {form.images.map((url, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => updateImage(i, e.target.value)}
                  placeholder={t("imagesPlaceholder")}
                  className="h-9 flex-1 rounded-xl border border-secondary-200 px-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
                {form.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImageField(i)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400 hover:bg-red-50"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addImageField}
            className="mt-2 flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            <Plus size={14} />
            {t("addImage")}
          </button>
        </div>

        {/* Main image */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-secondary-700">
            {t("mainImage")}
          </label>
          <input
            type="url"
            value={form.main_image}
            onChange={(e) => set("main_image", e.target.value)}
            placeholder={t("imagesPlaceholder")}
            className="h-9 w-full rounded-xl border border-secondary-200 px-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>

        {/* Checkboxes */}
        <div className="flex items-center gap-6">
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => set("is_active", e.target.checked)}
              className="h-4 w-4 rounded accent-primary-600"
            />
            <span className="text-sm font-medium text-secondary-700">
              {t("isActive")}
            </span>
          </label>
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={(e) => set("is_featured", e.target.checked)}
              className="h-4 w-4 rounded accent-primary-600"
            />
            <span className="text-sm font-medium text-secondary-700">
              {t("isFeatured")}
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 rounded-xl bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
          >
            {isPending ? t("saving") : submitLabel}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 rounded-xl border border-secondary-200 py-2.5 text-sm font-medium text-secondary-600 hover:bg-secondary-50"
          >
            {t("cancel")}
          </button>
        </div>
      </form>

      {/* Preview */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-secondary-500 uppercase tracking-wide">
          {t("preview")}
        </p>
        <div className="max-w-xs">
          <ProductCard
            product={buildMockProduct(form, selectedCategory?.name ?? "")}
            compact
          />
        </div>
      </div>
    </div>
  );
}

export default function NewProductPage() {
  const t = useTranslations("productsAdmin.form");
  const router = useRouter();
  const createProduct = useCreateProduct();

  async function handleSubmit(values: ProductFormValues) {
    const payload = {
      name: values.name.trim(),
      description: values.description.trim() || null,
      price: values.price,
      compare_price: values.compare_price || null,
      category: values.category_id ? Number(values.category_id) : null,
      stock: parseInt(values.stock, 10),
      images: values.images.filter(Boolean),
      main_image: values.main_image || null,
      is_active: values.is_active,
      is_featured: values.is_featured,
    };

    try {
      await createProduct.mutateAsync(payload as Parameters<typeof createProduct.mutateAsync>[0]);
      toast.success(t("created"));
      router.push("/dashboard/products");
    } catch {
      toast.error(t("error"));
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Back */}
      <Link
        href="/dashboard/products"
        className="inline-flex items-center gap-2 text-sm font-medium text-secondary-500 hover:text-primary-600"
      >
        <ArrowLeft size={16} />
        Retour aux produits
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">
          {t("createTitle")}
        </h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm"
      >
        <ProductFormInner
          initialValues={DEFAULT_VALUES}
          onSubmit={handleSubmit}
          isPending={createProduct.isPending}
          submitLabel={t("save")}
        />
      </motion.div>
    </div>
  );
}
