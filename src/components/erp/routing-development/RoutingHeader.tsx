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
import type { RoutingRecord } from "@/services/types";

interface RoutingHeaderProps {
  record: RoutingRecord;
  onSaveDraft: () => void;
  onSubmitForReview: () => void;
  onExport: () => void;
  onNewRouting: () => void;
}

export const RoutingHeader: React.FC<RoutingHeaderProps> = ({
  record,
  onSaveDraft,
  onSubmitForReview,
  onExport,
  onNewRouting,
}) => {
  return (
    <div className="bg-card text-card-foreground border-b border-border p-4 shadow-sm space-y-4">
      {/* Top Row: Breadcrumbs & Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <span className="hover:text-foreground cursor-pointer">Development</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="hover:text-foreground cursor-pointer">Manufacturing Development</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-semibold">Routing Development</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNewRouting}
            className="px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold rounded-md shadow flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New Routing
          </button>
          <button
            onClick={onSaveDraft}
            className="px-3 py-1.5 border border-input bg-background hover:bg-accent hover:text-accent-foreground text-xs font-medium rounded-md shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-3.5 h-3.5" /> Save Draft
          </button>
          <button
            onClick={onSubmitForReview}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow flex items-center gap-1.5 transition-colors"
          >
            <Send className="w-3.5 h-3.5" /> Submit for Review
          </button>
          <button
            onClick={onExport}
            className="px-3 py-1.5 border border-input bg-background hover:bg-accent hover:text-accent-foreground text-xs font-medium rounded-md shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      {/* Row 1 Metadata Cards */}
      <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-xs pt-1">
        <div className="min-w-[110px]">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Routing ID</span>
          <span className="font-extrabold text-foreground text-xs">{record.routingId}</span>
        </div>

        <div className="min-w-[110px]">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Form Code</span>
          <span className="font-bold text-foreground text-xs">{record.formCode}</span>
        </div>

        <div className="min-w-[240px] max-w-[340px]">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Routing Name</span>
          <span className="font-extrabold text-foreground text-xs truncate block" title={record.routingName}>
            {record.routingName}
          </span>
        </div>

        <div className="min-w-[140px]">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Routing Number</span>
          <span className="font-bold text-foreground text-xs">{record.routingNumber}</span>
        </div>

        <div className="min-w-[90px]">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Routing Version</span>
          <span className="font-extrabold text-foreground text-xs">{record.routingVersion}</span>
        </div>

        <div className="min-w-[110px]">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Workflow Status</span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <Clock className="w-3 h-3" /> {record.workflowStatus}
          </span>
        </div>
      </div>

      {/* Row 2 Metadata Cards */}
      <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-xs pt-2 border-t border-border/40">
        <div className="min-w-[140px]">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Product</span>
          <span className="font-bold text-foreground text-xs">{record.product}</span>
        </div>

        <div className="min-w-[100px]">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Product Revision</span>
          <span className="font-bold text-foreground text-xs">{record.productRevision}</span>
        </div>

        <div className="min-w-[140px]">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Process Owner</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-bold text-primary">
              RS
            </div>
            <span className="font-bold text-foreground text-xs">{record.processOwner}</span>
          </div>
        </div>

        <div className="min-w-[100px]">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Created Date</span>
          <span className="font-semibold text-foreground text-xs">{record.createdDate}</span>
        </div>

        <div className="min-w-[100px]">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Effective Date</span>
          <span className="font-semibold text-foreground text-xs">{record.effectiveDate}</span>
        </div>

        <div className="min-w-[100px]">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Next Review Date</span>
          <span className="font-semibold text-foreground text-xs">{record.nextReviewDate}</span>
        </div>
      </div>
    </div>
  );
};
