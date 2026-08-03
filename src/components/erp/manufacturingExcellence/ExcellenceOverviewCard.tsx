import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  InitiativeCategory,
  InitiativeStatus,
  ManufacturingExcellenceRecord,
} from "@/services/types";

interface ExcellenceOverviewCardProps {
  record: ManufacturingExcellenceRecord;
  onChange: (field: keyof ManufacturingExcellenceRecord, value: any) => void;
  isEditing?: boolean;
}

const INITIATIVE_CATEGORIES: InitiativeCategory[] = [
  "Operational Excellence",
  "Lean Transformation",
  "Six Sigma",
  "Kaizen",
  "TPM",
  "Smart Manufacturing",
  "Industry 4.0",
  "Energy Excellence",
  "Sustainability",
  "Digital Transformation",
];

const INITIATIVE_STATUSES: InitiativeStatus[] = [
  "Proposed",
  "Assessment",
  "Planning",
  "Implementation",
  "Monitoring",
  "Validation",
  "Completed",
  "Closed",
];

export const ExcellenceOverviewCard: React.FC<ExcellenceOverviewCardProps> = ({
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

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="border-b border-border/60 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold text-foreground">
            1. Excellence Initiative Overview
          </CardTitle>
          <span className="text-xs font-semibold text-muted-foreground">MAICW Classification</span>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-2">
        {/* Initiative Category */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-xs font-semibold text-foreground">
            Initiative Category
            <MaicwBadge type="M" tooltip="Mandatory Dropdown" />
          </label>
          {isEditing ? (
            <Select
              value={record.initiativeCategory}
              onValueChange={(val) => onChange("initiativeCategory", val as InitiativeCategory)}
            >
              <SelectTrigger className="h-9 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {INITIATIVE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat} className="text-xs">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="inline-flex rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              {record.initiativeCategory}
            </span>
          )}
        </div>

        {/* Business Objective */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-xs font-semibold text-foreground">
            Business Objective
            <MaicwBadge type="M" tooltip="Mandatory Field" />
          </label>
          {isEditing ? (
            <Textarea
              rows={2}
              value={record.businessObjective}
              onChange={(e) => onChange("businessObjective", e.target.value)}
              placeholder="Outline quantifiable business objectives..."
              className="text-xs"
            />
          ) : (
            <p className="rounded-md bg-muted/40 p-2.5 text-xs text-foreground">{record.businessObjective}</p>
          )}
        </div>

        {/* Current Performance */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-foreground">
            Current Performance
            <MaicwBadge type="M" tooltip="Mandatory Field" />
          </label>
          {isEditing ? (
            <Textarea
              rows={2}
              value={record.currentPerformance}
              onChange={(e) => onChange("currentPerformance", e.target.value)}
              placeholder="Describe current baseline performance..."
              className="text-xs"
            />
          ) : (
            <p className="rounded-md bg-muted/40 p-2.5 text-xs text-foreground">{record.currentPerformance}</p>
          )}
        </div>

        {/* Target Performance */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-foreground">
            Target Performance
            <MaicwBadge type="M" tooltip="Mandatory Field" />
          </label>
          {isEditing ? (
            <Textarea
              rows={2}
              value={record.targetPerformance}
              onChange={(e) => onChange("targetPerformance", e.target.value)}
              placeholder="Describe target performance KPIs..."
              className="text-xs"
            />
          ) : (
            <p className="rounded-md bg-muted/40 p-2.5 text-xs text-foreground">{record.targetPerformance}</p>
          )}
        </div>

        {/* Improvement Strategy */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-xs font-semibold text-foreground">
            Improvement Strategy
            <MaicwBadge type="M" tooltip="Mandatory Field" />
          </label>
          {isEditing ? (
            <Textarea
              rows={2}
              value={record.improvementStrategy}
              onChange={(e) => onChange("improvementStrategy", e.target.value)}
              placeholder="Detail lean, six sigma, TPM and AI strategy..."
              className="text-xs"
            />
          ) : (
            <p className="rounded-md bg-muted/40 p-2.5 text-xs text-foreground">{record.improvementStrategy}</p>
          )}
        </div>

        {/* Expected Business Benefits */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-xs font-semibold text-foreground">
            Expected Business Benefits
            <MaicwBadge type="M" tooltip="Mandatory Field" />
          </label>
          {isEditing ? (
            <Textarea
              rows={2}
              value={record.expectedBusinessBenefits}
              onChange={(e) => onChange("expectedBusinessBenefits", e.target.value)}
              placeholder="Detail cost savings, quality gains, energy reduction..."
              className="text-xs"
            />
          ) : (
            <p className="rounded-md bg-muted/40 p-2.5 text-xs text-foreground">{record.expectedBusinessBenefits}</p>
          )}
        </div>

        {/* Priority */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-foreground">
            Priority
            <MaicwBadge type="M" tooltip="Mandatory Dropdown" />
          </label>
          {isEditing ? (
            <Select
              value={record.priority}
              onValueChange={(val) => onChange("priority", val)}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Select Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low" className="text-xs">Low</SelectItem>
                <SelectItem value="Medium" className="text-xs">Medium</SelectItem>
                <SelectItem value="High" className="text-xs">High</SelectItem>
                <SelectItem value="Critical" className="text-xs">Critical</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Badge variant="outline" className="w-fit">
              {record.priority}
            </Badge>
          )}
        </div>

        {/* Initiative Status */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-foreground">
            Initiative Status
            <MaicwBadge type="W" tooltip="Workflow Dropdown" />
          </label>
          {isEditing ? (
            <Select
              value={record.initiativeStatus}
              onValueChange={(val) => onChange("initiativeStatus", val as InitiativeStatus)}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                {INITIATIVE_STATUSES.map((st) => (
                  <SelectItem key={st} value={st} className="text-xs">
                    {st}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Badge className="w-fit bg-primary text-primary-foreground">
              {record.initiativeStatus}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
