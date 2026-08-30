import { useState, useEffect } from "react";
import axios from "axios";
import OrderCard from "../components/OrderCard";
import SearchBar from "../components/SearchBar";
import StatusFilter from "../components/StatusFilter";
import OrderModal from "../components/OrderModal";
import { FormOrderModal } from "../components/FormOrderModal";
import { Order, FilterTab, OrderPriority, OrderStatus } from "../types/order";
import { fetchOrders, updateOrder, createOrder } from "../api/api.orders";
import { updateOrderPriority } from "../api/api.orderEscalation";

export default function DispatchPage() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [highPriorityOnly, setHighPriorityOnly] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentTime, setCurrentTime] = useState<number>(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await fetchOrders();
        setOrders(data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Error fetching data:", error.message);
        }
      }
    };
    loadOrders();
  }, []);

  const handleUpdateOrder = async (
    orderId: string,
    updates: Partial<Order>,
  ) => {
    try {
      const updatedOrder = await updateOrder(orderId, updates);
      setOrders((prev) =>
        prev.map((ord) => (ord.id === orderId ? updatedOrder : ord)),
      );
      setSelectedOrder(null);
    } catch (error) {
      if (axios.isAxiosError(error))
        console.error("Update failed:", error.message);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id?.toLowerCase().includes(searchTerm.toLowerCase());

    const isOrderCancelled = order.isCancelled || order.status === "cancelled";

    const matchesTab =
      activeTab === "all"
        ? !isOrderCancelled
        : activeTab === "cancelled"
          ? isOrderCancelled
          : order.status ===
              (activeTab === "in-transit" ? "in_transit" : activeTab) &&
            !isOrderCancelled;

    const matchPriority = !highPriorityOnly || order.priority === "high";

    return matchesSearch && matchesTab && matchPriority;
  });

  const currentOrder = orders.find((o) => o.id === selectedOrder?.id) || null;

  const staleCount = orders.filter((order) => {
    if (order.status === "delivered" || !order.lastUpdate) return false;
    return Math.floor((currentTime - order.lastUpdate) / 60000) >= 20;
  }).length;

  const isSystemOverloaded = staleCount > 10;

  const metrics = {
    total: orders.length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    highPriority: orders.filter(
      (o) => o.priority === "high" && o.status !== "delivered",
    ).length,
    successRate:
      orders.length > 0
        ? Math.round(
            (orders.filter((o) => o.status === "delivered").length /
              orders.length) *
              100,
          )
        : 0,
  };

  return (
    <div className="h-screen bg-slate-100 flex flex-col overflow-hidden">
      {/* HEADER SECTION */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm z-10">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-black text-slate-800 tracking-tight">
              Logistics Command
            </h1>

            <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md uppercase">
                {metrics.total} Total
              </span>

              {metrics.highPriority > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const nextState = !highPriorityOnly;
                    setHighPriorityOnly(nextState);
                    if (nextState) setActiveTab("all");
                  }}
                  className={`text-[10px] font-bold px-2 py-1 rounded-md border transition-all uppercase ${
                    highPriorityOnly
                      ? "bg-red-600 text-white border-red-600 shadow-sm"
                      : "bg-red-50 text-red-600 border-red-100 hover:bg-red-100"
                  }`}
                >
                  ⚠️ {metrics.highPriority} High Priority
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 flex-1 justify-end">
            <SearchBar onSearch={setSearchTerm} value={searchTerm} />
            {/*   FORM BUTTON */}
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors shadow-sm whitespace-nowrap"
            >
              + New Dispatch
            </button>

            {(searchTerm || activeTab !== "all" || highPriorityOnly) &&
              filteredOrders.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setActiveTab("all");
                    setHighPriorityOnly(false);
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 whitespace-nowrap"
                >
                  Reset All
                </button>
              )}
          </div>
        </div>
      </div>

      {/* Status Filter Row */}
      <div className="w-full bg-white border-b border-slate-200 py-1">
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
          <StatusFilter
            activeTab={activeTab}
            onTabChange={setActiveTab}
            orders={orders}
          />

          <div className="hidden lg:flex items-center gap-10 text-[11px] font-bold tracking-wider uppercase">
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center w-32">
                <span className="text-slate-400 text-[9px]">Success Rate</span>
                <span
                  className={
                    metrics.successRate > 70
                      ? "text-emerald-500"
                      : "text-amber-500"
                  }
                >
                  {metrics.successRate}%
                </span>
              </div>
              <div className="w-32 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    metrics.successRate > 70 ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                  style={{ width: `${metrics.successRate}%` }}
                />
              </div>
            </div>

            <div className="flex flex-col border-l border-slate-800 pl-6">
              <span className="text-slate-400 text-[9px]">Resolved</span>
              <span className="text-slate-200 mt-1">
                {metrics.delivered}{" "}
                <span className="text-slate-500 text-[9px] lowercase">
                  delivered
                </span>
              </span>
            </div>

            <div className="flex flex-col border-l border-slate-800 pl-6">
              <span className="text-slate-400 text-[9px]">System Health</span>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isSystemOverloaded
                      ? "bg-rose-500 animate-ping"
                      : "bg-emerald-500"
                  }`}
                />
                <span
                  className={
                    isSystemOverloaded ? "text-rose-500" : "text-emerald-500"
                  }
                >
                  {isSystemOverloaded ? "Critical" : "Stable"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SCROLLABLE LIST SECTION */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className="cursor-pointer"
            >
              <OrderCard
                order={order}
                currentTime={currentTime}
                onUpdatePriority={async (id, newPriority) => {
                  try {
                    const updated = await updateOrderPriority(id, newPriority);
                    setOrders((prev) =>
                      prev.map((o) => (o.id === id ? updated : o)),
                    );
                  } catch (error) {
                    console.error("Failed to update priority:", error);
                  }
                }}
              />
            </div>
          ))}

          {filteredOrders.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                No orders found
              </h3>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setActiveTab("all");
                  setHighPriorityOnly(false);
                }}
                className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-xs"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL LAYER */}
      <OrderModal
        order={currentOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdatePriority={async (id) => {
          if (!currentOrder) return;
          const nextPriority: OrderPriority =
            currentOrder.priority === "high" ? "normal" : "high";
          try {
            const updated = await updateOrderPriority(id, nextPriority);
            setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
            setSelectedOrder(null);
          } catch (error) {
            console.error("Failed to update priority:", error);
          }
        }}
        onCancel={(id) =>
          handleUpdateOrder(id, {
            isCancelled: true,
            status: "cancelled",
            lastUpdate: Date.now(),
          })
        }
        onRestore={(id) =>
          handleUpdateOrder(id, {
            isCancelled: false,
            status: "pending",
            lastUpdate: Date.now(),
          })
        }
        onAdvanceStatus={() => {
          if (!currentOrder) return;
          const nextStatus: OrderStatus =
            currentOrder.status === "pending" ? "in_transit" : "delivered";
          handleUpdateOrder(currentOrder.id, {
            status: nextStatus,
            lastUpdate: Date.now(),
          });
        }}
        onRevertStatus={(id) =>
          handleUpdateOrder(id, {
            status: "in_transit",
            lastUpdate: Date.now(),
          })
        }
      />
      {/* Form Modal */}
      <FormOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={async (newOrderData) => {
          try {
            // Import and call createOrder from your API file here
            const created = await createOrder(newOrderData);
            setOrders((prev) => [created, ...prev]);
            setIsCreateModalOpen(false);
          } catch (error) {
            console.error("Failed to create dispatch order:", error);
          }
        }}
      />
    </div>
  );
}
