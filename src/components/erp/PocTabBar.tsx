import type { PocStatus } from "@/services/types";
import { ModuleSubTabBar } from "@/components/erp/ModuleSubTabBar";

const BASE = "/development/research-innovation/proof-of-concept";

/** The module-level Register/Form sub-tab bar. Delegates to the shared
 *  ModuleSubTabBar so alignment, styling, and active-indicator stay identical
 *  across every Research & Innovation module. */
export function PocPageTabBar() {
  return (
    <ModuleSubTabBar
      tabs={[
        { to: BASE, label: "PoC Register", tooltip: "PoC Register", activeMatch: (p) => !p.startsWith(BASE + "/new") },
        { to: BASE + "/new", label: "PoC Form", tooltip: "PoC Form" },
      ]}
    />
  );
}

export const POC_STATUS_LABEL: Record<PocStatus, string> = {
  draft: "Draft",
  technical_implementation: "Technical Implementation",
  build_integration: "Build & Integration",
  experimental_testing: "Experimental Testing",
  commercial_assessment: "Commercial Assessment",
  final_review: "Final Review",
  approved: "Approved",
  conditional_approval: "Conditional Approval",
  revision_required: "Revision Required",
  rejected: "Rejected",
  archived: "Archived",
};
