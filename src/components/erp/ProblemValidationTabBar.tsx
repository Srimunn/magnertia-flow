import { ModuleSubTabBar } from "@/components/erp/ModuleSubTabBar";

const BASE = "/development/research-innovation/problem-validation";

/** The module-level Register/Form sub-tab bar. Delegates to the shared
 *  ModuleSubTabBar so alignment, styling, and active-indicator stay identical
 *  across every Research & Innovation module. */
export function ProblemValidationTabBar() {
  return (
    <ModuleSubTabBar
      tabs={[
        { to: BASE, label: "Problem Validation Register", tooltip: "Problem Validation Register", activeMatch: (p) => !p.startsWith(BASE + "/new") },
        { to: BASE + "/new", label: "Problem Validation Form", tooltip: "Problem Validation Form" },
      ]}
    />
  );
}

export const PV_STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  in_progress: "In Progress",
  under_review: "Under Review",
  more_research_required: "More Research Required",
  revision_required: "Revision Required",
  validated: "Validated",
  validation_failed: "Validation Failed",
  archived: "Archived",
};

export const PV_STAGE_LABEL: Record<string, string> = {
  problem_definition: "Problem Definition",
  customer_validation: "Customer Validation",
  market_validation: "Market Validation",
  technical_validation: "Technical Validation",
  business_validation: "Business Validation",
};
