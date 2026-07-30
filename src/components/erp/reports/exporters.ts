import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { CellValue, ColumnDef } from "./types";

/* ===========================================================================
   Export utilities — CSV / Excel (.xlsx) / PDF for a generated report.
   Shared by every Finance + R&I report so the exports look identical.
   =========================================================================== */

const stamp = () =>
  new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19); // 2026-07-27T14-30-05
const safeName = (title: string) => title.replace(/[^A-Za-z0-9_-]+/g, "_");
const asString = (v: CellValue | undefined) => (v == null ? "" : String(v));

/** Header text used as the file caption / PDF title. */
export type ReportMeta = {
  title: string;
  captionLines?: string[];
  generatedAt?: string;
};

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportCsv(
  columns: ColumnDef[],
  rows: Record<string, CellValue>[],
  meta: ReportMeta,
) {
  const csvEscape = (v: string) => {
    if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
    return v;
  };
  const lines: string[] = [];
  lines.push(columns.map((c) => csvEscape(c.header)).join(","));
  for (const row of rows) {
    lines.push(columns.map((c) => csvEscape(asString(row[c.key]))).join(","));
  }
  const blob = new Blob([lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  download(blob, `${safeName(meta.title)}_${stamp()}.csv`);
}

export function exportXlsx(
  columns: ColumnDef[],
  rows: Record<string, CellValue>[],
  meta: ReportMeta,
) {
  const headerRow = columns.map((c) => c.header);
  const dataRows = rows.map((r) => columns.map((c) => r[c.key] ?? ""));
  // Optional totals row
  const totalsRow: (string | number)[] = [];
  let hasTotals = false;
  for (const c of columns) {
    if (c.total === "sum") {
      hasTotals = true;
      const sum = rows.reduce((s, r) => {
        const v = r[c.key];
        return s + (typeof v === "number" ? v : Number(v) || 0);
      }, 0);
      totalsRow.push(sum);
    } else {
      totalsRow.push("");
    }
  }
  if (hasTotals) totalsRow[0] = totalsRow[0] || "Total";

  const sheet = XLSX.utils.aoa_to_sheet([
    [meta.title],
    ...(meta.captionLines?.map((l) => [l]) ?? []),
    [],
    headerRow,
    ...dataRows,
    ...(hasTotals ? [totalsRow] : []),
  ]);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Report");
  XLSX.writeFile(book, `${safeName(meta.title)}_${stamp()}.xlsx`);
}

export function exportPdf(
  columns: ColumnDef[],
  rows: Record<string, CellValue>[],
  meta: ReportMeta,
) {
  const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "landscape" });
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(meta.title, 40, 40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const captionY = 58;
  (meta.captionLines ?? []).forEach((line, i) => {
    doc.text(line, 40, captionY + i * 12);
  });
  const captionEnd = captionY + (meta.captionLines?.length ?? 0) * 12;
  autoTable(doc, {
    head: [columns.map((c) => c.header)],
    body: rows.map((r) => columns.map((c) => asString(r[c.key]))),
    startY: captionEnd + 10,
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [10, 60, 117], textColor: 255, fontStyle: "bold" },
    theme: "grid",
    columnStyles: columns.reduce<Record<number, { halign: "left" | "right" | "center" }>>(
      (acc, c, i) => {
        acc[i] = { halign: c.align ?? "left" };
        return acc;
      },
      {},
    ),
    foot: (() => {
      const totalsRow = columns.map((c) => {
        if (c.total === "sum") {
          const sum = rows.reduce((s, r) => {
            const v = r[c.key];
            return s + (typeof v === "number" ? v : Number(v) || 0);
          }, 0);
          return String(sum);
        }
        return "";
      });
      if (totalsRow.every((x) => x === "")) return undefined;
      totalsRow[0] = totalsRow[0] || "Total";
      return [totalsRow];
    })(),
    footStyles: { fillColor: [240, 240, 245], textColor: 20, fontStyle: "bold" },
  });
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(
      `Page ${i} of ${total}${meta.generatedAt ? ` · Generated ${meta.generatedAt}` : ""}`,
      doc.internal.pageSize.getWidth() - 40,
      doc.internal.pageSize.getHeight() - 20,
      { align: "right" },
    );
  }
  doc.save(`${safeName(meta.title)}_${stamp()}.pdf`);
}
