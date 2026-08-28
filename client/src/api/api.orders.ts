import { api } from "./axios";
import { Order } from "../types/order";

// Fetch all orders from backend
export const fetchOrders = async (): Promise<Order[]> => {
  const response = await api.get<Order[]>("/orders");
  return response.data;
};

// Update order fields (status, priority, cancellation, lastUpdate)
export const updateOrder = async (
  orderId: string,
  updates: Partial<Order>,
): Promise<Order> => {
  const response = await api.patch<Order>(`/orders/${orderId}`, updates);
  return response.data;
};
