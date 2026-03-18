import { Package, MapPin, Clock, ChevronRight } from "lucide-react";

export const OrderCard = ({ order }) => {
  const priorityStyles = {
    high: "bg-red-100 text-red-700 border-red-200",
    normal: "bg-blue-100 text-blue-700 border-blue-200",
    low: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group">
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

        <div className="flex items-center gap-1 text-blue-600 font-semibold text-xs opacity-0 group-hover:opacity-100 transition-opacity">
          Details
          <ChevronRight size={14} />
        </div>
      </div>
    </div>
  );
};
