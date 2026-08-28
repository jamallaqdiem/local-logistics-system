import { api } from "./axios";
import { Order, OrderPriority } from "../types/order";

/**
 * Sends a PATCH request to toggle or set the priority of a specific order.
 * @param orderId - The unique ID of the target order (e.g., 'ORD-1001')
 * @param priority - The target priority level ('normal' | 'high')
 */
export const updateOrderPriority = async (
  orderId: string,
  priority: OrderPriority,
): Promise<Order> => {
  const response = await api.patch<Order>(`/orders/${orderId}`, {
    priority,
    lastUpdate: Date.now(),
  });
  return response.data;
};
