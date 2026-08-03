import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Save,
  Eye,
  Send,
  Plus,
  Building2,
  MapPin,
  UserCheck,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";
import type { SmartFactoryDevelopmentRecord } from "@/services/types";

interface SmartFactoryHeaderProps {
  record: SmartFactoryDevelopmentRecord;
  onSaveDraft: () => void;
  onSubmitForApproval: () => void;
  onPreview: () => void;
  onNewProject: () => void;
  isSubmitting?: boolean;
}

export const SmartFactoryHeader: React.FC<SmartFactoryHeaderProps> = ({
  record,
  onSaveDraft,
  onSubmitForApproval,
  onPreview,
  onNewProject,
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
      {/* Top Title Bar & Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Smart Factory Development Form (MAICW)
              </span>
              <Badge variant="outline" className={getStatusBadgeVariant(record.workflowStatus)}>
                {record.workflowStatus}
              </Badge>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {record.smartFactoryProjectTitle}
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
          <Button size="sm" onClick={onNewProject} className="gap-1.5 bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700">
            <Plus className="h-3.5 w-3.5" />
            New Smart Factory Project
          </Button>
        </div>
      </div>

      {/* Metadata Bar */}
      <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4 lg:grid-cols-7">
        <div className="flex flex-col gap-0.5 rounded-lg bg-muted/40 p-2.5">
          <span className="text-[10px] font-medium uppercase text-muted-foreground">Project ID</span>
          <span className="font-bold text-foreground">{record.smartFactoryProjectId}</span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-lg bg-muted/40 p-2.5">
          <span className="text-[10px] font-medium uppercase text-muted-foreground">Form Code</span>
          <span className="font-bold text-foreground">{record.formCode}</span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-lg bg-muted/40 p-2.5">
          <span className="text-[10px] font-medium uppercase text-muted-foreground">Project Number</span>
          <span className="font-bold text-foreground">{record.projectNumber}</span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-lg bg-muted/40 p-2.5">
          <span className="text-[10px] font-medium uppercase text-muted-foreground">Manufacturing Plant</span>
          <div className="flex items-center gap-1 font-semibold text-foreground">
            <Building2 className="h-3 w-3 text-muted-foreground" />
            <span>{record.manufacturingPlant}</span>
          </div>
        </div>
        <div className="flex flex-col gap-0.5 rounded-lg bg-muted/40 p-2.5">
          <span className="text-[10px] font-medium uppercase text-muted-foreground">Factory Zone</span>
          <div className="flex items-center gap-1 font-semibold text-foreground">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <span>{record.factoryZone}</span>
          </div>
        </div>
        <div className="flex flex-col gap-0.5 rounded-lg bg-muted/40 p-2.5">
          <span className="text-[10px] font-medium uppercase text-muted-foreground">Project Manager</span>
          <div className="flex items-center gap-1 font-semibold text-foreground">
            <UserCheck className="h-3 w-3 text-muted-foreground" />
            <span>{record.projectManager}</span>
          </div>
        </div>
        <div className="flex flex-col gap-0.5 rounded-lg bg-muted/40 p-2.5">
          <span className="text-[10px] font-medium uppercase text-muted-foreground">Target Go-Live</span>
          <div className="flex items-center gap-1 font-semibold text-foreground">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span>{record.targetGoLive}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
