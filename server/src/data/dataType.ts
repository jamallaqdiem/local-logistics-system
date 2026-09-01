export type OrderStatus = "pending" | "in_transit" | "delivered" | "cancelled";
export type OrderPriority = "high" | "normal";

export interface Order {
  id: string;
  customer: string;
  phone: string;
  address: string;
  pickupAddress?: string | null;
  price: number;
  pickupPhone?: string | null;
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
  pickupAddress?: string | null;
  price: number;
  pickupPhone?: string | null;
  estimatedDeliveryTime?: string;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  postcode: string;
  address: string;
  pickupAddress?: string | null;
  createdAt?: string;
}

export interface CreateCustomerInput {
  name: string;
  phone: string;
  postcode: string;
  address: string;
}
