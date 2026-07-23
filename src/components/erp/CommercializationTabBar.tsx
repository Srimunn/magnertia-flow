import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import type { CommercializationStatus } from "@/services/types";

const TAB_BASE =
  "shrink-0 whitespace-nowrap border-b-2 border-transparent bg-transparent px-3 pb-3 pt-1 text-[13px] font-semibold text-muted-foreground shadow-none transition-all hover:text-foreground focus-visible:outline-none";
const TAB_ACTIVE = "border-primary text-primary hover:text-primary font-bold";

/** The module-level page tab bar (Register vs. Planning Form). */
export function CommercializationPageTabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const base = "/development/research-innovation/commercialization-planning";
  const onForm = pathname.startsWith(`${base}/new`);
  const tabs = [
    { to: base, label: "Commercialization Register", active: !onForm },
    { to: `${base}/new`, label: "Commercialization Planning Form", active: onForm },
  ];
  return (
    <div className="flex items-center gap-4 border-b border-border bg-white px-3 shadow-sm">
      {tabs.map((tab) => (
        <Link key={tab.to} to={tab.to} className={cn(TAB_BASE, tab.active && TAB_ACTIVE)}>
          {tab.label}
        </Link>
      ))}
    </div>
  );
}

export const COMMERCIALIZATION_STATUS_LABEL: Record<CommercializationStatus, string> = {
  draft: "Draft",
  product_readiness: "Product Readiness",
  manufacturing_supply_chain: "Manufacturing & Supply Chain",
  sales_marketing_planning: "Sales & Marketing Planning",
  executive_review: "Under Review",
  approved: "Approved",
  approved_with_conditions: "Approved with Conditions",
  revision_required: "Revision Required",
  rejected: "Rejected",
  archived: "Archived",
};
