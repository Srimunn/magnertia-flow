import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

const TAB_BASE =
  "shrink-0 whitespace-nowrap border-b-2 border-transparent bg-transparent px-3 pb-3 pt-1 text-[13px] font-semibold text-muted-foreground shadow-none transition-all hover:text-foreground focus-visible:outline-none";
const TAB_ACTIVE = "border-primary text-primary hover:text-primary font-bold";

const BASE = "/development/research-innovation/opportunity-discovery";

export function OpportunityTabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onForm = pathname.startsWith(`${BASE}/new`);

  const tabs = [
    { to: BASE, label: "Opportunity Register", active: !onForm },
    { to: `${BASE}/new`, label: "Opportunity Discovery Form", active: onForm },
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

/** Human label + tone for the workflow status enum. */
export const OPPORTUNITY_STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  under_review: "Under Review",
  revision_required: "Revision Required",
  approved: "Approved",
  on_hold: "On Hold",
  rejected: "Rejected",
  archived: "Archived",
};
