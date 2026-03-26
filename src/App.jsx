import { useState } from "react";
import { mockOrders } from "@/components/data";
import OrderCard from "@/components/OrderCard";
import SearchBar from "./components/SearchBar";
import StatusFilter from "./components/StatusFilter";

function App() {
  //searchBar state
  const [searchTerm, setSearchTerm] = useState("");
  // active Tab state.
  const [activeTab, setActiveTab] = useState("all");

  const filteredOrders = mockOrders.filter((order) => {
    // the ID or customer name match.
    const matchesSearch =
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    // we return true if the tab is all or the status match.
    const matchesTab = activeTab === "all" || order.status === activeTab;
    // the order must pass both checks.
    return matchesSearch && matchesTab;
  });

  return (
    // 1. The main wrapper stays the full height of the screen
    <div className="h-screen bg-slate-100 flex flex-col">
      {/* 2. HEADER SECTION */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 shadow-sm z-10">
        <div className="max-w-6xl mx-auto flex items-center  gap-6">
          {/* Left Side: Count & Title */}
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-black text-slate-800 tracking-tight whitespace-nowrap">
              Logistics Command
            </h1>
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
              {filteredOrders.length} results found
            </span>
          </div>

          {/* Center Search Bar  */}
          <div className="flex-1 max-w-md">
            <SearchBar onSearch={setSearchTerm} value={searchTerm} />
          </div>

          {/* Right Side Clear Button */}
          <div className="min-w-[100px] flex justify">
            {(searchTerm || activeTab !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setActiveTab("all");
                }}
                className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-all active:scale-95"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
      {/*Status Filter Row */}
      <div className="flex justify-center border-t border-slate-50 pt-2">
        <StatusFilter
          activeTab={activeTab}
          onTabChange={setActiveTab}
          orders={mockOrders}
        />
      </div>
      {/* 3. SCROLLABLE LIST SECTION */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-md mx-auto flex flex-col gap-4 pb-10">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}

          {filteredOrders.length === 0 && (
            <div className="text-center py-20 text-slate-400 italic">
              No matching orders found...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
