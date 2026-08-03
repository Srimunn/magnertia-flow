import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";

/* ===========================================================================
   Widget Management System — domain types
   ---------------------------------------------------------------------------
   This file is intentionally dependency-free (types + one icon import) so any
   module — Finance today, Inventory/HR/Fleet/Charging later — can register
   widgets without pulling in Finance code.
   =========================================================================== */

/** User-facing size presets. Mapped to grid spans in `grid.ts`. */
export type WidgetSize = "sm" | "md" | "lg" | "xl" | "full" | "auto";

/** Accent themes from the spec. Backed by --widget-accent-* tokens. */
export type WidgetTheme = "default" | "blue" | "green" | "purple";

/**
 * Library grouping. `category` drives the Widget Library's filter pills, so it
 * mixes shape ("chart", "table") and domain ("banking", "ledger") the way the
 * spec's filter list does.
 */
export type WidgetCategory =
  | "kpi"
  | "chart"
  | "table"
  | "list"
  | "insight"
  | "ai"
  | "finance"
  | "analytics"
  | "reports"
  | "operations"
  | "compliance"
  | "banking"
  | "receivables"
  | "payables"
  | "ledger"
  | "assets"
  | "innovation";

/**
 * Simulated roles for access control. There is no auth system yet — identity is
 * a hardcoded user — so the active role lives on the preferences document and is
 * switched via the RoleSwitcher. When real auth lands, only the source of
 * `role` changes; every consumer keeps working.
 */
export type WidgetRole = "CEO" | "Finance" | "Accountant" | "Auditor" | "Operations";

/** Every surface that can host widgets. Extend here when new modules opt in. */
export type WidgetPageId =
  | "dashboard"
  | "finance-overview"
  | "finance-payables"
  | "finance-receivables"
  | "finance-cash-bank"
  | "finance-budgeting"
  | "finance-cost-centers"
  | "finance-consolidation"
  | "finance-profitability"
  | "finance-tax"
  | "finance-reports"
  | "finance-assets"
  | "finance-audit"
  // Research & Innovation module dashboards (see src/widgets/content/ri/kpis.tsx).
  | "ri-overview"
  | "ri-ideas"
  | "ri-opportunities"
  | "ri-design"
  | "ri-validation"
  | "ri-portfolio"
  | "ri-scouting"
  | "ri-research"
  | "ri-feasibility"
  | "ri-poc"
  | "ri-prototype"
  | "ri-experiments"
  | "ri-trl"
  | "ri-commercialization"
  | "ri-innovation"
  | "ri-patents"
  // Product Development & Manufacturing Development Overviews
  | "pd-overview"
  | "md-overview";

/** Grid spans per breakpoint tier, expressed in that tier's column count. */
export type WidgetSpan = {
  /** Tablet/laptop tier (>=768px), out of 6 columns. */
  md?: number;
  /** Laptop tier (>=1024px), out of 6 columns. */
  lg?: number;
  /** Desktop tier (>=1280px), out of 60 columns. */
  xl?: number;
};

/**
 * One placed widget on one page. `id` is the placement key (a widget can appear
 * more than once via Duplicate, so `widgetId` is NOT unique per page).
 */
export type WidgetInstance = {
  /** Placement key. Stable literal in default layouts; UUID when user-added. */
  id: string;
  /** Registry key, e.g. "kpi.total-revenue". */
  widgetId: string;
  size: WidgetSize;
  theme: WidgetTheme;
  pinned: boolean;
  /** Set by the context-menu Rename action; falls back to the definition title. */
  customTitle?: string;
  /** Hidden but retained — lets visibility toggle without losing settings. */
  hidden?: boolean;
  /**
   * Escape hatch for spans the size presets can't express (e.g. the Dashboard's
   * quarter-width cards at 15/60). Authored only in default layouts to guarantee
   * pixel parity with the pre-widget pages; cleared the moment a user resizes.
   */
  spanOverride?: WidgetSpan;
};

/** A page's saved layout. Absence of a page key means "use the default layout". */
export type PageLayout = {
  instances: WidgetInstance[];
  updatedAt: string;
};

export type DashboardTemplate = {
  id: string;
  name: string;
  description?: string;
  /** Which role this template is designed for (drives the built-in set). */
  role?: WidgetRole;
  /** Built-ins live in code and cannot be deleted/edited. */
  builtIn?: boolean;
  pages: Partial<Record<WidgetPageId, { instances: WidgetInstance[] }>>;
  createdAt: string;
};

/**
 * The persisted document — one per user, collection `widget_preferences`.
 * Mirrors the spec's UserDashboardPreferences: positions/sizes/visibility/order
 * all live inside `pages[].instances` (array order IS widget order).
 */
export type WidgetPreferencesDoc = {
  /** `widget_preferences::<userId>` — singleton per user. */
  _id: string;
  userId: string;
  role: WidgetRole;
  /**
   * Only customized pages appear here. A missing key falls back to
   * DEFAULT_LAYOUTS, which is what makes the upgrade backward compatible and
   * what "Restore Default" restores to (by deleting the key).
   */
  pages: Partial<Record<WidgetPageId, PageLayout>>;
  /** Favorited widgetIds (not placements). */
  favorites: string[];
  /** MRU widgetIds for the library's "Recently Used" section. */
  recentlyUsed: string[];
  /** User-saved templates; built-ins are code-defined and not stored here. */
  templates: DashboardTemplate[];
  activeTemplateId?: string;
  updatedAt: string;
};

/** The writable slice of the preferences doc. */
export type WidgetPreferencesPatch = Partial<
  Pick<
    WidgetPreferencesDoc,
    "pages" | "favorites" | "recentlyUsed" | "role" | "templates" | "activeTemplateId"
  >
>;

/** Props every widget content component receives. */
export type WidgetContentProps = {
  instance: WidgetInstance;
  size: WidgetSize;
  theme: WidgetTheme;
  /**
   * True in the settings-dialog preview and library cards: render at a fixed
   * size and skip interactions. Charts must not use ResponsiveContainer-driven
   * measurement loops in this mode.
   */
  isPreview?: boolean;
};

/** The registry entry — everything the system knows about a widget type. */
export type WidgetDefinition = {
  id: string;
  title: string;
  description: string;
  category: WidgetCategory;
  /** Secondary categories, so one widget can match several library filters. */
  tags?: WidgetCategory[];
  icon: LucideIcon;
  /** Extra search terms beyond title/description. */
  keywords: string[];
  defaultSize: WidgetSize;
  allowedSizes: WidgetSize[];
  /** "all" = visible to every role. */
  roles: WidgetRole[] | "all";
  /** Context-menu "Open" target. */
  sourceRoute?: string;
  /** Canonical TanStack Query key — powers context-menu Refresh and Export. */
  dataKey?: readonly unknown[];
  /**
   * Hide from the Widget Library browser. The widget is still fully placeable
   * (via a finance page's KPI-card quick-add) and renderable — this just keeps
   * the library curated instead of listing every page's ~5 KPIs.
   */
  libraryHidden?: boolean;
  component: ComponentType<WidgetContentProps>;
};

/** Where a widget currently lives — drives the settings dialog's checkboxes. */
export type WidgetPlacement = {
  pageId: WidgetPageId;
  instanceIds: string[];
};
