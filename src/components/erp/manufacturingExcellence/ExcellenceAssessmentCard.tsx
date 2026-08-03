import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Gauge } from "lucide-react";
import type { ManufacturingExcellenceRecord } from "@/services/types";

interface ExcellenceAssessmentCardProps {
  record: ManufacturingExcellenceRecord;
  onChange: (field: keyof ManufacturingExcellenceRecord, value: any) => void;
  isEditing?: boolean;
}

export const ExcellenceAssessmentCard: React.FC<ExcellenceAssessmentCardProps> = ({
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

  const scoreFields = [
    { key: "productivityIndex", label: "Productivity Index", val: record.productivityIndex, unit: "/ 100" },
    { key: "qualityPerformance", label: "Quality Performance", val: record.qualityPerformance, unit: "/ 100" },
    { key: "deliveryPerformance", label: "Delivery Performance", val: record.deliveryPerformance, unit: "/ 100" },
    { key: "costEfficiency", label: "Cost Efficiency", val: record.costEfficiency, unit: "/ 100" },
    { key: "safetyPerformance", label: "Safety Performance", val: record.safetyPerformance, unit: "/ 100" },
    { key: "sustainabilityAssessmentScore", label: "Sustainability Score", val: record.sustainabilityAssessmentScore, unit: "/ 100" },
  ] as const;

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="border-b border-border/60 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-base font-bold text-foreground">
              2. Operational Excellence Assessment
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Operational Score:</span>
            <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-extrabold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              {record.operationalExcellenceScore} / 100
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-2 lg:grid-cols-4">
        {/* OEE (%) */}
        <div className="flex flex-col gap-1.5 rounded-lg border border-blue-200 bg-blue-50/50 p-3 dark:border-blue-900/50 dark:bg-blue-950/20 lg:col-span-2">
          <label className="text-xs font-bold text-foreground">
            OEE (%)
            <MaicwBadge type="C" tooltip="Calculated OEE Percentage" />
          </label>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{record.oeePercentage}%</span>
            <span className="text-xs font-semibold text-muted-foreground">Target: 85.00%</span>
          </div>
        </div>

        {/* Operational Score Summary Badge */}
        <div className="flex flex-col gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/20 lg:col-span-2">
          <label className="text-xs font-bold text-foreground">
            Operational Excellence Score
            <MaicwBadge type="C" tooltip="Calculated Score" />
          </label>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{record.operationalExcellenceScore}</span>
            <span className="text-xs font-semibold text-muted-foreground">/ 100 (Very Good)</span>
          </div>
        </div>

        {/* Score Inputs / Displays */}
        {scoreFields.map((sc) => (
          <div key={sc.key} className="flex flex-col gap-1.5 rounded-lg border border-border bg-muted/20 p-2.5">
            <label className="text-xs font-semibold text-foreground">
              {sc.label}
              <MaicwBadge type="C" tooltip="Calculated Score" />
            </label>
            {isEditing ? (
              <div className="flex items-center gap-1.5">
                <Input
                  type="number"
                  value={sc.val}
                  onChange={(e) => onChange(sc.key as keyof ManufacturingExcellenceRecord, parseFloat(e.target.value) || 0)}
                  className="h-8 text-xs font-bold"
                />
                <span className="text-xs font-semibold text-muted-foreground">{sc.unit}</span>
              </div>
            ) : (
              <span className="text-xs font-bold text-foreground">{sc.val} {sc.unit}</span>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
