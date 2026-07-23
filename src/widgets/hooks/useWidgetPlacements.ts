import { useMemo } from "react";
import { PAGE_META, PLACEABLE_PAGES } from "../defaults";
import { effectiveInstances } from "./usePageWidgets";
import { useWidgetPreferences } from "./useWidgetPreferences";
import type { WidgetPageId } from "../types";

/* ===========================================================================
   Where does this widget currently live?
   ---------------------------------------------------------------------------
   Drives the settings dialog's "✓ Already Added" states. Crucially this reads
   EFFECTIVE layouts (saved ?? default), not just saved ones — otherwise
   "Total Revenue" would claim it isn't on the Dashboard, even though the
   default Dashboard shows it.
   =========================================================================== */

export type PlacementInfo = {
  pageId: WidgetPageId;
  label: string;
  /** Placement ids of this widget type on that page (>1 after Duplicate). */
  instanceIds: string[];
  present: boolean;
};

export function useWidgetPlacements(widgetId: string, originPageId?: WidgetPageId) {
  const { prefs } = useWidgetPreferences();

  const pages: WidgetPageId[] = useMemo(() => {
    const list = [...PLACEABLE_PAGES];
    // The page the user opened the dialog from is always offered, even if it
    // isn't one of the two standard destinations.
    if (originPageId && !list.includes(originPageId)) list.push(originPageId);
    return list;
  }, [originPageId]);

  const placements: PlacementInfo[] = useMemo(
    () =>
      pages.map((pageId) => {
        const instanceIds = effectiveInstances(prefs, pageId)
          .filter((i) => i.widgetId === widgetId)
          .map((i) => i.id);
        return {
          pageId,
          label: PAGE_META[pageId].label,
          instanceIds,
          present: instanceIds.length > 0,
        };
      }),
    [pages, prefs, widgetId],
  );

  const isFavorite = prefs.favorites.includes(widgetId);

  return { placements, isFavorite };
}
