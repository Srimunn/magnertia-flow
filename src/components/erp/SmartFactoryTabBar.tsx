import React from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Network,
  Cpu,
  Sparkles,
  Bot,
  Activity,
  CheckCircle2,
  FileText,
  ShieldCheck,
  History,
} from "lucide-react";

export type SmartFactoryTabId =
  | "overview"
  | "infrastructure"
  | "systems"
  | "ai"
  | "automation"
  | "operations"
  | "validation"
  | "summary"
  | "review"
  | "history";

interface TabItem {
  id: SmartFactoryTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "infrastructure", label: "Digital Infrastructure", icon: Network },
  { id: "systems", label: "Smart Systems", icon: Cpu },
  { id: "ai", label: "AI & Analytics", icon: Sparkles },
  { id: "automation", label: "Automation", icon: Bot },
  { id: "operations", label: "Smart Operations", icon: Activity },
  { id: "validation", label: "Validation", icon: CheckCircle2 },
  { id: "summary", label: "Summary", icon: FileText },
  { id: "review", label: "Review & Approval", icon: ShieldCheck },
  { id: "history", label: "Activity History", icon: History },
];

interface SmartFactoryTabBarProps {
  activeTab: SmartFactoryTabId;
  onTabChange: (tab: SmartFactoryTabId) => void;
}

export const SmartFactoryTabBar: React.FC<SmartFactoryTabBarProps> = ({
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
