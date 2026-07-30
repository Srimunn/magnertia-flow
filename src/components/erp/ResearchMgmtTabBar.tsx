import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import type { ResearchStatus } from "@/services/types";
import { ModuleSubTabBar } from "@/components/erp/ModuleSubTabBar";

const TAB_BASE =
  "shrink-0 whitespace-nowrap border-b-2 border-transparent bg-transparent px-3 pb-3 pt-1 text-[13px] font-semibold text-muted-foreground shadow-none transition-all hover:text-foreground focus-visible:outline-none";
const TAB_ACTIVE = "border-primary text-primary hover:text-primary font-bold";

const BASE = "/development/research-innovation/research-management";

/** The module-level Register/Form sub-tab bar. Delegates to the shared
 *  ModuleSubTabBar so alignment/styling stay identical across every R&I module. */
export function ResearchMgmtPageTabBar() {
  return (
    <ModuleSubTabBar
      tabs={[
        { to: BASE, label: "Research Register", tooltip: "Research Management Register", activeMatch: (p) => !p.startsWith(BASE + "/new") },
        { to: BASE + "/new", label: "Research Management Form", tooltip: "Research Management Form" },
      ]}
    />
  );
}

/** The form's own in-page tab bar. Real navigable tabs — only Overview is
 *  fully built; the rest render as labeled placeholders. */
export type ResearchTab =
  | "overview"
  | "planning"
  | "literature-review"
  | "experimental-design"
  | "resources"
  | "progress"
  | "outputs"
  | "commercialization"
  | "attachments"
  | "review-approval";

const INNER_TABS: { key: ResearchTab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "planning", label: "Planning" },
  { key: "literature-review", label: "Literature Review" },
  { key: "experimental-design", label: "Experimental Design" },
  { key: "resources", label: "Resources" },
  { key: "progress", label: "Progress" },
  { key: "outputs", label: "Outputs" },
  { key: "commercialization", label: "Commercialization" },
  { key: "attachments", label: "Attachments" },
  { key: "review-approval", label: "Review & Approval" },
];

export function ResearchInnerTabs({ active, id }: { active: ResearchTab; id?: string }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b border-border bg-white px-1">
      {INNER_TABS.map((t) => (
        <Link
          key={t.key}
          to="/development/research-innovation/research-management/new"
          search={{ id, tab: t.key === "overview" ? undefined : t.key }}
          className={cn(TAB_BASE, active === t.key && TAB_ACTIVE)}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}

export const RESEARCH_TAB_LABEL: Record<ResearchTab, string> = Object.fromEntries(
  INNER_TABS.map((t) => [t.key, t.label]),
) as Record<ResearchTab, string>;

export const RESEARCH_STATUS_LABEL: Record<ResearchStatus, string> = {
  planning: "Planning",
  resource_planning: "Resource Planning",
  in_progress: "In Progress",
  under_review: "Under Review",
  approved: "Approved",
  approved_with_conditions: "Approved with Conditions",
  revision_required: "Revision Required",
  rejected: "Rejected",
  archived: "Archived",
};
