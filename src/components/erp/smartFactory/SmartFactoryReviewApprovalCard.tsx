import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, Clock, UserCheck } from "lucide-react";
import type { SmartFactoryApprovalDecision, SmartFactoryDevelopmentRecord } from "@/services/types";

interface SmartFactoryReviewApprovalCardProps {
  record: SmartFactoryDevelopmentRecord;
  onDecisionChange: (decision: "Approved" | "Approved with Conditions" | "Revision Required" | "Rejected", comments: string) => void;
}

export const SmartFactoryReviewApprovalCard: React.FC<SmartFactoryReviewApprovalCardProps> = ({
  record,
  onDecisionChange,
}) => {
  const [decision, setDecision] = useState<SmartFactoryApprovalDecision>(record.approvalDecision || "Approved");
  const [comments, setComments] = useState(record.reviewComments || "");

  const handleApplyDecision = () => {
    if (decision === "Pending") return;
    onDecisionChange(
      decision as "Approved" | "Approved with Conditions" | "Revision Required" | "Rejected",
      comments
    );
  };

  const getDecisionBadge = (dec: SmartFactoryApprovalDecision) => {
    switch (dec) {
      case "Approved":
        return <Badge className="bg-emerald-600 text-white font-semibold">Approved</Badge>;
      case "Approved with Conditions":
        return <Badge className="bg-amber-600 text-white font-semibold">Approved with Conditions</Badge>;
      case "Revision Required":
        return <Badge className="bg-purple-600 text-white font-semibold">Revision Required</Badge>;
      case "On Hold":
        return <Badge className="bg-indigo-600 text-white font-semibold">On Hold</Badge>;
      case "Rejected":
        return <Badge className="bg-rose-600 text-white font-semibold">Rejected</Badge>;
      default:
        return <Badge variant="outline" className="text-muted-foreground">Pending</Badge>;
    }
  };

  const MaicwBadge = ({ type, tooltip }: { type: "M" | "A" | "I" | "C" | "W"; tooltip: string }) => (
    <span
      title={tooltip}
      className="ml-1.5 inline-flex items-center justify-center rounded border border-indigo-200 bg-indigo-100 px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300"
    >
      {type}
    </span>
  );

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="border-b border-border/60 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-bold text-foreground">
              10. Review & Approval (10-Role Authorization Matrix)
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Decision:</span>
            {getDecisionBadge(record.approvalDecision)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 pt-4">
        {/* 10-Role Approvers Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {record.reviewers.map((rev) => (
            <div
              key={rev.id}
              className="flex flex-col justify-between rounded-xl border border-border/70 bg-card p-3 shadow-2xs transition-shadow hover:shadow-xs"
            >
              <div>
                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  {rev.role}
                  <MaicwBadge type="W" tooltip="Workflow Approval Role" />
                </span>
                <div className="mt-1 flex items-center gap-1.5 font-bold text-foreground text-xs">
                  <UserCheck className="h-3.5 w-3.5 text-primary" />
                  <span>{rev.person}</span>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2 text-[10px]">
                {getDecisionBadge(rev.decision)}
                <span className="font-medium text-muted-foreground">{rev.date}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Executive Decision & Comments Box */}
        <div className="rounded-xl border border-border bg-muted/20 p-4">
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-foreground">
            Smart Factory Executive Review Board Decision
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Approval Decision</label>
              <Select
                value={decision}
                onValueChange={(val) => setDecision(val as SmartFactoryApprovalDecision)}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select Decision" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Approved" className="text-xs">Approved</SelectItem>
                  <SelectItem value="Approved with Conditions" className="text-xs">Approved with Conditions</SelectItem>
                  <SelectItem value="Revision Required" className="text-xs">Revision Required</SelectItem>
                  <SelectItem value="On Hold" className="text-xs">On Hold</SelectItem>
                  <SelectItem value="Rejected" className="text-xs">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-foreground">Review Comments</label>
              <Textarea
                rows={2}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Enter review board comments and deployment conditions..."
                className="text-xs"
              />
            </div>
          </div>

          <div className="mt-3 flex justify-end">
            <Button size="sm" onClick={handleApplyDecision} className="gap-1.5 bg-primary text-xs font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" />
              Record Executive Decision
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
