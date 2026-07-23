import { z } from "zod";
import type { DashboardTemplate, WidgetInstance, WidgetPageId, WidgetRole } from "./types";
import { getWidgetDef } from "./registry";

/* ===========================================================================
   Dashboard templates
   ---------------------------------------------------------------------------
   Built-ins live in code (they can't be edited or deleted); user templates are
   stored on the preferences document. Applying a template overlays its pages
   onto the saved layout, so a template for the Dashboard leaves every other
   page untouched.
   =========================================================================== */

const base = { theme: "default", pinned: false } as const;

/** Small helper so template definitions stay readable. */
function w(widgetId: string, size: WidgetInstance["size"], idx: number): WidgetInstance {
  return { ...base, id: `tpl-${idx}-${widgetId}`, widgetId, size };
}

function makeTemplate(
  id: string,
  name: string,
  description: string,
  role: WidgetRole,
  dashboard: Array<[string, WidgetInstance["size"]]>,
): DashboardTemplate {
  return {
    id,
    name,
    description,
    role,
    builtIn: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    pages: {
      dashboard: { instances: dashboard.map(([wid, size], i) => w(wid, size, i)) },
    },
  };
}

export const BUILT_IN_TEMPLATES: DashboardTemplate[] = [
  makeTemplate(
    "tpl.ceo",
    "CEO Dashboard",
    "Company-wide performance at a glance: revenue, profit, cash and AI intelligence.",
    "CEO",
    [
      ["kpi.total-revenue", "sm"],
      ["kpi.net-profit", "sm"],
      ["kpi.total-expenses", "sm"],
      ["kpi.cash-balance", "sm"],
      ["kpi.current-ratio", "sm"],
      ["chart.revenue-expense-trend", "lg"],
      ["chart.expense-donut", "md"],
      ["ai.financial-intelligence", "full"],
      ["insight.quick-financial", "full"],
    ],
  ),
  makeTemplate(
    "tpl.finance",
    "Finance Dashboard",
    "Working capital focus: payables, receivables, cash flow and bank balances.",
    "Finance",
    [
      ["kpi.total-payables", "sm"],
      ["kpi.total-receivables", "sm"],
      ["kpi.total-cash-balance", "sm"],
      ["kpi.net-profit", "sm"],
      ["kpi.budget-utilization", "sm"],
      ["chart.aging-receivable", "md"],
      ["chart.aging-payable", "md"],
      ["list.cash-flow-summary", "md"],
      ["list.bank-balances", "lg"],
      ["chart.overview-trend", "xl"],
    ],
  ),
  makeTemplate(
    "tpl.accountant",
    "Accountant Dashboard",
    "Day-to-day ledger work: journals, trial balance and outstanding invoices.",
    "Accountant",
    [
      ["kpi.total-accounts", "sm"],
      ["kpi.posted-journals", "sm"],
      ["kpi.trial-balance-diff", "sm"],
      ["kpi.ap-overdue", "sm"],
      ["kpi.ar-overdue", "sm"],
      ["table.operations-ledger", "xl"],
      ["insight.system-alerts", "md"],
      ["table.recent-transactions", "lg"],
    ],
  ),
  makeTemplate(
    "tpl.auditor",
    "Auditor Dashboard",
    "Compliance view: audit activity, trial balance integrity and tax position.",
    "Auditor",
    [
      ["kpi.audit-activities", "sm"],
      ["kpi.audit-unique-users", "sm"],
      ["kpi.trial-balance-diff", "sm"],
      ["kpi.tax-liability", "sm"],
      ["kpi.tax-paid", "sm"],
      ["insight.system-alerts", "md"],
      ["table.operations-ledger", "xl"],
      ["ai.financial-intelligence", "full"],
    ],
  ),
  makeTemplate(
    "tpl.operations",
    "Operations Dashboard",
    "Operational spend: budget utilization, cost centers and asset register.",
    "Operations",
    [
      ["kpi.total-budget", "sm"],
      ["kpi.budget-utilization", "sm"],
      ["kpi.total-assets", "sm"],
      ["kpi.gross-book-value", "sm"],
      ["kpi.operating-cash", "sm"],
      ["chart.expense-donut", "md"],
      ["chart.revenue-expense-trend", "lg"],
      ["list.bank-balances", "md"],
    ],
  ),
];

