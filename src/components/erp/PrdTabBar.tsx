export type PrdTabId =
  | "overview"
  | "business_reqs"
  | "functional_reqs"
  | "non_functional"
  | "ux_reqs"
  | "technical_reqs"
  | "risk_deps"
  | "acceptance_testing"
  | "ai_assessment"
  | "summary";

export function PrdTabBar({
  activeTab = "overview",
  onTabChange,
}: {
  activeTab?: PrdTabId;
  onTabChange?: (tabId: PrdTabId) => void;
}) {
  const tabs = [
    { id: "overview" as const, label: "Overview" },
    { id: "business_reqs" as const, label: "Business Requirements" },
    { id: "functional_reqs" as const, label: "Functional Requirements" },
    { id: "non_functional" as const, label: "Non-Functional" },
    { id: "ux_reqs" as const, label: "UX Requirements" },
    { id: "technical_reqs" as const, label: "Technical Requirements" },
    { id: "risk_deps" as const, label: "Risk & Dependencies" },
    { id: "acceptance_testing" as const, label: "Acceptance & Testing" },
    { id: "ai_assessment" as const, label: "AI Assessment" },
    { id: "summary" as const, label: "Summary" },
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
