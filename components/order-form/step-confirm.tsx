"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle,
  Loader2,
  User,
  Phone,
  MapPin,
  Truck,
  ShoppingBag,
  Home,
  Building2,
} from "lucide-react";
import { usePlaceOrder } from "@/hooks/orders";

// ── Shared wizard types ───────────────────────────────────────────────────────

type CartItem = {
  product_id: number;
  product_name: string;
  product_image: string | null;
  unit_price: string;
  quantity: number;
  stock: number;
};

type WizardData = {
  items: CartItem[];
  customer_name: string;
  customer_phone: string;
  customer_phone2: string;
  customer_wilaya_code: number;
  customer_wilaya_name: string;
  customer_address: string;
  delivery_type: "home" | "office";
  delivery_price: string;
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface StepConfirmProps {
  data: WizardData;
  onBack: () => void;
  onSuccess: (orderNumber: string) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(value: string | number): string {
  return `${Number(value).toLocaleString("fr-DZ")} DA`;
}

// ── Info row ──────────────────────────────────────────────────────────────────

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 shrink-0 text-primary-600">{icon}</span>
      <div className="flex flex-col">
        <span className="text-xs font-medium uppercase tracking-wide text-secondary-400">
          {label}
        </span>
        <span className="text-sm font-semibold text-secondary-800">{value}</span>
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function StepConfirm({
  data,
  onBack,
  onSuccess,
}: StepConfirmProps) {
  const t = useTranslations("order.form");
  const [confirmed, setConfirmed] = useState(false);

  const { mutate: placeOrder, isPending } = usePlaceOrder();

  const subtotal = data.items.reduce(
    (sum, item) => sum + Number(item.unit_price) * item.quantity,
    0
  );
  const deliveryNum = data.delivery_price ? Number(data.delivery_price) : 0;
  const total = subtotal + deliveryNum;

  function handleConfirm() {
    placeOrder(
      {
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        customer_phone2: data.customer_phone2 || undefined,
        customer_wilaya_code: data.customer_wilaya_code,
        customer_address: data.customer_address,
        delivery_type: data.delivery_type,
        items: data.items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      },
      {
        onSuccess(response) {
          setConfirmed(true);
          onSuccess(response.order_number);
        },
        onError() {
          toast.error(t("errorDesc"));
        },
      }
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">
      {/* Success state (brief overlay before wizard-level overlay shows) */}
      {confirmed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center gap-3 py-12 text-center"
        >
          <CheckCircle size={56} className="text-primary-600" strokeWidth={1.5} />
          <p className="text-xl font-black text-secondary-900">{t("successTitle")}</p>
          <p className="text-sm text-secondary-500">{t("successDesc")}</p>
        </motion.div>
      )}

      {!confirmed && (
        <>
          {/* Customer info */}
          <section className="rounded-xl border border-secondary-100 bg-white p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-secondary-500">
              <User size={14} />
              Informations client
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoRow icon={<User size={16} />} label="Nom" value={data.customer_name} />
              <InfoRow
                icon={<Phone size={16} />}
                label="Téléphone 1"
                value={data.customer_phone}
              />
              {data.customer_phone2 && (
                <InfoRow
                  icon={<Phone size={16} />}
                  label="Téléphone 2"
                  value={data.customer_phone2}
                />
              )}
              <InfoRow
                icon={<MapPin size={16} />}
                label="Adresse"
                value={data.customer_address}
              />
            </div>
          </section>

          {/* Delivery info */}
          <section className="rounded-xl border border-secondary-100 bg-white p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-secondary-500">
              <Truck size={14} />
              Livraison
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoRow
                icon={<MapPin size={16} />}
                label="Wilaya"
                value={`${String(data.customer_wilaya_code).padStart(2, "0")} — ${data.customer_wilaya_name}`}
              />
              <InfoRow
                icon={
                  data.delivery_type === "home" ? (
                    <Home size={16} />
                  ) : (
                    <Building2 size={16} />
                  )
                }
                label="Mode de livraison"
                value={
                  data.delivery_type === "home"
                    ? t("deliveryHome")
                    : t("deliveryOffice")
                }
              />
            </div>
          </section>

          {/* Items table */}
          <section className="rounded-xl border border-secondary-100 bg-white p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-secondary-500">
              <ShoppingBag size={14} />
              Articles commandés
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-secondary-100 text-left text-xs font-semibold uppercase tracking-wide text-secondary-400">
                    <th className="pb-2 pr-3">Produit</th>
                    <th className="pb-2 pr-3 text-center">Qté</th>
                    <th className="pb-2 pr-3 text-right">P.U.</th>
                    <th className="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-50">
                  {data.items.map((item) => (
                    <tr key={item.product_id}>
                      <td className="py-2.5 pr-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 shrink-0 overflow-hidden rounded-md bg-secondary-100">
                            {item.product_image ? (
                              <img
                                src={item.product_image}
                                alt={item.product_name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800">
                                <span className="text-xs font-bold text-white">
                                  {item.product_name.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                          <span className="max-w-[160px] truncate font-medium text-secondary-800">
                            {item.product_name}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 pr-3 text-center text-secondary-600">
                        {item.quantity}
                      </td>
                      <td className="py-2.5 pr-3 text-right text-secondary-600">
                        {fmt(item.unit_price)}
                      </td>
                      <td className="py-2.5 text-right font-semibold text-secondary-900">
                        {fmt(Number(item.unit_price) * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mt-4 flex flex-col gap-2 border-t border-secondary-100 pt-4">
              <div className="flex justify-between text-sm text-secondary-600">
                <span>Sous-total</span>
                <span className="font-semibold">{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-secondary-600">
                <span>
                  Livraison (
                  {data.delivery_type === "home"
                    ? t("deliveryHome")
                    : t("deliveryOffice")}
                  )
                </span>
                <span className="font-semibold">{fmt(data.delivery_price || 0)}</span>
              </div>
              <div className="flex justify-between border-t border-secondary-100 pt-2 text-base font-black text-secondary-900">
                <span>Total</span>
                <span className="text-primary-600">{fmt(total)}</span>
              </div>
            </div>
          </section>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={onBack}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl border border-secondary-200 bg-white px-5 py-3 text-sm font-semibold text-secondary-600 shadow-sm transition hover:bg-secondary-50 disabled:opacity-50"
            >
              <ArrowLeft size={16} />
              {t("back")}
            </motion.button>

            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={handleConfirm}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {t("confirming")}
                </>
              ) : (
                t("confirm")
              )}
            </motion.button>
          </div>
        </>
      )}
    </div>
  );
}
