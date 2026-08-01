import React from "react";
import {
  FileCheck,
  Plus,
  Layers,
  Download,
  Send,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
} from "lucide-react";
import type { BomEngineeringRecord } from "@/services/types";

interface BomDocumentControlPanelProps {
  record: BomEngineeringRecord;
  onAddComponent?: () => void;
  onImportCadPlm?: () => void;
  onCompareBom?: () => void;
  onExportExcel?: () => void;
  onGenerateProcurement?: () => void;
  onSubmitForReview?: () => void;
  onViewRevisionHistory?: () => void;
  onNavigateTab?: (tab: any) => void;
}

export const BomDocumentControlPanel: React.FC<BomDocumentControlPanelProps> = ({
  record,
  onAddComponent,
  onImportCadPlm,
  onCompareBom,
  onExportExcel,
  onGenerateProcurement,
  onSubmitForReview,
  onViewRevisionHistory,
}) => {
  return (
    <div className="space-y-3 text-xs">
      {/* Document Control Card */}
      <div className="bg-card border border-border rounded-lg shadow-sm p-3">
        <div className="flex justify-between items-center pb-2 border-b border-border mb-2">
          <div className="flex items-center gap-1.5">
            <FileCheck className="w-3.5 h-3.5 text-primary" />
            <h2 className="font-bold text-foreground text-xs">Document Control</h2>
          </div>
          <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[9px] border border-blue-300 dark:border-blue-800">
            Controlled Document
          </span>
        </div>

        <div className="space-y-1.5 text-[11px]">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Version</span>
            <span className="font-bold text-foreground">v{record.version.toFixed(1)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Effective Date</span>
            <span className="font-medium text-foreground">{record.effectiveDate}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Next Review Date</span>
            <span className="font-medium text-foreground">{record.nextReviewDate}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-muted-foreground shrink-0">Distribution</span>
            <span className="font-medium text-foreground text-right text-[10px] truncate max-w-[140px]" title={record.distribution.join(", ")}>
              {record.distribution.join(", ")}
            </span>
          </div>
        </div>

        <button
          onClick={onViewRevisionHistory}
          className="mt-2 w-full py-0.5 text-[10px] font-semibold text-primary hover:underline flex items-center justify-center gap-0.5"
        >
          View Revision History <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Quick Actions List */}
      <div className="bg-card border border-border rounded-lg shadow-sm p-3">
        <h2 className="font-bold text-foreground text-xs pb-1.5 border-b border-border mb-2">
          Quick Actions
        </h2>

        <div className="space-y-1 text-[11px]">
          <button
            onClick={onAddComponent}
            className="w-full text-left px-2 py-1 rounded hover:bg-accent hover:text-accent-foreground text-foreground flex items-center gap-1.5 font-medium transition-colors"
          >
            <Plus className="w-3 h-3 text-primary shrink-0" /> Add Component
          </button>
          <button
            onClick={onAddComponent}
            className="w-full text-left px-2 py-1 rounded hover:bg-accent hover:text-accent-foreground text-foreground flex items-center gap-1.5 font-medium transition-colors"
          >
            <Plus className="w-3 h-3 text-primary shrink-0" /> Add Sub-Assembly
          </button>
          <button
            onClick={onImportCadPlm}
            className="w-full text-left px-2 py-1 rounded hover:bg-accent hover:text-accent-foreground text-foreground flex items-center gap-1.5 font-medium transition-colors"
          >
            <Layers className="w-3 h-3 text-blue-500 shrink-0" /> Import from CAD / PLM
          </button>
          <button
            onClick={onCompareBom}
            className="w-full text-left px-2 py-1 rounded hover:bg-accent hover:text-accent-foreground text-foreground flex items-center gap-1.5 font-medium transition-colors"
          >
            <ShieldCheck className="w-3 h-3 text-purple-500 shrink-0" /> Compare BOM
          </button>
          <button
            onClick={onExportExcel}
            className="w-full text-left px-2 py-1 rounded hover:bg-accent hover:text-accent-foreground text-foreground flex items-center gap-1.5 font-medium transition-colors"
          >
            <FileSpreadsheet className="w-3 h-3 text-emerald-500 shrink-0" /> Export BOM (Excel)
          </button>
          <button
            onClick={onGenerateProcurement}
            className="w-full text-left px-2 py-1 rounded hover:bg-accent hover:text-accent-foreground text-foreground flex items-center gap-1.5 font-medium transition-colors"
          >
            <Download className="w-3 h-3 text-amber-500 shrink-0" /> Generate Procurement List
          </button>
          <button
            onClick={onSubmitForReview}
            className="w-full text-left px-2 py-1 rounded hover:bg-accent hover:text-accent-foreground text-foreground flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400 transition-colors"
          >
            <Send className="w-3 h-3 shrink-0" /> Submit for Review
          </button>
        </div>
      </div>
    </div>
  );
};
