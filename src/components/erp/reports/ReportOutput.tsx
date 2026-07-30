import { useMemo, useState } from "react";
import { AlertTriangle, Download, FileSpreadsheet, FileText, Inbox, Link2Off } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ErpButton } from "@/components/erp/Button";
import type { ColumnDef, ReportPayload } from "./types";
import { exportCsv, exportPdf, exportXlsx, type ReportMeta } from "./exporters";

/* ===========================================================================
   ReportOutput — the shared preview + exports for a generated report.
   Renders a table when payload.status === "ok"; renders empty / not-connected
   / error states otherwise. Export bar (CSV / Excel / PDF) uses the shared
   exporter utilities so every report exports identically.
   =========================================================================== */

export function ReportOutput({
  title,
  captionLines,
  payload,
}: {
  title: string;
  captionLines: string[];
  payload: ReportPayload;
}) {
  const [exporting, setExporting] = useState<null | "csv" | "xlsx" | "pdf">(null);

  const meta: ReportMeta = useMemo(
    () => ({
      title,
      captionLines,
      generatedAt: new Date().toLocaleString("en-IN"),
    }),
    [title, captionLines],
  );

  const columns = payload.status === "ok" ? payload.columns : [];
  const rows = payload.status === "ok" ? payload.rows : [];
  const canExport = payload.status === "ok" && rows.length > 0;

  const doExport = async (fmt: "csv" | "xlsx" | "pdf") => {
    if (!canExport) return;
    setExporting(fmt);
    try {
      if (fmt === "csv") exportCsv(columns, rows, meta);
      else if (fmt === "xlsx") exportXlsx(columns, rows, meta);
      else exportPdf(columns, rows, meta);
      toast.success(`${fmt.toUpperCase()} export downloaded.`);
    } catch (err) {
      toast.error(`Export failed: ${(err as Error).message}`);
    } finally {
      setExporting(null);
    }
  };

  // Totals row when any column asked for it.
  const totalsRow = useMemo(() => {
    if (payload.status !== "ok") return null;
    const totals: Record<string, string | number> = {};
    let has = false;
    for (const c of columns) {
      if (c.total === "sum") {
        has = true;
        totals[c.key] = rows.reduce((s, r) => {
          const v = r[c.key];
          return s + (typeof v === "number" ? v : Number(v) || 0);
        }, 0);
      }
    }
    return has ? totals : null;
  }, [payload.status, columns, rows]);

  return (
    <section className="card-soft p-5">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-foreground">{title}</h3>
          {captionLines.length > 0 && (
            <p className="mt-0.5 text-xs text-muted-foreground">{captionLines.join(" · ")}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ErpButton
            variant="outline"
            size="sm"
            onClick={() => doExport("csv")}
            disabled={!canExport || exporting !== null}
            aria-label="Export CSV"
            title="Export CSV"
          >
            <Download className="h-3.5 w-3.5" /> CSV
          </ErpButton>
          <ErpButton
            variant="outline"
            size="sm"
            onClick={() => doExport("xlsx")}
            disabled={!canExport || exporting !== null}
            aria-label="Export Excel"
            title="Export Excel"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" /> Excel
          </ErpButton>
          <ErpButton
            variant="outline"
            size="sm"
            onClick={() => doExport("pdf")}
            disabled={!canExport || exporting !== null}
            aria-label="Export PDF"
            title="Export PDF"
          >
            <FileText className="h-3.5 w-3.5" /> PDF
          </ErpButton>
        </div>
      </div>

      {payload.status === "ok" && rows.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                {columns.map((c) => (
                  <th
                    key={c.key}
                    className={cn(
                      "py-2 pr-3 font-semibold",
                      c.align === "right" && "text-right",
                      c.align === "center" && "text-center",
                    )}
                  >
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-border/60">
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={cn(
                        "py-2 pr-3 text-xs text-foreground",
                        c.align === "right" && "text-right tabular",
                        c.align === "center" && "text-center",
                      )}
                    >
                      {r[c.key] as string | number}
                    </td>
                  ))}
                </tr>
              ))}
              {totalsRow && (
                <tr className="border-t-2 border-border/80 bg-muted/40">
                  {columns.map((c, i) => (
                    <td
                      key={c.key}
                      className={cn(
                        "py-2 pr-3 text-xs font-bold text-foreground",
                        c.align === "right" && "text-right tabular",
                        c.align === "center" && "text-center",
                      )}
                    >
                      {i === 0 && totalsRow[c.key] == null ? "Total" : (totalsRow[c.key] ?? "")}
                    </td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
          {payload.totalsCaption && (
            <p className="mt-2 text-[11px] text-muted-foreground">{payload.totalsCaption}</p>
          )}
        </div>
      ) : payload.status === "empty" || (payload.status === "ok" && payload.rows.length === 0) ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 py-10 text-center">
          <Inbox className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">No data for the selected criteria.</span>
          <span className="text-xs text-muted-foreground">Try widening the date range or clearing the filter.</span>
        </div>
      ) : payload.status === "not-connected" ? (
        <div className="flex items-start gap-3 rounded-lg border border-dashed border-border bg-muted/30 p-4">
          <Link2Off className="mt-0.5 h-4 w-4 text-muted-foreground" />
          <div>
            <div className="text-sm font-semibold text-foreground">Data source not yet connected</div>
            <p className="text-xs text-muted-foreground">{payload.message}</p>
          </div>
        </div>
      ) : payload.status === "error" ? (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive" />
          <div>
            <div className="text-sm font-semibold text-destructive">Report failed</div>
            <p className="text-xs text-muted-foreground">{payload.message}</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
