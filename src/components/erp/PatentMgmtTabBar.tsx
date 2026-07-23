import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import type { PatentStatus } from "@/services/types";

const TAB_BASE =
  "shrink-0 whitespace-nowrap border-b-2 border-transparent bg-transparent px-3 pb-3 pt-1 text-[13px] font-semibold text-muted-foreground shadow-none transition-all hover:text-foreground focus-visible:outline-none";
const TAB_ACTIVE = "border-primary text-primary hover:text-primary font-bold";

/** The module-level page tab bar (Register vs. Form). */
export function PatentMgmtPageTabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const base = "/development/ip-development/patent-management";
  const onForm = pathname.startsWith(`${base}/new`);
  const tabs = [
    { to: base, label: "Patent Register", active: !onForm },
    { to: `${base}/new`, label: "Patent Management Form", active: onForm },
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

export const PATENT_STATUS_LABEL: Record<PatentStatus, string> = {
  draft: "Draft",
  preparation: "Preparation",
  filing: "Filing",
  examination: "Examination",
  granted: "Granted",
  commercialization: "Commercialization",
  active: "Active",
  revision_required: "Revision Required",
  abandoned: "Abandoned",
  closed: "Closed",
};
