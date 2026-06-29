// @ts-nocheck
import React, { useState } from "react";
import { useLang, t } from "@/hooks/useAppLang";

type UploadStatus = "pending" | "uploading" | "success" | "error";

interface UploadRow {
  idx: number;
  title: string;
  priceXAF: number;
  category: string;
  condition: string;
  description: string;
  status: UploadStatus;
}

const SAMPLE = "title,priceXAF,category,condition,description\nProduct A,15000,electronics,new,Great item\nProduct B,8000,clothing,like-new,Barely used";

const BulkUpload: React.FC = () => {
  const [rows,    setRows]    = useState<UploadRow[]>([]);
  const [loading, setLoading] = useState(false);

  const parseCSV = (text: string) => {
    const lines = text.trim().split("\n").slice(1);
    const parsed: UploadRow[] = lines.map((line, idx) => {
      const parts = line.split(",");
      return {
        idx,
        title:       parts[0]?.trim() ?? "",
        priceXAF:    Number(parts[1]) || 0,
        category:    parts[2]?.trim() ?? "",
        condition:   parts[3]?.trim() ?? "",
        description: parts[4]?.trim() ?? "",
        status:      "pending" as UploadStatus,
      };
    });
    setRows(parsed);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => parseCSV(String(ev.target?.result ?? ""));
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    setLoading(true);
    setRows(prev => prev.map(r => ({ ...r, status: "uploading" as UploadStatus })));
    await new Promise(r => setTimeout(r, 1200));
    setRows(prev => prev.map(r => ({ ...r, status: "success" as UploadStatus })));
    setLoading(false);
  };

  const ICONS: Record<UploadStatus, string> = {
    pending: "?", uploading: "??", success: "?", error: "?",
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Bulk Upload</h1>
      <p className="text-gray-500 text-sm mb-4">Upload a CSV to add multiple listings at once.</p>
      <pre className="bg-gray-50 rounded-xl p-3 text-xs font-mono text-gray-600 mb-4">{SAMPLE}</pre>
      <div className="flex gap-4 mb-6 items-center">
        <input type="file" accept=".csv" onChange={handleFile}
          className="flex-1 border rounded-lg p-2 text-sm" />
        {rows.length > 0 && (
          <button onClick={handleUpload} disabled={loading}
            className="bg-teal-600 text-white px-4 py-2 rounded-xl text-sm disabled:opacity-50">
            {loading ? "Uploading..." : ("Upload " + rows.length + " items")}
          </button>
        )}
      </div>
      {rows.length > 0 && (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-2">#</th><th className="pb-2">Title</th>
              <th className="pb-2">Price</th><th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.idx} className="border-b last:border-0">
                <td className="py-2 text-gray-400">{r.idx + 1}</td>
                <td className="py-2 font-medium">{r.title}</td>
                <td className="py-2">{r.priceXAF.toLocaleString()} XAF</td>
                <td className="py-2">{ICONS[r.status]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BulkUpload;





