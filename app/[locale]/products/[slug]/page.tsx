"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import { useLocale } from "next-intl";
import {
  ArrowLeft, ArrowRight, ChevronLeft, ChevronRight,
  ShoppingBag, Package, Tag, CheckCircle,
  MapPin, Home, Building2, Minus, Plus, Truck,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { toast } from "sonner";
import PublicNavbar from "@/components/layouts/public-navbar";
import Footer from "@/components/layouts/footer";
import ProductCard from "@/components/shared/product-card";
import { useGetProductBySlug, useGetPublicProducts } from "@/hooks/products";
import { usePlaceOrder } from "@/hooks/orders";
import { useGetDeliveryPricing } from "@/hooks/delivery";

// ── 58 Algerian wilayas ───────────────────────────────────────────────────────

const WILAYAS = [
  { code: 1,  name: "Adrar" },          { code: 2,  name: "Chlef" },
  { code: 3,  name: "Laghouat" },       { code: 4,  name: "Oum El Bouaghi" },
  { code: 5,  name: "Batna" },          { code: 6,  name: "Béjaïa" },
  { code: 7,  name: "Biskra" },         { code: 8,  name: "Béchar" },
  { code: 9,  name: "Blida" },          { code: 10, name: "Bouira" },
  { code: 11, name: "Tamanrasset" },    { code: 12, name: "Tébessa" },
  { code: 13, name: "Tlemcen" },        { code: 14, name: "Tiaret" },
  { code: 15, name: "Tizi Ouzou" },     { code: 16, name: "Alger" },
  { code: 17, name: "Djelfa" },         { code: 18, name: "Jijel" },
  { code: 19, name: "Sétif" },          { code: 20, name: "Saïda" },
  { code: 21, name: "Skikda" },         { code: 22, name: "Sidi Bel Abbès" },
  { code: 23, name: "Annaba" },         { code: 24, name: "Guelma" },
  { code: 25, name: "Constantine" },    { code: 26, name: "Médéa" },
  { code: 27, name: "Mostaganem" },     { code: 28, name: "M'Sila" },
  { code: 29, name: "Mascara" },        { code: 30, name: "Ouargla" },
  { code: 31, name: "Oran" },           { code: 32, name: "El Bayadh" },
  { code: 33, name: "Illizi" },         { code: 34, name: "Bordj Bou Arréridj" },
  { code: 35, name: "Boumerdès" },      { code: 36, name: "El Tarf" },
  { code: 37, name: "Tindouf" },        { code: 38, name: "Tissemsilt" },
  { code: 39, name: "El Oued" },        { code: 40, name: "Khenchela" },
  { code: 41, name: "Souk Ahras" },     { code: 42, name: "Tipaza" },
  { code: 43, name: "Mila" },           { code: 44, name: "Aïn Defla" },
  { code: 45, name: "Naâma" },          { code: 46, name: "Aïn Témouchent" },
  { code: 47, name: "Ghardaïa" },       { code: 48, name: "Relizane" },
  { code: 49, name: "Timimoun" },       { code: 50, name: "Bordj Badji Mokhtar" },
  { code: 51, name: "Ouled Djellal" },  { code: 52, name: "Béni Abbès" },
  { code: 53, name: "In Salah" },       { code: 54, name: "In Guezzam" },
  { code: 55, name: "Touggourt" },      { code: 56, name: "Djanet" },
  { code: 57, name: "El M'Ghair" },     { code: 58, name: "El Meniaa" },
];

// ── Form types ────────────────────────────────────────────────────────────────

interface OrderFormValues {
  first_name: string;
  last_name: string;
  phone: string;
  wilaya_code: string;
  commune: string;
  delivery_type: "home" | "office";
  address: string;
  quantity: number;
}

// ── Shared class strings ──────────────────────────────────────────────────────

const INPUT =
  "w-full rounded-xl border border-secondary-200 bg-white px-4 py-3 text-sm text-secondary-900 placeholder-secondary-400 shadow-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20";

const LABEL = "block mb-1.5 text-xs font-bold uppercase tracking-wide text-secondary-500";

// ── Skeleton ──────────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-10">
      <div className="mb-8 h-8 w-48 rounded-xl bg-secondary-100" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="h-150 rounded-2xl bg-secondary-100" />
        <div className="space-y-4">
          <div className="h-8 w-3/4 rounded bg-secondary-100" />
          <div className="aspect-square rounded-2xl bg-secondary-100" />
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProductDetailPage() {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const { slug } = useParams<{ slug: string }>();
  const [selectedImage, setSelectedImage] = useState(0);
  const [successOrder, setSuccessOrder] = useState<string | null>(null);

  const { data: product, isLoading, isError } = useGetProductBySlug(slug);
  const { data: deliveryPricing } = useGetDeliveryPricing();
  const { mutateAsync: placeOrder, isPending } = usePlaceOrder();

  const { data: relatedData } = useGetPublicProducts(
    "", 1, product?.category?.slug ?? "", "", "", "", "-created_at"
  );
  const relatedProducts = (relatedData?.results ?? []).filter((p) => p.slug !== slug).slice(0, 4);

  const { register, handleSubmit, watch, setValue, formState: { errors } } =
    useForm<OrderFormValues>({ defaultValues: { delivery_type: "home", quantity: 1 } });

  const deliveryType = watch("delivery_type");
  const wilayaCode   = watch("wilaya_code");
  const quantity     = watch("quantity");

  const deliveryEntry = deliveryPricing?.find((d) => d.wilaya_code === Number(wilayaCode));
  const deliveryPrice = deliveryEntry
    ? deliveryType === "home" ? Number(deliveryEntry.home_delivery) : Number(deliveryEntry.office_delivery)
    : null;

  const productPrice = product ? Number(product.price) : 0;
  const qty      = Number(quantity) || 1;
  const subtotal = productPrice * qty;
  const total    = subtotal + (deliveryPrice ?? 0);

  const allImages = product
    ? [...(product.main_image ? [product.main_image] : []), ...product.images.filter((img) => img !== product.main_image)]
    : [];

  const hasDiscount    = product?.compare_price && parseFloat(product.compare_price) > parseFloat(product.price ?? "0");
  const discountPct    = hasDiscount && product
    ? Math.round(((parseFloat(product.compare_price!) - parseFloat(product.price)) / parseFloat(product.compare_price!)) * 100)
    : 0;

  async function onSubmit(values: OrderFormValues) {
    if (!product) return;
    try {
      const order = await placeOrder({
        customer_name: `${values.first_name.trim()} ${values.last_name.trim()}`,
        customer_phone: values.phone,
        customer_wilaya_code: Number(values.wilaya_code),
        customer_address: values.delivery_type === "home" ? values.address : values.commune,
        delivery_type: values.delivery_type,
        items: [{ product_id: product.id, quantity: qty }],
      });
      setSuccessOrder((order as unknown as Record<string, unknown>).order_number as string ?? String(order.id));
    } catch {
      toast.error("Une erreur est survenue. Réessayez.");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-secondary-50" dir={isRTL ? "rtl" : "ltr"}>
      <PublicNavbar />

      <main className="flex-1">

        {/* ── Loading ── */}
        {isLoading && <DetailSkeleton />}

        {/* ── Not found ── */}
        {!isLoading && (isError || !product) && (
          <div className="flex flex-col items-center justify-center px-4 py-32 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-secondary-100">
              <Package className="h-10 w-10 text-secondary-400" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-secondary-700">Produit introuvable</h2>
            <p className="mb-6 text-sm text-secondary-400">Ce produit a été retiré du catalogue.</p>
            <Link href="/products" className="rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-bold text-white shadow transition hover:bg-primary-700">
              Retour aux produits
            </Link>
          </div>
        )}

        {/* ── Success ── */}
        {!isLoading && product && successOrder && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45 }}
            className="flex flex-col items-center justify-center gap-6 px-4 py-32 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
              className="flex h-24 w-24 items-center justify-center rounded-full bg-primary-50"
            >
              <CheckCircle size={56} className="text-primary-600" strokeWidth={1.5} />
            </motion.div>
            <div>
              <h2 className="font-display text-3xl font-black text-secondary-900">Commande confirmée !</h2>
              <p className="mt-2 text-secondary-500">Votre commande a bien été enregistrée. Nous vous contacterons sous peu.</p>
            </div>
            <div className="rounded-2xl border border-primary-200 bg-primary-50 px-8 py-4">
              <p className="text-xs font-bold uppercase tracking-widest text-primary-500">Numéro de commande</p>
              <p className="mt-1 font-display text-2xl font-black tracking-widest text-primary-700">{successOrder}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/products"
                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow transition hover:bg-primary-700">
                Continuer les achats
              </Link>
              <button onClick={() => setSuccessOrder(null)}
                className="inline-flex items-center gap-2 rounded-xl border border-secondary-200 bg-white px-6 py-3 text-sm font-semibold text-secondary-600 shadow-sm transition hover:bg-secondary-50">
                Nouvelle commande
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Product detail ── */}
        {!isLoading && product && !successOrder && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>

            {/* Name banner */}
            <div className="border-b border-secondary-100 bg-white px-4 py-6 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-7xl">
                <Link href="/products"
                  className="mb-3 inline-flex items-center gap-1.5 text-sm text-secondary-400 transition hover:text-primary-600">
                  {isRTL ? <ArrowRight size={15} /> : <ArrowLeft size={15} />}
                  Retour aux produits
                </Link>
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  {product.category && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                      <Tag size={11} />{product.category.name}
                    </span>
                  )}
                  {product.is_featured && (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">★ En vedette</span>
                  )}
                </div>
                <h1 className="font-display text-3xl font-black text-secondary-900 sm:text-4xl">{product.name}</h1>
              </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_420px]">

                {/* ─── LEFT: Order form ─────────────────────────── */}
                <div className="order-2 lg:order-1">
                  <div className="overflow-hidden rounded-2xl border border-secondary-100 bg-white shadow-sm">

                    {/* Form header */}
                    <div className="bg-linear-to-r from-primary-600 to-primary-700 px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                          <ShoppingBag size={20} className="text-white" />
                        </div>
                        <div>
                          <h2 className="font-display text-xl font-black text-white">Commander ce produit</h2>
                          <p className="text-sm text-white/70">Remplissez le formulaire ci-dessous</p>
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-6">

                      {/* Prénom + Nom */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={LABEL}>Prénom *</label>
                          <input placeholder="Mohamed"
                            className={`${INPUT} ${errors.first_name ? "border-red-400 bg-red-50" : ""}`}
                            {...register("first_name", { required: "Requis", minLength: { value: 2, message: "Min 2 car." } })} />
                          {errors.first_name && <p className="mt-1 text-xs text-red-500">{errors.first_name.message}</p>}
                        </div>
                        <div>
                          <label className={LABEL}>Nom *</label>
                          <input placeholder="Benali"
                            className={`${INPUT} ${errors.last_name ? "border-red-400 bg-red-50" : ""}`}
                            {...register("last_name", { required: "Requis", minLength: { value: 2, message: "Min 2 car." } })} />
                          {errors.last_name && <p className="mt-1 text-xs text-red-500">{errors.last_name.message}</p>}
                        </div>
                      </div>

                      {/* Téléphone */}
                      <div>
                        <label className={LABEL}>Téléphone *</label>
                        <input type="tel" placeholder="05 XX XX XX XX"
                          className={`${INPUT} ${errors.phone ? "border-red-400 bg-red-50" : ""}`}
                          {...register("phone", { required: "Requis", minLength: { value: 9, message: "Numéro invalide" } })} />
                        {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
                      </div>

                      {/* Quantité */}
                      <div>
                        <label className={LABEL}>Quantité *</label>
                        <div className="flex items-center gap-3">
                          <button type="button"
                            onClick={() => setValue("quantity", Math.max(1, qty - 1))}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-secondary-200 bg-white text-secondary-600 shadow-sm transition hover:bg-secondary-50 active:scale-95">
                            <Minus size={16} />
                          </button>
                          <span className="min-w-10 text-center font-display text-2xl font-black text-secondary-900">{qty}</span>
                          <button type="button"
                            onClick={() => setValue("quantity", Math.min(product.stock || 99, qty + 1))}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-secondary-200 bg-white text-secondary-600 shadow-sm transition hover:bg-secondary-50 active:scale-95">
                            <Plus size={16} />
                          </button>
                          <span className="text-xs text-secondary-400">
                            {product.stock > 0 ? `${product.stock} disponibles` : "Rupture de stock"}
                          </span>
                        </div>
                      </div>

                      {/* Wilaya */}
                      <div>
                        <label className={LABEL}>Wilaya *</label>
                        <select className={`${INPUT} ${errors.wilaya_code ? "border-red-400 bg-red-50" : ""}`}
                          {...register("wilaya_code", { required: "Sélectionnez une wilaya" })}>
                          <option value="">-- Choisir une wilaya --</option>
                          {WILAYAS.map((w) => (
                            <option key={w.code} value={w.code}>
                              {String(w.code).padStart(2, "0")} — {w.name}
                            </option>
                          ))}
                        </select>
                        {errors.wilaya_code && <p className="mt-1 text-xs text-red-500">{errors.wilaya_code.message}</p>}
                      </div>

                      {/* Commune */}
                      <div>
                        <label className={LABEL}>Commune *</label>
                        <input placeholder="ex. Hydra, Alger Centre..."
                          className={`${INPUT} ${errors.commune ? "border-red-400 bg-red-50" : ""}`}
                          {...register("commune", { required: "Requis" })} />
                        {errors.commune && <p className="mt-1 text-xs text-red-500">{errors.commune.message}</p>}
                      </div>

                      {/* Mode de livraison */}
                      <div>
                        <label className={LABEL}>Mode de livraison *</label>
                        <div className="grid grid-cols-2 gap-3">
                          {(["home", "office"] as const).map((type) => (
                            <button key={type} type="button" onClick={() => setValue("delivery_type", type)}
                              className={`flex items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200 ${
                                deliveryType === type
                                  ? "border-primary-500 bg-primary-50 text-primary-700"
                                  : "border-secondary-200 bg-white text-secondary-600 hover:border-secondary-300"
                              }`}>
                              {type === "home" ? <Home size={18} /> : <Building2 size={18} />}
                              <span className="text-sm font-semibold">
                                {type === "home" ? "À domicile" : "Bureau de poste"}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Adresse — domicile uniquement */}
                      <AnimatePresence>
                        {deliveryType === "home" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <label className={LABEL}>Adresse complète *</label>
                            <textarea rows={2} placeholder="ex. 15 rue des Fleurs, Alger Centre"
                              className={`${INPUT} resize-none ${errors.address ? "border-red-400 bg-red-50" : ""}`}
                              {...register("address", {
                                required: deliveryType === "home" ? "Adresse requise pour livraison domicile" : false,
                              })} />
                            {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Récapitulatif prix */}
                      <div className="space-y-2 rounded-xl border border-secondary-100 bg-secondary-50 p-4">
                        <div className="flex justify-between text-sm text-secondary-600">
                          <span>Prix unitaire</span>
                          <span className="font-semibold">{productPrice.toLocaleString("fr-DZ")} DA</span>
                        </div>
                        <div className="flex justify-between text-sm text-secondary-600">
                          <span>Quantité</span>
                          <span className="font-semibold">× {qty}</span>
                        </div>
                        <div className="flex justify-between text-sm text-secondary-600">
                          <span>Sous-total</span>
                          <span className="font-semibold">{subtotal.toLocaleString("fr-DZ")} DA</span>
                        </div>
                        <div className="flex justify-between text-sm text-secondary-600">
                          <span className="flex items-center gap-1"><Truck size={13} /> Livraison</span>
                          <span className="font-semibold">
                            {deliveryPrice !== null
                              ? `${deliveryPrice.toLocaleString("fr-DZ")} DA`
                              : wilayaCode ? "Non disponible" : "— Choisir une wilaya"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-t border-secondary-200 pt-2">
                          <span className="font-bold text-secondary-900">Total</span>
                          <span className="font-display text-2xl font-black text-primary-600">
                            {deliveryPrice !== null
                              ? `${total.toLocaleString("fr-DZ")} DA`
                              : `${subtotal.toLocaleString("fr-DZ")} DA`}
                          </span>
                        </div>
                      </div>

                      {/* CTA */}
                      <motion.button
                        type="submit"
                        whileHover={{ scale: product.stock === 0 ? 1 : 1.01 }}
                        whileTap={{ scale: product.stock === 0 ? 1 : 0.98 }}
                        disabled={isPending || product.stock === 0}
                        className={`flex w-full items-center justify-center gap-3 rounded-xl py-4 font-display text-lg font-black text-white shadow-lg transition-all ${
                          product.stock === 0
                            ? "cursor-not-allowed bg-secondary-300"
                            : isPending
                            ? "cursor-wait bg-primary-500"
                            : "bg-primary-600 shadow-primary-600/30 hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-600/25"
                        }`}
                      >
                        <ShoppingBag size={22} />
                        {product.stock === 0 ? "Rupture de stock" : isPending ? "Envoi en cours..." : "Commander maintenant !"}
                      </motion.button>
                    </form>
                  </div>
                </div>

                {/* ─── RIGHT: Image + price ─────────────────────── */}
                <div className="order-1 lg:order-2">
                  <div className="sticky top-24 space-y-4">

                    {/* Image gallery */}
                    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                      <div className="relative aspect-square">
                        {allImages[selectedImage] ? (
                          <img src={allImages[selectedImage]} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary-600 to-primary-800">
                            <span className="font-display text-8xl font-black text-white/30">{product.name.charAt(0)}</span>
                          </div>
                        )}
                        {hasDiscount && (
                          <div className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-black text-white shadow">
                            -{discountPct}%
                          </div>
                        )}
                        {allImages.length > 1 && (
                          <>
                            <button onClick={() => setSelectedImage((i) => (i === 0 ? allImages.length - 1 : i - 1))}
                              className="absolute left-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 shadow transition hover:bg-white">
                              <ChevronLeft size={18} className="text-secondary-700" />
                            </button>
                            <button onClick={() => setSelectedImage((i) => (i === allImages.length - 1 ? 0 : i + 1))}
                              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 shadow transition hover:bg-white">
                              <ChevronRight size={18} className="text-secondary-700" />
                            </button>
                          </>
                        )}
                      </div>
                      {allImages.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto p-3">
                          {allImages.map((img, i) => (
                            <button key={i} onClick={() => setSelectedImage(i)}
                              className={`h-16 w-16 flex-none overflow-hidden rounded-lg border-2 transition ${
                                selectedImage === i ? "border-primary-500" : "border-transparent opacity-60 hover:opacity-100"
                              }`}>
                              <img src={img} alt="" className="h-full w-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Price card */}
                    <div className="space-y-3 rounded-2xl border border-secondary-100 bg-white p-5 shadow-sm">
                      <div className="flex items-baseline gap-3">
                        <span className="font-display text-3xl font-black text-primary-600">
                          {productPrice.toLocaleString("fr-DZ")} DA
                        </span>
                        {hasDiscount && (
                          <span className="text-base text-secondary-400 line-through">
                            {Number(product.compare_price).toLocaleString("fr-DZ")} DA
                          </span>
                        )}
                      </div>
                      {product.stock > 10 ? (
                        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" /> En stock
                        </span>
                      ) : product.stock > 0 ? (
                        <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                          <span className="h-2 w-2 rounded-full bg-amber-500" /> Plus que {product.stock} en stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                          <span className="h-2 w-2 rounded-full bg-red-500" /> Rupture de stock
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Description ── */}
              {product.description && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45 }}
                  className="mt-12 rounded-2xl border border-secondary-100 bg-white p-8 shadow-sm"
                >
                  <h2 className="font-display mb-4 text-2xl font-black text-secondary-900">Description du produit</h2>
                  <div className="mb-6 h-0.5 w-12 rounded-full bg-primary-600" />
                  <p className="whitespace-pre-line leading-relaxed text-secondary-600">{product.description}</p>
                </motion.div>
              )}

              {/* ── Related products ── */}
              {relatedProducts.length > 0 && (
                <div className="mt-14">
                  <div className="mb-6 flex items-center gap-4">
                    <h2 className="font-display text-2xl font-black text-secondary-900">Vous aimerez aussi</h2>
                    <div className="h-px flex-1 bg-secondary-100" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {relatedProducts.map((p, i) => (
                      <motion.div key={p.id}
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: i * 0.07 }}>
                        <ProductCard product={p} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
