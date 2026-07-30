import type { PatentStatus } from "@/services/types";
import { ModuleSubTabBar } from "@/components/erp/ModuleSubTabBar";

const BASE = "/development/ip-development/patent-management";

/** The module-level Register/Form sub-tab bar. Delegates to the shared
 *  ModuleSubTabBar so alignment, styling, and active-indicator stay identical
 *  across every Research & Innovation module. */
export function PatentMgmtPageTabBar() {
  return (
    <ModuleSubTabBar
      tabs={[
        { to: BASE, label: "Patent Register", tooltip: "Patent Register", activeMatch: (p) => !p.startsWith(BASE + "/new") },
        { to: BASE + "/new", label: "Patent Management Form", tooltip: "Patent Management Form" },
      ]}
    />
  );
}

export const PATENT_STATUS_LABEL: Record<PatentStatus, string> = {
  draft: "Draft",
  preparation: "Preparation",
  filing: "Filing",
  examination: "Examination",
  granted: "Granted",
  commercialization: "Commercialization",
  active: "Active",
  revision_required: "Revision Required",
  abandoned: "Abandoned",
  closed: "Closed",
};
