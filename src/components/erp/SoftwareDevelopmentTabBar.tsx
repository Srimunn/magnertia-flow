export type SoftwareDevelopmentTabId =
  | "overview"
  | "architecture"
  | "technology_stack"
  | "api_integration"
  | "database"
  | "devops_cicd"
  | "security_compliance"
  | "testing_qa"
  | "ai_assessment"
  | "summary"
  | "attachments"
  | "review_approval";

export function SoftwareDevelopmentTabBar({
  activeTab = "overview",
  onTabChange,
}: {
  activeTab?: SoftwareDevelopmentTabId;
  onTabChange?: (tabId: SoftwareDevelopmentTabId) => void;
}) {
  const tabs: { id: SoftwareDevelopmentTabId; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "architecture", label: "Architecture" },
    { id: "technology_stack", label: "Technology Stack" },
    { id: "api_integration", label: "API & Integration" },
    { id: "database", label: "Database" },
    { id: "devops_cicd", label: "DevOps & CI/CD" },
    { id: "security_compliance", label: "Security & Compliance" },
    { id: "testing_qa", label: "Testing & QA" },
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
