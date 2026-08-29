export type OrderStatus = "pending" | "in_transit" | "delivered" | "cancelled";
export type OrderPriority = "high" | "normal";

export interface Order {
  id: string;
  customer: string;
  phone: string;
  address: string;
  status: OrderStatus;
  trackingToken: string;
  estimatedDeliveryTime?: string | null;
  priority: OrderPriority;
  isCancelled: boolean;
  lastUpdate: number;
  createdAt?: string;
}

export interface UpdateOrderInput {
  status?: OrderStatus;
  priority?: OrderPriority;
  isCancelled?: boolean;
  lastUpdate?: number;
  phone?: string;
  estimatedDeliveryTime?: string;
}
