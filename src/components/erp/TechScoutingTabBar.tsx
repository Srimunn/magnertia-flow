import { Link, useRouterState } from "@tanstack/react-router";
import { ModuleSubTabBar } from "@/components/erp/ModuleSubTabBar";
import {
  Search,
  FlaskConical,
  Wrench,
  BarChart3,
  Scale,
  Landmark,
  CheckCircle2,
  Eye,
  Archive,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TechScoutingStatus } from "@/services/types";

const TAB_BASE =
  "shrink-0 whitespace-nowrap border-b-2 border-transparent bg-transparent px-3 pb-3 pt-1 text-[13px] font-semibold text-muted-foreground shadow-none transition-all hover:text-foreground focus-visible:outline-none";
const TAB_ACTIVE = "border-primary text-primary hover:text-primary font-bold";

/** The module-level Register/Form sub-tab bar. Delegates to the shared
 *  ModuleSubTabBar so alignment/styling stay identical across every R&I module. */
export function TechScoutingPageTabBar() {
  const base = "/development/research-innovation/technology-scouting";
  return (
    <ModuleSubTabBar
      tabs={[
        { to: base, label: "Scouting Register", tooltip: "Technology Scouting Register", activeMatch: (p) => !p.startsWith(base + "/new") },
        { to: base + "/new", label: "Technology Scouting Form", tooltip: "Technology Scouting Form" },
      ]}
    />
  );
}

export const TECH_SCOUTING_STATUS_LABEL: Record<TechScoutingStatus, string> = {
  identified: "Identified",
  under_evaluation: "Under Evaluation",
  technical_review: "Technical Review",
  business_review: "Business Review",
  ip_review: "IP Review",
  executive_review: "Executive Review",
  approved: "Approved",
  monitoring: "Monitoring",
  rejected: "Rejected",
  closed: "Closed",
};

/** The 9 tracker steps in workflow order. `rejected` isn't a step — it
 *  highlights the terminal Closed position instead. */
const TRACKER_STEPS: { status: TechScoutingStatus; label: string; icon: LucideIcon }[] = [
  { status: "identified", label: "Identified", icon: Search },
  { status: "under_evaluation", label: "Under Evaluation", icon: FlaskConical },
  { status: "technical_review", label: "Technical Review", icon: Wrench },
  { status: "business_review", label: "Business Review", icon: BarChart3 },
  { status: "ip_review", label: "IP Review", icon: Scale },
  { status: "executive_review", label: "Executive Review", icon: Landmark },
  { status: "approved", label: "Approved", icon: CheckCircle2 },
  { status: "monitoring", label: "Monitoring", icon: Eye },
  { status: "closed", label: "Closed", icon: Archive },
];

function trackerIndex(status: TechScoutingStatus): number {
  if (status === "rejected") return TRACKER_STEPS.length - 1;
  return TRACKER_STEPS.findIndex((s) => s.status === status);
}

/** Horizontal 9-stage workflow tracker, data-driven from `status`. */
export function TechScoutingStageTracker({ status }: { status: TechScoutingStatus }) {
  const activeIdx = trackerIndex(status);
  return (
    <div className="card-soft overflow-x-auto px-4 py-3">
      <div className="flex min-w-[860px] items-start">
        {TRACKER_STEPS.map((step, idx) => {
          const done = idx < activeIdx;
          const active = idx === activeIdx;
          const Icon = step.icon;
          const isRejected = status === "rejected" && step.status === "closed";
          return (
            <div key={step.status} className="flex flex-1 items-start last:flex-none">
              <div className="flex w-24 flex-col items-center gap-1.5 text-center">
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors",
                    active && !isRejected && "border-primary bg-primary text-white",
                    active && isRejected && "border-destructive bg-destructive text-white",
                    done && "border-success bg-success/10 text-success",
                    !active && !done && "border-border bg-white text-muted-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span
                  className={cn(
                    "text-[11px] font-semibold leading-tight",
                    active ? "text-foreground" : done ? "text-success" : "text-muted-foreground",
                  )}
                >
                  {isRejected ? "Rejected" : step.label}
                </span>
              </div>
              {idx < TRACKER_STEPS.length - 1 && (
                <div
                  className={cn(
                    "mt-[17px] h-0.5 flex-1 rounded-full",
                    idx < activeIdx ? "bg-success" : "bg-border",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
