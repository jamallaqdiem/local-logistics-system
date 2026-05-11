import { Package, MapPin, Clock, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

const OrderCard = ({ order }) => {
  // state that hold the date
  const [now, setNow] = useState(() => Date.now());

  // This hook will update each minute to trigger  the time
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 60000); // 60,000ms = 1 minute

    return () => clearInterval(interval); // Cleanup when card is hidden
  }, []);

  const diffInMinutes = order.lastUpdate
    ? Math.floor((now - order.lastUpdate) / 60000)
    : 0;

  const isStale = diffInMinutes >= 20 && order.status !== "delivered";

  const displayTime =
    typeof order.lastUpdate === "number"
      ? new Date(order.lastUpdate).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Just now";
  // helper function to display formatting time
  const formatTimeAgo = (mins) => {
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  const priorityStyles = {
    high: "bg-red-100 text-red-700 border-red-200",
    normal: "bg-blue-100 text-blue-700 border-blue-200",
    low: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <div
      className={`p-5 rounded-2xl border transition-all cursor-pointer group 
      ${isStale ? "bg-amber-50/50 border-amber-300 shadow-inner" : "bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300"}`}
    >
      {/* The Warning  */}
      {isStale && (
        <div className="flex items-center gap-2 mb-3 py-1 px-2 bg-amber-100 rounded-md w-fit">
          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
          <span className="text-[9px] font-black text-amber-700 uppercase tracking-wider">
            Stale: {formatTimeAgo(diffInMinutes)}m since last update
          </span>
        </div>
      )}
      {/* ID and Priority Badge */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 text-slate-500">
          <Package size={16} />
          <span className="text-xs font-mono font-bold tracking-wider">
            {order.id}
          </span>
        </div>
        {/* Dynamic Badge Color */}
        <span
          className={`text-[10px] uppercase font-heavy px-2 py-0.5 rounded-full border ${priorityStyles[order.priority]}`}
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

      {/* Time and Action */}
      <div className="flex justify-between items-center pt-4 border-t border-slate-50">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Clock size={14} />
          <span className="text-xs font-medium">{order.time}</span>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Clock
            size={14}
            className={isStale ? "text-amber-500" : "text-slate-400"}
          />
          <span
            className={`text-[10px] font-bold ${isStale ? "text-amber-600" : "text-slate-400"}`}
          >
            {isStale
              ? `STALE: ${formatTimeAgo(diffInMinutes)} ago`
              : `Moved at : ${displayTime}`}
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
