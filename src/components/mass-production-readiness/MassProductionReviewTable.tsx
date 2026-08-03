import React, { useState } from "react";
import { CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";
import type { ReviewerRow, ReadinessApprovalDecision, PpapStatusType } from "@/lib/mass-production-readiness/types";

interface MassProductionReviewTableProps {
  reviewers: ReviewerRow[];
  currentDecision: ReadinessApprovalDecision;
  comments: string;
  approvalDate?: string;
  ppapStatus: PpapStatusType;
  onDecisionChange: (decision: ReadinessApprovalDecision, comments: string) => void;
  onToggleReviewerStatus?: (index: number) => void;
}

export const MassProductionReviewTable: React.FC<MassProductionReviewTableProps> = ({
  reviewers,
  currentDecision,
  comments,
  approvalDate,
  ppapStatus,
  onDecisionChange,
  onToggleReviewerStatus,
}) => {
  const [localDecision, setLocalDecision] = useState<ReadinessApprovalDecision>(currentDecision);
  const [localComments, setLocalComments] = useState<string>(comments || "");

  const allApproved = reviewers.every((r) => r.status === "Approved");
  const ppapApproved = ppapStatus === "Customer Approved";
  const canDecide = allApproved && ppapApproved;

  const handleDecisionSubmit = (newDecision: ReadinessApprovalDecision) => {
    setLocalDecision(newDecision);
    onDecisionChange(newDecision, localComments);
  };

  const getStatusBadge = (status: "Approved" | "Pending" | "Rejected") => {
    switch (status) {
      case "Approved":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved ✓
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Pending ⏱
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* 7 Approvers Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-xs text-left">
          <thead className="bg-muted text-muted-foreground uppercase font-bold text-[10px] tracking-wider border-b border-border">
            <tr>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Reviewer</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 bg-card">
            {reviewers.map((row, index) => (
              <tr key={index} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-semibold text-foreground">{row.role}</td>
                <td className="px-4 py-3 font-medium text-foreground">{row.reviewer}</td>
                <td className="px-4 py-3">{getStatusBadge(row.status)}</td>
                <td className="px-4 py-3 text-right">
                  {onToggleReviewerStatus && (
                    <button
                      onClick={() => onToggleReviewerStatus(index)}
                      className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 underline"
                    >
                      Toggle Sign-off
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!canDecide && (
        <div className="flex items-center gap-2 p-2.5 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded border border-amber-200 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>
            Executive decision dropdown is locked until all 7 roles sign off with "Approved" AND PPAP Status is "Customer Approved".
          </span>
        </div>
      )}

      {/* Decision controls below table */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div>
          <label className="text-[11px] font-bold text-muted-foreground uppercase block mb-1">
            Approval Decision
          </label>
          <select
            value={localDecision}
            disabled={!canDecide}
            onChange={(e) => handleDecisionSubmit(e.target.value as ReadinessApprovalDecision)}
            className="w-full px-3 py-2 bg-background border border-input rounded-md text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          >
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Approved with Conditions">Approved with Conditions</option>
            <option value="Additional Validation Required">Additional Validation Required</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-muted-foreground uppercase block mb-1">
            Executive Comments
          </label>
          <textarea
            rows={2}
            value={localComments}
            onChange={(e) => setLocalComments(e.target.value)}
            onBlur={() => onDecisionChange(localDecision, localComments)}
            placeholder="Enter executive comments or launch conditions..."
            className="w-full px-3 py-1.5 bg-background border border-input rounded-md text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-muted-foreground uppercase block mb-1">
            Approval Date
          </label>
          <input
            type="text"
            readOnly
            value={approvalDate || "Auto-set on decision"}
            className="w-full px-3 py-2 bg-muted border border-input rounded-md text-xs text-muted-foreground font-medium"
          />
        </div>
      </div>
    </div>
  );
};
