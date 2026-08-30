import React, { useEffect, useState } from "react";
import axios from "axios";
import { Customer, FormOrderModalProps } from "@/types/order";

export const FormOrderModal: React.FC<FormOrderModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [postcode, setPostcode] = useState("");
  const [address, setAddress] = useState("");
  const [saveForFuture, setSaveForFuture] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch saved B2B customers whenever modal opens
  useEffect(() => {
    if (isOpen) {
      axios
        .get<Customer[]>("/api/customers")
        .then((response) => {
          setCustomers(Array.isArray(response.data) ? response.data : []);
        })
        .catch((err) => console.error("Failed to load saved customers:", err));
    }
  }, [isOpen]);

  // Handle dropdown selection & auto-fill form fields
  const handleSelectCustomer = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const custId = e.target.value;
    setSelectedCustomerId(custId);

    if (!custId) {
      setName("");
      setPhone("");
      setPostcode("");
      setAddress("");
      return;
    }

    const found = customers.find((c) => c.id === Number(custId));
    if (found) {
      setName(found.name);
      setPhone(found.phone);
      setPostcode(found.postcode || "");
      setAddress(found.address);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let finalCustomerId: number | undefined = selectedCustomerId
      ? Number(selectedCustomerId)
      : undefined;

    // Save profile if dispatcher entered a new account manually and checked "Save account profile"
    if (!selectedCustomerId && saveForFuture) {
      try {
        const response = await axios.post<Customer>("/api/customers", {
          name,
          phone,
          postcode,
          address,
        });
        if (response.status === 201 || response.status === 200) {
          finalCustomerId = response.data.id;
        }
      } catch (err) {
        console.error("Failed to save customer profile:", err);
      }
    }

    const fullAddress = postcode ? `${address}, ${postcode}` : address;

    onSubmit({
      customer: name,
      phone,
      address: fullAddress,
      customerId: finalCustomerId,
    });

    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header  */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">
            ⚡ New Dispatch Order
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Quick Select B2B Dropdown */}
          <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100">
            <label className="block text-[10px] uppercase font-bold text-blue-900 tracking-wider mb-1">
              Quick Select Saved B2B Account
            </label>
            <select
              value={selectedCustomerId}
              onChange={handleSelectCustomer}
              className="w-full border border-slate-200 p-2.5 rounded-xl bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Manual Entry / New Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.postcode ? `(${c.postcode})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
              Recipient / Business Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Havant Auto Repairs"
              className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+447700900111"
              className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                Address
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Unit 4, Park Road Ind Est"
                className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                Postcode
              </label>
              <input
                type="text"
                required
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                placeholder="PO9 1SA"
                className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {!selectedCustomerId && (
            <label className="flex items-center gap-2 text-xs text-slate-600 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={saveForFuture}
                onChange={(e) => setSaveForFuture(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              Save account profile for future fast select
            </label>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-blue-500/20"
            >
              {loading ? "Dispatching..." : "Confirm Dispatch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