/** Fresh placement ids so an applied template never collides with defaults. */
function reid(instances: WidgetInstance[]): WidgetInstance[] {
  return instances.map((i) => ({
    ...i,
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `w-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  }));
}

/**
 * Materialize a template into a `pages` patch.
 * Unknown widget ids are dropped — an imported template from a build with extra
 * widgets should degrade gracefully rather than render blanks.
 */
export function templateToPages(
  template: DashboardTemplate,
  currentPages: Partial<Record<WidgetPageId, { instances: WidgetInstance[]; updatedAt: string }>>,
) {
  const pages = { ...currentPages };
  const now = new Date().toISOString();
  for (const [pageId, layout] of Object.entries(template.pages) as Array<
    [WidgetPageId, { instances: WidgetInstance[] }]
  >) {
    const known = layout.instances.filter((i) => getWidgetDef(i.widgetId));
    pages[pageId] = { instances: reid(known), updatedAt: now };
  }
  return pages;
}

/* ---------------------------------------------------------------------------
   Import / export
   --------------------------------------------------------------------------- */

const EXPORT_KIND = "magnertia-widget-template";
const EXPORT_VERSION = 1;

/**
 * Optional fields are `nullish`, not `optional`.
 *
 * The MongoDB driver serializes `undefined` as `null`, so a layout saved with
 * `spanOverride: undefined` reads back as `spanOverride: null`. An `.optional()`
 * schema rejects null — which would make every template exported from a saved
 * layout fail to import. Accept both, then normalize null away on parse.
 */
const nullableSpan = z
  .object({
    md: z.number().nullish(),
    lg: z.number().nullish(),
    xl: z.number().nullish(),
  })
  .nullish();

const instanceSchema = z.object({
  id: z.string(),
  widgetId: z.string(),
  size: z.enum(["sm", "md", "lg", "xl", "full", "auto"]),
  theme: z.enum(["default", "blue", "green", "purple"]),
  pinned: z.boolean(),
  customTitle: z.string().nullish(),
  hidden: z.boolean().nullish(),
  spanOverride: nullableSpan,
});

const templateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  role: z.enum(["CEO", "Finance", "Accountant", "Auditor", "Operations"]).nullish(),
  builtIn: z.boolean().nullish(),
  pages: z.record(z.string(), z.object({ instances: z.array(instanceSchema) })),
  createdAt: z.string(),
});

/** Strip nulls so the parsed template matches the in-app types exactly. */
function normalizeInstance(i: z.infer<typeof instanceSchema>): WidgetInstance {
  const span = i.spanOverride
    ? {
        ...(i.spanOverride.md != null ? { md: i.spanOverride.md } : {}),
        ...(i.spanOverride.lg != null ? { lg: i.spanOverride.lg } : {}),
        ...(i.spanOverride.xl != null ? { xl: i.spanOverride.xl } : {}),
      }
    : undefined;
  return {
    id: i.id,
    widgetId: i.widgetId,
    size: i.size,
    theme: i.theme,
    pinned: i.pinned,
    ...(i.customTitle ? { customTitle: i.customTitle } : {}),
    ...(i.hidden ? { hidden: i.hidden } : {}),
    ...(span && Object.keys(span).length > 0 ? { spanOverride: span } : {}),
  };
}

const fileSchema = z.object({
  kind: z.literal(EXPORT_KIND),
  version: z.literal(EXPORT_VERSION),
  template: templateSchema,
});

export function exportTemplateFile(template: DashboardTemplate) {
  const payload = { kind: EXPORT_KIND, version: EXPORT_VERSION, template };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `magnertia-template-${template.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Parse an imported file. Returns null (never throws) if it isn't valid. */
export function parseTemplateFile(json: unknown): DashboardTemplate | null {
  const parsed = fileSchema.safeParse(json);
  if (!parsed.success) return null;
  const t = parsed.data.template;
  const pages = Object.fromEntries(
    Object.entries(t.pages).map(([pageId, layout]) => [
      pageId,
      { instances: layout.instances.map(normalizeInstance) },
    ]),
  ) as DashboardTemplate["pages"];

  return {
    id: `tpl.user.${Date.now()}`, // always user-owned; never overwrites a built-in
    name: t.name,
    ...(t.description ? { description: t.description } : {}),
    ...(t.role ? { role: t.role } : {}),
    builtIn: false,
    createdAt: new Date().toISOString(),
    pages,
  };
}

/** Snapshot the current layouts as a new user template. */
export function snapshotTemplate(
  name: string,
  pages: Partial<Record<WidgetPageId, { instances: WidgetInstance[] }>>,
): DashboardTemplate {
  return {
    id: `tpl.user.${Date.now()}`,
    name,
    description: "Saved from your current layout.",
    builtIn: false,
    createdAt: new Date().toISOString(),
    pages: Object.fromEntries(
      Object.entries(pages).map(([k, v]) => [
        k,
        { instances: v!.instances.map((i) => ({ ...i })) },
      ]),
    ) as DashboardTemplate["pages"],
  };
}
