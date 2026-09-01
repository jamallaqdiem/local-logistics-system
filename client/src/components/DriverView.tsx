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
  Building2,
} from "lucide-react";
import { Order } from "../types/order";

interface DriverViewProps {
  orders: Order[];
  onAdvanceStatus: (orderId: string) => void;
}

export const DriverView = ({ orders, onAdvanceStatus }: DriverViewProps) => {
  const activeOrders = orders.filter(
    (o) =>
      !o.isCancelled && o.status !== "delivered" && o.status !== "cancelled",
  );

  const [navTargetAddress, setNavTargetAddress] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const sortedOrders = [...activeOrders].sort((a, b) => {
    if (a.priority === "high" && b.priority !== "high") return -1;
    if (a.priority !== "high" && b.priority === "high") return 1;
    if (a.status === "in_transit" && b.status !== "in_transit") return -1;
    if (a.status !== "in_transit" && b.status === "in_transit") return 1;
    return 0;
  });

  const currentOrder =
    sortedOrders.find((o) => o.id === selectedOrderId) || sortedOrders[0];

  const queuedOrders = sortedOrders.filter((o) => o.id !== currentOrder?.id);

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

  // Read pickup address dynamically from order object with dynamic fallback
  const pickupAddress =
    currentOrder.pickupAddress || import.meta.env.VITE_DEFAULT_PICKUP_ADDRESS;
  const deliveryAddress = currentOrder.address || "";
  const customerPhone = currentOrder.phone || "+447000000000";

  // Determine active target address based on order lifecycle phase
  const isPendingPickup = currentOrder.status === "pending";
  const activeTargetAddress = isPendingPickup ? pickupAddress : deliveryAddress;

  const encodedNavAddress = encodeURIComponent(navTargetAddress || "");
  const navLinks = [
    {
      name: "Google Maps",
      url: `https://www.google.com/maps/search/?api=1&query=${encodedNavAddress}`,
      color: "hover:bg-blue-50 text-blue-600",
    },
    {
      name: "Waze",
      url: `https://waze.com/ul?q=${encodedNavAddress}&navigate=yes`,
      color: "hover:bg-cyan-50 text-cyan-600",
    },
    {
      name: "Apple Maps",
      url: `https://maps.apple.com/?q=${encodedNavAddress}`,
      color: "hover:bg-slate-100 text-slate-800",
    },
  ];

  return (
    <div className="max-w-md mx-auto p-4 space-y-4 relative">
      {/* Header Card with Compact Pickup Detail */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-lg space-y-2">
        <div className="flex items-center justify-between">
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
              : "Pending Pickup"}
          </span>
        </div>

        {/* Compact Pickup badge in Header when in transit */}
        {!isPendingPickup && (
          <div className="pt-2 border-t border-slate-800 text-xs text-slate-300 flex items-center gap-1.5 truncate">
            <Building2 size={13} className="text-amber-400 shrink-0" />
            <span className="text-slate-400 font-medium shrink-0">Pickup:</span>
            <span className="truncate">{pickupAddress}</span>
          </div>
        )}
      </div>

      {/* Main Delivery Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
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

        {/* Status-Driven Focus Block */}
        {isPendingPickup ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-extrabold text-amber-800 tracking-wider flex items-center gap-1">
                <Building2 size={13} className="text-amber-600" /> Current Step:
                Collect Package
              </span>
            </div>
            <p className="text-base font-bold text-slate-900">
              {pickupAddress}
            </p>
            <p className="text-xs text-slate-500 pt-1">
              Dropoff: {deliveryAddress}
            </p>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-extrabold text-blue-900 tracking-wider flex items-center gap-1">
                <MapPin size={13} className="text-blue-600" /> Current Step:
                Deliver to Customer
              </span>
            </div>
            <p className="text-base font-bold text-slate-900">
              {deliveryAddress}
            </p>
          </div>
        )}

        {/* Single Contextual Navigation Button */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() => setNavTargetAddress(activeTargetAddress)}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20"
          >
            <Navigation size={16} />
            {isPendingPickup ? "Navigate Pickup" : "Navigate Dropoff"}
          </button>

          <a
            href={`tel:${customerPhone}`}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-200 transition-colors"
          >
            <Phone size={16} />
            Call Customer
          </a>
        </div>

        {currentOrder.priority === "high" && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold">
            <AlertCircle size={16} className="shrink-0 text-red-500" />
            High Priority Delivery - Requires Immediate Attention
          </div>
        )}

        {/* Status Lifecycle Action */}
        <button
          onClick={() => {
            onAdvanceStatus(currentOrder.id);
            setSelectedOrderId(null);
          }}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-base rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle2 size={20} />
          {isPendingPickup
            ? "Confirm Pickup & Start Route"
            : "Complete Delivery"}
        </button>
      </div>

      {/* Navigation App Modal */}
      {Boolean(navTargetAddress) && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Choose Navigation App
                </h3>
                <p className="text-xs text-slate-500 truncate max-w-[240px]">
                  {navTargetAddress}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setNavTargetAddress(null)}
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
                  onClick={() => setNavTargetAddress(null)}
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

      {/* Remaining Queue */}
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
