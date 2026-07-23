import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import type { TrlStatus } from "@/services/types";

const TAB_BASE =
  "shrink-0 whitespace-nowrap border-b-2 border-transparent bg-transparent px-3 pb-3 pt-1 text-[13px] font-semibold text-muted-foreground shadow-none transition-all hover:text-foreground focus-visible:outline-none";
const TAB_ACTIVE = "border-primary text-primary hover:text-primary font-bold";

/** The module-level page tab bar (TRL Register vs. TRL Form). */
export function TrlAssessmentPageTabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const base = "/development/research-innovation/trl-assessment";
  const onForm = pathname.startsWith(`${base}/new`);
  const tabs = [
    { to: base, label: "TRL Assessment Register", active: !onForm },
    { to: `${base}/new`, label: "TRL Assessment Form", active: onForm },
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

export const TRL_STATUS_LABEL: Record<TrlStatus, string> = {
  draft: "Draft",
  technology_assessment: "Technology Assessment",
  technical_validation: "Technical Validation",
  demonstration_review: "Demonstration Review",
  risk_commercial_assessment: "Risk & Commercial Assessment",
  executive_review: "Under Review",
  approved: "Approved",
  approved_with_improvements: "Approved with Improvements",
  revision_required: "Revision Required",
  rejected: "Rejected",
  archived: "Archived",
};
