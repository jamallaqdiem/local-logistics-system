// src/types/order.ts
export type OrderStatus = "pending" | "in_transit" | "delivered" | "cancelled";
export type OrderPriority = "high" | "normal" | "low";
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
  status: OrderStatus;
  priority: OrderPriority;
  lastUpdate?: number;
  timeline?: TimelineEvent[];
  isCancelled?: boolean;
}
