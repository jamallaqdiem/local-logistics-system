import { OrderStatus } from "../types/order";

interface OrderTimelineProps {
  currentStatus: OrderStatus;
  isCancelled?: boolean;
}

const OrderTimeline = ({
  currentStatus,
  isCancelled = false,
}: OrderTimelineProps) => {
  const steps: OrderStatus[] = ["pending", "in_transit", "delivered"];
  const currentStepIndx = steps.indexOf(currentStatus);

  return (
    <div className="py-8 px-2">
      <div className="relative flex items-center justify-between">
        {/* The Background Connecting Line */}
        <div className="absolute top-2 left-0 w-full h-0.5 bg-slate-100 z-0" />
        {steps.map((step, index) => {
          const isStepMatch = currentStatus === step;

          // 1. If cancelled, this dot is "completed" only if it was the stage where it stopped
          // 2. Otherwise, use normal index logic
          const isCompleted = isCancelled
            ? isStepMatch
            : index <= currentStepIndx;

          // 3. Active dot
          const isCurrent = isStepMatch;

          return (
            <div
              key={step}
              className="relative z-10 flex flex-col items-center gap-3"
            >
              <div
                className={`w-4 h-4 rounded-full border-4 transition-all duration-500 ${
                  isCancelled && isCurrent
                    ? "bg-red-500 border-red-100"
                    : isCompleted
                      ? "bg-blue-600 border-blue-100"
                      : "bg-white border-slate-200"
                } ${isCurrent ? "scale-125 shadow-lg" : ""}`}
              />
              <span
                className={`text-[10px] font-black uppercase tracking-tight ${
                  isCancelled && isCurrent
                    ? "text-red-500"
                    : isCompleted
                      ? "text-slate-800"
                      : "text-slate-400"
                }`}
              >
                {isCancelled && isCurrent
                  ? "Cancelled"
                  : step.replace("_", "-")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTimeline;
