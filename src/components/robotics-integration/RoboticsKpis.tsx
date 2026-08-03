import React from "react";

interface RoboticsKpisProps {
  overallRoboticsReadiness: number;
  cellReadinessScore: number;
  integrationScore: number;
  programmingScore: number;
  validationScore: number;
  commissioningScore: number;
  aiRoboticsHealthScore: number;
}

export const RoboticsKpis: React.FC<RoboticsKpisProps> = ({
  overallRoboticsReadiness,
  cellReadinessScore,
  integrationScore,
  programmingScore,
  validationScore,
  commissioningScore,
  aiRoboticsHealthScore,
}) => {
  const getStandardBand = (score: number) => {
    if (score >= 85) return { label: "Very Good", colorClass: "text-purple-700 bg-purple-100 dark:bg-purple-950 dark:text-purple-300", ringColor: "#9333ea" };
    if (score >= 80) return { label: "Very Good", colorClass: "text-blue-700 bg-blue-100 dark:bg-blue-950 dark:text-blue-300", ringColor: "#2563eb" };
    if (score >= 70) return { label: "Good", colorClass: "text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300", ringColor: "#10b981" };
    return { label: "Fair", colorClass: "text-amber-700 bg-amber-100 dark:bg-amber-950 dark:text-amber-300", ringColor: "#f59e0b" };
  };

  const renderDonut = (value: number, strokeColor: string, isAiHexagon = false) => {
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

        {isAiHexagon ? (
          /* Custom AI Hexagon Badge Treatment */
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-7 h-7 bg-emerald-600 dark:bg-emerald-500 rounded-md flex items-center justify-center shadow text-white font-black text-[11px] border border-white/20 transform rotate-45">
              <span className="transform -rotate-45">AI</span>
            </div>
          </div>
        ) : (
          <span className="absolute text-[11px] font-bold text-foreground">{value}%</span>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
      {/* 1. Overall Robotics Readiness */}
      <div className="bg-card text-card-foreground p-3 rounded-lg border border-border/70 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            Overall Readiness
          </span>
          <span className="text-lg font-black text-foreground">{overallRoboticsReadiness}/100</span>
          <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${getStandardBand(overallRoboticsReadiness).colorClass}`}>
            {getStandardBand(overallRoboticsReadiness).label}
          </span>
        </div>
        {renderDonut(overallRoboticsReadiness, "#10b981")}
      </div>

      {/* 2. Cell Readiness Score */}
      <div className="bg-card text-card-foreground p-3 rounded-lg border border-border/70 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            Cell Readiness
          </span>
          <span className="text-lg font-black text-foreground">{cellReadinessScore}/100</span>
          <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${getStandardBand(cellReadinessScore).colorClass}`}>
            {getStandardBand(cellReadinessScore).label}
          </span>
        </div>
        {renderDonut(cellReadinessScore, "#10b981")}
      </div>

      {/* 3. Integration Score */}
      <div className="bg-card text-card-foreground p-3 rounded-lg border border-border/70 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            Integration Score
          </span>
          <span className="text-lg font-black text-foreground">{integrationScore}/100</span>
          <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${getStandardBand(integrationScore).colorClass}`}>
            {getStandardBand(integrationScore).label}
          </span>
        </div>
        {renderDonut(integrationScore, "#2563eb")}
      </div>

      {/* 4. Programming Score */}
      <div className="bg-card text-card-foreground p-3 rounded-lg border border-border/70 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            Programming Score
          </span>
          <span className="text-lg font-black text-foreground">{programmingScore}/100</span>
          <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${getStandardBand(programmingScore).colorClass}`}>
            {getStandardBand(programmingScore).label}
          </span>
        </div>
        {renderDonut(programmingScore, "#9333ea")}
      </div>

      {/* 5. Validation Score */}
      <div className="bg-card text-card-foreground p-3 rounded-lg border border-border/70 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            Validation Score
          </span>
          <span className="text-lg font-black text-foreground">{validationScore}/100</span>
          <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${getStandardBand(validationScore).colorClass}`}>
            {getStandardBand(validationScore).label}
          </span>
        </div>
        {renderDonut(validationScore, "#10b981")}
      </div>

      {/* 6. Commissioning Score */}
      <div className="bg-card text-card-foreground p-3 rounded-lg border border-border/70 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            Commissioning Score
          </span>
          <span className="text-lg font-black text-foreground">{commissioningScore}/100</span>
          <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${getStandardBand(commissioningScore).colorClass}`}>
            {getStandardBand(commissioningScore).label}
          </span>
        </div>
        {renderDonut(commissioningScore, "#f97316")}
      </div>

      {/* 7. AI Robotics Health Score (AI HEXAGON TREATMENT) */}
      <div className="bg-card text-card-foreground p-3 rounded-lg border border-border/70 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            AI Robotics Health
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-foreground">{aiRoboticsHealthScore}</span>
            <span className="text-xs font-bold text-muted-foreground">/100</span>
          </div>
          <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${getStandardBand(aiRoboticsHealthScore).colorClass}`}>
            {getStandardBand(aiRoboticsHealthScore).label}
          </span>
        </div>
        {renderDonut(aiRoboticsHealthScore, "#10b981", true)}
      </div>
    </div>
  );
};
