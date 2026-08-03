import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ClipboardCheck,
  Save,
  Send,
  MoreHorizontal,
  FileText,
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Shield,
  Zap,
  Activity,
  Cpu,
  Layers,
  Sparkles,
  BarChart3,
  Search,
  Plus,
  Play,
  RotateCw,
  Award,
  ChevronRight,
  Eye,
  Check,
  X,
  Building,
  Thermometer,
  Gauge,
  Lock,
  ArrowRight,
  UserCheck,
  Paperclip,
  Share2,
  Printer,
  History,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

import { InnovationAreaTabs } from "@/components/erp/ResearchInnovationTabBar";
import { AppShell } from "@/components/erp/AppShell";
import {
  TestingValidationTabBar,
  type TestingTabKey,
} from "@/components/erp/TestingValidationTabBar";
import { testingValidationService } from "@/services/testingValidationService";
import type {
  TestingApprovalDecision,
  TestingFormInput,
  TestingValidationRecord,
  TestCaseRecord,
  DefectRecord,
  TestingAttachment,
  TestingReviewer,
  TestingAuditEntry,
} from "@/services/types";

export const Route = createFileRoute(
  "/development/research-innovation/testing-validation/new"
)({
  component: TestingValidationNewPage,
});

export function TestingValidationNewPage({
  breadcrumb,
  tabs,
}: {
  breadcrumb?: string;
  tabs?: React.ReactNode;
} = {}) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TestingTabKey>("overview");
  const [reviewDecision, setReviewDecision] = useState<TestingApprovalDecision>("Approved with Conditions");
  const [reviewCommentInput, setReviewCommentInput] = useState(
    "Minor improvements suggested in thermal management. All safety and functional tests passed."
  );

  // Modals state
  const [isTestConsoleOpen, setIsTestConsoleOpen] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState<TestCaseRecord | null>(null);
  const [isDefectModalOpen, setIsDefectModalOpen] = useState(false);
  const [newDefectTitle, setNewDefectTitle] = useState("");
  const [newDefectSeverity, setNewDefectSeverity] = useState("Minor");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<TestingAttachment | null>(null);

  // Query record
  const { data: record, isLoading } = useQuery<TestingValidationRecord>({
    queryKey: ["testingValidationRecord"],
    queryFn: testingValidationService.fetchRecord,
  });

  // Save Draft Mutation
  const saveDraftMutation = useMutation({
    mutationFn: (input: Partial<TestingFormInput>) => testingValidationService.saveDraft(input),
    onSuccess: (updated) => {
      queryClient.setQueryData(["testingValidationRecord"], updated);
      toast.success("Draft saved successfully.");
    },
  });

  // Submit Mutation
  const submitMutation = useMutation({
    mutationFn: () => testingValidationService.submitForReview(),
    onSuccess: (updated) => {
      queryClient.setQueryData(["testingValidationRecord"], updated);
      toast.success("Testing & Validation submitted for QA review.");
    },
  });

  // Review Decision Mutation
  const reviewMutation = useMutation({
    mutationFn: (args: { id: string; decision: TestingApprovalDecision; comments?: string }) =>
      testingValidationService.reviewDecision(args),
    onSuccess: (updated) => {
      queryClient.setQueryData(["testingValidationRecord"], updated);
      toast.success(`Decision submitted: ${updated.approvalDecision}`);
    },
  });

  if (isLoading || !record) {
    return (
      <AppShell
        tabs={
          <InnovationAreaTabs
            sub={
              <TestingValidationTabBar
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            }
          />
        }
      >
        <div className="flex h-96 items-center justify-center p-8 text-sm text-muted-foreground">
          <RotateCw className="h-6 w-6 animate-spin mr-2 text-primary" /> Loading Testing & Validation Workspace...
        </div>
      </AppShell>
    );
  }

  const handleSaveDraft = () => {
    saveDraftMutation.mutate({
      testProjectName: record.testProjectName,
      testObjective: record.testObjective,
      testScope: record.testScope,
      testEnvironment: record.testEnvironment,
      priority: record.priority,
      recommendation: record.readinessSummary.recommendation,
    });
  };

  const handleSubmitReview = () => {
    submitMutation.mutate();
  };

  const handleSubmitDecision = () => {
    reviewMutation.mutate({
      id: record.id,
      decision: reviewDecision,
      comments: reviewCommentInput,
    });
  };

  const handleCreateDefect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDefectTitle) return;
    toast.success(`Defect logged: DEF-2024-00${record.resultsConfig.defectsList.length + 1}`);
    setIsDefectModalOpen(false);
    setNewDefectTitle("");
  };

  const chartData = [
    { category: "Functional", Passed: 24, Failed: 0, Blocked: 0 },
    { category: "Electrical", Passed: 18, Failed: 0, Blocked: 0 },
    { category: "Thermal", Passed: 12, Failed: 1, Blocked: 0 },
    { category: "EMC/EMI", Passed: 15, Failed: 0, Blocked: 0 },
    { category: "Safety", Passed: 10, Failed: 0, Blocked: 0 },
  ];

  return (
    <AppShell
      title="Testing & Validation"
      breadcrumb={breadcrumb}
      description="Validate test protocols, HALT/HASS stress testing, EMC compliance, and defect tracking."
      tabs={tabs}
    >
      <div className="space-y-6 pb-12 font-sans text-slate-900 dark:text-slate-100">

          {/* Form Metadata Control Card */}
          <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
            <CardContent className="p-4 sm:p-5 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/60 pb-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-primary/10 p-2.5 text-primary shrink-0">
                    <ClipboardCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {record.testProjectName}
                      </h1>
                      <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary">
                        {record.testVersion}
                      </Badge>
                      <Badge
                        className={
                          record.workflowStatus === "Approved"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                            : record.workflowStatus === "In Review"
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                            : "bg-blue-500/15 text-blue-700 dark:text-blue-300"
                        }
                      >
                        {record.workflowStatus}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      ID: <span className="font-semibold">{record.testingValidationId}</span> | Form Code:{" "}
                      <span className="font-semibold">{record.formCode}</span> | Created: {record.createdOn}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveDraft}
                    disabled={saveDraftMutation.isPending}
                    className="h-8 text-xs font-semibold gap-1.5"
                  >
                    <Save className="h-3.5 w-3.5 text-primary" /> Save Draft
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSubmitReview}
                    disabled={submitMutation.isPending}
                    className="h-8 text-xs font-semibold gap-1.5 bg-primary text-white hover:bg-primary/90"
                  >
                    <Send className="h-3.5 w-3.5" /> Submit for Review
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => toast.success("Exported PDF Report")}>
                        <FileText className="h-3.5 w-3.5 mr-2 text-primary" /> Export PDF Report
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.success("Exported Excel Data")}>
                        <FileSpreadsheet className="h-3.5 w-3.5 mr-2 text-emerald-600" /> Export CSV / Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.print()}>
                        <Printer className="h-3.5 w-3.5 mr-2 text-slate-600" /> Print Record
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Linked References Metadata Ribbon */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs pt-1">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Linked Product</span>
                  <span className="font-bold text-slate-900 dark:text-white truncate block">
                    {record.linkedProductId}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Linked Prototype</span>
                  <span className="font-semibold text-primary font-mono text-[11px]">
                    {record.linkedPrototypeId}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Linked Simulation</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400 font-mono text-[11px]">
                    {record.linkedSimulationId}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Test Engineer</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {record.testEngineerName}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">QA Engineer</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {record.qaEngineerName}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Environment / Stage</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {record.testEnvironment} ({record.developmentStage})
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ====================================================================
           3. MAIN TESTING WORKSPACE (12 Tabs + Right Insights Panel)
           ==================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            {/* TAB 1: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* 9 Numbered Section Overview Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Card 1: Test Project Overview */}
                  <Card className="border-border/80 shadow-xs hover:shadow-md transition-all bg-white dark:bg-slate-900">
                    <CardHeader className="p-3.5 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
                      <CardTitle className="text-xs font-bold flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">
                          1
                        </span>
                        Test Project Overview
                      </CardTitle>
                      <Badge variant="outline" className="text-[10px]">
                        Priority: {record.priority}
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-3.5 text-xs space-y-2">
                      <div>
                        <span className="text-muted-foreground text-[10px] block">Product Name</span>
                        <span className="font-bold text-slate-900 dark:text-white">{record.productName}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-[10px] block">Test Objective</span>
                        <p className="text-slate-600 dark:text-slate-300 line-clamp-2 text-[11px]">
                          {record.testObjective}
                        </p>
                      </div>
                      <div className="flex justify-between text-[11px] pt-1">
                        <span className="text-muted-foreground">Category:</span>
                        <span className="font-semibold">{record.productCategory}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card 2: Test Planning */}
                  <Card className="border-border/80 shadow-xs hover:shadow-md transition-all bg-white dark:bg-slate-900">
                    <CardHeader className="p-3.5 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
                      <CardTitle className="text-xs font-bold flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">
                          2
                        </span>
                        Test Planning
                      </CardTitle>
                      <Badge className="bg-emerald-500/15 text-emerald-700 text-[10px] font-bold">
                        Score: {record.planningConfig.planningScore}/100
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-3.5 text-xs space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground">Strategy:</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {record.planningConfig.testStrategy}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground">Test Plan:</span>
                        <span className="font-semibold text-primary flex items-center gap-1">
                          <FileText className="h-3 w-3 inline" /> {record.planningConfig.testPlanFile}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground">Acceptance:</span>
                        <span className="font-semibold text-emerald-600">
                          {record.planningConfig.acceptanceCriteria}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card 3: Prototype & Equipment */}
                  <Card className="border-border/80 shadow-xs hover:shadow-md transition-all bg-white dark:bg-slate-900">
                    <CardHeader className="p-3.5 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
                      <CardTitle className="text-xs font-bold flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">
                          3
                        </span>
                        Prototype & Equipment
                      </CardTitle>
                      <Badge className="bg-emerald-500/15 text-emerald-700 text-[10px] font-bold">
                        Score: {record.prototypeEquipmentConfig.readinessScore}/100
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-3.5 text-xs space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground">Prototype:</span>
                        <span className="font-mono font-bold text-primary">
                          {record.prototypeEquipmentConfig.prototypeVersion}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground">Equipment Used:</span>
                        <span className="font-semibold">
                          {record.prototypeEquipmentConfig.equipmentUsedCount} Selected
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground">Readiness:</span>
                        <span className="font-bold text-emerald-600">
                          {record.prototypeEquipmentConfig.equipmentReadiness}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card 4: Functional Testing */}
                  <Card className="border-border/80 shadow-xs hover:shadow-md transition-all bg-white dark:bg-slate-900">
                    <CardHeader className="p-3.5 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
                      <CardTitle className="text-xs font-bold flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">
                          4
                        </span>
                        Functional Testing
                      </CardTitle>
                      <Badge className="bg-emerald-500/15 text-emerald-700 text-[10px] font-bold">
                        Score: {record.functionalScore}/100
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-3.5 text-xs space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground">Functional:</span>
                        <span className="font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 inline text-emerald-500" />{" "}
                          {record.functionalConfig.functionalTestStatus}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground">Electrical:</span>
                        <span className="font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 inline text-emerald-500" />{" "}
                          {record.functionalConfig.electricalTestStatus}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground">Software:</span>
                        <span className="font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 inline text-emerald-500" />{" "}
                          {record.functionalConfig.softwareTestStatus}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card 5: Performance & Reliability */}
                  <Card className="border-border/80 shadow-xs hover:shadow-md transition-all bg-white dark:bg-slate-900">
                    <CardHeader className="p-3.5 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
                      <CardTitle className="text-xs font-bold flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">
                          5
                        </span>
                        Performance & Reliability
                      </CardTitle>
                      <Badge className="bg-emerald-500/15 text-emerald-700 text-[10px] font-bold">
                        Score: {record.reliabilityScore}/100
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-3.5 text-xs space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground">MTBF Estimate:</span>
                        <span className="font-bold text-primary">
                          {record.performanceConfig.mtbfEstimate}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground">Load Test:</span>
                        <span className="font-semibold text-emerald-600">
                          {record.performanceConfig.loadTestStatus}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground">Thermal Test:</span>
                        <span className="font-semibold text-emerald-600">
                          {record.performanceConfig.thermalTestStatus}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card 6: Safety & Compliance */}
                  <Card className="border-border/80 shadow-xs hover:shadow-md transition-all bg-white dark:bg-slate-900">
                    <CardHeader className="p-3.5 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
                      <CardTitle className="text-xs font-bold flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">
                          6
                        </span>
                        Safety & Compliance
                      </CardTitle>
                      <Badge className="bg-emerald-500/15 text-emerald-700 text-[10px] font-bold">
                        Score: {record.complianceScore}/100
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-3.5 text-xs space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground">EMC / EMI:</span>
                        <span className="font-semibold text-emerald-600">
                          {record.safetyComplianceConfig.emcEmiTestStatus}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground">IP Rating:</span>
                        <span className="font-semibold text-emerald-600">
                          {record.safetyComplianceConfig.ipRatingTestStatus}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground">Standards:</span>
                        <span className="font-mono text-[10px] text-primary">
                          {record.safetyComplianceConfig.regulatoryStandards.length} Standards Compliant
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card 7: Validation Results */}
                  <Card className="border-border/80 shadow-xs hover:shadow-md transition-all bg-white dark:bg-slate-900">
                    <CardHeader className="p-3.5 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
                      <CardTitle className="text-xs font-bold flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">
                          7
                        </span>
                        Validation Results
                      </CardTitle>
                      <Badge className="bg-emerald-500/15 text-emerald-700 text-[10px] font-bold">
                        Score: {record.validationScore}/100
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-3.5 text-xs space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground">Correlation:</span>
                        <span className="font-bold text-primary">
                          {record.resultsConfig.prototypeCorrelationPct}%
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground">Defects Found:</span>
                        <span className="font-semibold text-amber-600">
                          {record.resultsConfig.defectsIdentifiedCount} (0 Critical)
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground">Compliance:</span>
                        <span className="font-bold text-emerald-600">
                          {record.resultsConfig.customerRequirementCompliancePct}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card 8: AI Quality Assessment */}
                  <Card className="border-border/80 shadow-xs hover:shadow-md transition-all bg-white dark:bg-slate-900">
                    <CardHeader className="p-3.5 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
                      <CardTitle className="text-xs font-bold flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">
                          8
                        </span>
                        AI Quality Assessment
                      </CardTitle>
                      <Badge variant="outline" className="text-[10px] text-purple-600 font-bold border-purple-300">
                        AI Score: {record.aiAssessment.aiValidationScore}/100
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-3.5 text-xs space-y-1.5">
                      <p className="text-[11px] text-slate-700 dark:text-slate-300 line-clamp-2">
                        {record.aiAssessment.aiDefectPrediction}
                      </p>
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold block">
                        Suggestions: {record.aiAssessment.aiImprovementSuggestions}
                      </span>
                    </CardContent>
                  </Card>

                  {/* Card 9: Testing Summary */}
                  <Card className="border-border/80 shadow-xs hover:shadow-md transition-all bg-white dark:bg-slate-900">
                    <CardHeader className="p-3.5 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
                      <CardTitle className="text-xs font-bold flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">
                          9
                        </span>
                        Testing Summary
                      </CardTitle>
                      <Badge className="bg-primary text-white text-[10px] font-bold">
                        Overall: {record.overallQualityScore}/100
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-3.5 text-xs space-y-2">
                      <span className="text-[10px] text-muted-foreground block">Recommendation</span>
                      <span className="font-bold text-primary text-[11px] block">
                        {record.readinessSummary.recommendation}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => toast.success("Initiated Product Certification workflow.")}
                        className="w-full h-7 text-[10px] bg-primary text-white gap-1"
                      >
                        Proceed to Certification &rarr;
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* TAB 2: TEST PLANNING */}
            {activeTab === "test_planning" && (
              <div className="space-y-6">
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" /> Test Plan & Strategy Configuration
                    </CardTitle>
                    <Badge className="bg-emerald-500/15 text-emerald-700">Planning Score: 92/100</Badge>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="font-bold text-slate-900 dark:text-white block mb-1">Test Strategy</label>
                        <Input value={record.planningConfig.testStrategy} readOnly className="text-xs" />
                      </div>
                      <div>
                        <label className="font-bold text-slate-900 dark:text-white block mb-1">Acceptance Criteria</label>
                        <Input value={record.planningConfig.acceptanceCriteria} readOnly className="text-xs" />
                      </div>
                      <div>
                        <label className="font-bold text-slate-900 dark:text-white block mb-1">Attached Test Plan</label>
                        <div className="flex items-center justify-between p-2 rounded-lg border bg-slate-50 dark:bg-slate-800">
                          <span className="font-semibold text-primary">{record.planningConfig.testPlanFile}</span>
                          <Button size="sm" variant="ghost" onClick={() => toast.success("Downloading Test Plan")} className="h-6 text-[10px]">
                            <Download className="h-3 w-3 mr-1" /> Download
                          </Button>
                        </div>
                      </div>
                      <div>
                        <label className="font-bold text-slate-900 dark:text-white block mb-1">Test Cases Spreadsheet</label>
                        <div className="flex items-center justify-between p-2 rounded-lg border bg-slate-50 dark:bg-slate-800">
                          <span className="font-semibold text-emerald-600">{record.planningConfig.testCasesFile}</span>
                          <Button size="sm" variant="ghost" onClick={() => toast.success("Downloading Test Cases")} className="h-6 text-[10px]">
                            <Download className="h-3 w-3 mr-1" /> Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* TAB 3: PROTOTYPE & EQUIPMENT */}
            {activeTab === "prototype_equipment" && (
              <div className="space-y-6">
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-primary" /> Prototype & Calibrated Instruments ({record.prototypeEquipmentConfig.equipmentList.length})
                    </CardTitle>
                    <Badge className="bg-emerald-500/15 text-emerald-700">Lab Status: Ready</Badge>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {record.prototypeEquipmentConfig.equipmentList.map((eq) => (
                        <div key={eq.id} className="rounded-lg border p-3 bg-white dark:bg-slate-900 space-y-2">
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">{eq.name}</span>
                            <Badge className="bg-emerald-500/15 text-emerald-700 text-[9px]">{eq.calibrationStatus}</Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground">Model: {eq.model} | ID: {eq.equipmentId}</p>
                          <div className="flex justify-between items-center text-[10px] pt-1 border-t">
                            <span className="text-muted-foreground">Cal. Expiry: {eq.calibrationExpiry}</span>
                            <span className="text-primary font-semibold">{eq.assignedLab}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* TAB 4: FUNCTIONAL TESTING */}
            {activeTab === "functional_testing" && (
              <div className="space-y-6">
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" /> Functional & Electrical Test Cases ({record.functionalConfig.testCases.length})
                    </CardTitle>
                    <Button size="sm" onClick={() => setIsTestConsoleOpen(true)} className="h-8 text-xs bg-primary text-white">
                      + Run Test Console
                    </Button>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <div className="rounded-lg border overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800 text-muted-foreground font-semibold border-b">
                          <tr>
                            <th className="p-2.5">Test ID</th>
                            <th className="p-2.5">Title</th>
                            <th className="p-2.5">Category</th>
                            <th className="p-2.5">Result</th>
                            <th className="p-2.5">Execution Time</th>
                            <th className="p-2.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {record.functionalConfig.testCases.map((tc) => (
                            <tr key={tc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                              <td className="p-2.5 font-mono font-bold text-primary">{tc.testCaseId}</td>
                              <td className="p-2.5 font-semibold text-slate-900 dark:text-white">{tc.title}</td>
                              <td className="p-2.5"><Badge variant="outline" className="text-[10px]">{tc.category}</Badge></td>
                              <td className="p-2.5"><Badge className="bg-emerald-500/15 text-emerald-700 text-[10px]">{tc.status}</Badge></td>
                              <td className="p-2.5 text-muted-foreground">{tc.executionTime}</td>
                              <td className="p-2.5 text-right">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setSelectedTestCase(tc);
                                    setIsTestConsoleOpen(true);
                                  }}
                                  className="h-7 text-xs text-primary"
                                >
                                  <Play className="h-3.5 w-3.5 mr-1" /> Inspect
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* TAB 5: PERFORMANCE & RELIABILITY */}
            {activeTab === "performance_reliability" && (
              <div className="space-y-6">
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-primary" /> Performance & MTBF Reliability Assessment
                    </CardTitle>
                    <Badge className="bg-emerald-500/15 text-emerald-700">Score: 92/100</Badge>
                  </CardHeader>
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="flex flex-col items-center justify-center">
                      <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-emerald-50 border-4 border-emerald-400 dark:bg-emerald-950/30">
                        <div>
                          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">12,500</span>
                          <span className="block text-[10px] font-bold text-muted-foreground">Hours MTBF</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                      Estimated Mean Time Between Failures (MTBF) computed based on 2,000 thermal endurance cycles and MIL-HDBK-217F reliability prediction models.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* TAB 6: SAFETY & COMPLIANCE */}
            {activeTab === "safety_compliance" && (
              <div className="space-y-6">
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" /> Regulatory Standards & Safety Verification
                    </CardTitle>
                    <Badge className="bg-emerald-500/15 text-emerald-700">Compliant (100%)</Badge>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {record.safetyComplianceConfig.regulatoryStandards.map((std) => (
                        <div key={std} className="rounded-lg border p-3 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">{std}</span>
                          <Badge className="bg-emerald-500/15 text-emerald-700 text-[10px]">Verified</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* TAB 7: RESULTS & VALIDATION */}
            {activeTab === "results_validation" && (
              <div className="space-y-6">
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-primary" /> Test Execution Results & Defect Metrics
                    </CardTitle>
                    <Button size="sm" onClick={() => setIsDefectModalOpen(true)} className="h-8 text-xs bg-amber-600 text-white hover:bg-amber-700">
                      + Log New Defect
                    </Button>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <RechartsTooltip />
                          <Bar dataKey="Passed" fill="#10B981" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Failed" fill="#EF4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* TAB 8: AI ASSESSMENT */}
            {activeTab === "ai_assessment" && (
              <div className="space-y-6">
                <Card className="border-border/80 shadow-xs bg-gradient-to-br from-purple-50/40 via-white to-slate-50 dark:from-purple-950/20 dark:via-slate-900">
                  <CardHeader className="p-4 pb-2 border-b">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-purple-700 dark:text-purple-300">
                      <Sparkles className="h-4 w-4" /> Magnertia AI Quality & Verification Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="rounded-lg border bg-white dark:bg-slate-800 p-4 space-y-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">AI Defect Prediction</span>
                      <p className="text-xs text-slate-700 dark:text-slate-300">{record.aiAssessment.aiDefectPrediction}</p>
                    </div>
                    <div className="rounded-lg border bg-white dark:bg-slate-800 p-4 space-y-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">AI Recommendations</span>
                      <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold">{record.aiAssessment.aiImprovementSuggestions}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* TAB 9: SUMMARY */}
            {activeTab === "summary" && (
              <div className="space-y-6">
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="p-4 pb-2 border-b">
                    <CardTitle className="text-sm font-bold">Overall Readiness Summary & Recommendation</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-3">
                      {[
                        { label: "Functional Score", score: record.functionalScore },
                        { label: "Reliability Score", score: record.reliabilityScore },
                        { label: "Compliance Score", score: record.complianceScore },
                        { label: "Validation Score", score: record.validationScore },
                      ].map((item) => (
                        <div key={item.label} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span>{item.label}</span>
                            <span className="text-primary">{item.score}%</span>
                          </div>
                          <Progress value={item.score} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* TAB 10: ATTACHMENTS */}
            {activeTab === "attachments" && (
              <div className="space-y-6">
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Paperclip className="h-4 w-4 text-primary" /> Test Reports & Certification Assets ({record.attachments.length})
                    </CardTitle>
                    <Button size="sm" onClick={() => setIsUploadOpen(true)} className="h-8 text-xs bg-primary text-white">
                      + Upload New Document
                    </Button>
                  </CardHeader>
                  <CardContent className="p-4 space-y-2">
                    <div className="rounded-lg border overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800 text-muted-foreground font-semibold border-b">
                          <tr>
                            <th className="p-2.5">File Name</th>
                            <th className="p-2.5">Type</th>
                            <th className="p-2.5">Size</th>
                            <th className="p-2.5">Date</th>
                            <th className="p-2.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {record.attachments.map((att) => (
                            <tr key={att.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                              <td className="p-2.5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary" /> {att.name}
                              </td>
                              <td className="p-2.5"><Badge variant="outline" className="text-[10px]">{att.type}</Badge></td>
                              <td className="p-2.5 text-muted-foreground">{att.size}</td>
                              <td className="p-2.5 text-muted-foreground">{att.date}</td>
                              <td className="p-2.5 text-right">
                                <Button size="sm" variant="ghost" onClick={() => toast.success(`Downloading ${att.name}`)} className="h-7 text-xs text-primary">
                                  <Download className="h-3.5 w-3.5 mr-1" /> Download
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* TAB 11: REVIEW & APPROVAL */}
            {activeTab === "review_approval" && (
              <div className="space-y-6">
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="p-4 pb-2 border-b">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-primary" /> Quality Review Board Decision Form
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-900 dark:text-white">Approval Decision:</label>
                      <div className="flex flex-wrap gap-2">
                        {(["Approved", "Approved with Conditions", "Revision Required", "On Hold", "Rejected"] as const).map((dec) => (
                          <Button
                            key={dec}
                            type="button"
                            variant={reviewDecision === dec ? "default" : "outline"}
                            size="sm"
                            onClick={() => setReviewDecision(dec)}
                            className="h-8 text-xs"
                          >
                            {dec}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-900 dark:text-white">Review Comments:</label>
                      <Textarea
                        rows={3}
                        value={reviewCommentInput}
                        onChange={(e) => setReviewCommentInput(e.target.value)}
                        placeholder="Enter review comments or requirements for testing team..."
                        className="text-xs"
                      />
                    </div>

                    <Button onClick={handleSubmitDecision} disabled={reviewMutation.isPending} className="bg-primary text-white text-xs">
                      Submit Decision
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* TAB 12: SYSTEM INFO */}
            {activeTab === "system_info" && (
              <div className="space-y-6">
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="p-4 pb-2 border-b">
                    <CardTitle className="text-sm font-bold">System Audit Trail & History</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <div className="space-y-2">
                      {record.auditTrail.map((aud) => (
                        <div key={aud.id} className="rounded-lg border p-3 text-xs flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">{aud.action}</span>
                            <span className="text-[10px] text-muted-foreground">{aud.details}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-muted-foreground block">{aud.timestamp}</span>
                            <span className="text-[10px] text-primary font-mono">{aud.user} ({aud.ipAddress})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* ====================================================================
             RIGHT INSIGHTS PANEL (4 cols on desktop)
             ==================================================================== */}
          <div className="lg:col-span-4 space-y-6">
            {/* Overall Score Card */}
            <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
              <CardHeader className="p-4 pb-2 border-b">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <span>Overall Quality Score</span>
                  <Award className="h-4 w-4 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 text-center space-y-4">
                <div className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-primary/10 border-4 border-primary/20 p-2">
                  <div>
                    <span className="text-3xl font-black text-primary dark:text-blue-400">{record.overallQualityScore}</span>
                    <span className="block text-[10px] font-bold text-muted-foreground">/ 100</span>
                  </div>
                </div>

                <div className="space-y-2 text-left text-xs border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Functional Score</span>
                    <span className="font-bold text-slate-900 dark:text-white">{record.functionalScore} / 100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reliability Score</span>
                    <span className="font-bold text-slate-900 dark:text-white">{record.reliabilityScore} / 100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Compliance Score</span>
                    <span className="font-bold text-emerald-600">{record.complianceScore} / 100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Validation Score</span>
                    <span className="font-bold text-slate-900 dark:text-white">{record.validationScore} / 100</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Highlights */}
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="p-4 pb-2 border-b">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Key Highlights</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2 text-xs">
                {[
                  "All functional tests passed (24/24)",
                  "Thermal performance within limits (<75°C)",
                  "Efficiency achieved 92.4% under 7kW load",
                  "No critical defects identified",
                  "Compliant with IEC 61851 & IEC 61000",
                ].map((hl, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{hl}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="p-4 pb-2 border-b">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2 text-xs">
                <Button variant="outline" size="sm" onClick={() => setIsTestConsoleOpen(true)} className="w-full justify-start text-xs h-8">
                  <Play className="h-3.5 w-3.5 mr-2 text-primary" /> Run New Test
                </Button>
                <Button variant="outline" size="sm" onClick={() => setActiveTab("test_planning")} className="w-full justify-start text-xs h-8">
                  <FileText className="h-3.5 w-3.5 mr-2 text-blue-600" /> View Test Plan
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsTestConsoleOpen(true)} className="w-full justify-start text-xs h-8">
                  <Plus className="h-3.5 w-3.5 mr-2 text-emerald-600" /> Create Test Case
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsDefectModalOpen(true)} className="w-full justify-start text-xs h-8">
                  <AlertTriangle className="h-3.5 w-3.5 mr-2 text-amber-600" /> Log Defect
                </Button>
                <Button variant="outline" size="sm" onClick={() => toast.success("Generating Test Report")} className="w-full justify-start text-xs h-8">
                  <FileCheck className="h-3.5 w-3.5 mr-2 text-purple-600" /> Generate Test Report
                </Button>
                <Button variant="outline" size="sm" onClick={() => setActiveTab("results_validation")} className="w-full justify-start text-xs h-8">
                  <BarChart3 className="h-3.5 w-3.5 mr-2 text-indigo-600" /> View Quality Dashboard
                </Button>
                <Button variant="outline" size="sm" onClick={() => setActiveTab("prototype_equipment")} className="w-full justify-start text-xs h-8">
                  <Cpu className="h-3.5 w-3.5 mr-2 text-rose-600" /> Schedule Equipment
                </Button>
                <Button variant="outline" size="sm" onClick={() => toast.success("Requested Product Certification")} className="w-full justify-start text-xs h-8">
                  <Award className="h-3.5 w-3.5 mr-2 text-emerald-600" /> Request Certification
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

      {/* ====================================================================
         MODALS & DIALOGS
         ==================================================================== */}

      {/* Test Execution Console Modal */}
      <Dialog open={isTestConsoleOpen} onOpenChange={setIsTestConsoleOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <Play className="h-4 w-4 text-primary" /> Test Execution Console
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-xs">
            <p className="text-muted-foreground">
              Executing test case: <span className="font-bold text-foreground">{selectedTestCase?.title ?? "TC-FUNC-001 Power-On Sequence"}</span>
            </p>
            <div className="rounded-lg bg-slate-950 p-3 font-mono text-emerald-400 text-[11px] space-y-1">
              <p>[00:00:01] Initializing Keysight Oscilloscope EQ-OSC-04...</p>
              <p>[00:00:02] Applying 32A charging current load...</p>
              <p>[00:00:03] Sampling CP/PP pilot signal waveforms...</p>
              <p>[00:00:04] Measurement: 31.9A ±0.2A (Pass criteria ±0.5A)</p>
              <p className="text-emerald-300 font-bold">[00:00:05] TEST PASSED SUCCESSFULLY.</p>
            </div>
          </div>
          <DialogFooter>
            <Button size="sm" onClick={() => setIsTestConsoleOpen(false)} className="bg-primary text-white text-xs">
              Close Console
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Log Defect Modal */}
      <Dialog open={isDefectModalOpen} onOpenChange={setIsDefectModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" /> Log Quality Defect
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateDefect} className="space-y-3 text-xs">
            <div>
              <label className="font-bold block mb-1">Defect Title</label>
              <Input
                value={newDefectTitle}
                onChange={(e) => setNewDefectTitle(e.target.value)}
                placeholder="Enter defect description..."
                className="text-xs"
                required
              />
            </div>
            <div>
              <label className="font-bold block mb-1">Severity</label>
              <select
                value={newDefectSeverity}
                onChange={(e) => setNewDefectSeverity(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-2xs"
              >
                <option value="Minor">Minor</option>
                <option value="Major">Major</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsDefectModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-amber-600 text-white hover:bg-amber-700">
                Submit Defect
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
