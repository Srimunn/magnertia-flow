export type EmbeddedDevelopmentTabId =
  | "overview"
  | "hardware_platform"
  | "firmware_architecture"
  | "rtos_tasks"
  | "interfaces"
  | "functional_modules"
  | "security_safety"
  | "verification_testing"
  | "ai_assessment"
  | "summary"
  | "attachments"
  | "review_approval";

export function EmbeddedDevelopmentTabBar({
  activeTab = "overview",
  onTabChange,
}: {
  activeTab?: EmbeddedDevelopmentTabId;
  onTabChange?: (tabId: EmbeddedDevelopmentTabId) => void;
}) {
  const tabs: { id: EmbeddedDevelopmentTabId; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "hardware_platform", label: "Hardware Platform" },
    { id: "firmware_architecture", label: "Firmware Architecture" },
    { id: "rtos_tasks", label: "RTOS & Tasks" },
    { id: "interfaces", label: "Interfaces" },
    { id: "functional_modules", label: "Functional Modules" },
    { id: "security_safety", label: "Security & Safety" },
    { id: "verification_testing", label: "Verification & Testing" },
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
