import { useState, useEffect } from "react";
import { mockOrders } from "@/components/data";
import OrderCard from "@/components/OrderCard";
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

  const [orders, setOrders] = useState(() => {
    // We try to get data from localStorage
    const savedOrders = localStorage.getItem("logistics_orders");

    // If it exists, parse the JSON string back into a JS array
    if (savedOrders) {
      try {
        return JSON.parse(savedOrders);
      } catch (error) {
        console.error("Failed to parse saved orders:", error);
        return mockOrders;
      }
    }
    // Fallback to mockOrders if storage is empty
    return mockOrders;
  });
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
    // Convert the array to a string to store it into file name logistic...
    localStorage.setItem("logistics_orders", JSON.stringify(orders));
  }, [orders]);

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

  // calculate the two numbers total, and high priority
  const totalOrders = orders.length;
  const highPriorityCount = orders.filter((o) => o.priority === "high").length;

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

  // Calculate the success rate.
  const deliveredCount = orders.filter((o) => o.status === "delivered").length;
  const cancelledCount = orders.filter((o) => o.isCancelled).length;
  const totalResolved = deliveredCount + cancelledCount;

  // Success Rate Formula: (Delivered / Total Resolved) * 100
  const successRate =
    totalResolved > 0 ? Math.round((deliveredCount / totalResolved) * 100) : 0;

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
                {totalOrders} Total
              </span>

              {/* High Priority Badge - Only show if count > 0 */}
              {highPriorityCount > 0 && (
                <button
                  onClick={() => setHighPriorityOnly(!highPriorityOnly)} // This toggles the filter
                  className={`text-[10px] font-bold px-2 py-1 rounded-md border transition-all active:scale-95 uppercase 
      ${
        highPriorityOnly
          ? "bg-red-600 text-white border-red-600 shadow-sm"
          : "bg-red-50 text-red-600 border-red-100 hover:bg-red-100"
      }`}
                >
                  ⚠️ {highPriorityCount} High Priority
                </button>
              )}
            </div>
          </div>

          {/* RIGHT SIDE: Search & Clear */}
          <div className="flex items-center gap-3 flex-1  justify-end">
            <SearchBar onSearch={setSearchTerm} value={searchTerm} />

            {(searchTerm || activeTab !== "all" || highPriorityOnly) && (
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
        <div className="max-w-[1400px] mx-auto px-6">
          <StatusFilter
            activeTab={activeTab}
            onTabChange={setActiveTab}
            orders={orders}
          />
        </div>
      </div>

      {/* Insights Ribbon */}
      <div className="bg-slate-50 border-b border-slate-200 py-2 px-6">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-slate-400">Success Rate</span>
              <span
                className={
                  successRate > 80 ? "text-green-600" : "text-amber-600"
                }
              >
                {successRate}%
              </span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex flex-col">
              <span className="text-slate-400">Resolved</span>
              <span className="text-slate-700">{totalResolved} Orders</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[9px] block text-slate-400 uppercase tracking-widest">
              System Health
            </span>
            <span
              className={`text-[10px] font-bold uppercase ${isSystemOverloaded ? "text-red-500 animate-pulse" : "text-green-500"}`}
            >
              {isSystemOverloaded ? "⚠️ Critical" : "Active"}
            </span>
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
