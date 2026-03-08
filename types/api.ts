// ── E-Commerce API Types ─────────────────────────────────────────────────────

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  compare_price: string | null;
  images: string[];
  main_image: string | null;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  category: Pick<Category, "id" | "name" | "slug" | "is_active"> | null;
  created_at: string;
  updated_at: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type DeliveryType = "home" | "office";

export interface OrderItem {
  id: number;
  product: number | null;
  product_name: string;
  product_image: string | null;
  unit_price: string;
  quantity: number;
  subtotal: string;
}

export interface Order {
  id: number;
  order_number: string;
  status: OrderStatus;
  customer_name: string;
  customer_phone: string;
  customer_phone2: string | null;
  customer_wilaya_code: number;
  customer_wilaya_name: string;
  customer_address: string;
  delivery_type: DeliveryType;
  delivery_price: string;
  subtotal: string;
  total: string;
  notes: string | null;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface DeliveryPricing {
  id: number;
  wilaya_code: number;
  wilaya_name: string;
  home_delivery: string | null;
  office_delivery: string | null;
  is_active: boolean;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface OrderStats {
  today: { orders_count: number; revenue: number };
  this_month: { orders_count: number; revenue: number };
  all_time: { orders_count: number; revenue: number };
  by_status: Record<OrderStatus, number>;
  top_products: { product_id: number; product_name: string; total_sold: number }[];
  recent_orders: Pick<
    Order,
    | "id"
    | "order_number"
    | "status"
    | "customer_name"
    | "customer_phone"
    | "total"
    | "created_at"
  >[];
}

export interface AdminUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff?: boolean;
}

export interface CreateOrderPayload {
  customer_name: string;
  customer_phone: string;
  customer_phone2?: string;
  customer_wilaya_code: number;
  customer_address: string;
  delivery_type: DeliveryType;
  items: { product_id: number; quantity: number }[];
  notes?: string;
}

export interface TrackOrderResponse extends Order {
  timeline?: { status: OrderStatus; timestamp: string }[];
}
