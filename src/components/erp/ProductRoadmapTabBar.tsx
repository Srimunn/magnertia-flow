import { ModuleSubTabBar } from "@/components/erp/ModuleSubTabBar";

const BASE = "/development/research-innovation/product-roadmap/new";

export type ProductRoadmapTabId =
  | "overview"
  | "releases"
  | "features"
  | "tech"
  | "milestones"
  | "budget"
  | "risks"
  | "ai_insights";

export function ProductRoadmapTabBar({
  activeTab = "overview",
  onTabChange,
}: {
  activeTab?: ProductRoadmapTabId;
  onTabChange?: (tabId: ProductRoadmapTabId) => void;
}) {
  const tabs = [
    { id: "overview" as const, label: "Roadmap Overview" },
    { id: "releases" as const, label: "Releases & Timeline" },
    { id: "features" as const, label: "Feature Roadmap" },
    { id: "tech" as const, label: "Technology Roadmap" },
    { id: "milestones" as const, label: "Milestones" },
    { id: "budget" as const, label: "Resources & Budget" },
    { id: "risks" as const, label: "Risks" },
    { id: "ai_insights" as const, label: "AI Insights" },
  ];

  return (
    <div className="flex items-center gap-2 border-b border-border bg-white px-3 shadow-sm overflow-x-auto [&::-webkit-scrollbar]:hidden">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange?.(tab.id)}
            className={`shrink-0 whitespace-nowrap border-b-2 px-3 pb-3 pt-2 text-[13px] font-semibold transition-all focus:outline-none ${
              isActive
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
