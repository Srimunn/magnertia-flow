export type IndustrialDesignTabId =
  | "overview"
  | "ergonomics"
  | "aesthetics_branding"
  | "materials"
  | "manufacturing"
  | "prototype_validation"
  | "sustainability"
  | "ai_assessment"
  | "summary"
  | "attachments"
  | "review_approval";

export function IndustrialDesignTabBar({
  activeTab = "overview",
  onTabChange,
}: {
  activeTab?: IndustrialDesignTabId;
  onTabChange?: (tabId: IndustrialDesignTabId) => void;
}) {
  const tabs = [
    { id: "overview" as const, label: "Overview" },
    { id: "ergonomics" as const, label: "Ergonomics" },
    { id: "aesthetics_branding" as const, label: "Aesthetics & Branding" },
    { id: "materials" as const, label: "Materials" },
    { id: "manufacturing" as const, label: "Manufacturing" },
    { id: "prototype_validation" as const, label: "Prototype & Validation" },
    { id: "sustainability" as const, label: "Sustainability" },
    { id: "ai_assessment" as const, label: "AI Assessment" },
    { id: "summary" as const, label: "Summary" },
    { id: "attachments" as const, label: "Attachments" },
    { id: "review_approval" as const, label: "Review & Approval" },
  ];

  return (
    <div className="flex items-center gap-1 border-b border-border bg-white px-4 shadow-xs overflow-x-auto [&::-webkit-scrollbar]:hidden">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange?.(tab.id)}
            className={`shrink-0 whitespace-nowrap border-b-2 px-3 pb-3 pt-3 text-[13px] font-medium transition-all focus:outline-none cursor-pointer ${
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
