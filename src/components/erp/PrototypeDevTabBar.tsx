import type { PrototypeStatus } from "@/services/types";
import { ModuleSubTabBar } from "@/components/erp/ModuleSubTabBar";

const BASE = "/development/research-innovation/prototype-development";

/** The module-level Register/Form sub-tab bar. Delegates to the shared
 *  ModuleSubTabBar so alignment, styling, and active-indicator stay identical
 *  across every Research & Innovation module. */
export function PrototypeDevPageTabBar() {
  return (
    <ModuleSubTabBar
      tabs={[
        { to: BASE, label: "Prototype Register", tooltip: "Prototype Development Register", activeMatch: (p) => !p.startsWith(BASE + "/new") },
        { to: BASE + "/new", label: "Prototype Development Form", tooltip: "Prototype Development Form" },
      ]}
    />
  );
}

export const PROTOTYPE_STATUS_LABEL: Record<PrototypeStatus, string> = {
  draft: "Draft",
  engineering_design: "Engineering Design",
  prototype_manufacturing: "Prototype Manufacturing",
  testing_validation: "Testing & Validation",
  engineering_review: "Engineering Review",
  approved: "Approved",
  approved_with_conditions: "Approved with Conditions",
  revision_required: "Revision Required",
  rejected: "Rejected",
  archived: "Archived",
};
