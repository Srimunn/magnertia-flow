import React from "react";
import {
  Save,
  Send,
  Download,
  Plus,
  ChevronRight,
  Eye,
  Clock,
} from "lucide-react";
import type { ApqpRecord } from "@/services/types";

interface ApqpHeaderProps {
  record: ApqpRecord;
  onSaveDraft: () => void;
  onSubmitForReview: () => void;
  onExport: () => void;
  onNewProject: () => void;
}

export const ApqpHeader: React.FC<ApqpHeaderProps> = ({
  record,
  onSaveDraft,
  onSubmitForReview,
  onExport,
  onNewProject,
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
          <span className="text-foreground font-semibold">Quality Planning (APQP)</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNewProject}
            className="px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-md shadow flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New APQP Project
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
        <div className="min-w-[110px]">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">APQP ID</span>
          <span className="font-extrabold text-foreground">{record.apqpId}</span>
        </div>

        <div className="min-w-[100px]">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Form Code</span>
          <span className="font-bold text-foreground">{record.formCode}</span>
        </div>

        <div className="min-w-[220px] max-w-[320px]">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">APQP Project Name</span>
          <span className="font-extrabold text-foreground truncate block" title={record.apqpProjectName}>
            {record.apqpProjectName}
          </span>
        </div>

        <div className="min-w-[130px]">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">APQP Number</span>
          <span className="font-bold text-foreground">{record.apqpNumber}</span>
        </div>

        <div className="min-w-[140px]">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">APQP Phase</span>
          <span className="px-2 py-0.5 rounded font-extrabold text-[10px] bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
            Phase 3 Process Design
          </span>
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

        <div className="min-w-[160px]">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Customer</span>
          <span className="font-bold text-foreground truncate block" title={record.customer}>{record.customer}</span>
        </div>

        <div className="min-w-[130px]">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Project Manager</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-bold text-primary">
              RS
            </div>
            <span className="font-bold text-foreground">{record.projectManager}</span>
          </div>
        </div>

        <div className="min-w-[100px]">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Target SOP Date</span>
          <span className="font-semibold text-foreground">{record.targetSopDate}</span>
        </div>

        <div className="min-w-[100px]">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Program Status</span>
          <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
            {record.programStatus}
          </span>
        </div>

        <div className="min-w-[80px]">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Priority</span>
          <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
            {record.priority}
          </span>
        </div>
      </div>
    </div>
  );
};
