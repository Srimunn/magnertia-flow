import type { CIStatus } from "@/services/types";
import { ModuleSubTabBar } from "@/components/erp/ModuleSubTabBar";

const BASE = "/development/research-innovation/continuous-innovation";

/** The module-level Register/Form sub-tab bar. Delegates to the shared
 *  ModuleSubTabBar so alignment, styling, and active-indicator stay identical
 *  across every Research & Innovation module. */
export function ContinuousInnovationPageTabBar() {
  return (
    <ModuleSubTabBar
      tabs={[
        { to: BASE, label: "Innovation Cycles", tooltip: "Innovation Cycles", activeMatch: (p) => !p.startsWith(BASE + "/new") },
        { to: BASE + "/new", label: "Continuous Innovation Form", tooltip: "Continuous Innovation Form" },
      ]}
    />
  );
}

export const CI_STATUS_LABEL: Record<CIStatus, string> = {
  draft: "Draft",
  opportunity_identification: "Opportunity Identification",
  innovation_planning: "Innovation Planning",
  implementation_monitoring: "Implementation & Monitoring",
  executive_review: "Executive Review",
  approved: "Approved",
  approved_with_improvements: "Approved with Improvements",
  revision_required: "Revision Required",
  rejected: "Rejected",
  archived: "Archived",
};
