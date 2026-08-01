import React from "react";
import {
  Activity,
  CheckCircle2,
  ShieldCheck,
  Award,
  Sparkles,
} from "lucide-react";
import type { ProcessValidationRecord } from "@/services/types";

interface ProcessValidationTopBadgesProps {
  record: ProcessValidationRecord;
}

export const ProcessValidationTopBadges: React.FC<ProcessValidationTopBadgesProps> = ({
  record,
}) => {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const score = record.overallValidationReadiness;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
      {/* Badge 1: Validation Status */}
      <div className="bg-card border border-border rounded-lg p-3 shadow-sm flex flex-col justify-between">
        <span className="text-[10px] text-muted-foreground font-semibold uppercase block">Validation Status</span>
        <div className="flex items-center gap-2 my-1">
          <Activity className="w-5 h-5 text-blue-500 shrink-0" />
          <span className="font-extrabold text-foreground text-sm">{record.validationStatus}</span>
        </div>
        <span className="text-[10px] text-muted-foreground font-medium">65% Completed</span>
      </div>

      {/* Badge 2: Capability Status */}
      <div className="bg-card border border-border rounded-lg p-3 shadow-sm flex flex-col justify-between">
        <span className="text-[10px] text-muted-foreground font-semibold uppercase block">Capability Status</span>
        <div className="flex items-center gap-2 my-1">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">{record.capabilityStatus}</span>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono font-medium">Cp: {record.cp} | Cpk: {record.cpk}</span>
      </div>

      {/* Badge 3: Quality Status */}
      <div className="bg-card border border-border rounded-lg p-3 shadow-sm flex flex-col justify-between">
        <span className="text-[10px] text-muted-foreground font-semibold uppercase block">Quality Status</span>
        <div className="flex items-center gap-2 my-1">
          <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
          <span className="font-extrabold text-foreground text-sm">Good</span>
        </div>
        <span className="text-[10px] text-muted-foreground font-medium">Defect Rate: {record.defectRate}%</span>
      </div>

      {/* Badge 4: Readiness Status */}
      <div className="bg-card border border-border rounded-lg p-3 shadow-sm flex flex-col justify-between">
        <span className="text-[10px] text-muted-foreground font-semibold uppercase block">Readiness Status</span>
        <div className="flex items-center gap-2 my-1">
          <Award className="w-5 h-5 text-emerald-500 shrink-0" />
          <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs">Production Ready</span>
        </div>
        <span className="text-[10px] text-muted-foreground font-medium">Overall Readiness: {score}/100</span>
      </div>

      {/* Badge 5: AI Health Score */}
      <div className="bg-card border border-border rounded-lg p-3 shadow-sm flex flex-col justify-between">
        <span className="text-[10px] text-muted-foreground font-semibold uppercase block">AI Health Score</span>
        <div className="flex items-center gap-2 my-1">
          <Sparkles className="w-5 h-5 text-purple-500 shrink-0" />
          <span className="font-black text-purple-600 dark:text-purple-400 text-base">{record.aiAssessment.healthScore} <span className="text-xs font-semibold text-muted-foreground">/100</span></span>
        </div>
        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Good</span>
      </div>

      {/* Badge 6: Overall Validation Score Ring Gauge */}
      <div className="bg-card border border-border rounded-lg p-2.5 shadow-sm flex items-center justify-around">
        <div className="relative flex items-center justify-center w-14 h-14">
          <svg className="w-14 h-14 transform -rotate-90">
            <circle cx="28" cy="28" r={radius} stroke="currentColor" strokeWidth="4" className="text-muted/30" fill="transparent" />
            <circle
              cx="28"
              cy="28"
              r={radius}
              stroke="#059669"
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-sm font-black text-foreground">{score}</span>
            <span className="text-[8px] font-bold text-muted-foreground">/100</span>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground font-semibold uppercase">Overall Score</span>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Good</span>
        </div>
      </div>
    </div>
  );
};
