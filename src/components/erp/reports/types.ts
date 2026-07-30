/* ===========================================================================
   Report system — types shared by ReportBuilder + ReportOutput + per-area configs.
   Finance and R&I each supply a ReportConfig; the components are shared, so
   adding a new report type is a config change, not new UI.
   =========================================================================== */

/** One rendered value in a report row cell. Kept string|number so exports work
 *  uniformly across CSV / Excel / PDF. */
export type CellValue = string | number;

export type ColumnDef = {
  key: string;
  header: string;
  /** Column alignment — used by PDF/HTML rendering. Defaults to "left". */
  align?: "left" | "right" | "center";
  /** Optional totals row aggregator: "sum" adds all numeric values. */
  total?: "sum";
};

export type ReportPayload =
  | { status: "ok"; columns: ColumnDef[]; rows: Record<string, CellValue>[]; totalsCaption?: string }
  | { status: "empty" }
  | { status: "not-connected"; message: string }
  | { status: "error"; message: string };

/** How the builder resolves a Report Type: takes the current form filters and
 *  returns a payload — can be sync (pull from cache) or async (network). */
export type ReportResolver = (filters: ReportFilters) => Promise<ReportPayload> | ReportPayload;

export type ReportTypeDef = {
  id: string;
  label: string;
  /** Short description shown as a hint under the selector. */
  description?: string;
  /** Column set + fetch/shape. */
  resolve: ReportResolver;
};

export type SecondaryFilter = {
  /** Field name in ReportFilters.secondary. */
  key: string;
  label: string;
  /** "all" option added implicitly at the top. */
  options: { value: string; label: string }[];
  required?: boolean;
};

export type ReportFilters = {
  reportType: string;
  /** Free-form because the secondary filter differs per area. */
  secondary: string;
  dateRangeEnabled: boolean;
  from: string; // YYYY-MM-DD
  to: string;
};

export type ReportConfig = {
  /** Displayed above the builder. */
  areaLabel: string;
  reportTypes: ReportTypeDef[];
  secondaryFilter: SecondaryFilter;
  /** Default date range window when the toggle is enabled. */
  defaultRange: { from: string; to: string };
};
