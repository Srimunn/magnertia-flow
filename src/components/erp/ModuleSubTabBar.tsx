import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

/* ===========================================================================
   ModuleSubTabBar — the shared secondary tab row that every Research &
   Innovation module renders beneath the area-level ResearchInnovationTabBar.
   Reuses the SAME TAB_BASE / TAB_ACTIVE classes as the area bar so alignment,
   spacing, active-indicator, and hover state stay identical between the two
   rows (they read as one hierarchy, not two mismatched strips).
   =========================================================================== */

const TAB_BASE =
  "shrink-0 whitespace-nowrap border-b-2 border-transparent bg-transparent px-3 pb-3 pt-1 text-[13px] font-semibold text-muted-foreground shadow-none transition-all hover:text-foreground focus-visible:outline-none";
const TAB_ACTIVE = "border-primary text-primary hover:text-primary font-bold";

export type ModuleSubTab = {
  to: string;
  label: string;
  /** Tooltip / a11y label — full name when the visible label is shortened. */
  tooltip?: string;
  /** How to decide whether this tab is active for the current pathname.
   *  Defaults to `startsWith(to)`. Pass "exact" for tabs whose route is a
   *  prefix of another tab's route (e.g. `/foo` vs `/foo/new`). */
  activeMatch?: "startsWith" | "exact" | ((pathname: string) => boolean);
};

export function ModuleSubTabBar({ tabs }: { tabs: ModuleSubTab[] }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex items-center gap-4 border-b border-border bg-white px-3 shadow-sm">
      {tabs.map((tab) => {
        const active =
          typeof tab.activeMatch === "function"
            ? tab.activeMatch(pathname)
            : tab.activeMatch === "exact"
              ? pathname === tab.to
              : pathname.startsWith(tab.to);
        return (
          <Link
            key={tab.to}
            to={tab.to}
            title={tab.tooltip ?? tab.label}
            aria-label={tab.tooltip ?? tab.label}
            className={cn(TAB_BASE, active && TAB_ACTIVE)}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
