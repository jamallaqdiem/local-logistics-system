import { useEffect } from "react";
import OrderTimeline from "./OrderTimeline";
import { Order } from "../types/order";

interface OrderModalProps {
  order: Order | null;
  onClose: () => void;
  onUpdatePriority: (orderId: string) => void;
  onCancel: (orderId: string) => void;
  onRestore: (orderId: string) => void;
  onAdvanceStatus: () => void;
  onRevertStatus: (orderId: string) => void;
}

const OrderModal = ({
  order,
  onClose,
  onUpdatePriority,
  onCancel,
  onRestore,
  onAdvanceStatus,
  onRevertStatus,
}: OrderModalProps) => {
  // Listen for Escape key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);

    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!order) return null;

  const isCancelled = order.isCancelled || order.status === "cancelled";
  const isDelivered = order.status === "delivered";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">{order.id}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Customer
            </label>
            <p className="text-lg font-semibold text-slate-700">
              {order.customer}
            </p>
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
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Address
            </label>
            <p className="text-slate-600">{order.address}</p>
          </div>

          <OrderTimeline
            currentStatus={order.status}
            isCancelled={isCancelled}
          />

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-50">
            {/* CASE 1: ORDER IS DELIVERED */}
            {isDelivered ? (
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="text-emerald-600 font-black text-xl tracking-tighter italic border-2 border-emerald-500 px-4 py-1 rounded-md rotate-[-3deg] opacity-90 bg-emerald-50">
                  ✓ DELIVERED
                </div>
                <button
                  onClick={() => onRevertStatus(order.id)}
                  className="text-xs text-slate-400 hover:text-blue-500 underline transition-colors"
                >
                  Mistake? Revert to In-Transit
                </button>
              </div>
            ) : isCancelled ? (
              /* CASE 2: ORDER IS CANCELLED */
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="text-red-500 font-black text-xl tracking-tighter italic border-2 border-red-500 px-4 py-1 rounded-md rotate-[-5deg] opacity-80">
                  CANCELLED
                </div>
                <button
                  onClick={() => onRestore(order.id)}
                  className="text-xs text-slate-400 hover:text-blue-500 underline transition-colors"
                >
                  Mistake? Restore Order
                </button>
              </div>
            ) : (
              /* CASE 3: ORDER IS ACTIVE (PENDING / IN_TRANSIT) */
              <>
                <div className="flex gap-3">
                  <button
                    onClick={() => onUpdatePriority(order.id)}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-colors ${
                      order.priority === "high"
                        ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        : "bg-red-50 text-red-600 hover:bg-red-100"
                    }`}
                  >
                    {order.priority === "high"
                      ? "⬇️ Demote"
                      : "🔥 Promote to High"}
                  </button>
                  <button
                    onClick={onAdvanceStatus}
                    className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors"
                  >
                    {order.status === "pending"
                      ? "🚚 Start Delivery"
                      : "✅ Mark Delivered"}
                  </button>
                </div>

                <button
                  onClick={() => onCancel(order.id)}
                  className="w-full mt-2 py-2 text-xs font-bold text-slate-400 hover:text-red-600 transition-colors uppercase tracking-widest"
                >
                  × Cancel Order
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;
