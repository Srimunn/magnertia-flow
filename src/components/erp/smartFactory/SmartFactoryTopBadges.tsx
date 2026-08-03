import React from "react";
import { Cpu, SignalHigh } from "lucide-react";
import type { SmartFactoryDevelopmentRecord } from "@/services/types";

interface SmartFactoryTopBadgesProps {
  record: SmartFactoryDevelopmentRecord;
}

export const SmartFactoryTopBadges: React.FC<SmartFactoryTopBadgesProps> = ({
  record,
}) => {
  const renderGaugeRing = (value: number, color: string, label: string) => {
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
      {/* Badge 1: Overall Readiness */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md">
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Overall Readiness
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-black text-foreground">{record.overallSmartFactoryReadiness}</span>
            <span className="text-[10px] text-muted-foreground">/100</span>
          </div>
          <span className={`mt-0.5 block text-[10px] font-semibold ${getScoreRating(record.overallSmartFactoryReadiness).color}`}>
            {getScoreRating(record.overallSmartFactoryReadiness).text}
          </span>
        </div>
        {renderGaugeRing(record.overallSmartFactoryReadiness, "#3b82f6", "Overall")}
      </div>

      {/* Badge 2: Infrastructure Score */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md">
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Infrastructure
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-black text-foreground">{record.infrastructureReadinessScore}</span>
            <span className="text-[10px] text-muted-foreground">/100</span>
          </div>
          <span className={`mt-0.5 block text-[10px] font-semibold ${getScoreRating(record.infrastructureReadinessScore).color}`}>
            {getScoreRating(record.infrastructureReadinessScore).text}
          </span>
        </div>
        {renderGaugeRing(record.infrastructureReadinessScore, "#10b981", "Infra")}
      </div>

      {/* Badge 3: Integration Score */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md">
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Integration
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-black text-foreground">{record.integrationScore}</span>
            <span className="text-[10px] text-muted-foreground">/100</span>
          </div>
          <span className={`mt-0.5 block text-[10px] font-semibold ${getScoreRating(record.integrationScore).color}`}>
            {getScoreRating(record.integrationScore).text}
          </span>
        </div>
        {renderGaugeRing(record.integrationScore, "#8b5cf6", "Systems")}
      </div>

      {/* Badge 4: Automation Score */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md">
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Automation
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-black text-foreground">{record.automationScore}</span>
            <span className="text-[10px] text-muted-foreground">/100</span>
          </div>
          <span className={`mt-0.5 block text-[10px] font-semibold ${getScoreRating(record.automationScore).color}`}>
            {getScoreRating(record.automationScore).text}
          </span>
        </div>
        {renderGaugeRing(record.automationScore, "#f59e0b", "Automation")}
      </div>

      {/* Badge 5: Operational Score */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md">
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Operational
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-black text-foreground">{record.operationalScore}</span>
            <span className="text-[10px] text-muted-foreground">/100</span>
          </div>
          <span className={`mt-0.5 block text-[10px] font-semibold ${getScoreRating(record.operationalScore).color}`}>
            {getScoreRating(record.operationalScore).text}
          </span>
        </div>
        {renderGaugeRing(record.operationalScore, "#06b6d4", "Operations")}
      </div>

      {/* Badge 6: AI Score */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md">
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            AI Score
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-black text-foreground">{record.aiReadinessScore}</span>
            <span className="text-[10px] text-muted-foreground">/100</span>
          </div>
          <span className={`mt-0.5 block text-[10px] font-semibold ${getScoreRating(record.aiReadinessScore).color}`}>
            {getScoreRating(record.aiReadinessScore).text}
          </span>
        </div>
        {renderGaugeRing(record.aiReadinessScore, "#ec4899", "AI")}
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
              {record.industry40Maturity}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
