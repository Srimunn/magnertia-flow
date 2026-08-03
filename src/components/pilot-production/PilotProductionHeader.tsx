import React, { useState } from "react";
import {
  ChevronRight,
  Save,
  Eye,
  Send,
  MoreVertical,
  ExternalLink,
  Copy,
  FileText,
  Printer,
  Archive,
} from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PilotProductionRecord } from "@/lib/pilot-production/types";
import { toast } from "sonner";

interface PilotProductionHeaderProps {
  record: PilotProductionRecord;
  onSaveDraft: () => void;
  onSubmitForReview: () => void;
  onDuplicate?: () => void;
  onExportPdf?: () => void;
  onPrint?: () => void;
  onArchive?: () => void;
}

export const PilotProductionHeader: React.FC<PilotProductionHeaderProps> = ({
  record,
  onSaveDraft,
  onSubmitForReview,
  onDuplicate,
  onExportPdf,
  onPrint,
  onArchive,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ready for Mass Production":
        return "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300";
      case "Minor Improvements Required":
        return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300";
      case "Superseded — Repeat Scheduled":
        return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300";
      case "Archived":
        return "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-900 dark:text-slate-300";
      default:
        return "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300";
    }
  };

  return (
    <TooltipProvider>
      <div className="bg-card text-card-foreground border-b border-border p-4 shadow-sm space-y-4 text-xs">
        {/* Top Bar: Breadcrumb + Title + Header Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <span className="hover:text-foreground cursor-pointer">Development</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="hover:text-foreground cursor-pointer">Manufacturing Development</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-foreground font-semibold">Pilot Production</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Pilot Production</h1>
            <p className="text-xs text-muted-foreground font-medium">
              Pilot Production · <span className="font-semibold text-foreground">{record.id}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Save Draft: Icon-only button with tooltip */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onSaveDraft}
                  className="p-2 border border-input bg-background hover:bg-accent text-foreground rounded-md shadow-sm transition-colors flex items-center justify-center"
                  aria-label="Save Draft"
                >
                  <Save className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save Draft</p>
              </TooltipContent>
            </Tooltip>

            {/* Preview: Icon-only button with tooltip */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => toast.info("Opening Record Preview...")}
                  className="p-2 border border-input bg-background hover:bg-accent text-foreground rounded-md shadow-sm transition-colors flex items-center justify-center"
                  aria-label="Preview"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Preview</p>
              </TooltipContent>
            </Tooltip>

            {/* Submit for Review: Primary blue solid labeled button */}
            <button
              onClick={onSubmitForReview}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-md shadow flex items-center gap-2 transition-colors"
            >
              <Send className="w-4 h-4" /> Submit for Review
            </button>

            {/* Kebab Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-2 border border-input bg-background hover:bg-accent text-foreground rounded-md shadow-sm transition-colors flex items-center justify-center"
                  aria-label="More Options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={onDuplicate || (() => toast.info("Record duplicated"))}>
                  <Copy className="w-4 h-4 mr-2" /> Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onExportPdf || (() => toast.info("Exporting PDF report..."))}>
                  <FileText className="w-4 h-4 mr-2" /> Export PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onPrint || (() => window.print())}>
                  <Printer className="w-4 h-4 mr-2" /> Print
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onArchive || (() => toast.warning("Record archived"))}>
                  <Archive className="w-4 h-4 mr-2" /> Archive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Identity Row (First Grey Band, 6 fields) */}
        <div className="bg-muted/50 p-3 rounded-lg border border-border/60 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
              Pilot Production ID
            </span>
            <span className="font-extrabold text-foreground">{record.id}</span>
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
              Form Code
            </span>
            <span className="font-bold text-foreground">{record.formCode}</span>
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
              Pilot Batch Title
            </span>
            <span className="font-extrabold text-foreground truncate block" title={record.pilotBatchTitle}>
              {record.pilotBatchTitle}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
              Pilot Batch Number
            </span>
            <span className="font-bold text-foreground">{record.pilotBatchNumber}</span>
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
              Version
            </span>
            <span className="font-extrabold text-foreground">{record.version}</span>
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
              Workflow Status
            </span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border mt-0.5 ${getStatusColor(
                record.workflowStatus
              )}`}
            >
              {record.workflowStatus}
            </span>
          </div>
        </div>

        {/* Metadata Row (Second Grey Band, 7 fields) */}
        <div className="bg-muted/40 p-3 rounded-lg border border-border/40 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
              Product
            </span>
            <span className="font-semibold text-foreground">{record.product}</span>
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
              Product Revision
            </span>
            <span className="font-semibold text-foreground">{record.productRevision}</span>
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
              Manufacturing Process
            </span>
            <span className="font-semibold text-foreground">{record.manufacturingProcess}</span>
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
              Production Line
            </span>
            <span className="font-semibold text-foreground">{record.productionLine}</span>
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
              Process Validation Ref
            </span>
            <a
              href={`/manufacturing-development/process-validation/${record.processValidationRef}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              {record.processValidationRef} <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
              Created Date
            </span>
            <span className="font-medium text-foreground">{record.createdDate}</span>
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
              Last Updated
            </span>
            <span className="font-medium text-foreground">{record.lastUpdated}</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
