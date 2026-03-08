"use client";

import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  CheckCircle2,
  Circle,
  XCircle,
  Clock,
  Package,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import PublicNavbar from "@/components/layouts/public-navbar";
import Footer from "@/components/layouts/footer";
import { useTrackOrder } from "@/hooks/orders";
import type { OrderStatus } from "@/types/api";

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];

function LoadingSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 animate-pulse space-y-6">
      <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto" />
      <div className="bg-white rounded-2xl p-6 space-y-4">
        <div className="h-5 bg-gray-200 rounded w-1/3" />
        <div className="h-5 bg-gray-200 rounded w-1/4" />
      </div>
      <div className="bg-white rounded-2xl p-6 space-y-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 items-center">
            <div className="w-9 h-9 rounded-full bg-gray-200 flex-none" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusIcon({
  status,
  currentStatus,
  isCancelled,
}: {
  status: OrderStatus;
  currentStatus: OrderStatus;
  isCancelled: boolean;
}) {
  const currentIndex = ORDER_STATUSES.indexOf(currentStatus);
  const thisIndex = ORDER_STATUSES.indexOf(status);

  if (isCancelled) {
    return thisIndex === 0 ? (
      <XCircle className="w-9 h-9 text-red-500" />
    ) : (
      <Circle className="w-9 h-9 text-gray-300" />
    );
  }

  if (thisIndex < currentIndex) {
    return <CheckCircle2 className="w-9 h-9 text-primary-500" />;
  }

  if (thisIndex === currentIndex) {
    return (
      <motion.div
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
        className="w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center"
      >
        <Clock className="w-5 h-5 text-white" />
      </motion.div>
    );
  }

  return <Circle className="w-9 h-9 text-gray-300" />;
}

export default function TrackResultPage() {
  const t = useTranslations("order");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const { order_number } = useParams<{ order_number: string }>();

  const { data: order, isLoading, isError } = useTrackOrder(order_number);

  const isCancelled = order?.status === "cancelled";
  const currentStatusIndex = order
    ? ORDER_STATUSES.indexOf(order.status as OrderStatus)
    : -1;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir={isRTL ? "rtl" : "ltr"}>
      <PublicNavbar />

      <main className="flex-1 py-10">
        {/* Back link */}
        <div className="max-w-2xl mx-auto px-4 mb-6">
          <Link
            href="/track"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition"
          >
            {isRTL ? (
              <ArrowRight className="w-4 h-4" />
            ) : (
              <ArrowLeft className="w-4 h-4" />
            )}
            {t("backToTrack")}
          </Link>
        </div>

        {isLoading ? (
          <LoadingSkeleton />
        ) : isError || !order ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto px-4 py-16 text-center"
          >
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {t("orderNotFound")}
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              {t("orderNotFoundHint")}
            </p>
            <Link
              href="/track"
              className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-medium transition"
            >
              {t("tryAgain")}
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto px-4 space-y-5"
          >
            {/* Order number badge */}
            <div className="text-center">
              <span className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-1.5 rounded-full text-sm font-semibold">
                <Package className="w-4 h-4" />
                {t("orderLabel")} #{order.order_number}
              </span>
            </div>

            {/* Customer info */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {t("customerInfo")}
              </h2>
              <div className="space-y-1.5">
                <p className="text-gray-900 font-medium">{order.customer_name}</p>
                <p className="text-gray-500 text-sm">{order.customer_phone}</p>
                <p className="text-gray-500 text-sm">
                  {order.customer_wilaya_name}
                  {order.customer_address ? ` — ${order.customer_address}` : ""}
                </p>
              </div>
            </div>

            {/* Cancelled state */}
            {isCancelled && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3"
              >
                <XCircle className="w-6 h-6 text-red-500 flex-none mt-0.5" />
                <div>
                  <p className="font-semibold text-red-700">{t("orderCancelled")}</p>
                  <p className="text-red-500 text-sm mt-0.5">
                    {t("orderCancelledMessage")}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Status timeline */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-5">
                {t("timeline.title")}
              </h2>
              <div className="space-y-0">
                {ORDER_STATUSES.map((status, index) => {
                  const thisIndex = ORDER_STATUSES.indexOf(status);
                  const isDone = !isCancelled && thisIndex < currentStatusIndex;
                  const isCurrent = !isCancelled && thisIndex === currentStatusIndex;
                  const isFuture = isCancelled || thisIndex > currentStatusIndex;
                  const isLast = index === ORDER_STATUSES.length - 1;

                  return (
                    <div key={status} className="flex gap-4">
                      {/* Icon + connector */}
                      <div className="flex flex-col items-center">
                        <StatusIcon
                          status={status}
                          currentStatus={order.status as OrderStatus}
                          isCancelled={isCancelled}
                        />
                        {!isLast && (
                          <div
                            className={`w-0.5 flex-1 min-h-[2rem] my-1 ${
                              isDone
                                ? "bg-primary-400"
                                : "bg-gray-200"
                            }`}
                          />
                        )}
                      </div>

                      {/* Label */}
                      <div className="pb-6 pt-1.5 flex-1">
                        <p
                          className={`text-sm font-semibold ${
                            isCurrent
                              ? "text-primary-700"
                              : isDone
                              ? "text-gray-700"
                              : "text-gray-400"
                          }`}
                        >
                          {t(`status.${status}`)}
                        </p>
                        {isCurrent && (
                          <p className="text-xs text-primary-500 mt-0.5">
                            {t("currentStatus")}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order items */}
            {order.items.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                  {t("orderItems")}
                </h2>
                <div className="divide-y divide-gray-100">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                      {/* Product image */}
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-none">
                        {item.product_image ? (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {item.product_name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {item.quantity} × {parseFloat(item.unit_price).toLocaleString()} {t("currency")}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-800 flex-none">
                        {parseFloat(item.subtotal).toLocaleString()} {t("currency")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Totals */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{t("subtotal")}</span>
                  <span>{parseFloat(order.subtotal).toLocaleString()} {t("currency")}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{t("deliveryFee")}</span>
                  <span>{parseFloat(order.delivery_price).toLocaleString()} {t("currency")}</span>
                </div>
                <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900">
                  <span>{t("total")}</span>
                  <span className="text-primary-600">
                    {parseFloat(order.total).toLocaleString()} {t("currency")}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
