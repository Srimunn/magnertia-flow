import type { FeasibilityStatus } from "@/services/types";
import { ModuleSubTabBar } from "@/components/erp/ModuleSubTabBar";

const BASE = "/development/research-innovation/feasibility-study";

/** The module-level Register/Form sub-tab bar. Delegates to the shared
 *  ModuleSubTabBar so alignment, styling, and active-indicator stay identical
 *  across every Research & Innovation module. */
export function FeasibilityStudyPageTabBar() {
  return (
    <ModuleSubTabBar
      tabs={[
        { to: BASE, label: "Feasibility Register", tooltip: "Feasibility Register", activeMatch: (p) => !p.startsWith(BASE + "/new") },
        { to: BASE + "/new", label: "Feasibility Study Form", tooltip: "Feasibility Study Form" },
      ]}
    />
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
