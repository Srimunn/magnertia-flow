import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { ModuleSubTabBar } from "@/components/erp/ModuleSubTabBar";

const TAB_BASE =
  "shrink-0 whitespace-nowrap border-b-2 border-transparent bg-transparent px-3 pb-3 pt-1 text-[13px] font-semibold text-muted-foreground shadow-none transition-all hover:text-foreground focus-visible:outline-none";
const TAB_ACTIVE = "border-primary text-primary hover:text-primary font-bold";

/** The portfolio's own in-page tab bar (Overview | Projects | Financials | …).
 *  Real navigable tabs — not anchor-scroll — matching the screenshot's tab
 *  bar sitting just below the record header. Only Overview is fully built;
 *  the rest render as labeled placeholders (see `PortfolioTabPlaceholder`). */
export type PortfolioTab =
  | "overview"
  | "projects"
  | "financials"
  | "resources"
  | "risks"
  | "performance"
  | "analytics"
  | "documents"
  | "history";

const TABS: { key: PortfolioTab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "projects", label: "Projects" },
  { key: "financials", label: "Financials" },
  { key: "resources", label: "Resources" },
  { key: "risks", label: "Risks" },
  { key: "performance", label: "Performance" },
  { key: "analytics", label: "Analytics" },
  { key: "documents", label: "Documents" },
  { key: "history", label: "History" },
];

export function PortfolioInnerTabs({ active, id }: { active: PortfolioTab; id?: string }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b border-border bg-white px-1">
      {TABS.map((t) => (
        <Link
          key={t.key}
          to="/development/research-innovation/innovation-portfolio/new"
          search={{ id, tab: t.key === "overview" ? undefined : t.key }}
          className={cn(TAB_BASE, active === t.key && TAB_ACTIVE)}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}

/** The module-level Register/Form sub-tab bar. Delegates to the shared
 *  ModuleSubTabBar so alignment/styling stay identical across every R&I module. */
export function PortfolioPageTabBar() {
  const base = "/development/research-innovation/innovation-portfolio";
  return (
    <ModuleSubTabBar
      tabs={[
        { to: base, label: "Portfolio Register", tooltip: "Innovation Portfolio Register", activeMatch: (p) => !p.startsWith(base + "/new") },
        { to: base + "/new", label: "Innovation Portfolio Form", tooltip: "Innovation Portfolio Form" },
      ]}
    />
  );
}

export const PORTFOLIO_STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  under_review: "Under Review",
  active: "Active",
  revision_required: "Revision Required",
  budget_review: "Budget Review",
  rejected: "Rejected",
  archived: "Archived",
};
