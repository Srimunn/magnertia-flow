import { ModuleSubTabBar } from "@/components/erp/ModuleSubTabBar";

const BASE = "/development/research-innovation/opportunity-discovery";

/** The module-level Register/Form sub-tab bar. Delegates to the shared
 *  ModuleSubTabBar so alignment, styling, and active-indicator stay identical
 *  across every Research & Innovation module. */
export function OpportunityTabBar() {
  return (
    <ModuleSubTabBar
      tabs={[
        { to: BASE, label: "Opportunity Register", tooltip: "Opportunity Register", activeMatch: (p) => !p.startsWith(BASE + "/new") },
        { to: BASE + "/new", label: "Opportunity Discovery Form", tooltip: "Opportunity Discovery Form" },
      ]}
    />
  );
}

export const OPPORTUNITY_STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  under_review: "Under Review",
  revision_required: "Revision Required",
  approved: "Approved",
  on_hold: "On Hold",
  rejected: "Rejected",
  archived: "Archived",
};
