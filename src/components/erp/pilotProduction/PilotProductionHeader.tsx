import React from "react";
import {
  Save,
  Send,
  Plus,
  ChevronRight,
  Clock,
} from "lucide-react";
import type { PilotProductionRecord } from "@/services/types";

interface PilotProductionHeaderProps {
  record: PilotProductionRecord;
  onSaveDraft: () => void;
  onSubmitForReview: () => void;
  onExport: () => void;
  onNewPilot: () => void;
}

export const PilotProductionHeader: React.FC<PilotProductionHeaderProps> = ({
  record,
  onSaveDraft,
  onSubmitForReview,
  onExport,
  onNewPilot,
}) => {
  return (
    <div className="bg-card text-card-foreground border-b border-border p-4 shadow-sm space-y-4 text-xs">
      {/* Top Row: Breadcrumbs & Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <span className="hover:text-foreground cursor-pointer">Development</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="hover:text-foreground cursor-pointer">Manufacturing Development</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-semibold">Pilot Production</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNewPilot}
            className="px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-md shadow flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New Pilot Production
          </button>
          <button
            onClick={onSaveDraft}
            className="px-3 py-1.5 border border-input bg-background hover:bg-accent text-xs font-medium rounded-md shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-3.5 h-3.5" /> Save Draft
          </button>
          <button
            onClick={onSubmitForReview}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow flex items-center gap-1.5 transition-colors"
          >
            <Send className="w-3.5 h-3.5" /> Submit for Review
          </button>
        </div>
      </div>

      {/* Row 1 Metadata Cards matching mockup */}
      <div className="flex flex-wrap items-center gap-y-3 gap-x-6 pt-1">
        <div className="min-w-[120px]">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Pilot Production ID</span>
          <span className="font-extrabold text-foreground">{record.pilotId}</span>
        </div>

        <div className="min-w-[100px]">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Form Code</span>
          <span className="font-bold text-foreground">{record.formCode}</span>
        </div>

        <div className="min-w-[220px] max-w-[320px]">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Pilot Batch Title</span>
          <span className="font-extrabold text-foreground truncate block" title={record.pilotTitle}>
            {record.pilotTitle}
          </span>
        </div>

        <div className="min-w-[140px]">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Pilot Batch Number</span>
          <span className="font-bold text-foreground">{record.pilotNumber}</span>
        </div>

        <div className="min-w-[70px]">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Version</span>
          <span className="font-extrabold text-foreground">{record.version}</span>
        </div>

        <div className="min-w-[110px]">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Workflow Status</span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <Clock className="w-3 h-3" /> {record.workflowStatus}
          </span>
        </div>
      </div>

      {/* Row 2 Metadata Cards */}
      <div className="flex flex-wrap items-center gap-y-3 gap-x-6 pt-2 border-t border-border/40">
        <div className="min-w-[130px]">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Product</span>
          <span className="font-bold text-foreground">{record.product}</span>
        </div>

        <div className="min-w-[90px]">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Product Revision</span>
          <span className="font-bold text-foreground">{record.productRevision}</span>
        </div>

        <div className="min-w-[140px]">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Manufacturing Process</span>
          <span className="font-bold text-foreground">{record.manufacturingProcess}</span>
        </div>

        <div className="min-w-[90px]">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Production Line</span>
          <span className="font-bold text-foreground font-mono">{record.productionLine}</span>
        </div>

        <div className="min-w-[150px]">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Process Validation Reference</span>
          <span className="font-bold font-mono text-primary">{record.processValidationRef}</span>
        </div>

        <div className="min-w-[110px]">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Created Date</span>
          <span className="font-semibold text-muted-foreground font-mono">{record.createdDate}</span>
        </div>

        <div className="min-w-[110px]">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Last Updated</span>
          <span className="font-semibold text-muted-foreground font-mono">{record.lastUpdated}</span>
        </div>
      </div>
    </div>
  );
};
