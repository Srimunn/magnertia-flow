import React, { useState } from "react";
import { UserCheck, Send } from "lucide-react";
import type { PfmeaRecord, PfmeaApprovalDecision } from "@/services/types";

interface ReviewApprovalTabProps {
  record: PfmeaRecord;
  onReviewDecision?: (decision: PfmeaApprovalDecision, comments: string) => void;
}

export const ReviewApprovalTab: React.FC<ReviewApprovalTabProps> = ({
  record,
  onReviewDecision,
}) => {
  const [selectedDecision, setSelectedDecision] = useState<PfmeaApprovalDecision>(
    record.approvalDecision
  );
  const [comments, setComments] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onReviewDecision?.(selectedDecision, comments);
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="bg-card p-4 rounded-lg border border-border flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-foreground">
            PFMEA Review Board Approval Matrix (8-Role Sign-off)
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cross-functional approval matrix for Manufacturing Engineer, Process Engineer, Quality Engineer, Production Manager, APQP Manager, Plant Head, and COO.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <span className="text-xs text-muted-foreground font-semibold">Workflow Decision:</span>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {record.approvalDecision}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {record.reviewers.map((rev, idx) => (
          <div key={idx} className="bg-card p-4 rounded-lg border border-border space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <span className="font-bold text-foreground truncate">{rev.role}</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  rev.status === "Approved"
                    ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                    : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                }`}
              >
                {rev.status}
              </span>
            </div>
            <div className="font-semibold text-foreground">{rev.person}</div>
            <div className="text-[10px] text-muted-foreground font-mono">Date: {rev.date}</div>
            <p className="text-muted-foreground text-[11px] italic bg-muted/30 p-2 rounded border border-border/40">
              "{rev.comments}"
            </p>
          </div>
        ))}
      </div>

      <div className="bg-card p-4 rounded-lg border border-border space-y-4">
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
                onChange={(e) => setSelectedDecision(e.target.value as PfmeaApprovalDecision)}
                className="w-full bg-background border border-input rounded px-3 py-1.5 font-bold focus:ring-1 focus:ring-primary"
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
                className="w-full bg-muted border border-input rounded px-3 py-1.5 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-muted-foreground font-semibold mb-1">
              Reviewer Board Feedback & Approval Conditions
            </label>
            <textarea
              rows={3}
              placeholder="Enter review comments or approval conditions..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full bg-background border border-input rounded p-2 focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded shadow flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" /> Submit Decision
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
