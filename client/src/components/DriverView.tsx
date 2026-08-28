import { useState } from "react";
import {
  MapPin,
  Phone,
  Navigation,
  CheckCircle2,
  Package,
  AlertCircle,
  X,
  ExternalLink,
} from "lucide-react";
import { Order } from "../types/order";

interface DriverViewProps {
  orders: Order[];
  onAdvanceStatus: (orderId: string) => void;
}

const DriverView = ({ orders, onAdvanceStatus }: DriverViewProps) => {
  // 1. Filter for active orders
  const activeOrders = orders.filter(
    (o) =>
      !o.isCancelled && o.status !== "delivered" && o.status !== "cancelled",
  );

  const [showNavMenu, setShowNavMenu] = useState(false);
  // 2. Track manual selection state
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // 3. Sort orders (High priority first, then in_transit, then pending)
  const sortedOrders = [...activeOrders].sort((a, b) => {
    if (a.priority === "high" && b.priority !== "high") return -1;
    if (a.priority !== "high" && b.priority === "high") return 1;
    if (a.status === "in_transit" && b.status !== "in_transit") return -1;
    if (a.status !== "in_transit" && b.status === "in_transit") return 1;
    return 0;
  });

  // 4. Resolve current active order
  const currentOrder =
    sortedOrders.find((o) => o.id === selectedOrderId) || sortedOrders[0];

  // 5. Build queue of remaining items
  const queuedOrders = sortedOrders.filter((o) => o.id !== currentOrder?.id);

  // ⚠️ SAFETY CHECK: Handle empty orders or loading state BEFORE reading address
  if (!currentOrder) {
    return (
      <div className="max-w-md mx-auto p-6 text-center space-y-4 py-16">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">All Delivered!</h2>
        <p className="text-sm text-slate-500">
          There are currently no active deliveries assigned to your queue.
        </p>
      </div>
    );
  }

  // Safe to read address and phone
  const encodedAddress = encodeURIComponent(currentOrder.address || "");
  const customerPhone = currentOrder.phone || "+447000000000";

  // Navigation Options
  const navLinks = [
    {
      name: "Google Maps",
      url: `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
      color: "hover:bg-blue-50 text-blue-600",
    },
    {
      name: "Waze",
      url: `https://waze.com/ul?q=${encodedAddress}&navigate=yes`,
      color: "hover:bg-cyan-50 text-cyan-600",
    },
    {
      name: "Apple Maps",
      url: `https://maps.apple.com/?q=${encodedAddress}`,
      color: "hover:bg-slate-100 text-slate-800",
    },
  ];

  return (
    <div className="max-w-md mx-auto p-4 space-y-4 relative">
      {/* Header Badge */}
      <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-2xl shadow-lg">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
            Current Route
          </span>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Package size={18} className="text-blue-400" />
            {currentOrder.id}
          </h2>
        </div>
        <span
          className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
            currentOrder.status === "in_transit"
              ? "bg-blue-500 text-white"
              : "bg-amber-500 text-white"
          }`}
        >
          {currentOrder.status === "in_transit"
            ? "In Transit"
            : "Pending Start"}
        </span>
      </div>

      {/* Main Delivery Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Customer
          </span>
          <h3 className="text-xl font-extrabold text-slate-900">
            {currentOrder.customer}
          </h3>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            {customerPhone}
          </p>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Delivery Address
          </span>
          <div className="flex items-start gap-2 mt-1">
            <MapPin size={18} className="text-blue-600 shrink-0 mt-0.5" />
            <p className="text-base font-medium text-slate-700 leading-snug">
              {currentOrder.address}
            </p>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {/* Modal Trigger for Navigation */}
          <button
            type="button"
            onClick={() => setShowNavMenu(true)}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-50 text-blue-600 font-bold text-sm rounded-xl hover:bg-blue-100 transition-colors"
          >
            <Navigation size={16} />
            Navigate
          </button>

          {/* Native Phone Call Link */}
          <a
            href={`tel:${customerPhone}`}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-200 transition-colors"
          >
            <Phone size={16} />
            Call Customer
          </a>
        </div>

        {/* Priority Warning */}
        {currentOrder.priority === "high" && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold">
            <AlertCircle size={16} className="shrink-0 text-red-500" />
            High Priority Delivery - Requires Immediate Attention
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={() => {
            onAdvanceStatus(currentOrder.id);
            setSelectedOrderId(null);
          }}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-base rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle2 size={20} />
          {currentOrder.status === "pending"
            ? "Start Delivery"
            : "Complete Delivery"}
        </button>
      </div>

      {/* Navigation App Selector Modal */}
      {showNavMenu && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                Choose Navigation App
              </h3>
              <button
                type="button"
                onClick={() => setShowNavMenu(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-2">
              {navLinks.map((app) => (
                <a
                  key={app.name}
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowNavMenu(false)}
                  className={`flex items-center justify-between p-3 rounded-xl border border-slate-200 font-bold text-sm transition-colors ${app.color}`}
                >
                  {app.name}
                  <ExternalLink size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Remaining Queue Overview */}
      {queuedOrders.length > 0 && (
        <div className="pt-2 space-y-2">
          <div className="flex justify-between items-center px-1">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Next in Queue ({queuedOrders.length})
            </h4>
            {selectedOrderId && (
              <button
                type="button"
                onClick={() => setSelectedOrderId(null)}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Reset to Auto Queue
              </button>
            )}
          </div>
          <div className="space-y-2">
            {queuedOrders.map((order) => (
              <button
                type="button"
                key={order.id}
                onClick={() => setSelectedOrderId(order.id)}
                className="w-full bg-white p-3 rounded-xl border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all flex justify-between items-center text-left group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-slate-800 group-hover:text-blue-600 transition-colors">
                      {order.customer}
                    </p>
                    {order.priority === "high" && (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-600">
                        High
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate max-w-[200px]">
                    {order.address}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    {order.id}
                  </span>
                  <span className="text-xs font-bold text-slate-300 group-hover:text-blue-600 transition-colors">
                    →
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverView;
