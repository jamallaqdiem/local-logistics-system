// src/types/order.ts
export type OrderStatus = "pending" | "in_transit" | "delivered" | "cancelled";
export type OrderPriority = "high" | "normal";
export type FilterTab =
  | "all"
  | "pending"
  | "in-transit"
  | "delivered"
  | "cancelled";

export interface TimelineEvent {
  status: string;
  time: string;
  note?: string;
}

export interface Order {
  id: string;
  customer: string;
  address: string;
  pickupAddress?: string | null;
  price: number;
  phone: string;
  status: OrderStatus;
  priority: OrderPriority;
  lastUpdate?: number;
  trackingToken: string;
  estimatedDeliveryTime: string;
  timeline?: TimelineEvent[];
  isCancelled?: boolean;
  customerId?: number | null;
  createdAt?: string;
}

export interface OrderData {
  id: string;
  customer: string;
  address: string;
  pickupAddress?: string | null;
  price?: number;
  status: "pending" | "in_transit" | "delivered" | "cancelled";
  trackingToken: string;
  estimatedDeliveryTime: string;
  isCancelled: boolean;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  postcode: string;
  address: string;
  pickupAddress?: string | null;
}

export interface FormOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (orderData: {
    customer: string;
    phone: string;
    address: string;
    pickupAddress?: string;
    price?: number;
    customerId?: number;
  }) => void;
}
export interface BatchOrderInput {
  customer: string;
  phone: string;
  address: string;
  pickupAddress?: string;
  price?: number;
  priority?: "low" | "medium" | "high" | "urgent";
}

export interface BatchOrderResponse {
  message: string;
  data: Order[];
}
