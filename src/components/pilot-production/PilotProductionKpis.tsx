import React from "react";
import { Package, Box, CheckCircle2, TrendingUp, AlertTriangle, ShieldCheck, Cpu } from "lucide-react";
import { getDefectRateSemantic } from "@/lib/pilot-production/scoring";

interface PilotProductionKpisProps {
  plannedQuantity: number;
  actualQuantity: number;
  oee: number;
  fpy: number;
  defectRate: number;
  overallReadiness: number;
  aiHealthScore: number;
}

export const PilotProductionKpis: React.FC<PilotProductionKpisProps> = ({
  plannedQuantity,
  actualQuantity,
  oee,
  fpy,
  defectRate,
  overallReadiness,
  aiHealthScore,
}) => {
  const defectSemantic = getDefectRateSemantic(defectRate);

  // SVG Ring Helper
  const renderDonut = (value: number, colorClass: string, strokeColor: string) => {
    const radius = 22;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
      <div className="relative w-14 h-14 flex items-center justify-center">
        <svg className="w-14 h-14 transform -rotate-90">
          <circle
            cx="28"
            cy="28"
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            className="text-muted/20"
            fill="transparent"
          />
          <circle
            cx="28"
            cy="28"
            r={radius}
            stroke={strokeColor}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
        <span className="absolute text-[11px] font-bold text-foreground">{value}%</span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
      {/* 1. Planned Quantity */}
      <div className="bg-card text-card-foreground p-3 rounded-lg border border-border/70 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Planned Qty</span>
          <Box className="w-4 h-4 text-blue-500" />
        </div>
        <div className="mt-2">
          <span className="text-xl font-extrabold text-foreground">{plannedQuantity.toLocaleString()}</span>
          <span className="text-[10px] text-muted-foreground ml-1">Units</span>
        </div>
      </div>

      {/* 2. Actual Quantity */}
      <div className="bg-card text-card-foreground p-3 rounded-lg border border-border/70 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Actual Qty</span>
          <Package className="w-4 h-4 text-indigo-500" />
        </div>
        <div className="mt-2">
          <span className="text-xl font-extrabold text-foreground">{actualQuantity.toLocaleString()}</span>
          <span className="text-[10px] text-muted-foreground ml-1">Units</span>
        </div>
      </div>

      {/* 3. OEE */}
      <div className="bg-card text-card-foreground p-3 rounded-lg border border-border/70 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-muted-foreground uppercase block">OEE</span>
          <span className="text-lg font-extrabold text-foreground">{oee}%</span>
          <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
            Good
          </span>
        </div>
        {renderDonut(oee, "text-purple-600", "#9333ea")}
      </div>

      {/* 4. FPY */}
      <div className="bg-card text-card-foreground p-3 rounded-lg border border-border/70 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-muted-foreground uppercase block">FPY</span>
          <span className="text-lg font-extrabold text-foreground">{fpy}%</span>
          <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
            Good
          </span>
        </div>
        {renderDonut(fpy, "text-emerald-600", "#10b981")}
      </div>

      {/* 5. Defect Rate (Low = Good, red ring + green semantic label) */}
      <div className="bg-card text-card-foreground p-3 rounded-lg border border-border/70 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-muted-foreground uppercase block">Defect Rate</span>
          <span className="text-lg font-extrabold text-foreground">{defectRate}%</span>
          <span
            className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${defectSemantic.badgeClass}`}
          >
            {defectSemantic.label}
          </span>
        </div>
        {renderDonut(defectRate * 10, "text-rose-600", "#f43f5e")}
      </div>

      {/* 6. Overall Pilot Readiness */}
      <div className="bg-card text-card-foreground p-3 rounded-lg border border-border/70 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-muted-foreground uppercase block">Overall Readiness</span>
          <span className="text-lg font-extrabold text-foreground">{overallReadiness}/100</span>
          <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
            Good
          </span>
        </div>
        {renderDonut(overallReadiness, "text-blue-600", "#2563eb")}
      </div>

      {/* 7. AI Production Health */}
      <div className="bg-card text-card-foreground p-3 rounded-lg border border-border/70 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-muted-foreground uppercase block">AI Health</span>
          <span className="text-lg font-extrabold text-foreground">{aiHealthScore}/100</span>
          <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300">
            Good
          </span>
        </div>
        {renderDonut(aiHealthScore, "text-violet-600", "#7c3aed")}
      </div>
    </div>
  );
};
