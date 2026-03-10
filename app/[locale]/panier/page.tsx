"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  ArrowLeft,
  ShoppingBag,
  User,
  Phone,
  MapPin,
  Home,
  Building2,
  Search,
  CheckCircle,
  Truck,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import PublicNavbar from "@/components/layouts/public-navbar";
import Footer from "@/components/layouts/footer";
import { useCart } from "@/contexts/CartContext";
import { useGetDeliveryPricing } from "@/hooks/delivery";
import { usePlaceOrder } from "@/hooks/orders";
import type { DeliveryPricing } from "@/types/api";

// ── Form types ────────────────────────────────────────────────────────────────

interface CheckoutFormValues {
  first_name: string;
  last_name: string;
  phone: string;
  phone2: string;
  commune: string;
  address: string;
  delivery_type: "home" | "office";
}

// ── Input class ───────────────────────────────────────────────────────────────

const INPUT =
  "w-full rounded-xl border border-secondary-200 bg-white px-4 py-3 text-sm text-secondary-900 placeholder-secondary-400 shadow-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20";

const LABEL = "block mb-1.5 text-xs font-bold uppercase tracking-wide text-secondary-500";

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PanierPage() {
  const router = useRouter();
  const { items, cartTotal, updateQty, removeItem, clearCart } = useCart();
  const { data: pricingData, isLoading: pricingLoading } = useGetDeliveryPricing();
  const { mutateAsync: placeOrder, isPending } = usePlaceOrder();

  const [wilayaSearch, setWilayaSearch] = useState("");
  const [selectedWilaya, setSelectedWilaya] = useState<DeliveryPricing | null>(null);
  const [successOrder, setSuccessOrder] = useState<string | null>(null);

  const allWilayas: DeliveryPricing[] = pricingData ?? [];

  const filteredWilayas = useMemo(() => {
    const q = wilayaSearch.trim().toLowerCase();
    if (!q) return allWilayas;
    return allWilayas.filter((w) => w.wilaya_name.toLowerCase().includes(q) || String(w.wilaya_code).padStart(2, "0").includes(q));
  }, [allWilayas, wilayaSearch]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    defaultValues: { delivery_type: "home" },
  });

  const deliveryType = watch("delivery_type");

  const deliveryPrice = selectedWilaya
    ? deliveryType === "home"
      ? Number(selectedWilaya.home_delivery ?? 0)
      : Number(selectedWilaya.office_delivery ?? 0)
    : null;

  const total = cartTotal + (deliveryPrice ?? 0);

  async function onSubmit(values: CheckoutFormValues) {
    if (!selectedWilaya) {
      toast.error("Veuillez sélectionner une wilaya");
      return;
    }
    if (items.length === 0) {
      toast.error("Votre panier est vide");
      return;
    }

    const address = deliveryType === "home" ? `${values.address} — ${values.commune}` : values.commune;

    try {
      const order = await placeOrder({
        customer_name: `${values.first_name.trim()} ${values.last_name.trim()}`,
        customer_phone: values.phone,
        customer_phone2: values.phone2 || undefined,
        customer_wilaya_code: selectedWilaya.wilaya_code,
        customer_address: address,
        delivery_type: values.delivery_type,
        items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
      });
      const orderNum = ((order as unknown as Record<string, unknown>).order_number as string) ?? String(order.id);
      clearCart();
      setSuccessOrder(orderNum);
    } catch {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    }
  }

  // ── Success screen ────────────────────────────────────────────────────────

  if (successOrder) {
    return (
      <div className="flex min-h-screen flex-col bg-secondary-50">
        <PublicNavbar />
        <main className="flex flex-1 items-center justify-center px-4 py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45 }}
            className="flex max-w-md flex-col items-center gap-6 text-center"
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
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow transition hover:bg-primary-700"
              >
                Continuer les achats
              </Link>
              <Link
                href={`/track/${successOrder}`}
                className="inline-flex items-center gap-2 rounded-xl border border-secondary-200 bg-white px-6 py-3 text-sm font-semibold text-secondary-600 shadow-sm transition hover:bg-secondary-50"
              >
                Suivre ma commande
              </Link>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Empty cart ────────────────────────────────────────────────────────────

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-secondary-50">
        <PublicNavbar />
        <main className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-secondary-100">
              <ShoppingCart size={40} className="text-secondary-400" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="font-display text-2xl font-black text-secondary-900">Votre panier est vide</h2>
              <p className="mt-2 text-secondary-500">Ajoutez des produits pour passer votre commande</p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow transition hover:bg-primary-700"
            >
              Découvrir les produits
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Main checkout ─────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen flex-col bg-secondary-50">
      <PublicNavbar />

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Back link */}
          <Link href="/products" className="mb-6 inline-flex items-center gap-1.5 text-sm text-secondary-400 transition hover:text-primary-600">
            <ArrowLeft size={15} />
            Continuer mes achats
          </Link>

          {/* Page title */}
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 shadow-lg shadow-primary-600/30">
              <ShoppingCart size={22} className="text-white" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-black text-secondary-900">Mon Panier</h1>
              <p className="text-sm text-secondary-500">
                {items.length} article{items.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_420px]">
            {/* ── LEFT: Cart items + Order form ─────────────────── */}
            <div className="flex flex-col gap-6">
              {/* Cart items */}
              <div className="overflow-hidden rounded-2xl border border-secondary-100 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-secondary-100 px-5 py-4">
                  <h2 className="font-display text-lg font-black text-secondary-900 flex items-center gap-2">
                    <ShoppingBag size={18} className="text-primary-600" />
                    Produits sélectionnés
                  </h2>
                  <button
                    onClick={() => {
                      if (confirm("Vider le panier ?")) clearCart();
                    }}
                    className="text-xs font-semibold text-red-400 transition hover:text-red-600"
                  >
                    Tout supprimer
                  </button>
                </div>

                <ul className="divide-y divide-secondary-50">
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.li
                        key={item.product_id}
                        layout
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-4 px-5 py-4"
                      >
                        {/* Image */}
                        <div className="h-18 w-18 shrink-0 overflow-hidden rounded-xl bg-secondary-100">
                          {item.product_image ? (
                            <img src={item.product_image} alt={item.product_name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800">
                              <span className="text-xl font-black text-white/80">{item.product_name.charAt(0)}</span>
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                          <Link
                            href={`/products/${item.slug}`}
                            className="line-clamp-2 text-sm font-bold text-secondary-900 hover:text-primary-600 transition"
                          >
                            {item.product_name}
                          </Link>
                          <p className="text-sm font-black text-primary-600">{Number(item.unit_price).toLocaleString("fr-DZ")} DA</p>
                          <p className="text-xs text-secondary-400">
                            Sous-total : {(Number(item.unit_price) * item.quantity).toLocaleString("fr-DZ")} DA
                          </p>
                        </div>

                        {/* Qty + remove */}
                        <div className="flex shrink-0 flex-col items-end gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQty(item.product_id, item.quantity - 1)}
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-secondary-200 bg-white text-secondary-600 transition hover:bg-secondary-50"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="w-7 text-center text-sm font-black text-secondary-900">{item.quantity}</span>
                            <button
                              onClick={() => updateQty(item.product_id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.product_id)}
                            className="flex items-center gap-1 text-xs text-red-400 transition hover:text-red-600"
                          >
                            <Trash2 size={12} />
                            Supprimer
                          </button>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              </div>

              {/* Order form */}
              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="overflow-hidden rounded-2xl border border-secondary-100 bg-white shadow-sm"
              >
                {/* Form header */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                      <User size={20} className="text-white" />
                    </div>
                    <div>
                      <h2 className="font-display text-xl font-black text-white">Informations de livraison</h2>
                      <p className="text-sm text-white/70">Remplissez vos coordonnées pour finaliser</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-5 p-6">
                  {/* Prénom + Nom */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL}>
                        <span className="flex items-center gap-1">
                          <User size={11} /> Prénom *
                        </span>
                      </label>
                      <input
                        placeholder="Mohamed"
                        className={`${INPUT} ${errors.first_name ? "border-red-400 bg-red-50" : ""}`}
                        {...register("first_name", {
                          required: "Requis",
                          minLength: { value: 2, message: "Min 2 caractères" },
                        })}
                      />
                      {errors.first_name && <p className="mt-1 text-xs text-red-500">{errors.first_name.message}</p>}
                    </div>
                    <div>
                      <label className={LABEL}>
                        <span className="flex items-center gap-1">
                          <User size={11} /> Nom *
                        </span>
                      </label>
                      <input
                        placeholder="Benali"
                        className={`${INPUT} ${errors.last_name ? "border-red-400 bg-red-50" : ""}`}
                        {...register("last_name", {
                          required: "Requis",
                          minLength: { value: 2, message: "Min 2 caractères" },
                        })}
                      />
                      {errors.last_name && <p className="mt-1 text-xs text-red-500">{errors.last_name.message}</p>}
                    </div>
                  </div>

                  {/* Téléphone + Téléphone 2 */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className={LABEL}>
                        <span className="flex items-center gap-1">
                          <Phone size={11} /> Téléphone *
                        </span>
                      </label>
                      <input
                        type="tel"
                        placeholder="05 XX XX XX XX"
                        className={`${INPUT} ${errors.phone ? "border-red-400 bg-red-50" : ""}`}
                        {...register("phone", {
                          required: "Requis",
                          minLength: { value: 9, message: "Numéro invalide" },
                        })}
                      />
                      {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
                    </div>
                    <div>
                      <label className={LABEL}>
                        <span className="flex items-center gap-1">
                          <Phone size={11} /> Téléphone 2 (optionnel)
                        </span>
                      </label>
                      <input type="tel" placeholder="06 XX XX XX XX" className={INPUT} {...register("phone2")} />
                    </div>
                  </div>

                  {/* Wilaya */}
                  <div>
                    <label className={LABEL}>
                      <span className="flex items-center gap-1">
                        <MapPin size={11} /> Wilaya *
                      </span>
                    </label>
                    {selectedWilaya ? (
                      <div className="flex items-center justify-between rounded-xl border-2 border-primary-500 bg-primary-50 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-primary-400">{String(selectedWilaya.wilaya_code).padStart(2, "0")}</span>
                          <span className="font-semibold text-primary-700">{selectedWilaya.wilaya_name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedWilaya(null)}
                          className="text-xs text-primary-500 hover:text-primary-700 font-semibold"
                        >
                          Changer
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={15} />
                          <input
                            type="text"
                            value={wilayaSearch}
                            onChange={(e) => setWilayaSearch(e.target.value)}
                            placeholder="Rechercher une wilaya..."
                            className="w-full rounded-xl border border-secondary-200 bg-white py-3 pl-9 pr-4 text-sm text-secondary-900 placeholder-secondary-400 shadow-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto rounded-xl border border-secondary-100 bg-white shadow-sm">
                          {pricingLoading ? (
                            <div className="flex flex-col gap-2 p-3">
                              {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-9 animate-pulse rounded-lg bg-secondary-100" />
                              ))}
                            </div>
                          ) : filteredWilayas.length === 0 ? (
                            <p className="py-6 text-center text-sm text-secondary-400">Aucune wilaya trouvée</p>
                          ) : (
                            <ul className="divide-y divide-secondary-50">
                              {filteredWilayas.map((wilaya) => {
                                const noDelivery = wilaya.home_delivery === null && wilaya.office_delivery === null;
                                return (
                                  <li
                                    key={wilaya.wilaya_code}
                                    onClick={() => {
                                      if (noDelivery) return;
                                      setSelectedWilaya(wilaya);
                                      setValue("delivery_type", "home");
                                    }}
                                    className={`flex cursor-pointer items-center justify-between px-3 py-2.5 text-sm transition ${
                                      noDelivery ? "cursor-not-allowed opacity-40" : "hover:bg-primary-50"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="w-6 font-mono text-xs font-bold text-secondary-400">
                                        {String(wilaya.wilaya_code).padStart(2, "0")}
                                      </span>
                                      <span className="font-medium text-secondary-800">{wilaya.wilaya_name}</span>
                                    </div>
                                    <div className="flex gap-3 text-xs text-secondary-400">
                                      <span className="flex items-center gap-1">
                                        <Home size={10} />
                                        {wilaya.home_delivery !== null ? `${Number(wilaya.home_delivery).toLocaleString("fr-DZ")} DA` : "—"}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Building2 size={10} />
                                        {wilaya.office_delivery !== null ? `${Number(wilaya.office_delivery).toLocaleString("fr-DZ")} DA` : "—"}
                                      </span>
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Commune */}
                  <div>
                    <label className={LABEL}>
                      <span className="flex items-center gap-1">
                        <MapPin size={11} /> Commune *
                      </span>
                    </label>
                    <input
                      placeholder="ex. Hydra, Alger Centre..."
                      className={`${INPUT} ${errors.commune ? "border-red-400 bg-red-50" : ""}`}
                      {...register("commune", { required: "Requis" })}
                    />
                    {errors.commune && <p className="mt-1 text-xs text-red-500">{errors.commune.message}</p>}
                  </div>

                  {/* Mode de livraison */}
                  {selectedWilaya && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                      <label className={LABEL}>Mode de livraison *</label>
                      <div className="grid grid-cols-2 gap-3">
                        {(["home", "office"] as const).map((type) => {
                          const price = type === "home" ? selectedWilaya.home_delivery : selectedWilaya.office_delivery;
                          const disabled = price === null;
                          const selected = deliveryType === type;
                          return (
                            <button
                              key={type}
                              type="button"
                              disabled={disabled}
                              onClick={() => !disabled && setValue("delivery_type", type)}
                              className={`flex flex-col gap-1.5 rounded-xl border-2 p-4 text-left transition ${
                                selected
                                  ? "border-primary-500 bg-primary-50"
                                  : disabled
                                    ? "cursor-not-allowed border-secondary-100 bg-secondary-50 opacity-50"
                                    : "border-secondary-200 bg-white hover:border-primary-300"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {type === "home" ? (
                                  <Home size={16} className={selected ? "text-primary-600" : "text-secondary-500"} />
                                ) : (
                                  <Building2 size={16} className={selected ? "text-primary-600" : "text-secondary-500"} />
                                )}
                                <span className={`text-sm font-bold ${selected ? "text-primary-700" : "text-secondary-700"}`}>
                                  {type === "home" ? "À domicile" : "Bureau de poste"}
                                </span>
                              </div>
                              <p className={`text-lg font-black ${selected ? "text-primary-600" : "text-secondary-900"}`}>
                                {disabled ? "Non disponible" : `${Number(price).toLocaleString("fr-DZ")} DA`}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

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
                        <label className={LABEL}>
                          <span className="flex items-center gap-1">
                            <MapPin size={11} /> Adresse complète *
                          </span>
                        </label>
                        <textarea
                          rows={2}
                          placeholder="ex. 15 rue des Fleurs, Alger Centre"
                          className={`${INPUT} resize-none ${errors.address ? "border-red-400 bg-red-50" : ""}`}
                          {...register("address", {
                            required: deliveryType === "home" ? "Adresse requise pour livraison domicile" : false,
                          })}
                        />
                        {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.98 }}
                    disabled={isPending || !selectedWilaya}
                    className="flex w-full items-center justify-center gap-3 rounded-xl bg-primary-600 py-4 font-display text-lg font-black text-white shadow-lg shadow-primary-600/25 transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ShoppingBag size={22} />
                    {isPending ? "Envoi en cours..." : "Confirmer ma commande"}
                  </motion.button>
                </div>
              </form>
            </div>

            {/* ── RIGHT: Order summary (sticky) ─────────────────── */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="overflow-hidden rounded-2xl border border-secondary-100 bg-white shadow-sm">
                <div className="border-b border-secondary-100 px-5 py-4">
                  <h2 className="font-display text-lg font-black text-secondary-900">Récapitulatif</h2>
                </div>

                {/* Items summary */}
                <ul className="divide-y divide-secondary-50 px-5">
                  {items.map((item) => (
                    <li key={item.product_id} className="flex items-center gap-3 py-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-secondary-100">
                        {item.product_image ? (
                          <img src={item.product_image} alt={item.product_name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800">
                            <span className="text-sm font-black text-white">{item.product_name.charAt(0)}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <p className="truncate text-xs font-semibold text-secondary-900">{item.product_name}</p>
                        <p className="text-xs text-secondary-400">× {item.quantity}</p>
                      </div>
                      <span className="shrink-0 text-sm font-bold text-secondary-900">
                        {(Number(item.unit_price) * item.quantity).toLocaleString("fr-DZ")} DA
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Totals */}
                <div className="space-y-2 border-t border-secondary-100 px-5 py-4">
                  <div className="flex justify-between text-sm text-secondary-600">
                    <span>Sous-total produits</span>
                    <span className="font-semibold">{cartTotal.toLocaleString("fr-DZ")} DA</span>
                  </div>
                  <div className="flex justify-between text-sm text-secondary-600">
                    <span className="flex items-center gap-1">
                      <Truck size={13} /> Livraison
                    </span>
                    <span className="font-semibold">
                      {selectedWilaya
                        ? deliveryPrice !== null
                          ? `${deliveryPrice.toLocaleString("fr-DZ")} DA`
                          : "Non disponible"
                        : "— Choisir une wilaya"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-secondary-200 pt-3">
                    <span className="font-bold text-secondary-900">Total</span>
                    <span className="font-display text-2xl font-black text-primary-600">
                      {selectedWilaya && deliveryPrice !== null ? `${total.toLocaleString("fr-DZ")} DA` : `${cartTotal.toLocaleString("fr-DZ")} DA`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
