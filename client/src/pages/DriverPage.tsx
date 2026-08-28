import { useState, useEffect } from "react";
import axios from "axios";
import DriverView from "../components/DriverView";
import { Order, OrderStatus } from "../types/order";
import { fetchOrders, updateOrder } from "../api/api.orders";

export default function DriverPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await fetchOrders();
        setOrders(data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Error fetching driver orders:", error.message);
        }
      }
    };
    loadOrders();
  }, []);

  const handleAdvanceStatus = async (id: string) => {
    const targetOrder = orders.find((o) => o.id === id);
    if (!targetOrder) return;

    const nextStatus: OrderStatus =
      targetOrder.status === "pending" ? "in_transit" : "delivered";

    try {
      const updatedOrder = await updateOrder(id, {
        status: nextStatus,
        lastUpdate: Date.now(),
      });

      setOrders((prev) =>
        prev.map((ord) => (ord.id === id ? updatedOrder : ord)),
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Status update failed:", error.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-base font-extrabold tracking-tight">
          🚚 Driver Portal
        </h1>
        <span className="text-xs bg-slate-800 px-3 py-1 rounded-full text-slate-300 font-bold">
          Active Shift
        </span>
      </header>
      <main className="flex-1 p-4">
        <DriverView orders={orders} onAdvanceStatus={handleAdvanceStatus} />
      </main>
    </div>
  );
}
