import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import type { ExperimentStatus } from "@/services/types";

const TAB_BASE =
  "shrink-0 whitespace-nowrap border-b-2 border-transparent bg-transparent px-3 pb-3 pt-1 text-[13px] font-semibold text-muted-foreground shadow-none transition-all hover:text-foreground focus-visible:outline-none";
const TAB_ACTIVE = "border-primary text-primary hover:text-primary font-bold";

/** The module-level page tab bar (Register vs. Form). */
export function ExperimentMgmtPageTabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const base = "/development/research-innovation/experiment-management";
  const onForm = pathname.startsWith(`${base}/new`);
  const tabs = [
    { to: base, label: "Experiment Register", active: !onForm },
    { to: `${base}/new`, label: "Experiment Management Form", active: onForm },
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

export const EXPERIMENT_STATUS_LABEL: Record<ExperimentStatus, string> = {
  draft: "Draft",
  experiment_planning: "Experiment Planning",
  laboratory_preparation: "Laboratory Preparation",
  experiment_execution: "Experiment Execution",
  validation: "Validation",
  technical_review: "Technical Review",
  approved: "Approved",
  approved_with_conditions: "Approved with Conditions",
  revision_required: "Revision Required",
  rejected: "Rejected",
  archived: "Archived",
};
