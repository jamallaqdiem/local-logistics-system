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
  phone: string;
  status: OrderStatus;
  priority: OrderPriority;
  lastUpdate?: number;
  trackingToken: string;
  estimatedDeliveryTime: string;
  timeline?: TimelineEvent[];
  isCancelled?: boolean;
}

export interface OrderData {
  id: string;
  customer: string;
  address: string;
  status: "pending" | "in_transit" | "delivered" | "cancelled";
  trackingToken: string;
  estimatedDeliveryTime: string;
  isCancelled: boolean;
}
