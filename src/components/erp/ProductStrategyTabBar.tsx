import { ModuleSubTabBar } from "@/components/erp/ModuleSubTabBar";

const BASE = "/development/research-innovation/product-strategy";

/** The module-level sub-tab bar for Product Strategy. Delegates to shared
 *  ModuleSubTabBar for identical styling, active indicator, and alignment. */
export function ProductStrategyTabBar() {
  return (
    <ModuleSubTabBar
      tabs={[
        {
          to: BASE + "/overview",
          label: "Overview",
          tooltip: "Product Strategy Dashboard & Executive Summary",
          activeMatch: "startsWith",
        },
        {
          to: BASE + "/new",
          label: "Product Strategy Form",
          tooltip: "Create & Edit Product Strategy Record",
          activeMatch: "startsWith",
        },
        {
          to: BASE + "/portfolio",
          label: "Strategy Portfolio",
          tooltip: "Product Strategy Records Register",
          activeMatch: "startsWith",
        },
        {
          to: BASE + "/roadmaps",
          label: "Product Roadmaps",
          tooltip: "Linked Product Roadmaps & Release Milestones",
          activeMatch: "startsWith",
        },
        {
          to: BASE + "/reports",
          label: "Strategy Reports",
          tooltip: "Financial Projections & AI Strategy Briefs",
          activeMatch: "startsWith",
        },
      ]}
    />
  );
}
