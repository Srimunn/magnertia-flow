import type { TrlStatus } from "@/services/types";
import { ModuleSubTabBar } from "@/components/erp/ModuleSubTabBar";

const BASE = "/development/research-innovation/trl-assessment";

/** The module-level Register/Form sub-tab bar. Delegates to the shared
 *  ModuleSubTabBar so alignment, styling, and active-indicator stay identical
 *  across every Research & Innovation module. */
export function TrlAssessmentPageTabBar() {
  return (
    <ModuleSubTabBar
      tabs={[
        { to: BASE, label: "TRL Register", tooltip: "TRL Assessment Register", activeMatch: (p) => !p.startsWith(BASE + "/new") },
        { to: BASE + "/new", label: "TRL Assessment Form", tooltip: "TRL Assessment Form" },
      ]}
    />
  );
}

export const TRL_STATUS_LABEL: Record<TrlStatus, string> = {
  draft: "Draft",
  technology_assessment: "Technology Assessment",
  technical_validation: "Technical Validation",
  demonstration_review: "Demonstration Review",
  risk_commercial_assessment: "Risk & Commercial Assessment",
  executive_review: "Under Review",
  approved: "Approved",
  approved_with_improvements: "Approved with Improvements",
  revision_required: "Revision Required",
  rejected: "Rejected",
  archived: "Archived",
};
