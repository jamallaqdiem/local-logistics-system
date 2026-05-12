import { useEffect } from "react";
import OrderTimeline from "./OrderTimeline";
const OrderModal = ({
  order,
  onClose,
  onUpdatePriority,
  onCancel,
  onRestore,
  onAdvanceStatus,
}) => {
  //A use effect that listen and  close the modal using Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);

    // Cleanup the listener when the modal closes
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!order) return null;

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
          <button onClick={onClose} className="text-slate-400 hover:bg-red-600">
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
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Address
            </label>
            <p className="text-slate-600">{order.address}</p>
          </div>
          <OrderTimeline
            currentStatus={order.status}
            isCancelled={order.isCancelled}
          />

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-50">
            {/* CASE 1: ORDER IS CANCELLED */}
            {order.isCancelled ? (
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="text-red-500 font-black text-xl tracking-tighter italic border-2 border-red-500 px-4 py-1 rounded-md rotate-[-5deg] opacity-80">
                  CANCELLED
                </div>
                <button
                  onClick={() => onRestore(order.id)} // You can pass false to the same PATCH logic
                  className="text-xs text-slate-400 hover:text-blue-500 underline transition-colors"
                >
                  Mistake? Restore Order
                </button>
              </div>
            ) : (
              /* CASE 2: ORDER IS ACTIVE */
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
                  {/*  Advance Status Button  */}
                  {order.status !== "delivered" && (
                    <button
                      onClick={onAdvanceStatus}
                      className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors"
                    >
                      {order.status === "pending"
                        ? "🚚 Start Delivery"
                        : "✅ Mark Delivered"}
                    </button>
                  )}
                </div>

                {order.status !== "delivered" && (
                  <button
                    onClick={() => onCancel(order.id)}
                    className="w-full mt-2 py-2 text-xs font-bold text-slate-400 hover:text-red-600 transition-colors uppercase tracking-widest"
                  >
                    × Cancel Order
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;
