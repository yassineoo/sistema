"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, User, Phone, MapPin } from "lucide-react";

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

// ── Form data ─────────────────────────────────────────────────────────────────

interface CustomerFormData {
  customer_name: string;
  customer_phone: string;
  customer_phone2: string;
  customer_address: string;
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface StepCustomerProps {
  data: WizardData;
  onUpdate: (data: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}

// ── Field wrapper ─────────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  error?: string;
  required?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

function Field({ label, error, required, icon, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-sm font-semibold text-secondary-700">
        {icon && <span className="text-primary-600">{icon}</span>}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-500"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function StepCustomer({
  data,
  onUpdate,
  onNext,
  onBack,
}: StepCustomerProps) {
  const t = useTranslations("order.form");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CustomerFormData>({
    defaultValues: {
      customer_name: data.customer_name,
      customer_phone: data.customer_phone,
      customer_phone2: data.customer_phone2,
      customer_address: data.customer_address,
    },
  });

  // Sync wizard data into form when returning to this step
  useEffect(() => {
    reset({
      customer_name: data.customer_name,
      customer_phone: data.customer_phone,
      customer_phone2: data.customer_phone2,
      customer_address: data.customer_address,
    });
  }, [data.customer_name, data.customer_phone, data.customer_phone2, data.customer_address, reset]);

  function onSubmit(formData: CustomerFormData) {
    onUpdate({
      customer_name: formData.customer_name,
      customer_phone: formData.customer_phone,
      customer_phone2: formData.customer_phone2 ?? "",
      customer_address: formData.customer_address,
    });
    onNext();
  }

  const inputClass =
    "w-full rounded-xl border border-secondary-200 bg-white px-4 py-3 text-sm text-secondary-900 placeholder-secondary-400 shadow-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20";

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      {/* customer_name */}
      <Field
        label={t("customerName")}
        error={errors.customer_name?.message}
        required
        icon={<User size={15} />}
      >
        <input
          type="text"
          placeholder={t("customerNamePlaceholder")}
          className={inputClass}
          {...register("customer_name", {
            required: "Le nom est requis",
            minLength: { value: 2, message: "Le nom doit contenir au moins 2 caractères" },
            maxLength: { value: 255, message: "Le nom est trop long" },
          })}
        />
      </Field>

      {/* customer_phone */}
      <Field
        label={t("phone")}
        error={errors.customer_phone?.message}
        required
        icon={<Phone size={15} />}
      >
        <input
          type="tel"
          placeholder={t("phonePlaceholder")}
          className={inputClass}
          {...register("customer_phone", {
            required: "Le numéro de téléphone est requis",
            minLength: { value: 9, message: "Le numéro doit contenir au moins 9 chiffres" },
            maxLength: { value: 20, message: "Le numéro est trop long" },
          })}
        />
      </Field>

      {/* customer_phone2 */}
      <Field
        label={t("phone2")}
        error={errors.customer_phone2?.message}
        icon={<Phone size={15} />}
      >
        <input
          type="tel"
          placeholder={t("phone2Placeholder")}
          className={inputClass}
          {...register("customer_phone2", {
            maxLength: { value: 20, message: "Le numéro est trop long" },
          })}
        />
      </Field>

      {/* customer_address */}
      <Field
        label={t("address")}
        error={errors.customer_address?.message}
        required
        icon={<MapPin size={15} />}
      >
        <textarea
          rows={3}
          placeholder={t("addressPlaceholder")}
          className={`${inputClass} resize-none`}
          {...register("customer_address", {
            required: "L'adresse est requise",
            minLength: { value: 5, message: "L'adresse doit contenir au moins 5 caractères" },
            maxLength: { value: 500, message: "L'adresse est trop longue" },
          })}
        />
      </Field>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between pt-2">
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl border border-secondary-200 bg-white px-5 py-3 text-sm font-semibold text-secondary-600 shadow-sm transition hover:bg-secondary-50"
        >
          <ArrowLeft size={16} />
          {t("back")}
        </motion.button>

        <motion.button
          type="submit"
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow transition hover:bg-primary-700"
        >
          {t("next")}
          <ArrowRight size={16} />
        </motion.button>
      </div>
    </form>
  );
}
