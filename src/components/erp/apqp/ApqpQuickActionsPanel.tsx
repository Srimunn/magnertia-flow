import React from "react";
import {
  Plus,
  FileCheck,
  Upload,
  Calendar,
  BarChart3,
  ShieldAlert,
} from "lucide-react";

interface ApqpQuickActionsPanelProps {
  onAction?: (actionName: string) => void;
}

export const ApqpQuickActionsPanel: React.FC<ApqpQuickActionsPanelProps> = ({
  onAction,
}) => {
  const actions = [
    { label: "Create DFMEA", icon: ShieldAlert, color: "text-rose-500" },
    { label: "Create PFMEA", icon: ShieldAlert, color: "text-amber-500" },
    { label: "Create Control Plan", icon: FileCheck, color: "text-blue-500" },
    { label: "Create PPAP", icon: Plus, color: "text-primary" },
    { label: "Upload Process Flow", icon: Upload, color: "text-emerald-500" },
    { label: "Upload Requirements", icon: Upload, color: "text-purple-500" },
    { label: "Schedule Review", icon: Calendar, color: "text-teal-500" },
    { label: "View APQP Dashboard", icon: BarChart3, color: "text-blue-600" },
  ];

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-3 text-xs">
      <h2 className="font-bold text-foreground text-xs pb-1.5 border-b border-border mb-2">
        Quick Actions
      </h2>

      <div className="space-y-1 text-[11px]">
        {actions.map((act, idx) => {
          const Icon = act.icon;
          return (
            <button
              key={idx}
              onClick={() => onAction?.(act.label)}
              className="w-full text-left px-2 py-1 rounded hover:bg-accent hover:text-accent-foreground text-foreground flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
            >
              <Icon className={`w-3 h-3 ${act.color} shrink-0`} />
              <span>{act.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
