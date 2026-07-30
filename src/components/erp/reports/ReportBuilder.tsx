import { useMemo, useState } from "react";
import { FileText, Loader2, PlayCircle } from "lucide-react";
import { ErpButton } from "@/components/erp/Button";
import { cn } from "@/lib/utils";
import type { ReportConfig, ReportFilters, ReportPayload } from "./types";
import { ReportOutput } from "./ReportOutput";

/* ===========================================================================
   ReportBuilder — the shared form. Structure follows the GeM reference:
   Report Type (required, with inline validation), one secondary filter, a
   Date Range toggle revealing From/To, and a Generate action. Each area
   (Finance, R&I) supplies its own ReportConfig — the UI is identical.
   =========================================================================== */

const INPUT =
  "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/60 disabled:bg-muted/40 disabled:text-muted-foreground";

export function ReportBuilder({ config }: { config: ReportConfig }) {
  const [filters, setFilters] = useState<ReportFilters>({
    reportType: "",
    secondary: "",
    dateRangeEnabled: false,
    from: config.defaultRange.from,
    to: config.defaultRange.to,
  });
  const [showError, setShowError] = useState(false);
  const [payload, setPayload] = useState<ReportPayload | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedFor, setGeneratedFor] = useState<ReportFilters | null>(null);

  const selectedType = useMemo(
    () => config.reportTypes.find((t) => t.id === filters.reportType) ?? null,
    [config.reportTypes, filters.reportType],
  );

  const onGenerate = async () => {
    if (!filters.reportType) {
      setShowError(true);
      return;
    }
    setShowError(false);
    setGenerating(true);
    try {
      const result = await Promise.resolve(selectedType!.resolve(filters));
      setPayload(result);
      setGeneratedFor({ ...filters });
    } catch (err) {
      setPayload({ status: "error", message: (err as Error).message });
    } finally {
      setGenerating(false);
    }
  };

  const captionLines = useMemo(() => {
    if (!generatedFor || !selectedType) return [];
    const lines = [selectedType.label];
    if (generatedFor.secondary) {
      const opt = config.secondaryFilter.options.find((o) => o.value === generatedFor.secondary);
      lines.push(`${config.secondaryFilter.label}: ${opt?.label ?? generatedFor.secondary}`);
    }
    if (generatedFor.dateRangeEnabled) {
      lines.push(`Date range: ${generatedFor.from} → ${generatedFor.to}`);
    }
    return lines;
  }, [generatedFor, selectedType, config.secondaryFilter]);

  return (
    <div className="space-y-4">
      <section className="card-soft p-5">
        <div className="mb-4 flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">{config.areaLabel} Report Builder</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-start">
          {/* Report Type — required */}
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-foreground">
              Report Type <span className="text-destructive">*</span>
            </span>
            <select
              className={cn(INPUT, showError && !filters.reportType && "border-destructive")}
              value={filters.reportType}
              onChange={(e) => setFilters((f) => ({ ...f, reportType: e.target.value }))}
              aria-invalid={showError && !filters.reportType}
              aria-describedby={showError && !filters.reportType ? "report-type-error" : undefined}
            >
              <option value="">Select…</option>
              {config.reportTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
            {showError && !filters.reportType ? (
              <span id="report-type-error" className="text-xs font-semibold text-destructive">
                Please select a Report Type.
              </span>
            ) : selectedType?.description ? (
              <span className="text-[11px] text-muted-foreground">{selectedType.description}</span>
            ) : null}
          </label>

          {/* Secondary filter */}
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-foreground">
              {config.secondaryFilter.label}
              {config.secondaryFilter.required && <span className="text-destructive"> *</span>}
            </span>
            <select
              className={INPUT}
              value={filters.secondary}
              onChange={(e) => setFilters((f) => ({ ...f, secondary: e.target.value }))}
            >
              <option value="">All</option>
              {config.secondaryFilter.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex md:pt-6">
            <ErpButton onClick={onGenerate} disabled={generating}>
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PlayCircle className="h-4 w-4" />
              )}
              Generate
            </ErpButton>
          </div>

          {/* Date Range toggle spans the full width */}
          <div className="md:col-span-3 space-y-2 border-t border-border pt-4">
            <label className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <input
                type="checkbox"
                className="h-3.5 w-3.5 accent-primary"
                checked={filters.dateRangeEnabled}
                onChange={(e) => setFilters((f) => ({ ...f, dateRangeEnabled: e.target.checked }))}
              />
              Filter by Date Range
            </label>
            {filters.dateRangeEnabled && (
              <div className="grid gap-3 sm:grid-cols-2 md:max-w-md">
                <label className="block space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground">From</span>
                  <input
                    type="date"
                    className={INPUT}
                    value={filters.from}
                    onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground">To</span>
                  <input
                    type="date"
                    className={INPUT}
                    value={filters.to}
                    onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      </section>

      {payload && selectedType && generatedFor && (
        <ReportOutput
          title={selectedType.label}
          captionLines={captionLines}
          payload={payload}
        />
      )}
    </div>
  );
}
