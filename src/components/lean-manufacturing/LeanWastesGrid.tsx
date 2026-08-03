import React from "react";
import type { WasteItem, WasteSeverityType } from "@/lib/lean-manufacturing/types";

interface LeanWastesGridProps {
  wastes: {
    overproduction: WasteItem;
    waiting: WasteItem;
    transportation: WasteItem;
    overprocessing: WasteItem;
    inventory: WasteItem;
    motion: WasteItem;
    defects: WasteItem;
    underutilizedTalent: WasteItem;
  };
  score: number;
  onChangeWaste: (wasteKey: string, checked: boolean, severity: WasteSeverityType) => void;
}

export const LeanWastesGrid: React.FC<LeanWastesGridProps> = ({
  wastes,
  score,
  onChangeWaste,
}) => {
  const leftWastes = [
    { key: "overproduction", label: "Overproduction", waste: wastes.overproduction },
    { key: "waiting", label: "Waiting", waste: wastes.waiting },
    { key: "transportation", label: "Transportation", waste: wastes.transportation },
    { key: "overprocessing", label: "Overprocessing", waste: wastes.overprocessing },
  ];

  const rightWastes = [
    { key: "inventory", label: "Inventory", waste: wastes.inventory },
    { key: "motion", label: "Motion", waste: wastes.motion },
    { key: "defects", label: "Defects", waste: wastes.defects },
    { key: "underutilizedTalent", label: "Underutilized Talent", waste: wastes.underutilizedTalent },
  ];

  const getSeverityBadgeClass = (severity: WasteSeverityType) => {
    switch (severity) {
      case "High":
        return "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300";
      case "Medium":
        return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300";
      default:
        return "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300";
    }
  };

  const renderWasteRow = (item: { key: string; label: string; waste: WasteItem }) => (
    <div
      key={item.key}
      className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border hover:bg-muted/70 transition-colors"
    >
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={item.waste.checked}
          onChange={(e) => onChangeWaste(item.key, e.target.checked, item.waste.severity)}
          className="w-4 h-4 rounded text-primary focus:ring-primary"
        />
        <span className="font-bold text-foreground text-xs">{item.label}</span>
      </div>

      <select
        value={item.waste.severity}
        disabled={!item.waste.checked}
        onChange={(e) =>
          onChangeWaste(item.key, item.waste.checked, e.target.value as WasteSeverityType)
        }
        className={`px-2 py-0.5 rounded text-[11px] font-extrabold border cursor-pointer disabled:opacity-50 ${getSeverityBadgeClass(
          item.waste.severity
        )}`}
      >
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2.5">{leftWastes.map(renderWasteRow)}</div>
        <div className="space-y-2.5">{rightWastes.map(renderWasteRow)}</div>
      </div>

      <div className="pt-2 border-t border-border flex justify-between items-center text-xs">
        <span className="text-muted-foreground italic">
          DOWNTIME Framework (8 Wastes Identified)
        </span>
        <span className="font-extrabold text-rose-600 bg-rose-50 dark:bg-rose-950 px-3 py-1 rounded border border-rose-200">
          Waste Severity Score: {score}/100 (Inverted)
        </span>
      </div>
    </div>
  );
};
