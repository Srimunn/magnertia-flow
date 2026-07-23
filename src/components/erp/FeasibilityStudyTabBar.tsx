import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import type { FeasibilityStatus } from "@/services/types";

const TAB_BASE =
  "shrink-0 whitespace-nowrap border-b-2 border-transparent bg-transparent px-3 pb-3 pt-1 text-[13px] font-semibold text-muted-foreground shadow-none transition-all hover:text-foreground focus-visible:outline-none";
const TAB_ACTIVE = "border-primary text-primary hover:text-primary font-bold";

/** The module-level page tab bar (Register vs. Form). */
export function FeasibilityStudyPageTabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const base = "/development/research-innovation/feasibility-study";
  const onForm = pathname.startsWith(`${base}/new`);
  const tabs = [
    { to: base, label: "Feasibility Register", active: !onForm },
    { to: `${base}/new`, label: "Feasibility Study Form", active: onForm },
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

export const FEASIBILITY_STATUS_LABEL: Record<FeasibilityStatus, string> = {
  draft: "Draft",
  technical_feasibility: "Technical Feasibility",
  market_feasibility: "Market Feasibility",
  financial_feasibility: "Financial Feasibility",
  operational_feasibility: "Operational Feasibility",
  compliance_risk: "Compliance & Risk",
  under_review: "Under Review",
  approved: "Approved",
  conditional_approval: "Conditional Approval",
  revision_required: "Revision Required",
  rejected: "Rejected",
  archived: "Archived",
};
