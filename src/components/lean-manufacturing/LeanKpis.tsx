import React from "react";
import { getWasteSeverityColorBand } from "@/lib/lean-manufacturing/scoring";

interface LeanKpisProps {
  wasteSeverityScore: number;
  processEfficiencyScore: number;
  operationalScore: number;
  continuousImprovementScore: number;
  aiLeanHealthScore: number;
  overallLeanReadiness: number;
}

export const LeanKpis: React.FC<LeanKpisProps> = ({
  wasteSeverityScore,
  processEfficiencyScore,
  operationalScore,
  continuousImprovementScore,
  aiLeanHealthScore,
  overallLeanReadiness,
}) => {
  const wasteBand = getWasteSeverityColorBand(wasteSeverityScore);

  const getStandardBand = (score: number) => {
    if (score >= 85) return { label: "Excellent", colorClass: "text-purple-700 bg-purple-100 dark:bg-purple-950 dark:text-purple-300", ringColor: "#9333ea" };
    if (score >= 80) return { label: "Very Good", colorClass: "text-blue-700 bg-blue-100 dark:bg-blue-950 dark:text-blue-300", ringColor: "#2563eb" };
    if (score >= 70) return { label: "Good", colorClass: "text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300", ringColor: "#10b981" };
    return { label: "Fair", colorClass: "text-amber-700 bg-amber-100 dark:bg-amber-950 dark:text-amber-300", ringColor: "#f59e0b" };
  };

  const renderDonut = (value: number, strokeColor: string) => {
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. Waste Severity Score (INVERTED POLARITY) */}
      <div className="bg-card text-card-foreground p-3 rounded-lg border border-border/70 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Waste Severity
            </span>
            <span className="text-[8px] font-extrabold px-1 rounded bg-rose-100 text-rose-800">
              Low=Good
            </span>
          </div>
          <span className="text-lg font-black text-foreground">{wasteSeverityScore}/100</span>
          <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${wasteBand.colorClass}`}>
            {wasteBand.label}
          </span>
        </div>
        {renderDonut(wasteSeverityScore, wasteBand.ringColor)}
      </div>

      {/* 2. Process Efficiency Score */}
      <div className="bg-card text-card-foreground p-3 rounded-lg border border-border/70 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            Process Efficiency
          </span>
          <span className="text-lg font-black text-foreground">{processEfficiencyScore}/100</span>
          <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${getStandardBand(processEfficiencyScore).colorClass}`}>
            {getStandardBand(processEfficiencyScore).label}
          </span>
        </div>
        {renderDonut(processEfficiencyScore, getStandardBand(processEfficiencyScore).ringColor)}
      </div>

      {/* 3. Operational Score */}
      <div className="bg-card text-card-foreground p-3 rounded-lg border border-border/70 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            Operational Score
          </span>
          <span className="text-lg font-black text-foreground">{operationalScore}/100</span>
          <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${getStandardBand(operationalScore).colorClass}`}>
            {getStandardBand(operationalScore).label}
          </span>
        </div>
        {renderDonut(operationalScore, getStandardBand(operationalScore).ringColor)}
      </div>

      {/* 4. Continuous Improvement Score */}
      <div className="bg-card text-card-foreground p-3 rounded-lg border border-border/70 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            Continuous Impr.
          </span>
          <span className="text-lg font-black text-foreground">{continuousImprovementScore}/100</span>
          <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${getStandardBand(continuousImprovementScore).colorClass}`}>
            {getStandardBand(continuousImprovementScore).label}
          </span>
        </div>
        {renderDonut(continuousImprovementScore, getStandardBand(continuousImprovementScore).ringColor)}
      </div>

      {/* 5. AI Lean Health Score */}
      <div className="bg-card text-card-foreground p-3 rounded-lg border border-border/70 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            AI Lean Health
          </span>
          <span className="text-lg font-black text-foreground">{aiLeanHealthScore}/100</span>
          <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${getStandardBand(aiLeanHealthScore).colorClass}`}>
            {getStandardBand(aiLeanHealthScore).label}
          </span>
        </div>
        {renderDonut(aiLeanHealthScore, getStandardBand(aiLeanHealthScore).ringColor)}
      </div>

      {/* 6. Overall Lean Readiness */}
      <div className="bg-card text-card-foreground p-3 rounded-lg border border-border/70 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            Overall Lean
          </span>
          <span className="text-lg font-black text-foreground">{overallLeanReadiness}/100</span>
          <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${getStandardBand(overallLeanReadiness).colorClass}`}>
            {getStandardBand(overallLeanReadiness).label}
          </span>
        </div>
        {renderDonut(overallLeanReadiness, getStandardBand(overallLeanReadiness).ringColor)}
      </div>
    </div>
  );
};
