import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SmartFactoryLevel,
  Industry40Maturity,
  SmartFactoryProjectStatus,
  SmartFactoryDevelopmentRecord,
} from "@/services/types";

interface SmartFactoryOverviewCardProps {
  record: SmartFactoryDevelopmentRecord;
  onChange: (field: keyof SmartFactoryDevelopmentRecord, value: any) => void;
  isEditing?: boolean;
}

const SMART_FACTORY_LEVELS: SmartFactoryLevel[] = [
  "Digital Factory",
  "Connected Factory",
  "Intelligent Factory",
  "Autonomous Factory",
  "Lights-Out Factory",
];

const MATURITY_LEVELS: Industry40Maturity[] = [
  "Initial",
  "Managed",
  "Connected",
  "Intelligent",
  "Autonomous",
];

const PROJECT_STATUSES: SmartFactoryProjectStatus[] = [
  "Concept",
  "Assessment",
  "Design",
  "Development",
  "Integration",
  "Pilot",
  "Validation",
  "Commissioning",
  "Operational",
  "Closed",
];

export const SmartFactoryOverviewCard: React.FC<SmartFactoryOverviewCardProps> = ({
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
            1. Smart Factory Overview
          </CardTitle>
          <span className="text-xs font-semibold text-muted-foreground">MAICW Classification</span>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-2">
        {/* Factory Vision */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-xs font-semibold text-foreground">
            Factory Vision
            <MaicwBadge type="M" tooltip="Mandatory Field" />
          </label>
          {isEditing ? (
            <Textarea
              rows={2}
              value={record.factoryVision}
              onChange={(e) => onChange("factoryVision", e.target.value)}
              placeholder="Define high-level factory vision..."
              className="text-xs"
            />
          ) : (
            <p className="rounded-md bg-muted/40 p-2.5 text-xs text-foreground">{record.factoryVision}</p>
          )}
        </div>

        {/* Business Objectives */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-xs font-semibold text-foreground">
            Business Objectives
            <MaicwBadge type="M" tooltip="Mandatory Field" />
          </label>
          {isEditing ? (
            <Textarea
              rows={2}
              value={record.businessObjectives}
              onChange={(e) => onChange("businessObjectives", e.target.value)}
              placeholder="Outline quantifiable business objectives..."
              className="text-xs"
            />
          ) : (
            <p className="rounded-md bg-muted/40 p-2.5 text-xs text-foreground">{record.businessObjectives}</p>
          )}
        </div>

        {/* Smart Factory Level */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-foreground">
            Smart Factory Level
            <MaicwBadge type="M" tooltip="Mandatory Dropdown" />
          </label>
          {isEditing ? (
            <Select
              value={record.smartFactoryLevel}
              onValueChange={(val) => onChange("smartFactoryLevel", val as SmartFactoryLevel)}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Select Smart Factory Level" />
              </SelectTrigger>
              <SelectContent>
                {SMART_FACTORY_LEVELS.map((lvl) => (
                  <SelectItem key={lvl} value={lvl} className="text-xs">
                    {lvl}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="inline-flex rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              {record.smartFactoryLevel}
            </span>
          )}
        </div>

        {/* Industry 4.0 Maturity */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-foreground">
            Industry 4.0 Maturity
            <MaicwBadge type="M" tooltip="Mandatory Dropdown" />
          </label>
          {isEditing ? (
            <Select
              value={record.industry40Maturity}
              onValueChange={(val) => onChange("industry40Maturity", val as Industry40Maturity)}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Select Maturity Level" />
              </SelectTrigger>
              <SelectContent>
                {MATURITY_LEVELS.map((mat) => (
                  <SelectItem key={mat} value={mat} className="text-xs">
                    {mat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="inline-flex rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {record.industry40Maturity}
            </span>
          )}
        </div>

        {/* Project Scope */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-xs font-semibold text-foreground">
            Project Scope
            <MaicwBadge type="M" tooltip="Mandatory Field" />
          </label>
          {isEditing ? (
            <Textarea
              rows={2}
              value={record.projectScope}
              onChange={(e) => onChange("projectScope", e.target.value)}
              placeholder="Describe physical and digital boundaries..."
              className="text-xs"
            />
          ) : (
            <p className="rounded-md bg-muted/40 p-2.5 text-xs text-foreground">{record.projectScope}</p>
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
              placeholder="Expected ROI, OEE gains, energy savings..."
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

        {/* Project Status */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-foreground">
            Project Status
            <MaicwBadge type="W" tooltip="Workflow Field" />
          </label>
          {isEditing ? (
            <Select
              value={record.projectStatus}
              onValueChange={(val) => onChange("projectStatus", val as SmartFactoryProjectStatus)}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_STATUSES.map((st) => (
                  <SelectItem key={st} value={st} className="text-xs">
                    {st}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Badge className="w-fit bg-primary text-primary-foreground">
              {record.projectStatus}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
