import React from "react";
import {
  Package,
  Users,
  Sparkles,
} from "lucide-react";
import type { PilotProductionRecord } from "@/services/types";

interface PilotProductionTopBadgesProps {
  record: PilotProductionRecord;
}

export const PilotProductionTopBadges: React.FC<PilotProductionTopBadgesProps> = ({
  record,
}) => {
  const renderGaugeRing = (value: number, color: string) => {
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center w-11 h-11">
        <svg className="w-11 h-11 transform -rotate-90">
          <circle cx="22" cy="22" r={radius} stroke="currentColor" strokeWidth="3.5" className="text-muted/30" fill="transparent" />
          <circle
            cx="22"
            cy="22"
            r={radius}
            stroke={color}
            strokeWidth="3.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <span className="absolute text-[10px] font-extrabold text-foreground">{value}%</span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
      {/* Badge 1: Planned Quantity */}
      <div className="bg-card border border-border rounded-lg p-3 shadow-sm flex flex-col justify-between">
        <span className="text-[10px] text-muted-foreground font-semibold uppercase block">Planned Quantity</span>
        <div className="flex items-center gap-2 my-1">
          <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
            <Package className="w-4 h-4" />
          </div>
          <span className="font-black text-foreground text-base">{record.plannedQuantity.toLocaleString()}</span>
        </div>
        <span className="text-[10px] text-muted-foreground font-medium">Units</span>
      </div>

      {/* Badge 2: Actual Quantity */}
      <div className="bg-card border border-border rounded-lg p-3 shadow-sm flex flex-col justify-between">
        <span className="text-[10px] text-muted-foreground font-semibold uppercase block">Actual Quantity</span>
        <div className="flex items-center gap-2 my-1">
          <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
            <Users className="w-4 h-4" />
          </div>
          <span className="font-black text-emerald-600 dark:text-emerald-400 text-base">{record.actualQuantity.toLocaleString()}</span>
        </div>
        <span className="text-[10px] text-muted-foreground font-medium">Units</span>
      </div>

      {/* Badge 3: OEE */}
      <div className="bg-card border border-border rounded-lg p-3 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] text-muted-foreground font-semibold uppercase block">OEE</span>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">Good</span>
        </div>
        {renderGaugeRing(record.oee, "#8b5cf6")}
      </div>

      {/* Badge 4: FPY */}
      <div className="bg-card border border-border rounded-lg p-3 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] text-muted-foreground font-semibold uppercase block">FPY</span>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">Good</span>
        </div>
        {renderGaugeRing(record.fpy, "#10b981")}
      </div>

      {/* Badge 5: Defect Rate */}
      <div className="bg-card border border-border rounded-lg p-3 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] text-muted-foreground font-semibold uppercase block">Defect Rate</span>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-1 block">Low</span>
        </div>
        {renderGaugeRing(record.defectRate * 10, "#ef4444")}
      </div>

      {/* Badge 6: Overall Pilot Readiness */}
      <div className="bg-card border border-border rounded-lg p-3 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] text-muted-foreground font-semibold uppercase block">Overall Readiness</span>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">Good</span>
        </div>
        <div className="relative flex items-center justify-center w-11 h-11">
          <svg className="w-11 h-11 transform -rotate-90">
            <circle cx="22" cy="22" r="18" stroke="currentColor" strokeWidth="3.5" className="text-muted/30" fill="transparent" />
            <circle
              cx="22"
              cy="22"
              r="18"
              stroke="#3b82f6"
              strokeWidth="3.5"
              strokeDasharray={2 * Math.PI * 18}
              strokeDashoffset={2 * Math.PI * 18 - (record.overallPilotReadiness / 100) * 2 * Math.PI * 18}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <span className="absolute text-[10px] font-extrabold text-foreground">{record.overallPilotReadiness}</span>
        </div>
      </div>

      {/* Badge 7: AI Production Health */}
      <div className="bg-card border border-border rounded-lg p-3 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] text-muted-foreground font-semibold uppercase block">AI Health Score</span>
          <span className="text-xs font-bold text-purple-600 dark:text-purple-400 mt-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Good
          </span>
        </div>
        <div className="relative flex items-center justify-center w-11 h-11">
          <svg className="w-11 h-11 transform -rotate-90">
            <circle cx="22" cy="22" r="18" stroke="currentColor" strokeWidth="3.5" className="text-muted/30" fill="transparent" />
            <circle
              cx="22"
              cy="22"
              r="18"
              stroke="#8b5cf6"
              strokeWidth="3.5"
              strokeDasharray={2 * Math.PI * 18}
              strokeDashoffset={2 * Math.PI * 18 - (record.aiAssessment.healthScore / 100) * 2 * Math.PI * 18}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <span className="absolute text-[10px] font-extrabold text-foreground">{record.aiAssessment.healthScore}</span>
        </div>
      </div>
    </div>
  );
};
