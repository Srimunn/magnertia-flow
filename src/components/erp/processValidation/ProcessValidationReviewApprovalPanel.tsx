import React, { useState } from "react";
import { UserCheck, Send, CheckCircle2, Clock } from "lucide-react";
import type { ProcessValidationRecord, ValidationApprovalDecision } from "@/services/types";

interface ProcessValidationReviewApprovalPanelProps {
  record: ProcessValidationRecord;
  onReviewDecision?: (decision: ValidationApprovalDecision, comments: string) => void;
  onViewApprovalFlow?: () => void;
}

export const ProcessValidationReviewApprovalPanel: React.FC<ProcessValidationReviewApprovalPanelProps> = ({
  record,
  onReviewDecision,
  onViewApprovalFlow,
}) => {
  const [selectedDecision, setSelectedDecision] = useState<ValidationApprovalDecision>(
    record.approvalDecision
  );
  const [comments, setComments] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onReviewDecision?.(selectedDecision, comments);
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-4 text-xs space-y-4">
      <div className="flex justify-between items-center pb-2.5 border-b border-border">
        <div className="flex items-center gap-1.5">
          <UserCheck className="w-4 h-4 text-primary" />
          <h2 className="font-bold text-foreground text-xs">10. Review & Approval Status Board</h2>
        </div>
      </div>

      {/* Horizontal 7-Role Approval Board matching bottom row of mockup */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pb-3 border-b border-border text-[11px]">
        {record.reviewers.map((rev, idx) => (
          <div key={idx} className="p-2.5 rounded-lg border border-border/70 bg-muted/20 space-y-1 text-center">
            <span className="text-[10px] text-muted-foreground font-bold block truncate" title={rev.role}>
              {rev.role}
            </span>
            <span className="font-bold text-foreground block truncate" title={rev.person}>
              {rev.person}
            </span>
            <div className="flex items-center justify-center gap-1 pt-1">
              {rev.status === "Approved" ? (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-300">
                  <CheckCircle2 className="w-3 h-3" /> Approved
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full border border-amber-300">
                  <Clock className="w-3 h-3" /> Pending
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Decision Submission Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] items-end">
        <div>
          <label className="block text-muted-foreground font-semibold mb-1">Approval Decision</label>
          <select
            value={selectedDecision}
            onChange={(e) => setSelectedDecision(e.target.value as ValidationApprovalDecision)}
            className="w-full bg-background border border-input rounded px-2.5 py-1.5 font-bold focus:outline-none focus:ring-1 focus:ring-primary text-xs"
          >
            <option value="Approved">Approved</option>
            <option value="Approved with Conditions">Approved with Conditions</option>
            <option value="Revision Required">Revision Required</option>
            <option value="On Hold">On Hold</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div>
          <label className="block text-muted-foreground font-semibold mb-1">Review Comments</label>
          <input
            type="text"
            placeholder="Enter review comments or approval feedback..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="w-full bg-background border border-input rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary text-xs"
          />
        </div>

        <button
          type="submit"
          className="py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded shadow flex items-center justify-center gap-1.5 transition-colors"
        >
          <Send className="w-3.5 h-3.5" /> Submit Review Board Decision
        </button>
      </form>
    </div>
  );
};
