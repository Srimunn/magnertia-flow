import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Leaf } from "lucide-react";
import type { ManufacturingExcellenceRecord } from "@/services/types";

interface ExcellenceSustainabilityCardProps {
  record: ManufacturingExcellenceRecord;
  onChange: (field: keyof ManufacturingExcellenceRecord, value: any) => void;
  isEditing?: boolean;
}

export const ExcellenceSustainabilityCard: React.FC<ExcellenceSustainabilityCardProps> = ({
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
            <Leaf className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <CardTitle className="text-base font-bold text-foreground">
              6. Sustainability & ESG
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Sustainability Score:</span>
            <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {record.sustainabilityScore} / 100
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Energy Consumption */}
        <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-muted/20 p-2.5">
          <label className="text-xs font-semibold text-foreground">
            Energy Consumption
            <MaicwBadge type="C" tooltip="Calculated Energy (MWh/Unit)" />
          </label>
          {isEditing ? (
            <div className="flex items-center gap-1.5">
              <Input
                type="number"
                step="0.01"
                value={record.energyConsumption}
                onChange={(e) => onChange("energyConsumption", parseFloat(e.target.value) || 0)}
                className="h-8 text-xs font-bold text-foreground"
              />
              <span className="text-xs font-semibold text-muted-foreground">MWh/Unit</span>
            </div>
          ) : (
            <span className="text-xs font-bold text-foreground">{record.energyConsumption} MWh/Unit</span>
          )}
        </div>

        {/* Carbon Emissions */}
        <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-muted/20 p-2.5">
          <label className="text-xs font-semibold text-foreground">
            Carbon Emissions
            <MaicwBadge type="C" tooltip="Calculated CO2 (tCO2e/Unit)" />
          </label>
          {isEditing ? (
            <div className="flex items-center gap-1.5">
              <Input
                type="number"
                step="0.01"
                value={record.carbonEmissions}
                onChange={(e) => onChange("carbonEmissions", parseFloat(e.target.value) || 0)}
                className="h-8 text-xs font-bold text-foreground"
              />
              <span className="text-xs font-semibold text-muted-foreground">tCO2e/Unit</span>
            </div>
          ) : (
            <span className="text-xs font-bold text-foreground">{record.carbonEmissions} tCO2e/Unit</span>
          )}
        </div>

        {/* Water Consumption */}
        <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-muted/20 p-2.5">
          <label className="text-xs font-semibold text-foreground">
            Water Consumption
            <MaicwBadge type="C" tooltip="Calculated Water (kL/Unit)" />
          </label>
          {isEditing ? (
            <div className="flex items-center gap-1.5">
              <Input
                type="number"
                step="0.01"
                value={record.waterConsumption}
                onChange={(e) => onChange("waterConsumption", parseFloat(e.target.value) || 0)}
                className="h-8 text-xs font-bold text-foreground"
              />
              <span className="text-xs font-semibold text-muted-foreground">kL/Unit</span>
            </div>
          ) : (
            <span className="text-xs font-bold text-foreground">{record.waterConsumption} kL/Unit</span>
          )}
        </div>

        {/* Waste Reduction */}
        <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-muted/20 p-2.5">
          <label className="text-xs font-semibold text-foreground">
            Waste Reduction (%)
            <MaicwBadge type="C" tooltip="Calculated Percentage" />
          </label>
          {isEditing ? (
            <Input
              type="number"
              step="0.01"
              value={record.wasteReduction}
              onChange={(e) => onChange("wasteReduction", parseFloat(e.target.value) || 0)}
              className="h-8 text-xs font-bold text-emerald-600"
            />
          ) : (
            <span className="text-xs font-bold text-emerald-600">{record.wasteReduction}%</span>
          )}
        </div>

        {/* Recycling Rate */}
        <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-muted/20 p-2.5">
          <label className="text-xs font-semibold text-foreground">
            Recycling Rate (%)
            <MaicwBadge type="C" tooltip="Calculated Percentage" />
          </label>
          {isEditing ? (
            <Input
              type="number"
              step="0.01"
              value={record.recyclingRate}
              onChange={(e) => onChange("recyclingRate", parseFloat(e.target.value) || 0)}
              className="h-8 text-xs font-bold text-emerald-600"
            />
          ) : (
            <span className="text-xs font-bold text-emerald-600">{record.recyclingRate}%</span>
          )}
        </div>

        {/* ESG Compliance Checkbox */}
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
          <span className="text-xs font-semibold text-foreground">
            ESG Compliance
            <MaicwBadge type="W" tooltip="Workflow ESG Compliance Checkbox" />
          </span>
          <Checkbox
            checked={record.esgCompliance}
            onCheckedChange={(checked) => onChange("esgCompliance", !!checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
};
