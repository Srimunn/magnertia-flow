import React from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Gauge,
  Repeat,
  Cpu,
  ShieldCheck,
  Leaf,
  Sparkles,
  FileText,
  UserCheck,
  History,
} from "lucide-react";

export type ExcellenceTabId =
  | "overview"
  | "assessment"
  | "programs"
  | "smart"
  | "quality"
  | "sustainability"
  | "ai"
  | "summary"
  | "review"
  | "history";

interface TabItem {
  id: ExcellenceTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "assessment", label: "Operational Assessment", icon: Gauge },
  { id: "programs", label: "Improvement Programs", icon: Repeat },
  { id: "smart", label: "Smart Manufacturing", icon: Cpu },
  { id: "quality", label: "Quality & Compliance", icon: ShieldCheck },
  { id: "sustainability", label: "Sustainability & ESG", icon: Leaf },
  { id: "ai", label: "AI Assessment", icon: Sparkles },
  { id: "summary", label: "Summary", icon: FileText },
  { id: "review", label: "Review & Approval", icon: UserCheck },
  { id: "history", label: "Activity History", icon: History },
];

interface ManufacturingExcellenceTabBarProps {
  activeTab: ExcellenceTabId;
  onTabChange: (tab: ExcellenceTabId) => void;
}

export const ManufacturingExcellenceTabBar: React.FC<ManufacturingExcellenceTabBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b border-border bg-card/60 px-4 py-2 text-xs scrollbar-none">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20",
              isActive
                ? "bg-primary/10 font-semibold text-primary dark:bg-primary/20"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className={cn("h-3.5 w-3.5", isActive ? "text-primary" : "text-muted-foreground")} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
