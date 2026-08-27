import { useState, useEffect } from "react";
import axios from "axios";
import { api } from "./api/axios";
import OrderCard from "./components/OrderCard";
import SearchBar from "./components/SearchBar";
import StatusFilter from "./components/StatusFilter";
import OrderModal from "./components/OrderModal";
import { Order, FilterTab, OrderStatus } from "./types/order";

function App() {
  // searchBar state
  const [searchTerm, setSearchTerm] = useState<string>("");

  // active Tab state
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  // priority state
  const [highPriorityOnly, setHighPriorityOnly] = useState<boolean>(false);

  // tracker for selected order
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // orders array
  const [orders, setOrders] = useState<Order[]>([]);

  // timestamp for whole app
  const [currentTime, setCurrentTime] = useState<number>(() => Date.now());

  // update timestamp every minute
  useEffect(() => {
    const timer = setInterval(() => {
      console.log("⏰ Timer ticked:", new Date().toLocaleTimeString());
      setCurrentTime(Date.now());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Fetch orders from backend API
  useEffect(() => {
    const getOrders = async () => {
      try {
        const response = await api.get<Order[]>("/orders");
        setOrders(response.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Error fetching data:", error.message);
        }
      }
    };
    getOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id?.toLowerCase().includes(searchTerm.toLowerCase());

    // Normalize cancellation check to handle both boolean and status string
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

  const updateOrderState = async (orderId: string, updates: Partial<Order>) => {
    try {
      const response = await api.patch<Order>(`/orders/${orderId}`, updates);

      setOrders((prevOrders) =>
        prevOrders.map((ord) => (ord.id === orderId ? response.data : ord)),
      );

      setSelectedOrder(null);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Update failed:", error.message);
      }
    }
  };

  const staleCount = orders.filter((order) => {
    if (order.status === "delivered" || !order.lastUpdate) return false;
    const diff = Math.floor((currentTime - order.lastUpdate) / 60000);
    return diff >= 20;
  }).length;

  const isSystemOverloaded = staleCount > 10;

  const metrics = {
    total: orders.length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.isCancelled || o.status === "cancelled")
      .length,
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
    <div className="h-screen bg-slate-100 flex flex-col">
      {/* HEADER SECTION */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm z-10">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-black text-slate-800 tracking-tight">
              Logistics Command
            </h1>

            <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md uppercase tracking-tight">
                {metrics.total} Total
              </span>

              {metrics.highPriority > 0 && (
                <button
                  onClick={() => setHighPriorityOnly(!highPriorityOnly)}
                  className={`text-[10px] font-bold px-2 py-1 rounded-md border transition-all active:scale-95 uppercase ${
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

            {(searchTerm || activeTab !== "all" || highPriorityOnly) &&
              filteredOrders.length > 0 && (
                <button
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

          {/* Insights Ribbon */}
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
              <OrderCard order={order} currentTime={currentTime} />
            </div>
          ))}

          {filteredOrders.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-sm transition-all animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl text-slate-400">🔍</span>
              </div>

              <h3 className="text-xl font-bold text-slate-800 mb-2">
                No orders found
              </h3>

              <p className="text-slate-500 text-sm max-w-[280px] text-center mb-8 leading-relaxed">
                We couldn't find anything matching your search or filters. Try
                adjusting your criteria.
              </p>

              <button
                onClick={() => {
                  setSearchTerm("");
                  setActiveTab("all");
                  setHighPriorityOnly(false);
                }}
                className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-800 active:scale-95 transition-all shadow-lg shadow-slate-200"
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
        onUpdatePriority={(id) =>
          updateOrderState(id, {
            priority: currentOrder?.priority === "high" ? "normal" : "high",
            lastUpdate: Date.now(),
          })
        }
        onCancel={(id) =>
          updateOrderState(id, {
            isCancelled: true,
            status: "cancelled",
            lastUpdate: Date.now(),
          })
        }
        onRestore={(id) =>
          updateOrderState(id, {
            isCancelled: false,
            status: "pending",
            lastUpdate: Date.now(),
          })
        }
        onAdvanceStatus={() => {
          if (!currentOrder) return;
          const nextStatus: OrderStatus =
            currentOrder.status === "pending" ? "in_transit" : "delivered";
          updateOrderState(currentOrder.id, {
            status: nextStatus,
            lastUpdate: Date.now(),
          });
        }}
      />
    </div>
  );
}

export default App;
