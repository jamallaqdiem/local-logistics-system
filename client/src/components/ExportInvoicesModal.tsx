import React, { useState } from "react";
import { Order } from "../types/order";

interface ExportInvoicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  initialSelectedOrderId?: string;
}

export const ExportInvoicesModal: React.FC<ExportInvoicesModalProps> = ({
  isOpen,
  onClose,
  orders,
  initialSelectedOrderId,
}) => {
  const [exportMode, setExportMode] = useState<"date_range" | "single">(
    initialSelectedOrderId ? "single" : "date_range",
  );

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Search query state for single order selection
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(
    orders.find((o) => o.id === initialSelectedOrderId) || orders[0] || null,
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  if (!isOpen) return null;

  // Filter orders for searchable combobox dropdown
  const searchableOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase();
    const matchesId = order.id?.toLowerCase().includes(q);
    const matchesCustomer = order.customer?.toLowerCase().includes(q);
    return matchesId || matchesCustomer;
  });

  // Calculate matching target list for final export
  const filteredOrders = orders.filter((order) => {
    if (exportMode === "single") {
      return selectedOrder ? order.id === selectedOrder.id : false;
    }

    const rawTimestamp = order.createdAt || order.lastUpdate;
    if (!rawTimestamp) return true;

    const orderTime = new Date(rawTimestamp).getTime();
    const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : 0;
    const end = endDate
      ? new Date(endDate).setHours(23, 59, 59, 999)
      : Infinity;

    return orderTime >= start && orderTime <= end;
  });

  const totalRevenue = filteredOrders.reduce(
    (sum, order) => sum + (order.price || 0),
    0,
  );

  const escapeCSV = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return '""';
    return `"${String(val).replace(/"/g, '""')}"`;
  };

  const handleExportCSV = () => {
    const headers = [
      "Order ID",
      "Customer",
      "Phone",
      "Pickup Address",
      "Delivery Address",
      "Status",
      "Price (£)",
      "Created At",
    ];

    const rows = filteredOrders.map((order) => [
      escapeCSV(order.id),
      escapeCSV(order.customer),
      escapeCSV(order.phone),
      escapeCSV(order.pickupAddress),
      escapeCSV(order.address),
      escapeCSV(order.status),
      escapeCSV((order.price || 0).toFixed(2)),
      escapeCSV(
        order.createdAt
          ? new Date(order.createdAt).toLocaleString("en-GB")
          : order.lastUpdate
            ? new Date(order.lastUpdate).toLocaleString("en-GB")
            : "",
      ),
    ]);

    const csvContent =
      "\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    const fileName =
      exportMode === "single" && selectedOrder
        ? `invoice_${selectedOrder.id}.csv`
        : `invoices_${startDate || "all"}_to_${endDate || "latest"}.csv`;

    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">
            Export Invoices (CSV)
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 rounded-lg hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        {/* Export Mode Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
          <button
            type="button"
            onClick={() => setExportMode("date_range")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              exportMode === "date_range"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Date Range
          </button>
          <button
            type="button"
            onClick={() => setExportMode("single")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              exportMode === "single"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Single Order
          </button>
        </div>

        <div className="space-y-4">
          {exportMode === "date_range" ? (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </>
          ) : (
            <div className="relative">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Search & Select Order
              </label>

              <input
                type="text"
                placeholder="Type order ID or customer name..."
                value={
                  isDropdownOpen
                    ? searchQuery
                    : selectedOrder
                      ? `${selectedOrder.id} — ${selectedOrder.customer}`
                      : ""
                }
                onFocus={() => {
                  setIsDropdownOpen(true);
                  setSearchQuery("");
                }}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />

              {/* Custom Searchable Dropdown List */}
              {isDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg z-20 divide-y divide-slate-100">
                  {searchableOrders.length > 0 ? (
                    searchableOrders.map((ord) => (
                      <button
                        key={ord.id}
                        type="button"
                        onClick={() => {
                          setSelectedOrder(ord);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-50 transition-colors flex justify-between items-center text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-800">
                            {ord.id}
                          </span>
                          <span className="text-slate-500 ml-2">
                            {ord.customer}
                          </span>
                        </div>
                        <span className="font-semibold text-emerald-600">
                          £{(ord.price || 0).toFixed(2)}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-xs text-slate-400 text-center font-medium">
                      No matching orders found
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Revenue Summary Preview */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex justify-between items-center text-xs font-medium text-slate-600">
              <span>Orders Selected:</span>
              <span className="font-bold text-slate-800">
                {filteredOrders.length}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm font-bold text-slate-900 border-t border-slate-200 pt-2">
              <span>Total Revenue:</span>
              <span className="text-emerald-600">
                £{totalRevenue.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={filteredOrders.length === 0}
            onClick={handleExportCSV}
            className="px-4 py-2.5 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Download CSV
          </button>
        </div>
      </div>
    </div>
  );
};
