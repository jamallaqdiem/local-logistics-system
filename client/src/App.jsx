import { useState, useEffect } from "react";
import OrderCard from "./components/OrderCard";
import SearchBar from "./components/SearchBar";
import StatusFilter from "./components/StatusFilter";
import OrderModal from "./components/OrderModal";

const steps = ["pending", "in-transit", "delivered"];
function App() {
  //searchBar state
  const [searchTerm, setSearchTerm] = useState("");

  // active Tab state.
  const [activeTab, setActiveTab] = useState("all");

  //priority state
  const [highPriorityOnly, setHighPriorityOnly] = useState(false);

  // a tracker for the order status.
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [orders, setOrders] = useState([]);

  // timer stamp for whole app
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  // update every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Runs every time the orders state change.
  useEffect(() => {
    const getOrders = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/orders", {
          method: "GET",
        });
        if (!response)
          throw new Error(`HTTP error, status: ${response.status}`);

        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };
    getOrders();
  }, []);

  //function that will move the order status
  const promoteOrder = (orderId) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id === orderId) {
          const newPriority = order.priority === "high" ? "normal" : "high";
          return { ...order, priority: newPriority };
        }
        return order;
      }),
    );
    setSelectedOrder(null);
  };

  // function that find the current index of an order's status and move it to the next idx
  const advanceStatus = (orderId) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id === orderId) {
          // find where we are in the array
          const currentIndex = steps.indexOf(order.status);

          // Calculate the next step
          const nextIndex = currentIndex + 1;

          // only update if there is a next step
          if (nextIndex < steps.length) {
            return {
              ...order,
              status: steps[nextIndex],
              lastUpdate: Date.now(),
            };
          }
        }
        return order;
      }),
    );
  };

  const filteredOrders = orders.filter((order) => {
    // the ID or customer name match.
    const matchesSearch =
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    // we return true if the tab is all or the status match.
    const matchesTab =
      activeTab === "all"
        ? !order.isCancelled // Show all active orders
        : activeTab === "cancelled"
          ? order.isCancelled // Show  orders where isCancelled is true
          : order.status === activeTab && !order.isCancelled; // Show specific status and not cancelled
    const matchPriority = !highPriorityOnly || order.priority === "high";

    // the order must pass all checks.
    return matchesSearch && matchesTab && matchPriority;
  });

  // find the the live version order from the state
  const currentOrder = orders.find((o) => o.id === selectedOrder?.id);

  // This changes an order's status to cancelled
  const cancelOrder = (orderId) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            isCancelled: true,
            lastUpdate: Date.now(),
          };
        }
        return order;
      }),
    );
    setSelectedOrder(null);
  };

  // calculate and check if the system is overloaded
  const staleCount = orders.filter((order) => {
    if (order.status === "delivered" || !order.lastUpdate) return false;
    const diff = Math.floor((currentTime - order.lastUpdate) / 60000);
    return diff >= 20; // 20min logic as the card
  }).length;

  // Determine health status
  const isSystemOverloaded = staleCount > 10;

  // Calculate real-time metrics
  const metrics = {
    total: orders.length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
    highPriority: orders.filter(
      (o) => o.priority === "high" && o.status !== "delivered",
    ).length,

    //  subtract cancelled from total so they don't count against the "success" potential
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
    // 1. The main wrapper
    <div className="h-screen bg-slate-100 flex flex-col">
      {/* 2. HEADER SECTION */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm z-10">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-6">
          {/* LEFT SIDE: Brand & Global Stats */}
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-black text-slate-800 tracking-tight">
              Logistics Command
            </h1>

            <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
              {/* Total Badge */}
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md uppercase tracking-tight">
                {metrics.total} Total
              </span>

              {/* High Priority Badge - Only show if count > 0 */}
              {metrics.highPriority > 0 && (
                <button
                  onClick={() => setHighPriorityOnly(!highPriorityOnly)} // This toggles the filter
                  className={`text-[10px] font-bold px-2 py-1 rounded-md border transition-all active:scale-95 uppercase 
                    ${
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

          {/* RIGHT SIDE: Search & Clear */}
          <div className="flex items-center gap-3 flex-1  justify-end">
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

      {/*Status Filter Row */}
      <div className="w-full bg-white border-b border-slate-200 py-1">
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
          <StatusFilter
            activeTab={activeTab}
            onTabChange={setActiveTab}
            orders={orders}
          />

          {/* Insights Ribbon */}
          <div className="hidden lg:flex items-center gap-10 text-[11px] font-bold tracking-wider uppercase">
            {/* Success Rate with Mini Progress Bar */}
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
              {/* The Progress Bar */}
              <div className="w-32 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${metrics.successRate > 70 ? "bg-emerald-500" : "bg-amber-500"}`}
                  style={{ width: `${metrics.successRate}%` }}
                />
              </div>
            </div>

            {/* Resolved Count */}
            <div className="flex flex-col border-l border-slate-800 pl-6">
              <span className="text-slate-400 text-[9px]">Resolved</span>
              <span className="text-slate-200 mt-1">
                {metrics.delivered}{" "}
                <span className="text-slate-500 text-[9px] lowercase">
                  delivered
                </span>
              </span>
            </div>

            {/* System Health with Status Indicator */}
            <div className="flex flex-col border-l border-slate-800 pl-6">
              <span className="text-slate-400 text-[9px]">System Health</span>
              <div className="flex items-center gap-2 mt-1">
                {/* The Status Dot */}
                <div
                  className={`w-2 h-2 rounded-full ${isSystemOverloaded ? "bg-rose-500 animate-ping" : "bg-emerald-500"}`}
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
              <OrderCard order={order} />
            </div>
          ))}

          {filteredOrders.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-sm transition-all animate-in fade-in zoom-in duration-300">
              {/* Visual Icon */}
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

              {/* The clear Button */}
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

      {/* 4. MODAL LAYER */}
      <OrderModal
        order={currentOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdatePriority={promoteOrder}
        onAdvanceStatus={advanceStatus}
        onCancel={cancelOrder}
      />
    </div>
  );
}

export default App;
