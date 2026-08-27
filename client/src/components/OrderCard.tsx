import { Package, MapPin, Clock, ChevronRight } from "lucide-react";
import { Order, OrderPriority } from "../types/order";

interface OrderCardProps {
  order: Order;
  currentTime: number;
}

const OrderCard = ({ order, currentTime }: OrderCardProps) => {
  // 1. Calculate relative elapsed time in minutes
  const diffInMinutes = order.lastUpdate
    ? Math.max(0, Math.floor((currentTime - order.lastUpdate) / 60000))
    : 0;

  const isStale = diffInMinutes >= 20 && order.status !== "delivered";

  // 2. Format relative time
  const formatTimeAgo = (mins: number): string => {
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const priorityStyles: Record<OrderPriority, string> = {
    high: "bg-red-100 text-red-700 border-red-200",
    normal: "bg-blue-100 text-blue-700 border-blue-200",
    low: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <div
      className={`p-5 rounded-2xl border transition-all cursor-pointer group ${
        isStale
          ? "bg-amber-50/50 border-amber-300 shadow-inner"
          : "bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300"
      }`}
    >
      {/* Warning Badge for Stale Orders */}
      {isStale && (
        <div className="flex items-center gap-2 mb-3 py-1 px-2 bg-amber-100 rounded-md w-fit">
          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
          <span className="text-[9px] font-black text-amber-700 uppercase tracking-wider">
            Stale: {formatTimeAgo(diffInMinutes)} since last update
          </span>
        </div>
      )}

      {/* Header: Order ID & Priority Badge */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 text-slate-500">
          <Package size={16} />
          <span className="text-xs font-mono font-bold tracking-wider">
            {order.id}
          </span>
        </div>
        <span
          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
            priorityStyles[order.priority] || priorityStyles.normal
          }`}
        >
          {order.priority}
        </span>
      </div>

      {/* Main Info */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
          {order.customer}
        </h3>
        <div className="flex items-center gap-1.5 text-slate-500 mt-1">
          <MapPin size={14} className="shrink-0" />
          <p className="text-sm truncate">{order.address}</p>
        </div>
      </div>

      {/* Footer: Dynamic Time Indicator*/}
      <div className="flex justify-between items-center pt-4 border-t border-slate-50">
        <div className="flex items-center gap-1.5">
          <Clock
            size={14}
            className={isStale ? "text-amber-500" : "text-slate-400"}
          />
          <span
            className={`text-[10px] font-bold ${
              isStale ? "text-amber-600" : "text-slate-400"
            }`}
          >
            {isStale
              ? `STALE: ${formatTimeAgo(diffInMinutes)}`
              : `Updated: ${formatTimeAgo(diffInMinutes)}`}
          </span>
        </div>

        <div className="flex items-center gap-1 text-blue-600 font-semibold text-xs opacity-0 group-hover:opacity-100 transition-opacity">
          Details
          <ChevronRight size={14} />
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
