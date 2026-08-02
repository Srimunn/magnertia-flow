import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShieldCheck } from "lucide-react";
import type { CapaStatus, ManufacturingExcellenceRecord } from "@/services/types";

interface ExcellenceQualityCardProps {
  record: ManufacturingExcellenceRecord;
  onChange: (field: keyof ManufacturingExcellenceRecord, value: any) => void;
  isEditing?: boolean;
}

const CAPA_STATUSES: CapaStatus[] = [
  "Open",
  "In Progress",
  "Verified",
  "Closed",
  "Overdue",
];

export const ExcellenceQualityCard: React.FC<ExcellenceQualityCardProps> = ({
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
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            <CardTitle className="text-base font-bold text-foreground">
              5. Quality & Compliance
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Quality Score:</span>
            <span className="rounded-md bg-cyan-100 px-2 py-0.5 text-xs font-extrabold text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
              {record.qualityExcellenceScore} / 100
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Customer PPM */}
        <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-muted/20 p-2.5">
          <label className="text-xs font-semibold text-foreground">
            Customer PPM
            <MaicwBadge type="C" tooltip="Calculated Parts Per Million" />
          </label>
          {isEditing ? (
            <Input
              type="number"
              value={record.customerPpm}
              onChange={(e) => onChange("customerPpm", parseFloat(e.target.value) || 0)}
              className="h-8 text-xs font-bold text-rose-600"
            />
          ) : (
            <span className="text-xs font-bold text-rose-600">{record.customerPpm} PPM</span>
          )}
        </div>

        {/* First Pass Yield (FPY) */}
        <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-muted/20 p-2.5">
          <label className="text-xs font-semibold text-foreground">
            First Pass Yield (FPY %)
            <MaicwBadge type="C" tooltip="Calculated Yield Percentage" />
          </label>
          {isEditing ? (
            <Input
              type="number"
              step="0.01"
              value={record.firstPassYield}
              onChange={(e) => onChange("firstPassYield", parseFloat(e.target.value) || 0)}
              className="h-8 text-xs font-bold text-emerald-600"
            />
          ) : (
            <span className="text-xs font-bold text-emerald-600">{record.firstPassYield}%</span>
          )}
        </div>

        {/* Process Capability (Cp/Cpk) */}
        <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-muted/20 p-2.5">
          <label className="text-xs font-semibold text-foreground">
            Process Capability (Cp/Cpk)
            <MaicwBadge type="C" tooltip="Calculated Capability Indices" />
          </label>
          {isEditing ? (
            <Input
              value={record.processCapabilityCpk}
              onChange={(e) => onChange("processCapabilityCpk", e.target.value)}
              className="h-8 text-xs font-bold text-foreground"
            />
          ) : (
            <span className="text-xs font-bold text-foreground">{record.processCapabilityCpk}</span>
          )}
        </div>

        {/* CAPA Status */}
        <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-muted/20 p-2.5">
          <label className="text-xs font-semibold text-foreground">
            CAPA Status
            <MaicwBadge type="W" tooltip="Workflow CAPA Status" />
          </label>
          {isEditing ? (
            <Select
              value={record.capaStatus}
              onValueChange={(val) => onChange("capaStatus", val as CapaStatus)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                {CAPA_STATUSES.map((st) => (
                  <SelectItem key={st} value={st} className="text-xs">
                    {st}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="text-xs font-bold text-foreground">{record.capaStatus}</span>
          )}
        </div>

        {/* Audit Compliance */}
        <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-muted/20 p-2.5">
          <label className="text-xs font-semibold text-foreground">
            Audit Compliance (%)
            <MaicwBadge type="C" tooltip="Calculated Audit Score" />
          </label>
          {isEditing ? (
            <Input
              type="number"
              step="0.01"
              value={record.auditCompliance}
              onChange={(e) => onChange("auditCompliance", parseFloat(e.target.value) || 0)}
              className="h-8 text-xs font-bold text-blue-600"
            />
          ) : (
            <span className="text-xs font-bold text-blue-600">{record.auditCompliance}%</span>
          )}
        </div>

        {/* Regulatory Compliance Checkbox */}
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
          <span className="text-xs font-semibold text-foreground">
            Regulatory Compliance
            <MaicwBadge type="W" tooltip="Workflow Checkbox" />
          </span>
          <Checkbox
            checked={record.regulatoryCompliance}
            onCheckedChange={(checked) => onChange("regulatoryCompliance", !!checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
};
