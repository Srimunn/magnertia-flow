import type { CommercializationStatus } from "@/services/types";
import { ModuleSubTabBar } from "@/components/erp/ModuleSubTabBar";

const BASE = "/development/research-innovation/commercialization-planning";

/** The module-level Register/Form sub-tab bar. Delegates to the shared
 *  ModuleSubTabBar so alignment, styling, and active-indicator stay identical
 *  across every Research & Innovation module. */
export function CommercializationPageTabBar() {
  return (
    <ModuleSubTabBar
      tabs={[
        { to: BASE, label: "Commercialization Register", tooltip: "Commercialization Register", activeMatch: (p) => !p.startsWith(BASE + "/new") },
        { to: BASE + "/new", label: "Commercialization Planning Form", tooltip: "Commercialization Planning Form" },
      ]}
    />
  );
}

export const COMMERCIALIZATION_STATUS_LABEL: Record<CommercializationStatus, string> = {
  draft: "Draft",
  product_readiness: "Product Readiness",
  manufacturing_supply_chain: "Manufacturing & Supply Chain",
  sales_marketing_planning: "Sales & Marketing Planning",
  executive_review: "Under Review",
  approved: "Approved",
  approved_with_conditions: "Approved with Conditions",
  revision_required: "Revision Required",
  rejected: "Rejected",
  archived: "Archived",
};
