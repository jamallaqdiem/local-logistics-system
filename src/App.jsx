import { useState } from "react";
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

  //using order state to change data.
  const [orders, setOrders] = useState(mockOrders);

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
            return { ...order, status: steps[nextIndex] };
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
          return { ...order, isCancelled: true };
        }
        return order;
      }),
    );
    setSelectedOrder(null);
  };

  return (
    // 1. The main wrapper
    <div className="h-screen bg-slate-100 flex flex-col">
      {/* 2. HEADER SECTION */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-6">
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
          <div className="flex items-center gap-3 flex-1 max-w-md">
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
      <div className="flex justify-center border-t border-slate-50 pt-2">
        <StatusFilter
          activeTab={activeTab}
          onTabChange={setActiveTab}
          orders={orders}
        />
      </div>
      {/* SCROLLABLE LIST SECTION */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-md mx-auto flex flex-col gap-4 pb-10">
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
            <div className="text-center py-20 text-slate-400 italic">
              No matching orders found...
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
