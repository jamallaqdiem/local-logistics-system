const OrderTimeline = ({ currentStatus }) => {
  const steps = ["pending", "in-transit", "delivered"];

  const currentStepIndx = steps.indexOf(currentStatus);

  return (
    <div className="py-8 px-2">
      <div className="relative flex items-center justify-between">
        {/* The Background Connecting Line */}
        <div className="absolute top-2 left-0 w-full h-0.5 bg-slate-100 z-0" />

        {steps.map((step, index) => {
          // Logic: Is this dot in the past, present, or future?
          const isCompleted = index <= currentStepIndx;
          const isCurrent = index === currentStepIndx;

          return (
            <div
              key={step}
              className="relative z-10 flex flex-col items-center gap-3"
            >
              {/* The Visual Dot */}
              <div
                className={`w-4 h-4 rounded-full border-4 transition-all duration-500 ${
                  isCompleted
                    ? "bg-blue-600 border-blue-100"
                    : "bg-white border-slate-200"
                } ${isCurrent ? "scale-125 shadow-lg shadow-blue-200" : ""}`}
              />

              {/* The Text Label */}
              <span
                className={`text-[10px] font-black uppercase tracking-tight ${
                  isCompleted ? "text-slate-800" : "text-slate-400"
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTimeline;
