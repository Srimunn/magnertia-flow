import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

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

/** The module-level page tab bar (Register vs. Form) — matches the pattern
 *  used by Idea Management / Opportunity Discovery / Design Thinking / Problem
 *  Validation for the outer AppShell `tabs` slot. */
export function PortfolioPageTabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const base = "/development/research-innovation/innovation-portfolio";
  const onForm = pathname.startsWith(`${base}/new`);
  const tabs = [
    { to: base, label: "Portfolio Register", active: !onForm },
    { to: `${base}/new`, label: "Innovation Portfolio Form", active: onForm },
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

export const PORTFOLIO_STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  under_review: "Under Review",
  active: "Active",
  revision_required: "Revision Required",
  budget_review: "Budget Review",
  rejected: "Rejected",
  archived: "Archived",
};
