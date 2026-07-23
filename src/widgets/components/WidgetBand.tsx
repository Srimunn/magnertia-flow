import { useCallback, useState } from "react";
import { LayoutGrid, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePageWidgets } from "../hooks/usePageWidgets";
import type { WidgetPageId } from "../types";
import { WidgetPage } from "./WidgetPage";
import { KpiQuickAddLayer } from "./KpiQuickAddLayer";
import { WidgetSettingsDialog, type WidgetDialogTarget } from "./WidgetSettingsDialog";

/* ===========================================================================
   WidgetBand — the additive widget slot for existing finance pages
   ---------------------------------------------------------------------------
   These 11 pages keep every one of their own KPI rows, tabs, tables, charts,
   dialogs and mutations. The band is inserted between the KPI row and the main
   grid and, by default, is EMPTY — so each page renders exactly as it did
   before, apart from one slim "Add widgets" affordance.

   Only once the user places a widget does the band take up space. That's what
   makes rolling this out across 11 pages a 2-line diff each instead of 11
   rewrites.

   The band also hosts the KpiQuickAddLayer: it makes the page's OWN KPI cards
   clickable, opening the settings dialog so any native metric can be dropped
   onto the Dashboard or Overview. That layer + its dialog render regardless of
   whether the band itself holds any widgets.
   =========================================================================== */

export type WidgetBandProps = {
  pageId: WidgetPageId;
  className?: string;
};

export function WidgetBand({ pageId, className }: WidgetBandProps) {
  const { visibleInstances, isLoading } = usePageWidgets(pageId);
  const [activated, setActivated] = useState(false);
  const [quickAdd, setQuickAdd] = useState<WidgetDialogTarget | null>(null);

  const openQuickAdd = useCallback(
    (widgetId: string) => setQuickAdd({ widgetId, originPageId: pageId }),
    [pageId],
  );

  // Nothing placed and not being edited: render only the entry point.
  const isEmpty = visibleInstances.length === 0;

  if (isLoading) return null;

  // The quick-add layer + its dialog are always present, whatever the band shows.
  const quickAddParts = (
    <>
      <KpiQuickAddLayer pageId={pageId} onOpen={openQuickAdd} />
      <WidgetSettingsDialog target={quickAdd} onClose={() => setQuickAdd(null)} />
    </>
  );

  if (isEmpty && !activated) {
    return (
      <>
        <div className={cn("mb-4 flex justify-end", className)}>
          <button
            type="button"
            onClick={() => setActivated(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Add widgets
            <Plus className="h-3 w-3" />
          </button>
        </div>
        {quickAddParts}
      </>
    );
  }

  return (
    <>
      <WidgetPage
        pageId={pageId}
        className={cn("mb-5", className)}
        emptyState={
          <div className="grid place-items-center rounded-xl border border-dashed border-border py-8 text-center">
            <p className="text-[13px] font-medium text-foreground">No widgets on this page yet</p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Open the Widget Library to add KPIs, charts and tables here.
            </p>
          </div>
        }
      />
      {quickAddParts}
    </>
  );
}
