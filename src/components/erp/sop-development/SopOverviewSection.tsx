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
  AlertTriangle,
  GraduationCap,
} from "lucide-react";
import type { SopFormInput, SopRecord } from "@/services/types";
import { ProcessFlowViewer } from "./ProcessFlowViewer";
import { toast } from "sonner";

export function SopOverviewSection({
  form,
  record,
  onNavigateTab,
}: {
  form: UseFormReturn<SopFormInput>;
  record: SopRecord;
  onNavigateTab?: (tabId: string) => void;
}) {
  const { watch } = form;

  const overallReadiness = watch("overallReadinessScore") ?? 87;
  const procedureScore = watch("procedureReadinessScore") ?? 85;
  const complianceScore = watch("complianceScore") ?? 90;
  const riskScore = watch("riskScore") ?? 82;
  const trainingScore = watch("trainingScore") ?? 88;
  const aiScore = watch("aiDocumentationScore") ?? 91;

  const steps = record.steps || [];
  const resources = record.resources || [];

  return (
    <div className="space-y-6">
      {/* Top 6 Executive Score Cards & Gauges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Overall SOP Readiness */}
        <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900 p-3.5 text-center flex flex-col justify-between">
          <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
            Overall SOP Readiness
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

        {/* Procedure Readiness */}
        <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900 p-3.5 text-center flex flex-col justify-between">
          <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
            Procedure Readiness
          </span>
          <div className="my-2 inline-flex items-center justify-center">
            <div className="relative flex items-center justify-center h-16 w-16 rounded-full border-4 border-blue-500 bg-blue-50 dark:bg-blue-950/40">
              <span className="text-xl font-black text-blue-700 dark:text-blue-300 font-mono">
                {procedureScore}
              </span>
              <span className="text-[9px] text-blue-500 font-bold font-mono">/100</span>
            </div>
          </div>
          <span className="text-[10px] text-blue-600 font-semibold">Good</span>
        </Card>

        {/* Compliance Score */}
        <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900 p-3.5 text-center flex flex-col justify-between">
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
            Compliance Score
          </span>
          <div className="my-2 inline-flex items-center justify-center">
            <div className="relative flex items-center justify-center h-16 w-16 rounded-full border-4 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40">
              <span className="text-xl font-black text-emerald-700 dark:text-emerald-300 font-mono">
                {complianceScore}
              </span>
              <span className="text-[9px] text-emerald-500 font-bold font-mono">/100</span>
            </div>
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold">Excellent</span>
        </Card>

        {/* Risk Score */}
        <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900 p-3.5 text-center flex flex-col justify-between">
          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
            Risk Score
          </span>
          <div className="my-2 inline-flex items-center justify-center">
            <div className="relative flex items-center justify-center h-16 w-16 rounded-full border-4 border-amber-500 bg-amber-50 dark:bg-amber-950/40">
              <span className="text-xl font-black text-amber-700 dark:text-amber-300 font-mono">
                {riskScore}
              </span>
              <span className="text-[9px] text-amber-500 font-bold font-mono">/100</span>
            </div>
          </div>
          <span className="text-[10px] text-amber-600 font-semibold">Good</span>
        </Card>

        {/* Training Score */}
        <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900 p-3.5 text-center flex flex-col justify-between">
          <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
            Training Score
          </span>
          <div className="my-2 inline-flex items-center justify-center">
            <div className="relative flex items-center justify-center h-16 w-16 rounded-full border-4 border-purple-500 bg-purple-50 dark:bg-purple-950/40">
              <span className="text-xl font-black text-purple-700 dark:text-purple-300 font-mono">
                {trainingScore}
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
            <div className="relative flex items-center justify-center h-16 w-16 rounded-full border-4 border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40">
              <span className="text-xl font-black text-indigo-700 dark:text-indigo-300 font-mono">
                {aiScore}
              </span>
              <span className="text-[9px] text-indigo-500 font-bold font-mono">/100</span>
            </div>
          </div>
          <span className="text-[10px] text-indigo-600 font-semibold">Excellent</span>
        </Card>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: SOP Overview */}
          <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold">1. SOP Overview</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1 hover:text-primary"
                onClick={() => onNavigateTab?.("procedure_definition")}
              >
                <Edit className="h-3.5 w-3.5" /> Edit
              </Button>
            </CardHeader>

            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-muted-foreground block font-medium">Business Function</span>
                  <span className="font-bold text-primary">{record.businessFunction}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block font-medium">Process Name</span>
                  <span className="font-bold text-foreground">{record.processName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block font-medium">SOP Category</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                    {record.sopCategory}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground block font-medium">Priority</span>
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px]">
                    {record.priority}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="font-bold text-foreground block">Process Objective</span>
                  <p className="text-muted-foreground leading-relaxed">
                    {record.processObjective}
                  </p>
                </div>
                <div>
                  <span className="font-bold text-foreground block">Scope & Applicability</span>
                  <p className="text-muted-foreground leading-relaxed">
                    {record.scope} {record.applicability}
                  </p>
                </div>
                <div>
                  <span className="font-bold text-foreground block">Trigger Event & Expected Output</span>
                  <p className="text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Trigger:</strong> {record.triggerEvent} — <strong className="text-foreground">Expected Output:</strong> {record.expectedOutput}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Process Flow Diagram Card */}
          <ProcessFlowViewer />

          {/* Card 2: Procedure Definition Summary Table */}
          <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">2. Procedure Definition</CardTitle>
                <CardDescription className="text-xs">
                  Sequential operation steps, responsible roles & duration allocation.
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1"
                onClick={() => onNavigateTab?.("procedure_definition")}
              >
                View All {steps.length || 12} Steps <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </CardHeader>

            <CardContent className="p-0">
              <div className="divide-y divide-border/60 text-xs">
                <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 font-bold text-muted-foreground uppercase text-[10px]">
                  <div className="col-span-1 text-center">Step</div>
                  <div className="col-span-5">Procedure Description</div>
                  <div className="col-span-4">Responsible Role</div>
                  <div className="col-span-2 text-right">Duration</div>
                </div>

                {steps.slice(0, 4).map((st) => (
                  <div key={st.id} className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                    <div className="col-span-1 text-center font-bold text-primary font-mono">{st.stepNumber}</div>
                    <div className="col-span-5 font-semibold text-foreground">{st.description}</div>
                    <div className="col-span-4 text-muted-foreground">{st.responsibleRole}</div>
                    <div className="col-span-2 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                      {st.durationMins} mins
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-border flex items-center justify-between text-xs px-4">
                <span className="font-bold text-foreground">Total SOP Duration</span>
                <span className="font-bold text-primary font-mono text-sm">
                  {record.totalDurationMins} Mins
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Cards 3, 4, 5, 6: Resources, Quality, Risk, Training Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">3. Resources & Requirements</span>
                <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700">Verified ✓</Badge>
              </div>
              <ul className="space-y-1 text-muted-foreground text-[11px]">
                <li className="flex items-center justify-between">
                  <span>Required Equipment</span>
                  <span className="font-bold text-foreground">5 Items • Verified ✓</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Required Tools</span>
                  <span className="font-bold text-foreground">8 Items • Verified ✓</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Software Systems</span>
                  <span className="font-bold text-foreground">3 Items • Verified ✓</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Forms & Templates</span>
                  <span className="font-bold text-foreground">6 Items • Verified ✓</span>
                </li>
              </ul>
            </Card>

            <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">4. Quality & Compliance</span>
                <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700">Score 90/100</Badge>
              </div>
              <ul className="space-y-1 text-muted-foreground text-[11px]">
                <li className="flex items-center justify-between">
                  <span>Applicable Standards</span>
                  <span className="font-bold text-foreground">ISO 9001:2015, ISO 14001:2015</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Regulatory Rules</span>
                  <span className="font-bold text-foreground">Factories Act, OSHA, BIS</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Internal Policies</span>
                  <span className="font-bold text-foreground">Quality Policy, EHS Policy</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Audit Checklists</span>
                  <span className="font-bold text-emerald-600">Compliance Verified ✓</span>
                </li>
              </ul>
            </Card>

            <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">5. Risk & Safety</span>
                <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700">Score 82/100</Badge>
              </div>
              <ul className="space-y-1 text-muted-foreground text-[11px]">
                <li className="flex items-center justify-between">
                  <span>Risk Level</span>
                  <Badge variant="outline" className="text-[9px] bg-amber-100 text-amber-800">Medium</Badge>
                </li>
                <li className="flex items-center justify-between">
                  <span>Risk Assessment Report</span>
                  <span className="font-mono text-primary truncate max-w-[140px]">{record.riskAssessmentReport}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>EHS Requirements</span>
                  <span className="font-bold text-foreground">PPE, Machine Guarding</span>
                </li>
              </ul>
            </Card>

            <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">6. Training & Implementation</span>
                <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-700">Score 88/100</Badge>
              </div>
              <ul className="space-y-1 text-muted-foreground text-[11px]">
                <li className="flex items-center justify-between">
                  <span>Training Required</span>
                  <span className="font-bold text-emerald-600">Yes ✓</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Training Material</span>
                  <span className="font-mono text-primary truncate max-w-[140px]">{record.trainingMaterial}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Target Audience</span>
                  <span className="font-bold text-foreground truncate max-w-[140px]">{record.targetAudience}</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Details Widget */}
          <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900 p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="font-bold text-foreground">Quick Details</span>
              <Badge className="bg-primary text-white text-[10px]">Rev 2.0</Badge>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">SOP Category</span>
                <span className="font-semibold text-foreground">{record.sopCategory}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Effective Date</span>
                <span className="font-mono text-foreground">{record.effectiveDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Next Review Date</span>
                <span className="font-mono text-foreground">{record.nextReviewDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Workflow Stage</span>
                <span className="font-semibold text-blue-600">{record.workflowStageLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Steps</span>
                <span className="font-bold font-mono text-foreground">12 Steps</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated Duration</span>
                <span className="font-bold font-mono text-foreground">45 mins</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Training Required</span>
                <span className="font-semibold text-emerald-600">Yes ✓</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Resource Verified</span>
                <span className="font-semibold text-emerald-600">Yes ✓</span>
              </div>
            </div>
          </Card>

          {/* AI SOP Insights Widget */}
          <Card className="border-border/80 shadow-xs bg-gradient-to-br from-indigo-50/50 to-blue-50/50 dark:from-indigo-950/40 dark:to-blue-950/40 border-indigo-200 dark:border-indigo-800">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold flex items-center gap-1.5 text-indigo-900 dark:text-indigo-200">
                <Sparkles className="h-4 w-4 text-amber-500" />
                AI SOP Insights
              </CardTitle>
              <Badge className="bg-indigo-600 text-white text-[10px]">
                AI Score {aiScore}/100
              </Badge>
            </CardHeader>

            <CardContent className="space-y-3 text-xs">
              <div className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-indigo-100 dark:border-indigo-900 space-y-1">
                <span className="font-bold text-indigo-950 dark:text-indigo-300 block flex items-center gap-1">
                  <Bot className="h-3.5 w-3.5 text-indigo-600" /> AI SOP Review
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  {watch("aiSopReview") || "SOP is well-structured and follows best practices."}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-indigo-100 dark:border-indigo-900 space-y-1">
                <span className="font-bold text-indigo-950 dark:text-indigo-300 block flex items-center gap-1">
                  <Bot className="h-3.5 w-3.5 text-indigo-600" /> AI Compliance Analysis
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  {watch("aiComplianceAnalysis") || "Meets ISO 9001:2015 requirements."}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-indigo-100 dark:border-indigo-900 space-y-1">
                <span className="font-bold text-indigo-950 dark:text-indigo-300 block flex items-center gap-1">
                  <Bot className="h-3.5 w-3.5 text-indigo-600" /> AI Risk Prediction
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  {watch("aiRiskPrediction") || "Medium risk in manual data entry step. Recommend barcode verification."}
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
                <span className="text-muted-foreground">Status</span>
                <span className="font-semibold text-emerald-600">Controlled</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">SOP Number</span>
                <span className="font-mono text-foreground">{record.sopNumber}</span>
              </div>
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
                <span className="font-medium text-foreground">Org Wide</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Access Level</span>
                <span className="font-semibold text-emerald-600">Authorized Users</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs h-8"
              onClick={() => toast.info("Opening SOP revision history...")}
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
                "Publish SOP",
                "Assign Training",
                "Export SOP (PDF)",
                "Duplicate SOP",
                "Request Revision",
                "Print SOP",
                "Share SOP Link",
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
