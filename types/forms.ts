import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginFormData = z.infer<typeof loginSchema>;

export const orderItemSchema = z.object({
  product_id: z.number().int().positive(),
  quantity: z.number().int().min(1),
});
export type OrderItemFormData = z.infer<typeof orderItemSchema>;

export const orderCreateSchema = z.object({
  customer_name: z.string().min(2).max(255),
  customer_phone: z.string().min(9).max(20),
  customer_phone2: z.string().max(20).optional().or(z.literal("")),
  customer_wilaya_code: z.number().int().min(1).max(58),
  customer_address: z.string().min(5).max(500),
  delivery_type: z.enum(["home", "office"]),
  items: z.array(orderItemSchema).min(1),
  notes: z.string().optional(),
});
export type OrderCreateFormData = z.infer<typeof orderCreateSchema>;

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1),
    new_password: z.string().min(8),
    confirm_password: z.string().min(8),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm_password"],
  });
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export const categorySchema = z.object({
  name: z.string().min(2).max(150),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
});
export type CategoryFormData = z.infer<typeof categorySchema>;

export const productSchema = z.object({
  name: z.string().min(2).max(255),
  description: z.string().optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Prix invalide"),
  compare_price: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .optional()
    .or(z.literal("")),
  images: z.array(z.string()).default([]),
  main_image: z.string().optional().or(z.literal("")),
  stock: z.number().int().min(0),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  category_id: z.number().int().nullable(),
});
export type ProductFormData = z.infer<typeof productSchema>;

export const deliveryPricingSchema = z.object({
  home_delivery: z.string().nullable(),
  office_delivery: z.string().nullable(),
  is_active: z.boolean().default(true),
});
export type DeliveryPricingFormData = z.infer<typeof deliveryPricingSchema>;
