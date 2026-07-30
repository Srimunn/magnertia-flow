export type ElectricalDesignTabId =
  | "overview"
  | "architecture"
  | "power_system"
  | "circuit_pcb"
  | "wiring_harness"
  | "protection_safety"
  | "emc_emi"
  | "simulation_validation"
  | "ai_assessment"
  | "summary"
  | "attachments"
  | "review_approval";

export function ElectricalDesignTabBar({
  activeTab = "overview",
  onTabChange,
}: {
  activeTab?: ElectricalDesignTabId;
  onTabChange?: (tabId: ElectricalDesignTabId) => void;
}) {
  const tabs: { id: ElectricalDesignTabId; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "architecture", label: "Architecture" },
    { id: "power_system", label: "Power System" },
    { id: "circuit_pcb", label: "Circuit & PCB" },
    { id: "wiring_harness", label: "Wiring & Harness" },
    { id: "protection_safety", label: "Protection & Safety" },
    { id: "emc_emi", label: "EMC / EMI" },
    { id: "simulation_validation", label: "Simulation & Validation" },
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
