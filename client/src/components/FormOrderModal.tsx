import React, { useEffect, useState, useRef } from "react";
import { api } from "../api/axios";
import { Customer, FormOrderModalProps } from "@/types/order";

const DEFAULT_PICKUP_ADDRESS =
  import.meta.env.VITE_DEFAULT_PICKUP_ADDRESS ||
  "Portsmouth Express Depot, PO1 1AA";

const DEFAULT_PICKUP_PHONE =
  import.meta.env.VITE_DEFAULT_PICKUP_PHONE || "+447000000000";

const INITIAL_FORM_STATE = {
  name: "",
  phone: "",
  postcode: "",
  address: "",
  pickupAddress: DEFAULT_PICKUP_ADDRESS,
  pickupPhone: DEFAULT_PICKUP_PHONE,
  price: "",
  saveForFuture: true,
};

export const FormOrderModal: React.FC<FormOrderModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");

  // Form State
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  // Search filter state for B2B dropdown
  const [customerSearch, setCustomerSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Clear form helper
  const resetForm = () => {
    setFormData(INITIAL_FORM_STATE);
    setSelectedCustomerId("");
    setCustomerSearch("");
    setIsDropdownOpen(false);
    setErrorMsg(null);
  };

  // Helper to handle form input updates
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Fetch saved B2B customers whenever modal opens & reset state when closed
  useEffect(() => {
    if (isOpen) {
      resetForm();
      api
        .get<Customer[]>("/customers")
        .then((response) => {
          setCustomers(Array.isArray(response.data) ? response.data : []);
        })
        .catch((err) => console.error("Failed to load saved customers:", err));
    }
  }, [isOpen]);

  // Close custom dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter saved customers based on search input
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      (c.postcode &&
        c.postcode.toLowerCase().includes(customerSearch.toLowerCase())),
  );

  const handleSelectCustomer = (customer: Customer | null) => {
    if (!customer) {
      resetForm();
    } else {
      setSelectedCustomerId(String(customer.id));
      setCustomerSearch(
        `${customer.name} ${customer.postcode ? `(${customer.postcode})` : ""}`,
      );
      setFormData((prev) => ({
        ...prev,
        name: customer.name,
        phone: customer.phone,
        postcode: customer.postcode || "",
        address: customer.address,
        saveForFuture: false,
      }));
    }
    setIsDropdownOpen(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    let finalCustomerId: number | undefined = selectedCustomerId
      ? Number(selectedCustomerId)
      : undefined;

    //Save Customer Account if checked and not selected from dropdown
    if (!selectedCustomerId && formData.saveForFuture) {
      try {
        const response = await api.post<Customer>("/customers", {
          name: formData.name,
          phone: formData.phone,
          postcode: formData.postcode,
          address: formData.address,
        });
        if (response.status === 201 || response.status === 200) {
          finalCustomerId = response.data.id;
        }
      } catch (err: any) {
        console.error("Failed to save customer profile:", err);
        setErrorMsg("Failed to save customer profile. Please try again.");
        setLoading(false);
        return; // Block order creation if saving account fails
      }
    }

    // 2. Format Address and Dispatch Order
    const fullAddress = formData.postcode
      ? `${formData.address}, ${formData.postcode}`
      : formData.address;

    try {
      await onSubmit({
        customer: formData.name,
        phone: formData.phone,
        address: fullAddress,
        pickupAddress: formData.pickupAddress,
        pickupPhone: formData.pickupPhone,
        price: parseFloat(formData.price) || 0,
        customerId: finalCustomerId,
      });

      setLoading(false);
      resetForm();
      onClose();
    } catch (err: any) {
      console.error("Failed to dispatch order:", err);
      setErrorMsg("Failed to create dispatch order.");
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            ⚡ New Dispatch Order
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Searchable B2B Combobox */}
          <div
            className="bg-blue-50/60 p-3 rounded-xl border border-blue-100 relative"
            ref={dropdownRef}
          >
            <label className="block text-[10px] uppercase font-bold text-blue-900 tracking-wider mb-1">
              Quick Search Saved B2B Account
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Type to search saved customer..."
                value={customerSearch}
                onFocus={() => setIsDropdownOpen(true)}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  setIsDropdownOpen(true);
                  if (selectedCustomerId) {
                    setSelectedCustomerId("");
                  }
                }}
                className="w-full border border-slate-200 p-2.5 pr-8 rounded-xl bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {customerSearch && (
                <button
                  type="button"
                  onClick={() => handleSelectCustomer(null)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Dropdown Options List */}
            {isDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto p-1">
                <button
                  type="button"
                  onClick={() => handleSelectCustomer(null)}
                  className="w-full text-left px-3 py-2 text-xs text-slate-500 hover:bg-slate-100 rounded-lg font-medium"
                >
                  -- Manual Entry / Clear Selection --
                </button>

                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectCustomer(c)}
                      className="w-full text-left px-3 py-2 text-sm text-slate-800 hover:bg-blue-50 hover:text-blue-600 rounded-lg font-medium flex justify-between items-center"
                    >
                      <span>{c.name}</span>
                      {c.postcode && (
                        <span className="text-xs text-slate-400">
                          {c.postcode}
                        </span>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-xs text-slate-400">
                    No matching saved accounts
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pickup Address & Price Row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                📍 Pickup Address
              </label>
              <input
                type="text"
                name="pickupAddress"
                id="pickupAddress"
                autoComplete="off"
                required
                value={formData.pickupAddress}
                onChange={handleChange}
                placeholder="Pickup address..."
                className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                📞 Pickup Phone
              </label>
              <input
                type="tel"
                name="pickupPhone"
                id="pickupPhone"
                autoComplete="off"
                required
                value={formData.pickupPhone}
                onChange={handleChange}
                placeholder="+447000000000"
                className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                Price (£)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="price"
                required
                value={formData.price}
                onFocus={(e) => e.target.select()}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
              Recipient / Business Name
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
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
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="+447700900111"
              className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                Delivery Address
              </label>
              <input
                type="text"
                name="address"
                id="deliveryAddress"
                autoComplete="street-address"
                required
                value={formData.address}
                onChange={handleChange}
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
                name="postcode"
                required
                value={formData.postcode}
                onChange={handleChange}
                placeholder="PO9 1SA"
                className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {!selectedCustomerId && (
            <label className="flex items-center gap-2 text-xs text-slate-600 pt-1 cursor-pointer">
              <input
                type="checkbox"
                name="saveForFuture"
                checked={formData.saveForFuture}
                onChange={handleChange}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              Save account profile for future fast select
            </label>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {loading ? "Dispatching..." : "Confirm Dispatch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
