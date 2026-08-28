export type OrderStatus = "pending" | "in_transit" | "delivered" | "cancelled";
export type OrderPriority = "high" | "normal" | "low";

export interface Order {
  id: string;
  customer: string;
  address: string;
  status: OrderStatus;
  priority: OrderPriority;
  isCancelled: boolean;
  lastUpdate: number;
  created_at?: string;
}

export interface UpdateOrderInput {
  status?: OrderStatus;
  priority?: OrderPriority;
  isCancelled?: boolean;
  lastUpdate?: number;
}
