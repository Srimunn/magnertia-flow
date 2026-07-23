import { useMemo, useState } from "react";
import { Check, Plus, Search, Star } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { listWidgetsForRole } from "../registry";
import { RoleSwitcher } from "./RoleSwitcher";
import type { WidgetCategory, WidgetDefinition, WidgetInstance, WidgetRole } from "../types";

/* ===========================================================================
   Widget Library — slides in from the right during Edit Mode
   =========================================================================== */

const CATEGORY_FILTERS: { value: WidgetCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "kpi", label: "KPIs" },
  { value: "finance", label: "Finance" },
  { value: "analytics", label: "Analytics" },
  { value: "ai", label: "AI" },
  { value: "reports", label: "Reports" },
  { value: "chart", label: "Charts" },
  { value: "table", label: "Tables" },
  { value: "operations", label: "Operations" },
  { value: "compliance", label: "Compliance" },
  { value: "banking", label: "Banking" },
  { value: "receivables", label: "Receivables" },
  { value: "payables", label: "Payables" },
  { value: "ledger", label: "Ledger" },
  { value: "assets", label: "Assets" },
];

function matchesCategory(def: WidgetDefinition, category: WidgetCategory | "all") {
  if (category === "all") return true;
  return def.category === category || def.tags?.includes(category);
}

function matchesSearch(def: WidgetDefinition, q: string) {
  if (!q) return true;
  const needle = q.toLowerCase();
  return (
    def.title.toLowerCase().includes(needle) ||
    def.description.toLowerCase().includes(needle) ||
    def.keywords.some((k) => k.includes(needle)) ||
    def.category.includes(needle)
  );
}

export type WidgetLibrarySheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: WidgetRole;
  /** Widgets currently on this page — drives the "Added" badge. */
  instances: WidgetInstance[];
  favorites: string[];
  recentlyUsed: string[];
  onAdd: (widgetId: string) => void;
  onToggleFavorite: (widgetId: string) => void;
  onRoleChange?: (role: WidgetRole) => void;
};

export function WidgetLibrarySheet({
  open,
  onOpenChange,
  role,
  instances,
  favorites,
  recentlyUsed,
  onAdd,
  onToggleFavorite,
  onRoleChange,
}: WidgetLibrarySheetProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<WidgetCategory | "all">("all");

  // Access control: the library only ever offers what this role may see.
  const available = useMemo(() => listWidgetsForRole(role), [role]);
  const placedIds = useMemo(() => new Set(instances.map((i) => i.widgetId)), [instances]);

  const filtered = useMemo(
    () => available.filter((d) => matchesCategory(d, category) && matchesSearch(d, query)),
    [available, category, query],
  );

  const sections = useMemo(() => {
    const favoriteDefs = filtered.filter((d) => favorites.includes(d.id));
    const recentDefs = recentlyUsed
      .map((id) => filtered.find((d) => d.id === id))
      .filter((d): d is WidgetDefinition => Boolean(d));
    return [
      { title: "Favorites", items: favoriteDefs },
      { title: "Recently Used", items: recentDefs },
      { title: "All Widgets", items: filtered },
    ].filter((s) => s.items.length > 0);
  }, [filtered, favorites, recentlyUsed]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border p-5 pb-4">
          <SheetTitle>Widget Library</SheetTitle>
          <SheetDescription>
            Add widgets to this page. The list is filtered to what this role may see.
          </SheetDescription>

          {onRoleChange && (
            <div className="mt-2">
              <RoleSwitcher role={role} onChange={onRoleChange} />
            </div>
          )}

          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search widgets…"
              className="w-full rounded-lg border border-border bg-card py-2 pl-8 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>

          <div className="-mx-1 mt-2 flex flex-wrap gap-1.5 px-1">
            {CATEGORY_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setCategory(f.value)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition-colors",
                  category === f.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:bg-muted/50",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-5 pt-4">
          {sections.length === 0 ? (
            <div className="grid place-items-center py-16 text-center">
              <p className="text-[13px] font-medium text-foreground">No widgets found</p>
              <p className="mt-1 text-[12px] text-muted-foreground">
                Try a different search term or category.
              </p>
            </div>
          ) : (
            sections.map((section) => (
              <section key={section.title} className="mb-5 last:mb-0">
                <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </h4>
                <ul className="space-y-1.5">
                  {section.items.map((def) => {
                    const added = placedIds.has(def.id);
                    const isFav = favorites.includes(def.id);
                    return (
                      <li
                        key={`${section.title}-${def.id}`}
                        className="flex items-center gap-3 rounded-lg border border-border p-2.5 transition-colors hover:bg-muted/30"
                      >
                        {/* Static icon preview — never a live chart, so opening
                            the library can't mount a dozen Recharts instances. */}
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                          <def.icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[13px] font-medium text-foreground">
                            {def.title}
                          </div>
                          <div className="truncate text-[11px] text-muted-foreground">
                            {def.description}
                          </div>
                        </div>
                        <button
                          type="button"
                          title={isFav ? "Remove favorite" : "Add favorite"}
                          onClick={() => onToggleFavorite(def.id)}
                          className={cn(
                            "shrink-0 rounded-md p-1.5 transition-colors",
                            isFav
                              ? "text-[oklch(0.45_0.15_75)]"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          <Star className={cn("h-3.5 w-3.5", isFav && "fill-current")} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onAdd(def.id)}
                          className={cn(
                            "inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[11.5px] font-semibold transition-colors",
                            added
                              ? "bg-success/10 text-success"
                              : "bg-primary text-primary-foreground hover:bg-primary/90",
                          )}
                        >
                          {added ? (
                            <>
                              <Check className="h-3 w-3" /> Added
                            </>
                          ) : (
                            <>
                              <Plus className="h-3 w-3" /> Add
                            </>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
