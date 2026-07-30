export type ProductArchitectureTabId =
  | "overview"
  | "system_architecture"
  | "hardware_architecture"
  | "software_architecture"
  | "data_communication"
  | "integration"
  | "security_compliance"
  | "performance"
  | "ai_assessment"
  | "summary";

export function ProductArchitectureTabBar({
  activeTab = "overview",
  onTabChange,
}: {
  activeTab?: ProductArchitectureTabId;
  onTabChange?: (tabId: ProductArchitectureTabId) => void;
}) {
  const tabs = [
    { id: "overview" as const, label: "Overview" },
    { id: "system_architecture" as const, label: "System Architecture" },
    { id: "hardware_architecture" as const, label: "Hardware Architecture" },
    { id: "software_architecture" as const, label: "Software Architecture" },
    { id: "data_communication" as const, label: "Data & Communication" },
    { id: "integration" as const, label: "Integration" },
    { id: "security_compliance" as const, label: "Security & Compliance" },
    { id: "performance" as const, label: "Performance" },
    { id: "ai_assessment" as const, label: "AI Assessment" },
    { id: "summary" as const, label: "Summary" },
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
