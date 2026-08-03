import type { WidgetDefinition, WidgetRole } from "./types";
import { DASHBOARD_WIDGETS } from "./content/dashboard";
import { OVERVIEW_WIDGETS } from "./content/overview";
import { FINANCE_KPI_WIDGETS } from "./content/finance/kpis";
import { RI_KPI_WIDGETS } from "./content/ri/kpis";
import { pdWidgets } from "./content/pd/pdWidgets";
import { mdWidgets } from "./content/md/mdWidgets";

/* ===========================================================================
   Widget registry
   ---------------------------------------------------------------------------
   The single source of truth for "what widgets exist". A module contributes by
   exporting a WidgetDefinition[] and adding it to the spread below — nothing
   else in the system needs to change. That's what makes future modules
   (Inventory, HR, Fleet, Charging Stations, ...) additive rather than
   architectural work.
   =========================================================================== */

const ALL_DEFINITIONS: WidgetDefinition[] = [
  ...DASHBOARD_WIDGETS,
  ...OVERVIEW_WIDGETS,
  ...FINANCE_KPI_WIDGETS,
  ...RI_KPI_WIDGETS,
  ...pdWidgets,
  ...mdWidgets,
  // Future modules append here: ...INVENTORY_WIDGETS, ...FLEET_WIDGETS, ...
];

export const WIDGET_REGISTRY: Record<string, WidgetDefinition> = Object.fromEntries(
  ALL_DEFINITIONS.map((def) => [def.id, def]),
);

export const WIDGET_LIST: WidgetDefinition[] = ALL_DEFINITIONS;

export function getWidgetDef(widgetId: string): WidgetDefinition | undefined {
  return WIDGET_REGISTRY[widgetId];
}

/** Access control: does this role have permission to see this widget? */
export function roleAllows(def: WidgetDefinition, role: WidgetRole): boolean {
  return def.roles === "all" || def.roles.includes(role);
}

/** Every widget the given role may use — the Widget Library's source list.
 *  `libraryHidden` widgets (e.g. each finance page's individual KPIs) are still
 *  placeable via card quick-add, they just don't clutter the library. */
export function listWidgetsForRole(role: WidgetRole): WidgetDefinition[] {
  return ALL_DEFINITIONS.filter((def) => !def.libraryHidden && roleAllows(def, role));
}
