import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Bot,
  ArrowRight,
  FileText,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Award,
  Download,
  Eye,
  Edit,
  Plus,
  Lock,
  Layers,
  Wrench,
  Users,
} from "lucide-react";
import type { WorkInstructionFormInput, WorkInstructionRecord } from "@/services/types";
import { toast } from "sonner";

export function WorkInstructionOverviewSection({
  form,
  record,
  onNavigateTab,
}: {
  form: UseFormReturn<WorkInstructionFormInput>;
  record: WorkInstructionRecord;
  onNavigateTab?: (tabId: string) => void;
}) {
  const { watch } = form;

  const overallReadiness = watch("overallReadinessScore") ?? 87;
  const qualityScore = watch("qualityScore") ?? 85;
  const safetyScore = watch("safetyScore") ?? 90;
  const competencyScore = watch("competencyScore") ?? 84;
  const aiScore = watch("aiDocumentationScore") ?? 88;

  const steps = record.steps || [];

  return (
    <div className="space-y-6">
      {/* Top 6 KPI Cards & Gauges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Overall Readiness Score */}
        <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900 p-3.5 text-center flex flex-col justify-between">
          <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
            Overall Readiness Score
          </span>
          <div className="my-2 inline-flex items-center justify-center">
            <div className="relative flex items-center justify-center h-16 w-16 rounded-full border-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40">
              <span className="text-xl font-black text-emerald-700 dark:text-emerald-300 font-mono">
                {overallReadiness}
              </span>
              <span className="text-[9px] text-emerald-500 font-bold font-mono">/100</span>
            </div>
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold">Good</span>
        </Card>

        {/* Quality Score */}
        <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900 p-3.5 text-center flex flex-col justify-between">
          <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
            Quality Score
          </span>
          <div className="my-2 inline-flex items-center justify-center">
            <div className="relative flex items-center justify-center h-16 w-16 rounded-full border-4 border-blue-500 bg-blue-50 dark:bg-blue-950/40">
              <span className="text-xl font-black text-blue-700 dark:text-blue-300 font-mono">
                {qualityScore}
              </span>
              <span className="text-[9px] text-blue-500 font-bold font-mono">/100</span>
            </div>
          </div>
          <span className="text-[10px] text-blue-600 font-semibold">Good</span>
        </Card>

        {/* Safety Score */}
        <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900 p-3.5 text-center flex flex-col justify-between">
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
            Safety Score
          </span>
          <div className="my-2 inline-flex items-center justify-center">
            <div className="relative flex items-center justify-center h-16 w-16 rounded-full border-4 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40">
              <span className="text-xl font-black text-emerald-700 dark:text-emerald-300 font-mono">
                {safetyScore}
              </span>
              <span className="text-[9px] text-emerald-500 font-bold font-mono">/100</span>
            </div>
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold">Excellent</span>
        </Card>

        {/* Competency Score */}
        <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900 p-3.5 text-center flex flex-col justify-between">
          <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
            Competency Score
          </span>
          <div className="my-2 inline-flex items-center justify-center">
            <div className="relative flex items-center justify-center h-16 w-16 rounded-full border-4 border-purple-500 bg-purple-50 dark:bg-purple-950/40">
              <span className="text-xl font-black text-purple-700 dark:text-purple-300 font-mono">
                {competencyScore}
              </span>
              <span className="text-[9px] text-purple-500 font-bold font-mono">/100</span>
            </div>
          </div>
          <span className="text-[10px] text-purple-600 font-semibold">Good</span>
        </Card>

        {/* AI Documentation Score */}
        <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900 p-3.5 text-center flex flex-col justify-between">
          <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
            AI Documentation Score
          </span>
          <div className="my-2 inline-flex items-center justify-center">
            <div className="relative flex items-center justify-center h-16 w-16 rounded-full border-4 border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40">
              <span className="text-xl font-black text-indigo-700 dark:text-indigo-300 font-mono">
                {aiScore}
              </span>
              <span className="text-[9px] text-indigo-500 font-bold font-mono">/100</span>
            </div>
          </div>
          <span className="text-[10px] text-indigo-600 font-semibold">Good</span>
        </Card>

        {/* Status Card */}
        <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900 p-3.5 text-center flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground block">
            Status
          </span>
          <div className="my-1 flex flex-col items-center justify-center">
            <Badge className="bg-blue-600 text-white text-xs font-semibold px-2.5 py-1">
              Under Review
            </Badge>
          </div>
          <span className="text-[10px] text-muted-foreground font-semibold">Review by QA Manager</span>
        </Card>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Work Instruction Overview */}
          <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold">1. Work Instruction Overview</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1 hover:text-primary"
                onClick={() => onNavigateTab?.("operation_details")}
              >
                <Edit className="h-3.5 w-3.5" /> Edit
              </Button>
            </CardHeader>

            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-muted-foreground block font-medium">Workstation</span>
                  <span className="font-bold text-primary font-mono">{record.workstation}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block font-medium">Production Line</span>
                  <span className="font-bold text-foreground font-mono">{record.productionLine}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block font-medium">Product Family</span>
                  <span className="font-semibold text-foreground">{record.productFamily}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block font-medium">Product Model</span>
                  <span className="font-semibold text-foreground font-mono">{record.productModel}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block font-medium">Process Name</span>
                  <span className="font-semibold text-foreground">{record.processName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block font-medium">Operation Number</span>
                  <span className="font-bold text-foreground font-mono">{record.operationNumber}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block font-medium">Instruction Category</span>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                    {record.instructionCategory}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground block font-medium">Priority</span>
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px]">
                    {record.priority}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-foreground block">Operation Description</span>
                <p className="text-muted-foreground leading-relaxed">
                  {record.operationDescription}
                </p>
              </div>

              {/* Visual Instruction Steps Checklist (No stock images) */}
              <div className="space-y-2 pt-2">
                <span className="font-bold text-foreground block">Visual Instruction Control Steps</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-lg border border-border bg-slate-50 dark:bg-slate-800/40 text-[11px]">
                    <span className="font-bold text-primary block">Step 1: Alignment</span>
                    <span className="text-muted-foreground">Verify locator pins and latch initial seating.</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-border bg-slate-50 dark:bg-slate-800/40 text-[11px]">
                    <span className="font-bold text-primary block">Step 2: Torquing</span>
                    <span className="text-muted-foreground">Torque M6 bolts in star pattern to 12.5 Nm.</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-border bg-slate-50 dark:bg-slate-800/40 text-[11px]">
                    <span className="font-bold text-primary block">Step 3: Verification</span>
                    <span className="text-muted-foreground">Check continuity and seal integrity.</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Step-by-Step Instructions Summary Table */}
          <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">2. Step-by-Step Instructions</CardTitle>
                <CardDescription className="text-xs">
                  Sequential operation steps, key quality points & time allocation.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1"
                  onClick={() => onNavigateTab?.("operation_details")}
                >
                  <Plus className="h-3.5 w-3.5" /> Add Step
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1"
                  onClick={() => toast.info("Importing from SOP...")}
                >
                  Import from SOP
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="divide-y divide-border/60 text-xs">
                <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 font-bold text-muted-foreground uppercase text-[10px]">
                  <div className="col-span-1 text-center">Step</div>
                  <div className="col-span-4">Instruction</div>
                  <div className="col-span-3">Visual / Reference</div>
                  <div className="col-span-3">Key Points</div>
                  <div className="col-span-1 text-right">Time</div>
                </div>

                {steps.map((st) => (
                  <div key={st.id} className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                    <div className="col-span-1 text-center font-bold text-primary font-mono">{st.stepNumber}</div>
                    <div className="col-span-4 font-semibold text-foreground">{st.instruction}</div>
                    <div className="col-span-3">
                      {st.visualReferenceUrl ? (
                        <img
                          src={st.visualReferenceUrl}
                          alt={st.instruction}
                          className="h-10 w-16 object-cover rounded border border-slate-200 dark:border-slate-700"
                        />
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">No Visual</span>
                      )}
                    </div>
                    <div className="col-span-3 text-[11px] text-muted-foreground">{st.keyPoints}</div>
                    <div className="col-span-1 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                      {st.timeSeconds}s
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-border flex items-center justify-between text-xs px-4">
                <span className="font-bold text-foreground">Total Cycle Time</span>
                <span className="font-bold text-primary font-mono text-sm">
                  {record.totalCycleTimeSec} Sec ({Math.round(record.totalCycleTimeSec / 60 * 10) / 10} mins)
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Cards 4, 5, 6: Quality, Safety & Training Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">4. Quality Requirements</span>
                <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700">Score 85/100</Badge>
              </div>
              <ul className="space-y-1 text-muted-foreground text-[11px]">
                {record.inspectionPoints.slice(0, 3).map((pt, i) => (
                  <li key={i} className="flex items-center gap-1.5 truncate">
                    <CheckCircle2 className="h-3 w-3 text-blue-600 shrink-0" />
                    <span className="truncate">{pt}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">5. Safety & Compliance</span>
                <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700">Score 90/100</Badge>
              </div>
              <ul className="space-y-1 text-muted-foreground text-[11px]">
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3 w-3 text-emerald-600 shrink-0" />
                  <span>Hazards Identified: {record.hazardsIdentified}</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3 w-3 text-emerald-600 shrink-0" />
                  <span>Lockout/Tagout: {record.lockoutTagoutRequired ? "Required" : "No"}</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3 w-3 text-emerald-600 shrink-0" />
                  <span>Regulatory Compliance: Yes</span>
                </li>
              </ul>
            </Card>

            <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">6. Training & Competency</span>
                <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-700">Score 84/100</Badge>
              </div>
              <ul className="space-y-1 text-muted-foreground text-[11px]">
                <li className="flex items-center gap-1.5">
                  <Users className="h-3 w-3 text-purple-600 shrink-0" />
                  <span>Training Required: Yes</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Users className="h-3 w-3 text-purple-600 shrink-0" />
                  <span>Skill Level: {record.skillLevel}</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Users className="h-3 w-3 text-purple-600 shrink-0" />
                  <span>Authorized Operators: {record.authorizedOperators}</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* AI Knowledge Insights Widget */}
          <Card className="border-border/80 shadow-xs bg-gradient-to-br from-indigo-50/50 to-blue-50/50 dark:from-indigo-950/40 dark:to-blue-950/40 border-indigo-200 dark:border-indigo-800">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold flex items-center gap-1.5 text-indigo-900 dark:text-indigo-200">
                <Sparkles className="h-4 w-4 text-amber-500" />
                AI Knowledge Insights
              </CardTitle>
              <Badge className="bg-indigo-600 text-white text-[10px]">
                AI Score {aiScore}/100
              </Badge>
            </CardHeader>

            <CardContent className="space-y-3 text-xs">
              <div className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-indigo-100 dark:border-indigo-900 space-y-1">
                <span className="font-bold text-indigo-950 dark:text-indigo-300 block flex items-center gap-1">
                  <Bot className="h-3.5 w-3.5 text-indigo-600" /> Instruction Review
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  {watch("aiInstructionReview") || "All steps are clear and complete."}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-indigo-100 dark:border-indigo-900 space-y-1">
                <span className="font-bold text-indigo-950 dark:text-indigo-300 block flex items-center gap-1">
                  <Bot className="h-3.5 w-3.5 text-indigo-600" /> Risk Assessment
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  {watch("aiRiskAssessment") || "Low risk operation. Ensure ESD safety."}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-indigo-100 dark:border-indigo-900 space-y-1">
                <span className="font-bold text-indigo-950 dark:text-indigo-300 block flex items-center gap-1">
                  <Bot className="h-3.5 w-3.5 text-indigo-600" /> Process Optimization
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  {watch("aiProcessOptimization") || "Use pre-assembled cable harness to reduce cycle time by 8%."}
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-indigo-700 dark:text-indigo-300 justify-end gap-1 font-semibold"
                onClick={() => onNavigateTab?.("ai_assessment")}
              >
                View AI Report <ArrowRight className="h-3 w-3" />
              </Button>
            </CardContent>
          </Card>

          {/* Document Control Widget */}
          <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900 p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="font-bold text-foreground">Document Control</span>
              <Badge className="bg-emerald-600 text-white text-[10px]">Controlled Document</Badge>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Effective Date</span>
                <span className="font-mono text-foreground">{record.effectiveDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Next Review Date</span>
                <span className="font-mono text-foreground">{record.nextReviewDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Distribution</span>
                <span className="font-medium text-foreground">Shop Floor, QC, Training</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Access Level</span>
                <span className="font-semibold text-emerald-600">Authorized</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs h-8"
              onClick={() => toast.info("Opening revision history...")}
            >
              View Revision History
            </Button>
          </Card>

          {/* Quick Actions Widget */}
          <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 text-xs">
              {[
                "Preview Work Instruction",
                "Publish to Shop Floor",
                "Assign Training",
                "Export PDF",
                "Duplicate Document",
                "Request Revision",
              ].map((act) => (
                <button
                  key={act}
                  type="button"
                  onClick={() => toast.info(`Action triggered: ${act}`)}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 text-foreground transition-colors font-medium text-left cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    {act}
                  </span>
                  <ArrowRight className="h-3 w-3 text-slate-400" />
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
