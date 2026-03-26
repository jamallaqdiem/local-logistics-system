const StatusFilter = ({ activeTab, onTabChange, orders }) => {
  const tabs = ["all", "pending", "in-transit", "delivered", "cancelled"];
  // get the count of each status.
  const getCount = (tabName) => {
    if (tabName === "all") return orders.length;
    return orders.filter((o) => o.status === tabName).length;
  };

  return (
    <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`px-4 py-1.5 text-xs font-bold rounded-lg capitalize transition-all duration-200 ${
            activeTab === tab
              ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
          }`}
        >
          {/* replace the dash in in-transit */}
          {tab.replace("-", " ")}
          <span className="ml-2 opacity-50 text-[10px]">{getCount(tab)}</span>
        </button>
      ))}
    </div>
  );
};

export default StatusFilter;
