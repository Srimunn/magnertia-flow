export type ElectronicsDesignTabId =
  | "overview"
  | "system_architecture"
  | "component_selection"
  | "circuit_design"
  | "pcb_preparation"
  | "embedded_interfaces"
  | "signal_integrity"
  | "verification_testing"
  | "ai_assessment"
  | "summary"
  | "attachments";

export function ElectronicsDesignTabBar({
  activeTab = "overview",
  onTabChange,
}: {
  activeTab?: ElectronicsDesignTabId;
  onTabChange?: (tabId: ElectronicsDesignTabId) => void;
}) {
  const tabs: { id: ElectronicsDesignTabId; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "system_architecture", label: "System Architecture" },
    { id: "component_selection", label: "Component Selection" },
    { id: "circuit_design", label: "Circuit Design" },
    { id: "pcb_preparation", label: "PCB Preparation" },
    { id: "embedded_interfaces", label: "Embedded Interfaces" },
    { id: "signal_integrity", label: "Signal Integrity" },
    { id: "verification_testing", label: "Verification & Testing" },
    { id: "ai_assessment", label: "AI Assessment" },
    { id: "summary", label: "Summary" },
    { id: "attachments", label: "Attachments" },
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
