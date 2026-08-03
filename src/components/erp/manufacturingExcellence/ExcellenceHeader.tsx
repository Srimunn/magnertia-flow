import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Save,
  Eye,
  Send,
  Plus,
  Building2,
  Briefcase,
  UserCheck,
  Calendar,
  Award,
} from "lucide-react";
import type { ManufacturingExcellenceRecord } from "@/services/types";

interface ExcellenceHeaderProps {
  record: ManufacturingExcellenceRecord;
  onSaveDraft: () => void;
  onSubmitForApproval: () => void;
  onPreview: () => void;
  onNewInitiative: () => void;
  isSubmitting?: boolean;
}

export const ExcellenceHeader: React.FC<ExcellenceHeaderProps> = ({
  record,
  onSaveDraft,
  onSubmitForApproval,
  onPreview,
  onNewInitiative,
  isSubmitting,
}) => {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300";
      case "Under Review":
      case "In Progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300";
      case "Approved with Conditions":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300";
      case "Revision Required":
        return "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300";
      case "Rejected":
        return "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-300";
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
      {/* Top Title Bar & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Manufacturing Excellence Form (MAICW)
              </span>
              <Badge variant="outline" className={getStatusBadgeVariant(record.workflowStatus)}>
                {record.workflowStatus}
              </Badge>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {record.initiativeTitle}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={onSaveDraft} className="gap-1.5 text-xs font-medium">
            <Save className="h-3.5 w-3.5" />
            Save Draft
          </Button>
          <Button variant="outline" size="sm" onClick={onPreview} className="gap-1.5 text-xs font-medium">
            <Eye className="h-3.5 w-3.5" />
            Preview
          </Button>
          <Button
            size="sm"
            onClick={onSubmitForApproval}
            disabled={isSubmitting}
            className="gap-1.5 bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Send className="h-3.5 w-3.5" />
            Submit for Approval
          </Button>
          <Button size="sm" onClick={onNewInitiative} className="gap-1.5 bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700">
            <Plus className="h-3.5 w-3.5" />
            New Excellence Initiative
          </Button>
        </div>
      </div>

      {/* Metadata Row */}
      <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4 lg:grid-cols-7">
        <div className="flex flex-col gap-0.5 rounded-lg bg-muted/40 p-2.5">
          <span className="text-[10px] font-medium uppercase text-muted-foreground">Excellence ID</span>
          <span className="font-bold text-foreground">{record.manufacturingExcellenceId}</span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-lg bg-muted/40 p-2.5">
          <span className="text-[10px] font-medium uppercase text-muted-foreground">Form Code</span>
          <span className="font-bold text-foreground">{record.formCode}</span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-lg bg-muted/40 p-2.5">
          <span className="text-[10px] font-medium uppercase text-muted-foreground">Initiative Number</span>
          <span className="font-bold text-foreground">{record.initiativeNumber}</span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-lg bg-muted/40 p-2.5">
          <span className="text-[10px] font-medium uppercase text-muted-foreground">Manufacturing Plant</span>
          <div className="flex items-center gap-1 font-semibold text-foreground">
            <Building2 className="h-3 w-3 text-muted-foreground" />
            <span>{record.manufacturingPlant}</span>
          </div>
        </div>
        <div className="flex flex-col gap-0.5 rounded-lg bg-muted/40 p-2.5">
          <span className="text-[10px] font-medium uppercase text-muted-foreground">Business Unit</span>
          <div className="flex items-center gap-1 font-semibold text-foreground">
            <Briefcase className="h-3 w-3 text-muted-foreground" />
            <span>{record.businessUnit}</span>
          </div>
        </div>
        <div className="flex flex-col gap-0.5 rounded-lg bg-muted/40 p-2.5">
          <span className="text-[10px] font-medium uppercase text-muted-foreground">Process Owner</span>
          <div className="flex items-center gap-1 font-semibold text-foreground">
            <UserCheck className="h-3 w-3 text-muted-foreground" />
            <span>{record.processOwner}</span>
          </div>
        </div>
        <div className="flex flex-col gap-0.5 rounded-lg bg-muted/40 p-2.5">
          <span className="text-[10px] font-medium uppercase text-muted-foreground">Target Completion</span>
          <div className="flex items-center gap-1 font-semibold text-foreground">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span>{record.targetCompletion}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
