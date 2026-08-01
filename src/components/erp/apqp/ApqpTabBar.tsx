import React from "react";
import {
  LayoutDashboard,
  Kanban,
  FileCheck,
  Factory,
  Users,
  ShieldAlert,
  Sparkles,
  FileSpreadsheet,
  UserCheck,
  Paperclip,
  History,
} from "lucide-react";

export type ApqpTabType =
  | "overview"
  | "phases"
  | "inputs"
  | "validation"
  | "supplier"
  | "risk"
  | "ai"
  | "summary"
  | "approval"
  | "attachments"
  | "history";

interface ApqpTabBarProps {
  activeTab: ApqpTabType;
  onTabChange: (tab: ApqpTabType) => void;
}

export const ApqpTabBar: React.FC<ApqpTabBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs: { id: ApqpTabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "phases", label: "Phase Planning", icon: Kanban },
    { id: "inputs", label: "Design & Process Inputs", icon: FileCheck },
    { id: "validation", label: "Manufacturing & Validation", icon: Factory },
    { id: "supplier", label: "Supplier Quality", icon: Users },
    { id: "risk", label: "Risk Assessment", icon: ShieldAlert },
    { id: "ai", label: "AI Assessment", icon: Sparkles },
    { id: "summary", label: "Summary", icon: FileSpreadsheet },
    { id: "approval", label: "Review & Approval", icon: UserCheck },
    { id: "attachments", label: "Attachments", icon: Paperclip },
    { id: "history", label: "Activity History", icon: History },
  ];

  return (
    <div className="bg-card border-b border-border px-4 overflow-x-auto scrollbar-none">
      <div className="flex items-center gap-1 min-w-max">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              className={`flex items-center gap-2 px-3.5 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                isActive
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
