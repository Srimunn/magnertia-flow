import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import type { PrototypeStatus } from "@/services/types";

const TAB_BASE =
  "shrink-0 whitespace-nowrap border-b-2 border-transparent bg-transparent px-3 pb-3 pt-1 text-[13px] font-semibold text-muted-foreground shadow-none transition-all hover:text-foreground focus-visible:outline-none";
const TAB_ACTIVE = "border-primary text-primary hover:text-primary font-bold";

/** The module-level page tab bar (Register vs. Form). */
export function PrototypeDevPageTabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const base = "/development/research-innovation/prototype-development";
  const onForm = pathname.startsWith(`${base}/new`);
  const tabs = [
    { to: base, label: "Prototype Register", active: !onForm },
    { to: `${base}/new`, label: "Prototype Development Form", active: onForm },
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

export const PROTOTYPE_STATUS_LABEL: Record<PrototypeStatus, string> = {
  draft: "Draft",
  engineering_design: "Engineering Design",
  prototype_manufacturing: "Prototype Manufacturing",
  testing_validation: "Testing & Validation",
  engineering_review: "Engineering Review",
  approved: "Approved",
  approved_with_conditions: "Approved with Conditions",
  revision_required: "Revision Required",
  rejected: "Rejected",
  archived: "Archived",
};
