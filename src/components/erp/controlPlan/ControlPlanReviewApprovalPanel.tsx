import React, { useState } from "react";
import { UserCheck, Send, ArrowRight } from "lucide-react";
import type { ControlPlanRecord, ControlPlanApprovalDecision } from "@/services/types";

interface ControlPlanReviewApprovalPanelProps {
  record: ControlPlanRecord;
  onReviewDecision?: (decision: ControlPlanApprovalDecision, comments: string) => void;
  onViewApprovalFlow?: () => void;
}

export const ControlPlanReviewApprovalPanel: React.FC<ControlPlanReviewApprovalPanelProps> = ({
  record,
  onReviewDecision,
  onViewApprovalFlow,
}) => {
  const [selectedDecision, setSelectedDecision] = useState<ControlPlanApprovalDecision>(
    record.approvalDecision
  );
  const [comments, setComments] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onReviewDecision?.(selectedDecision, comments);
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-3.5 text-xs space-y-3">
      <div className="flex justify-between items-center pb-2 border-b border-border">
        <div className="flex items-center gap-1.5">
          <UserCheck className="w-4 h-4 text-primary" />
          <h2 className="font-bold text-foreground text-xs">8. Review & Approval Status</h2>
        </div>
      </div>

      <div className="space-y-1.5 border-b border-border pb-2 text-[11px]">
        {record.reviewers.map((rev, idx) => (
          <div key={idx} className="flex items-center justify-between py-1 px-1 rounded hover:bg-muted/40">
            <div className="min-w-0 pr-2">
              <span className="font-semibold text-foreground block truncate">{rev.role}</span>
              <span className="text-[10px] text-muted-foreground truncate block">{rev.person}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[9px] text-muted-foreground font-mono">{rev.date || "-"}</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                  rev.status === "Approved"
                    ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                    : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                }`}
              >
                {rev.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-2 text-[11px]">
        <div>
          <label className="block text-muted-foreground font-semibold mb-1">Approval Decision</label>
          <select
            value={selectedDecision}
            onChange={(e) => setSelectedDecision(e.target.value as ControlPlanApprovalDecision)}
            className="w-full bg-background border border-input rounded px-2.5 py-1 font-bold focus:outline-none focus:ring-1 focus:ring-primary"
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
          <textarea
            rows={2}
            placeholder="Enter review comments..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="w-full bg-background border border-input rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-primary text-[11px]"
          />
        </div>

        <button
          type="submit"
          className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded shadow flex items-center justify-center gap-1 transition-colors"
        >
          <Send className="w-3.5 h-3.5" /> Submit Board Decision
        </button>
      </form>

      <button
        onClick={onViewApprovalFlow}
        className="w-full py-0.5 text-[10px] font-semibold text-primary hover:underline flex items-center justify-center gap-0.5"
      >
        View Approval Flow <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
};
