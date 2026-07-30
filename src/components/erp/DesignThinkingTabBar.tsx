import { ModuleSubTabBar } from "@/components/erp/ModuleSubTabBar";

const BASE = "/development/research-innovation/design-thinking";

/** The module-level Register/Form sub-tab bar. Delegates to the shared
 *  ModuleSubTabBar so alignment, styling, and active-indicator stay identical
 *  across every Research & Innovation module. */
export function DesignThinkingTabBar() {
  return (
    <ModuleSubTabBar
      tabs={[
        { to: BASE, label: "Design Thinking Projects", tooltip: "Design Thinking Projects", activeMatch: (p) => !p.startsWith(BASE + "/new") },
        { to: BASE + "/new", label: "Design Thinking Form", tooltip: "Design Thinking Form" },
      ]}
    />
  );
}

export const DT_STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  in_progress: "In Progress",
  under_review: "Under Review",
  revision_required: "Revision Required",
  approved: "Approved",
  rejected: "Rejected",
  archived: "Archived",
};

export const DT_STAGE_LABEL: Record<string, string> = {
  empathize: "Empathize",
  define: "Define",
  ideate: "Ideate",
  prototype: "Prototype",
  test: "Test",
};
