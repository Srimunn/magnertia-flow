import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

const TAB_BASE =
  "shrink-0 whitespace-nowrap border-b-2 border-transparent bg-transparent px-3 pb-3 pt-1 text-[13px] font-semibold text-muted-foreground shadow-none transition-all hover:text-foreground focus-visible:outline-none";
const TAB_ACTIVE = "border-primary text-primary hover:text-primary font-bold";

const BASE = "/development/research-innovation/design-thinking";

export function DesignThinkingTabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onForm = pathname.startsWith(`${BASE}/new`);

  const tabs = [
    { to: BASE, label: "Design Thinking Projects", active: !onForm },
    { to: `${BASE}/new`, label: "Design Thinking Form", active: onForm },
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

export const DT_STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  in_progress: "In Progress",
  under_review: "Under Review",
  revision_required: "Revision Required",
  approved: "Approved",
  rejected: "Rejected",
  archived: "Archived",
};

export const DT_STAGE_LABEL: Record<string, string> = {
  empathize: "Empathize",
  define: "Define",
  ideate: "Ideate",
  prototype: "Prototype",
  test: "Test",
};
