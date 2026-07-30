export type FirmwareDevelopmentTabId =
  | "overview"
  | "architecture"
  | "modules"
  | "communication"
  | "diagnostics_safety"
  | "cybersecurity"
  | "testing_qa"
  | "release_management"
  | "ai_assessment"
  | "summary"
  | "attachments"
  | "review_approval";

export function FirmwareDevelopmentTabBar({
  activeTab = "overview",
  onTabChange,
}: {
  activeTab?: FirmwareDevelopmentTabId;
  onTabChange?: (tabId: FirmwareDevelopmentTabId) => void;
}) {
  const tabs: { id: FirmwareDevelopmentTabId; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "architecture", label: "Architecture" },
    { id: "modules", label: "Modules" },
    { id: "communication", label: "Communication" },
    { id: "diagnostics_safety", label: "Diagnostics & Safety" },
    { id: "cybersecurity", label: "Cybersecurity" },
    { id: "testing_qa", label: "Testing & QA" },
    { id: "release_management", label: "Release Management" },
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
