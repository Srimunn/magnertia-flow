import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Award, CheckCircle } from "lucide-react";
import type { ExcellenceRecommendation, ManufacturingExcellenceRecord } from "@/services/types";

interface ExcellenceSummaryCardProps {
  record: ManufacturingExcellenceRecord;
  onChange: (field: keyof ManufacturingExcellenceRecord, value: any) => void;
  isEditing?: boolean;
}

const RECOMMENDATIONS: ExcellenceRecommendation[] = [
  "Approve Excellence Initiative",
  "Improve Operational Performance",
  "Expand Lean Implementation",
  "Increase Automation Coverage",
  "Enhance AI Analytics",
  "Strengthen ESG Performance",
  "Continue Continuous Improvement",
];

export const ExcellenceSummaryCard: React.FC<ExcellenceSummaryCardProps> = ({
  record,
  onChange,
  isEditing = true,
}) => {
  const MaicwBadge = ({ type, tooltip }: { type: "M" | "A" | "I" | "C" | "W"; tooltip: string }) => {
    const colors = {
      M: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-200",
      A: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200",
      I: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200",
      C: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200",
      W: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200",
    };
    return (
      <span
        title={tooltip}
        className={`ml-1.5 inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-extrabold uppercase border ${colors[type]}`}
      >
        {type}
      </span>
    );
  };

  const scores = [
    { label: "Operational Score", value: record.operationalExcellenceScore, color: "bg-blue-500", type: "C" as const },
    { label: "Digital Score", value: record.digitalExcellenceScore, color: "bg-purple-500", type: "A" as const },
    { label: "Quality Score", value: record.qualityExcellenceScore, color: "bg-cyan-500", type: "C" as const },
    { label: "Sustainability Score", value: record.sustainabilityScore, color: "bg-emerald-500", type: "C" as const },
    { label: "AI Score", value: record.aiExcellenceScore, color: "bg-amber-500", type: "A" as const },
  ];

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="border-b border-border/60 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-bold text-foreground">
              8. Manufacturing Excellence Summary
            </CardTitle>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Overall Excellence Score:</span>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
              {record.overallManufacturingExcellenceScore} / 100
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 pt-4">
        {/* Score Breakdown Bars */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {scores.map((sc) => (
            <div key={sc.label} className="flex flex-col gap-1 rounded-lg border border-border/60 bg-muted/20 p-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-foreground">
                  {sc.label}
                  <MaicwBadge type={sc.type} tooltip={sc.type === "C" ? "Calculated Score" : "Auto-generated Score"} />
                </span>
                <span className="font-bold text-foreground">{sc.value} / 100</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className={`h-full ${sc.color} transition-all duration-500`} style={{ width: `${sc.value}%` }} />
              </div>
            </div>
          ))}

          {/* Overall score big gauge card */}
          <div className="flex flex-col items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 text-center dark:border-emerald-900/50 dark:bg-emerald-950/20">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Overall Manufacturing Excellence Score
              <MaicwBadge type="C" tooltip="Calculated Score" />
            </span>
            <div className="my-1 text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {record.overallManufacturingExcellenceScore} <span className="text-sm font-normal text-muted-foreground">/ 100</span>
            </div>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              Status: Very Good — Ready for Enterprise Deployment
            </span>
          </div>
        </div>

        {/* Recommendation Dropdown */}
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3">
          <label className="text-xs font-semibold text-foreground">
            Recommendation
            <MaicwBadge type="W" tooltip="Workflow Recommendation Dropdown" />
          </label>
          {isEditing ? (
            <Select
              value={record.recommendation}
              onValueChange={(val) => onChange("recommendation", val as ExcellenceRecommendation)}
            >
              <SelectTrigger className="h-9 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                <SelectValue placeholder="Select Recommendation" />
              </SelectTrigger>
              <SelectContent>
                {RECOMMENDATIONS.map((rec) => (
                  <SelectItem key={rec} value={rec} className="text-xs">
                    {rec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-xs font-bold text-white">
              <CheckCircle className="h-4 w-4" />
              <span>{record.recommendation}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
