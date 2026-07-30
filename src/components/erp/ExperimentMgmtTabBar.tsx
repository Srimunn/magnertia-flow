import type { ExperimentStatus } from "@/services/types";
import { ModuleSubTabBar } from "@/components/erp/ModuleSubTabBar";

const BASE = "/development/research-innovation/experiment-management";

/** The module-level Register/Form sub-tab bar. Delegates to the shared
 *  ModuleSubTabBar so alignment, styling, and active-indicator stay identical
 *  across every Research & Innovation module. */
export function ExperimentMgmtPageTabBar() {
  return (
    <ModuleSubTabBar
      tabs={[
        { to: BASE, label: "Experiment Register", tooltip: "Experiment Register", activeMatch: (p) => !p.startsWith(BASE + "/new") },
        { to: BASE + "/new", label: "Experiment Management Form", tooltip: "Experiment Management Form" },
      ]}
    />
  );
}

export const EXPERIMENT_STATUS_LABEL: Record<ExperimentStatus, string> = {
  draft: "Draft",
  experiment_planning: "Experiment Planning",
  laboratory_preparation: "Laboratory Preparation",
  experiment_execution: "Experiment Execution",
  validation: "Validation",
  technical_review: "Technical Review",
  approved: "Approved",
  approved_with_conditions: "Approved with Conditions",
  revision_required: "Revision Required",
  rejected: "Rejected",
  archived: "Archived",
};
