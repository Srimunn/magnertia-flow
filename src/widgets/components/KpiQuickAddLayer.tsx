import { useEffect } from "react";
import { FINANCE_PAGE_KPIS } from "../content/finance/financeKpiMap";
import type { WidgetPageId } from "../types";

/* ===========================================================================
   KpiQuickAddLayer — makes a finance page's OWN KPI cards clickable
   ---------------------------------------------------------------------------
   The 11 finance pages render their KPIs as plain <StatCard>s, not widgets, and
   we don't want to rewrite those pages. So this layer bridges them into the
   widget system by delegation:

     - it finds the page's KPI cards by matching each card's StatCard label
       (StatCard puts the label in a `title` attribute) against FINANCE_PAGE_KPIS
     - matched cards get a `data-kpi-quickadd` attribute (for the hover/cursor
       affordance in styles.css)
     - clicking one opens the widget settings dialog for the matching widget, so
       the user can drop that metric onto the Dashboard or Overview

   It renders nothing; it only wires behaviour onto existing DOM. Non-KPI cards
   (charts, tables) never match a label, so they're ignored, and widget cells
   (`[data-instance-id]`) are skipped so their own click handler still wins.
   =========================================================================== */

export type KpiQuickAddLayerProps = {
  pageId: WidgetPageId;
  onOpen: (widgetId: string) => void;
};

/** Find the widgetId for a card by matching any of its `title`s to the map. */
function matchWidgetId(card: Element, map: Record<string, string>): string | undefined {
  for (const el of card.querySelectorAll("[title]")) {
    const title = (el.getAttribute("title") ?? "").trim();
    if (map[title]) return map[title];
  }
  return undefined;
}

export function KpiQuickAddLayer({ pageId, onOpen }: KpiQuickAddLayerProps) {
  useEffect(() => {
    const map = FINANCE_PAGE_KPIS[pageId];
    if (!map) return;
    const root = document.querySelector("main");
    if (!root) return;

    const tag = () => {
      root.querySelectorAll(".card-soft").forEach((card) => {
        if (card.hasAttribute("data-kpi-quickadd")) return;
        if (card.closest("[data-instance-id]")) return; // a placed widget — skip
        if (matchWidgetId(card, map)) card.setAttribute("data-kpi-quickadd", "");
      });
    };

    tag();
    // KPI cards mount after their data loads; re-tag as the DOM settles, then
    // stop observing so chart animations don't keep the observer busy.
    const observer = new MutationObserver(tag);
    observer.observe(root, { childList: true, subtree: true });
    const stop = window.setTimeout(() => observer.disconnect(), 5000);

    return () => {
      observer.disconnect();
      window.clearTimeout(stop);
      root
        .querySelectorAll("[data-kpi-quickadd]")
        .forEach((el) => el.removeAttribute("data-kpi-quickadd"));
    };
  }, [pageId, onOpen]);

  return null;
}
