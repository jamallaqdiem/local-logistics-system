import {
  Package,
  MapPin,
  Clock,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Order, OrderPriority } from "../types/order";

interface OrderCardProps {
  order: Order;
  currentTime: number;
  onUpdatePriority: (id: string, newPriority: OrderPriority) => void;
}

const OrderCard = ({
  order,
  currentTime,
  onUpdatePriority,
}: OrderCardProps) => {
  const isDelivered = order.status === "delivered";
  const isCancelled = order.isCancelled || order.status === "cancelled";
  const isFinished = isDelivered || isCancelled;

  // 1. Calculate relative elapsed time in minutes
  const diffInMinutes = order.lastUpdate
    ? Math.max(0, Math.floor((currentTime - order.lastUpdate) / 60000))
    : 0;

  // Stale warning applies only to active (non-delivered, non-cancelled) orders
  const isStale = diffInMinutes >= 20 && !isFinished;

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
  };

  // Toggle priority state on click
  const handleTogglePriority = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents parent card selection/navigation
    if (isFinished) return;
    const nextPriority: OrderPriority =
      order.priority === "high" ? "normal" : "high";
    onUpdatePriority(order.id, nextPriority);
  };

  return (
    <div
      className={`relative overflow-hidden p-5 rounded-2xl border transition-all cursor-pointer group ${
        isFinished
          ? "bg-slate-50/80 border-slate-200 opacity-90"
          : isStale
            ? "bg-amber-50/50 border-amber-300 shadow-inner"
            : "bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300"
      }`}
    >
      {/* DELIVERED STAMP OVERLAY */}
      {isDelivered && (
        <div className="absolute top-3 right-3 pointer-events-none select-none z-10">
          <div className="flex items-center gap-1 border-2 border-emerald-500/40 text-emerald-600 font-black text-[10px] tracking-widest uppercase px-2 py-0.5 rounded rotate-[6deg] bg-emerald-50/80">
            <CheckCircle2 size={12} />
            Delivered
          </div>
        </div>
      )}

      {/* CANCELLED STAMP OVERLAY */}
      {isCancelled && (
        <div className="absolute top-3 right-3 pointer-events-none select-none z-10">
          <div className="flex items-center gap-1 border-2 border-red-500/40 text-red-600 font-black text-[10px] tracking-widest uppercase px-2 py-0.5 rounded rotate-[-6deg] bg-red-50/80">
            <XCircle size={12} />
            Cancelled
          </div>
        </div>
      )}

      {/* Warning Badge for Stale Orders */}
      {isStale && (
        <div className="flex items-center gap-2 mb-3 py-1 px-2 bg-amber-100 rounded-md w-fit">
          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
          <span className="text-[9px] font-black text-amber-700 uppercase tracking-wider">
            Stale: {formatTimeAgo(diffInMinutes)} since last update
          </span>
        </div>
      )}

      {/* Header: Order ID & Interactive Priority Toggle Badge */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 text-slate-500">
          <Package size={16} />
          <span className="text-xs font-mono font-bold tracking-wider">
            {order.id}
          </span>
        </div>

        {/* Priority Badge - Hidden when delivered or cancelled */}
        {!isFinished && (
          <button
            type="button"
            onClick={handleTogglePriority}
            title="Click to toggle priority"
            className={`flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border transition-colors ${
              priorityStyles[order.priority] || priorityStyles.normal
            }`}
          >
            <span>{order.priority}</span>
            <RefreshCw
              size={10}
              className="opacity-60 group-hover:rotate-180 transition-transform duration-300"
            />
          </button>
        )}
      </div>

      {/* Main Info */}
      <div className="mb-4">
        <h3
          className={`text-lg font-bold transition-colors ${
            isFinished
              ? "text-slate-600 line-through decoration-slate-300"
              : "text-slate-900 group-hover:text-blue-600"
          }`}
        >
          {order.customer}
        </h3>
        <div className="flex items-center gap-1.5 text-slate-500 mt-1">
          <MapPin size={14} className="shrink-0" />
          <p className="text-sm truncate">{order.address}</p>
        </div>
        {/* Phone Number Display */}
        {order.phone && (
          <div className="text-xs text-gray-600 flex items-center gap-1 mt-1">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <a href={`tel:${order.phone}`} className="hover:underline">
              {order.phone}
            </a>
          </div>
        )}
      </div>

      {/* Footer: Dynamic Time Indicator */}
      <div className="flex justify-between items-center pt-4 border-t border-slate-50">
        <div className="flex items-center gap-1.5">
          <Clock
            size={14}
            className={
              isFinished
                ? "text-slate-300"
                : isStale
                  ? "text-amber-500"
                  : "text-slate-400"
            }
          />
          <span
            className={`text-[10px] font-bold ${
              isFinished
                ? "text-slate-400"
                : isStale
                  ? "text-amber-600"
                  : "text-slate-400"
            }`}
          >
            {isCancelled
              ? `Cancelled: ${formatTimeAgo(diffInMinutes)}`
              : isDelivered
                ? `Completed: ${formatTimeAgo(diffInMinutes)}`
                : isStale
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
