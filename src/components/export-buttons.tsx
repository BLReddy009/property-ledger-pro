"use client";

import { Download, FileSpreadsheet, Printer } from "lucide-react";
import jsPDF from "jspdf";

const sampleRows = [
  { month: "May 2026", rent: 147000, expenses: 71200, profit: 75800 },
  { month: "April 2026", rent: 149000, expenses: 65300, profit: 83700 }
];

export function ExportButtons() {
  function exportPdf() {
    const doc = new jsPDF();
    doc.text("Property Ledger Pro Report", 16, 18);
    sampleRows.forEach((row, index) => {
      doc.text(`${row.month}: Rent ${row.rent}, Expenses ${row.expenses}, Profit ${row.profit}`, 16, 32 + index * 10);
    });
    doc.save("property-ledger-report.pdf");
  }

  function exportExcel() {
    const headers = Object.keys(sampleRows[0]);
    const rows = sampleRows.map((row) => headers.map((key) => row[key as keyof typeof row]).join("\t"));
    const content = [headers.join("\t"), ...rows].join("\n");
    const blob = new Blob([content], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "property-ledger-report.xls";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={exportPdf} className="inline-flex items-center gap-2 rounded-md bg-pine px-4 py-2 text-sm font-semibold text-white hover:bg-pine/90">
        <Download size={16} /> PDF
      </button>
      <button onClick={exportExcel} className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold dark:border-slate-700 dark:bg-slate-900">
        <FileSpreadsheet size={16} /> Excel
      </button>
      <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold dark:border-slate-700 dark:bg-slate-900">
        <Printer size={16} /> Print
      </button>
    </div>
  );
}
