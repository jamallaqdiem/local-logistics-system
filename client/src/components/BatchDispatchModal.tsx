import React, { useState } from "react";
// cspell:disable-next-line
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { createBatchOrders } from "../api/api.orders";
import { Order, BatchOrderInput } from "../types/order";

export const BatchDispatchModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newOrders: Order[]) => void;
}> = ({ isOpen, onClose, onSuccess }) => {
  const [parsedOrders, setParsedOrders] = useState<BatchOrderInput[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const processRawData = (rows: Record<string, any>[]) => {
    const validated: BatchOrderInput[] = [];
    const validationErrors: string[] = [];

    rows.forEach((row, index) => {
      const normalizedRow: Record<string, string> = {};
      Object.keys(row).forEach((k) => {
        normalizedRow[k.toLowerCase().trim()] = String(row[k] || "").trim();
      });

      const customer =
        normalizedRow["customer"] ||
        normalizedRow["customer_name"] ||
        normalizedRow["name"] ||
        normalizedRow["recipient"];
      const phone =
        normalizedRow["phone"] ||
        normalizedRow["mobile"] ||
        normalizedRow["telephone"];
      const street = normalizedRow["address"] || normalizedRow["street"];
      const postcode = normalizedRow["postcode"] || normalizedRow["zip"];
      const fullAddress = postcode ? `${street}, ${postcode}` : street;

      const rawPriority = (normalizedRow["priority"] || "normal").toLowerCase();

      // Map imported values
      let priority: "normal" | "high" = "normal";
      if (rawPriority === "high" || rawPriority === "urgent") {
        priority = "high";
      } else {
        priority = "normal"; // Maps 'normal', or empty fields to 'normal'
      }

      if (!customer || !phone || !fullAddress) {
        validationErrors.push(
          `Row ${index + 2}: Missing required customer, phone, or address field.`,
        );
      } else {
        validated.push({
          customer,
          phone,
          address: fullAddress,
          priority: priority as any, // Casts cleanly to BatchOrderInput priority standard
        });
      }
    });

    setErrors(validationErrors);
    setParsedOrders(validated);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    //  CSV & TSV PARSING
    if (fileExtension === "csv" || fileExtension === "tsv") {
      Papa.parse<Record<string, string>>(file, {
        header: true,
        skipEmptyLines: true,
        delimiter: fileExtension === "tsv" ? "\t" : "",
        complete: (results) => processRawData(results.data),
        error: (err) =>
          setErrors([
            `${fileExtension.toUpperCase()} Parsing Error: ${err.message}`,
          ]),
      });
    }
    // JSON PARSING
    else if (fileExtension === "json") {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const content = evt.target?.result as string;
          const jsonContent = JSON.parse(content);
          const dataArray = Array.isArray(jsonContent)
            ? jsonContent
            : [jsonContent];
          processRawData(dataArray);
        } catch (err: any) {
          setErrors([`JSON Parsing Error: ${err.message}`]);
        }
      };
      reader.readAsText(file);
    }
    // EXCEL (XLSX / XLS) PARSING
    else if (["xlsx", "xls"].includes(fileExtension || "")) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const buffer = evt.target?.result as ArrayBuffer;
          const wb = XLSX.read(buffer, { type: "array", cellDates: true });
          const wsName = wb.SheetNames[0];
          const ws = wb.Sheets[wsName];

          // Convert sheet to JSON array of objects
          const json = XLSX.utils.sheet_to_json<Record<string, any>>(ws, {
            defval: "",
          });

          if (json.length === 0) {
            setErrors(["Excel file is empty or could not be parsed."]);
            setParsedOrders([]);
          } else {
            processRawData(json);
          }
        } catch (err: any) {
          setErrors([`Excel Parsing Error: ${err.message}`]);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleBatchSubmit = async () => {
    if (parsedOrders.length === 0) return;
    setIsUploading(true);

    try {
      const newOrders = await createBatchOrders(parsedOrders);
      setIsUploading(false);
      setParsedOrders([]);
      onSuccess(newOrders);
      onClose();
    } catch (err: any) {
      console.error("Batch creation failed:", err);
      setErrors([
        err.response?.data?.error || "Failed to save batch orders to database.",
      ]);
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-lg font-bold text-slate-800">
            📦 Batch File Dispatch Upload
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-lg"
          >
            ✕
          </button>
        </div>

        <input
          type="file"
          accept=".csv, .tsv, .json, .xlsx, .xls"
          onChange={handleFileUpload}
          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
        />

        {errors.length > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl max-h-32 overflow-y-auto text-xs text-red-600">
            {errors.map((err, idx) => (
              <p key={idx}>{err}</p>
            ))}
          </div>
        )}

        {parsedOrders.length > 0 && (
          <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 font-bold uppercase">
                <tr>
                  <th className="p-2">Customer</th>
                  <th className="p-2">Phone</th>
                  <th className="p-2">Delivery Address</th>
                  <th className="p-2">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parsedOrders.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2 font-medium">{row.customer}</td>
                    <td className="p-2">{row.phone}</td>
                    <td className="p-2">{row.address}</td>
                    <td className="p-2 capitalize font-semibold">
                      {row.priority}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleBatchSubmit}
            disabled={parsedOrders.length === 0 || isUploading}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors"
          >
            {isUploading
              ? "Saving to Database..."
              : `Dispatch ${parsedOrders.length} Orders`}
          </button>
        </div>
      </div>
    </div>
  );
};
