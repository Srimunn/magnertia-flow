export type MechanicalDesignTabId =
  | "overview"
  | "assembly_design"
  | "part_design"
  | "mechanism_design"
  | "materials_manufacturing"
  | "engineering_analysis"
  | "design_validation"
  | "ai_assessment"
  | "summary"
  | "attachments"
  | "review_approval";

export function MechanicalDesignTabBar({
  activeTab = "overview",
  onTabChange,
}: {
  activeTab?: MechanicalDesignTabId;
  onTabChange?: (tabId: MechanicalDesignTabId) => void;
}) {
  const tabs: { id: MechanicalDesignTabId; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "assembly_design", label: "Assembly Design" },
    { id: "part_design", label: "Part Design" },
    { id: "mechanism_design", label: "Mechanism Design" },
    { id: "materials_manufacturing", label: "Materials & Manufacturing" },
    { id: "engineering_analysis", label: "Engineering Analysis" },
    { id: "design_validation", label: "Design Validation" },
    { id: "ai_assessment", label: "AI Assessment" },
    { id: "summary", label: "Summary" },
    { id: "attachments", label: "Attachments" },
    { id: "review_approval", label: "Review & Approval" },
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
