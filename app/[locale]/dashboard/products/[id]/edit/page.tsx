"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, X, Plus, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Link, useRouter } from "@/i18n/navigation";
import { useGetAdminProductById, useUpdateProduct } from "@/hooks/products";
import { useGetCategories } from "@/hooks/categories";
import ProductCard from "@/components/shared/product-card";
import type { Product } from "@/types/api";

interface ProductFormValues {
  name: string;
  description: string;
  price: string;
  compare_price: string;
  category_id: string;
  subcategory_id: string;
  stock: string;
  main_image_file: File | null;
  main_image_preview: string;
  gallery_files: File[];
  gallery_existing: { id: number; image: string }[];
  delete_gallery_ids: number[];
  is_active: boolean;
  is_featured: boolean;
}

function buildMockProduct(
  form: ProductFormValues,
  subcategoryName: string,
  categoryName: string
): Product {
  return {
    id: 0,
    name: form.name || "Nom du produit",
    slug: "",
    description: form.description || null,
    price: form.price || "0",
    compare_price: form.compare_price || null,
    gallery: [],
    main_image: form.main_image_preview || null,
    stock: parseInt(form.stock, 10) || 0,
    is_active: form.is_active,
    is_featured: form.is_featured,
    subcategory: subcategoryName
      ? {
          id: 0,
          name: subcategoryName,
          slug: "",
          category: { id: 0, name: categoryName, slug: "", image: null, is_active: true },
        }
      : null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function buildFormData(values: ProductFormValues): FormData {
  const fd = new FormData();
  fd.append("name", values.name.trim());
  if (values.description.trim()) fd.append("description", values.description.trim());
  fd.append("price", values.price);
  if (values.compare_price) fd.append("compare_price", values.compare_price);
  if (values.subcategory_id) fd.append("subcategory_id", values.subcategory_id);
  fd.append("stock", values.stock);
  fd.append("is_active", String(values.is_active));
  fd.append("is_featured", String(values.is_featured));
  if (values.main_image_file) fd.append("main_image", values.main_image_file);
  for (const file of values.gallery_files) {
    fd.append("gallery_images", file);
  }
  for (const id of values.delete_gallery_ids) {
    fd.append("delete_gallery_ids", String(id));
  }
  return fd;
}

export default function EditProductPage() {
  const params = useParams();
  const id = Number(params.id);
  const t = useTranslations("productsAdmin.form");
  const router = useRouter();
  const updateProduct = useUpdateProduct();
  const { data: categoriesData } = useGetCategories();
  const categories = categoriesData?.results ?? [];
  const { data: product, isLoading } = useGetAdminProductById(id);

  const [form, setForm] = useState<ProductFormValues>({
    name: "",
    description: "",
    price: "",
    compare_price: "",
    category_id: "",
    subcategory_id: "",
    stock: "0",
    main_image_file: null,
    main_image_preview: "",
    gallery_files: [],
    gallery_existing: [],
    delete_gallery_ids: [],
    is_active: true,
    is_featured: false,
  });
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [initialized, setInitialized] = useState(false);
  const mainImageRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  // Populate form once product loads
  useEffect(() => {
    if (product && !initialized) {
      setForm({
        name: product.name,
        description: product.description ?? "",
        price: product.price,
        compare_price: product.compare_price ?? "",
        category_id: product.subcategory ? String(product.subcategory.category.id) : "",
        subcategory_id: product.subcategory ? String(product.subcategory.id) : "",
        stock: String(product.stock),
        main_image_file: null,
        main_image_preview: product.main_image ?? "",
        gallery_files: [],
        gallery_existing: product.gallery.map((g) => ({ id: g.id, image: g.image })),
        delete_gallery_ids: [],
        is_active: product.is_active,
        is_featured: product.is_featured,
      });
      setInitialized(true);
    }
  }, [product, initialized]);

  const selectedCategory = categories.find((c) => String(c.id) === form.category_id);
  const subcategories = selectedCategory?.subcategories ?? [];
  const selectedSubcategory = subcategories.find((s) => String(s.id) === form.subcategory_id);

  function set<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  }

  function handleCategoryChange(catId: string) {
    setForm((prev) => ({ ...prev, category_id: catId, subcategory_id: "" }));
  }

  function handleMainImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, main_image_file: file, main_image_preview: preview }));
  }

  function removeMainImage() {
    if (form.main_image_file) URL.revokeObjectURL(form.main_image_preview);
    setForm((prev) => ({ ...prev, main_image_file: null, main_image_preview: "" }));
    if (mainImageRef.current) mainImageRef.current.value = "";
  }

  function handleGalleryAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    set("gallery_files", [...form.gallery_files, ...files]);
    if (galleryRef.current) galleryRef.current.value = "";
  }

  function removeGalleryFile(index: number) {
    set("gallery_files", form.gallery_files.filter((_, i) => i !== index));
  }

  function removeExistingGallery(galleryId: number) {
    setForm((prev) => ({
      ...prev,
      gallery_existing: prev.gallery_existing.filter((g) => g.id !== galleryId),
      delete_gallery_ids: [...prev.delete_gallery_ids, galleryId],
    }));
  }

  function validate(): boolean {
    const errs: Partial<Record<string, string>> = {};
    if (!form.name.trim()) errs.name = "Requis";
    if (!form.price || isNaN(Number(form.price))) errs.price = "Prix invalide";
    if (form.compare_price && isNaN(Number(form.compare_price))) errs.compare_price = "Prix invalide";
    if (isNaN(parseInt(form.stock, 10)) || parseInt(form.stock, 10) < 0) errs.stock = "Stock invalide";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    try {
      await updateProduct.mutateAsync({ id, payload: buildFormData(form) });
      toast.success(t("updated"));
      router.push("/dashboard/products");
    } catch {
      toast.error(t("error"));
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center p-6">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Link
        href="/dashboard/products"
        className="inline-flex items-center gap-2 text-sm font-medium text-secondary-500 hover:text-primary-600"
      >
        <ArrowLeft size={16} />
        Retour aux produits
      </Link>

      <h1 className="text-2xl font-bold text-secondary-900">{t("editTitle")}</h1>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-secondary-700">{t("name")} *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder={t("namePlaceholder")}
                className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-primary-100 ${errors.name ? "border-red-400" : "border-secondary-200 focus:border-primary-500"}`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-secondary-700">{t("description")}</label>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder={t("descriptionPlaceholder")}
                rows={3}
                className="w-full resize-none rounded-xl border border-secondary-200 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
            </div>

            {/* Price + Compare Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-secondary-700">{t("price")} *</label>
                <input
                  type="number" min={0}
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                  placeholder={t("pricePlaceholder")}
                  className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-primary-100 ${errors.price ? "border-red-400" : "border-secondary-200 focus:border-primary-500"}`}
                />
                {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-secondary-700">{t("comparePrice")}</label>
                <input
                  type="number" min={0}
                  value={form.compare_price}
                  onChange={(e) => set("compare_price", e.target.value)}
                  placeholder={t("comparePricePlaceholder")}
                  className="h-10 w-full rounded-xl border border-secondary-200 px-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
              </div>
            </div>

            {/* Category → Subcategory */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-secondary-700">{t("category")}</label>
                <select
                  value={form.category_id}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="h-10 w-full rounded-xl border border-secondary-200 px-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                >
                  <option value="">{t("categoryPlaceholder")}</option>
                  {categories.map((c) => (
                    <option key={c.id} value={String(c.id)}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-secondary-700">Sous-catégorie</label>
                <select
                  value={form.subcategory_id}
                  onChange={(e) => set("subcategory_id", e.target.value)}
                  disabled={subcategories.length === 0}
                  className="h-10 w-full rounded-xl border border-secondary-200 px-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 disabled:opacity-50"
                >
                  <option value="">Choisir une sous-catégorie...</option>
                  {subcategories.map((s) => (
                    <option key={s.id} value={String(s.id)}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Stock */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-secondary-700">{t("stock")} *</label>
              <input
                type="number" min={0}
                value={form.stock}
                onChange={(e) => set("stock", e.target.value)}
                className={`h-10 w-full rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-primary-100 ${errors.stock ? "border-red-400" : "border-secondary-200 focus:border-primary-500"}`}
              />
              {errors.stock && <p className="mt-1 text-xs text-red-500">{errors.stock}</p>}
            </div>

            {/* Main image */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-secondary-700">{t("mainImage")}</label>
              {form.main_image_preview ? (
                <div className="relative inline-block">
                  <img src={form.main_image_preview} alt="" className="h-24 w-24 rounded-xl object-cover border border-secondary-200" />
                  <button
                    type="button"
                    onClick={removeMainImage}
                    className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                  >
                    <X size={10} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => mainImageRef.current?.click()}
                  className="flex h-24 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-secondary-200 text-sm text-secondary-400 hover:border-primary-400 hover:text-primary-500"
                >
                  <Upload size={16} />
                  Choisir une image principale
                </button>
              )}
              <input ref={mainImageRef} type="file" accept="image/*" onChange={handleMainImageChange} className="hidden" />
            </div>

            {/* Gallery */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-secondary-700">{t("images")}</label>
              {/* Existing gallery items */}
              {form.gallery_existing.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {form.gallery_existing.map((g) => (
                    <div key={g.id} className="relative">
                      <img src={g.image} alt="" className="h-16 w-16 rounded-lg object-cover border border-secondary-200" />
                      <button
                        type="button"
                        onClick={() => removeExistingGallery(g.id)}
                        className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                      >
                        <X size={8} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {/* New files to add */}
              {form.gallery_files.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {form.gallery_files.map((file, i) => {
                    const url = URL.createObjectURL(file);
                    return (
                      <div key={i} className="relative">
                        <img src={url} alt="" className="h-16 w-16 rounded-lg object-cover border-2 border-primary-300" />
                        <button
                          type="button"
                          onClick={() => removeGalleryFile(i)}
                          className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                        >
                          <X size={8} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              <button
                type="button"
                onClick={() => galleryRef.current?.click()}
                className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                <Plus size={14} />
                {t("addImage")}
              </button>
              <input ref={galleryRef} type="file" accept="image/*" multiple onChange={handleGalleryAdd} className="hidden" />
            </div>

            {/* Checkboxes */}
            <div className="flex items-center gap-6">
              <label className="flex cursor-pointer items-center gap-2.5">
                <input type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} className="h-4 w-4 rounded accent-primary-600" />
                <span className="text-sm font-medium text-secondary-700">{t("isActive")}</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2.5">
                <input type="checkbox" checked={form.is_featured} onChange={(e) => set("is_featured", e.target.checked)} className="h-4 w-4 rounded accent-primary-600" />
                <span className="text-sm font-medium text-secondary-700">{t("isFeatured")}</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={updateProduct.isPending}
                className="flex-1 rounded-xl bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
              >
                {updateProduct.isPending ? t("saving") : t("save")}
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

          {/* ── Preview ── */}
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-secondary-500">{t("preview")}</p>
            <div className="max-w-xs">
              <ProductCard
                product={buildMockProduct(
                  form,
                  selectedSubcategory?.name ?? "",
                  selectedCategory?.name ?? ""
                )}
                compact
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
