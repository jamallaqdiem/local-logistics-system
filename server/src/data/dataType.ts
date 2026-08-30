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
  customerId?: number | null;
}

export interface UpdateOrderInput {
  status?: OrderStatus;
  priority?: OrderPriority;
  isCancelled?: boolean;
  lastUpdate?: number;
  phone?: string;
  estimatedDeliveryTime?: string;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  postcode: string;
  address: string;
  createdAt?: string;
}

export interface CreateCustomerInput {
  name: string;
  phone: string;
  postcode: string;
  address: string;
}
