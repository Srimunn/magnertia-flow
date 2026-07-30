import { ModuleSubTabBar } from "@/components/erp/ModuleSubTabBar";

const BASE = "/development/research-innovation/idea-management";

/** The module-level Register/Form sub-tab bar. Delegates to the shared
 *  ModuleSubTabBar so alignment, styling, and active-indicator stay identical
 *  across every Research & Innovation module. */
export function IdeaTabBar() {
  return (
    <ModuleSubTabBar
      tabs={[
        { to: BASE, label: "Dashboard", tooltip: "Ideas Dashboard", activeMatch: (p) => !p.startsWith(BASE + "/new") },
        { to: BASE + "/new", label: "Submit Idea", tooltip: "Submit Idea" },
      ]}
    />
  );
}

