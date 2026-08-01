import React, { useState } from "react";
import { UserCheck, CheckCircle2, AlertCircle, Clock, Send, MessageSquare } from "lucide-react";
import type { BomEngineeringRecord, BomApprovalDecision } from "@/services/types";

interface ReviewApprovalTabProps {
  record: BomEngineeringRecord;
  onReviewDecision?: (decision: BomApprovalDecision, comments: string) => void;
}

export const ReviewApprovalTab: React.FC<ReviewApprovalTabProps> = ({
  record,
  onReviewDecision,
}) => {
  const [selectedDecision, setSelectedDecision] = useState<BomApprovalDecision>(
    record.approvalDecision
  );
  const [comments, setComments] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onReviewDecision?.(selectedDecision, comments);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-card p-4 rounded-lg border border-border flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-foreground">
            Executive Review Board & Gate Approvals (8-Role Sign-off)
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Sequential cross-functional approval matrix for Design, Manufacturing, Quality, Costing, Supply Chain, and Executive sign-off.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <span className="text-xs text-muted-foreground font-semibold">Workflow State:</span>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {record.approvalDecision}
          </span>
        </div>
      </div>

      {/* 8-Role Reviewers Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {record.reviewers.map((rev, idx) => (
          <div key={idx} className="bg-card p-4 rounded-lg border border-border space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <span className="font-bold text-foreground truncate">{rev.role}</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  rev.status === "Approved"
                    ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                    : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                }`}
              >
                {rev.status}
              </span>
            </div>

            <div className="font-semibold text-foreground text-xs">{rev.person}</div>
            <div className="text-[10px] text-muted-foreground font-mono">Date: {rev.date}</div>
            <p className="text-muted-foreground text-[11px] italic bg-muted/30 p-2 rounded border border-border/40">
              "{rev.comments}"
            </p>
          </div>
        ))}
      </div>

      {/* Sign-off Form Panel */}
      <div className="bg-card p-4 rounded-lg border border-border text-xs space-y-4">
        <h3 className="font-bold text-foreground pb-2 border-b border-border flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-primary" /> Record Executive Approval Decision
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-muted-foreground font-semibold mb-1">
                Approval Decision
              </label>
              <select
                value={selectedDecision}
                onChange={(e) => setSelectedDecision(e.target.value as BomApprovalDecision)}
                className="w-full bg-background border border-input rounded px-3 py-1.5 font-bold text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Approved">Approved</option>
                <option value="Approved with Conditions">Approved with Conditions</option>
                <option value="Revision Required">Revision Required</option>
                <option value="On Hold">On Hold</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-muted-foreground font-semibold mb-1">
                Sign-off Date
              </label>
              <input
                type="text"
                readOnly
                value={new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                className="w-full bg-muted border border-input rounded px-3 py-1.5 font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-muted-foreground font-semibold mb-1">
              Reviewer Comments & Gate Conditions
            </label>
            <textarea
              rows={3}
              placeholder="Enter review feedback, conditions, or required changes..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full bg-background border border-input rounded p-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded shadow flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" /> Submit Review Decision
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
