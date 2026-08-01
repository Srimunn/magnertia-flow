import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Clock, UserCheck } from "lucide-react";
import type { FactoryApprovalDecision, FactoryLayoutFormInput, FactoryReviewer } from "@/services/types";
import { factoryLayoutDesignService } from "@/services/factoryLayoutDesignService";
import { toast } from "sonner";

export function FactoryApprovalSection({
  form,
  reviewers,
}: {
  form: UseFormReturn<FactoryLayoutFormInput>;
  reviewers: FactoryReviewer[];
}) {
  const { setValue } = form;

  const [decision, setDecision] = useState<FactoryApprovalDecision>("Approved");
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApplyDecision = async () => {
    setIsSubmitting(true);
    try {
      const res = await factoryLayoutDesignService.reviewDecision({
        id: "proc-fact-rec-0012",
        decision,
        comments,
      });
      setValue("workflowStatus", res.workflowStatus);
      setValue("approvalDecision", res.approvalDecision);
      toast.success(`Approval decision saved: ${decision}`);
    } catch (err) {
      toast.error("Failed to update approval decision");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
              10
            </span>
            <CardTitle className="text-base font-bold">Multi-Level Review & Approval Workflow</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Cross-functional executive sign-offs: Layout, Manufacturing, Production, Industrial, Facility, EHS, Plant Head, COO, CEO.
          </CardDescription>
        </div>

        <Badge className="bg-blue-600 text-white text-xs font-semibold px-3 py-1">
          Workflow Stage: Under Review
        </Badge>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-2">
            <div className="rounded-lg border border-border overflow-hidden text-xs">
              <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border">
                <div className="col-span-3">Role</div>
                <div className="col-span-3">Approver</div>
                <div className="col-span-2">Decision</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2 text-right">Status</div>
              </div>

              <div className="divide-y divide-border/60">
                {reviewers.map((rev) => {
                  const isApproved = rev.status === "Approved";
                  return (
                    <div
                      key={rev.role}
                      className="grid grid-cols-12 gap-2 px-4 py-2.5 items-center hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <div className="col-span-3 font-semibold text-foreground">{rev.role}</div>
                      <div className="col-span-3 text-muted-foreground">{rev.person}</div>
                      <div className="col-span-2 font-medium">
                        {isApproved ? (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Approved
                          </span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" /> Pending
                          </span>
                        )}
                      </div>
                      <div className="col-span-2 text-muted-foreground font-mono">{rev.date}</div>
                      <div className="col-span-2 text-right">
                        <Badge
                          variant="outline"
                          className={
                            isApproved
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 text-[10px]"
                              : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 text-[10px]"
                          }
                        >
                          {rev.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-4 text-xs">
            <span className="font-bold text-foreground block text-sm flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-primary" />
              Sign-Off Decision Panel
            </span>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Approval Decision</label>
              <Select value={decision} onValueChange={(v) => setDecision(v as FactoryApprovalDecision)}>
                <SelectTrigger className="h-9 text-xs font-semibold bg-white dark:bg-slate-900">
                  <SelectValue placeholder="Select Decision" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Approved" className="text-xs text-emerald-600 font-semibold">
                    Approved
                  </SelectItem>
                  <SelectItem value="Approved with Conditions" className="text-xs text-blue-600">
                    Approved with Conditions
                  </SelectItem>
                  <SelectItem value="Revision Required" className="text-xs text-amber-600 font-semibold">
                    Revision Required
                  </SelectItem>
                  <SelectItem value="On Hold" className="text-xs text-purple-600">
                    On Hold
                  </SelectItem>
                  <SelectItem value="Rejected" className="text-xs text-destructive font-semibold">
                    Rejected
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Review Comments</label>
              <Textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
                placeholder="Enter sign-off comments, conditional constraints, or layout modification requests..."
                className="text-xs bg-white dark:bg-slate-900 min-h-[90px]"
              />
            </div>

            <Button
              size="sm"
              onClick={handleApplyDecision}
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold text-xs shadow-xs"
            >
              {isSubmitting ? "Submitting..." : "Submit Review Decision"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
