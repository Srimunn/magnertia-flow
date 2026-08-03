import React from "react";
import { SignalHigh } from "lucide-react";
import type { ManufacturingExcellenceRecord } from "@/services/types";

interface ExcellenceTopBadgesProps {
  record: ManufacturingExcellenceRecord;
}

export const ExcellenceTopBadges: React.FC<ExcellenceTopBadgesProps> = ({ record }) => {
  const renderGaugeRing = (value: number, color: string) => {
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
      <div className="relative flex h-11 w-11 items-center justify-center">
        <svg className="h-11 w-11 transform -rotate-90">
          <circle
            cx="22"
            cy="22"
            r={radius}
            stroke="currentColor"
            strokeWidth="3.5"
            className="text-muted/30"
            fill="transparent"
          />
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
        <span className="absolute text-[10px] font-extrabold text-foreground">{value}</span>
      </div>
    );
  };

  const getScoreRating = (val: number) => {
    if (val >= 90) return { text: "Excellent", color: "text-emerald-600 dark:text-emerald-400" };
    if (val >= 80) return { text: "Very Good", color: "text-blue-600 dark:text-blue-400" };
    if (val >= 70) return { text: "Good", color: "text-indigo-600 dark:text-indigo-400" };
    if (val >= 60) return { text: "Moderate", color: "text-amber-600 dark:text-amber-400" };
    return { text: "Needs Work", color: "text-rose-600 dark:text-rose-400" };
  };

  return (
    <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4 lg:grid-cols-7">
      {/* Badge 1: Overall Excellence */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md">
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Overall Excellence
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-black text-foreground">{record.overallManufacturingExcellenceScore}</span>
            <span className="text-[10px] text-muted-foreground">/100</span>
          </div>
          <span className={`mt-0.5 block text-[10px] font-semibold ${getScoreRating(record.overallManufacturingExcellenceScore).color}`}>
            {getScoreRating(record.overallManufacturingExcellenceScore).text}
          </span>
        </div>
        {renderGaugeRing(record.overallManufacturingExcellenceScore, "#10b981")}
      </div>

      {/* Badge 2: Operational Score */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md">
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Operational
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-black text-foreground">{record.operationalExcellenceScore}</span>
            <span className="text-[10px] text-muted-foreground">/100</span>
          </div>
          <span className={`mt-0.5 block text-[10px] font-semibold ${getScoreRating(record.operationalExcellenceScore).color}`}>
            {getScoreRating(record.operationalExcellenceScore).text}
          </span>
        </div>
        {renderGaugeRing(record.operationalExcellenceScore, "#3b82f6")}
      </div>

      {/* Badge 3: Digital Score */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md">
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Digital Score
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-black text-foreground">{record.digitalExcellenceScore}</span>
            <span className="text-[10px] text-muted-foreground">/100</span>
          </div>
          <span className={`mt-0.5 block text-[10px] font-semibold ${getScoreRating(record.digitalExcellenceScore).color}`}>
            {getScoreRating(record.digitalExcellenceScore).text}
          </span>
        </div>
        {renderGaugeRing(record.digitalExcellenceScore, "#8b5cf6")}
      </div>

      {/* Badge 4: Quality Score */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md">
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Quality Score
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-black text-foreground">{record.qualityExcellenceScore}</span>
            <span className="text-[10px] text-muted-foreground">/100</span>
          </div>
          <span className={`mt-0.5 block text-[10px] font-semibold ${getScoreRating(record.qualityExcellenceScore).color}`}>
            {getScoreRating(record.qualityExcellenceScore).text}
          </span>
        </div>
        {renderGaugeRing(record.qualityExcellenceScore, "#06b6d4")}
      </div>

      {/* Badge 5: Sustainability Score */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md">
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Sustainability
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-black text-foreground">{record.sustainabilityScore}</span>
            <span className="text-[10px] text-muted-foreground">/100</span>
          </div>
          <span className={`mt-0.5 block text-[10px] font-semibold ${getScoreRating(record.sustainabilityScore).color}`}>
            {getScoreRating(record.sustainabilityScore).text}
          </span>
        </div>
        {renderGaugeRing(record.sustainabilityScore, "#10b981")}
      </div>

      {/* Badge 6: AI Score */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md">
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            AI Score
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-black text-foreground">{record.aiExcellenceScore}</span>
            <span className="text-[10px] text-muted-foreground">/100</span>
          </div>
          <span className={`mt-0.5 block text-[10px] font-semibold ${getScoreRating(record.aiExcellenceScore).color}`}>
            {getScoreRating(record.aiExcellenceScore).text}
          </span>
        </div>
        {renderGaugeRing(record.aiExcellenceScore, "#f59e0b")}
      </div>

      {/* Badge 7: Industry 4.0 Maturity */}
      <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md">
        <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Industry 4.0 Maturity
        </span>
        <div className="my-1 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400">
            <SignalHigh className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs font-black text-foreground">Level 4</span>
            <span className="block text-[10px] font-semibold text-teal-600 dark:text-teal-400">
              Intelligent
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
