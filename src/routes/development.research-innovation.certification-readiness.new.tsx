import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Stamp,
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
  Globe,
  FileCode,
  FolderDown,
  Scale,
  Calendar,
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
  CertificationReadinessTabBar,
  type CertificationTabKey,
} from "@/components/erp/CertificationReadinessTabBar";
import { certificationReadinessService } from "@/services/certificationReadinessService";
import type {
  CertificationApprovalDecision,
  CertificationFormInput,
  CertificationReadinessRecord,
  StandardRecord,
  DocReadinessRecord,
  CertificationAttachment,
  CertificationReviewer,
  CertificationAuditEntry,
} from "@/services/types";

export const Route = createFileRoute(
  "/development/research-innovation/certification-readiness/new"
)({
  component: CertificationReadinessNewPage,
});

function CertificationReadinessNewPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<CertificationTabKey>("overview");
  const [reviewDecision, setReviewDecision] = useState<CertificationApprovalDecision>("Approved with Conditions");
  const [reviewCommentInput, setReviewCommentInput] = useState(
    "Please close the remaining CAPAs and update the risk assessment before final submission."
  );

  // Modals state
  const [isGapModalOpen, setIsGapModalOpen] = useState(false);
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [isCapaModalOpen, setIsCapaModalOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedStandard, setSelectedStandard] = useState<StandardRecord | null>(null);

  // Query record
  const { data: record, isLoading } = useQuery<CertificationReadinessRecord>({
    queryKey: ["certificationReadinessRecord"],
    queryFn: certificationReadinessService.fetchRecord,
  });

  // Save Draft Mutation
  const saveDraftMutation = useMutation({
    mutationFn: (input: Partial<CertificationFormInput>) => certificationReadinessService.saveDraft(input),
    onSuccess: (updated) => {
      queryClient.setQueryData(["certificationReadinessRecord"], updated);
      toast.success("Draft saved successfully.");
    },
  });

  // Submit Mutation
  const submitMutation = useMutation({
    mutationFn: () => certificationReadinessService.submitForReview(),
    onSuccess: (updated) => {
      queryClient.setQueryData(["certificationReadinessRecord"], updated);
      toast.success("Certification Readiness record submitted for review.");
    },
  });

  // Review Decision Mutation
  const reviewMutation = useMutation({
    mutationFn: (args: { id: string; decision: CertificationApprovalDecision; comments?: string }) =>
      certificationReadinessService.reviewDecision(args),
    onSuccess: (updated) => {
      queryClient.setQueryData(["certificationReadinessRecord"], updated);
      toast.success(`Review decision submitted: ${updated.approvalDecision}`);
    },
  });

  if (isLoading || !record) {
    return (
      <AppShell
        tabs={
          <InnovationAreaTabs
            sub={
              <CertificationReadinessTabBar
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            }
          />
        }
      >
        <div className="flex h-96 items-center justify-center p-8 text-sm text-muted-foreground">
          <RotateCw className="h-6 w-6 animate-spin mr-2 text-primary" /> Loading Certification Readiness Workspace...
        </div>
      </AppShell>
    );
  }

  const handleSaveDraft = () => {
    saveDraftMutation.mutate({
      certificationProjectName: record.certificationProjectName,
      certificationObjective: record.certificationObjective,
      targetMarket: record.targetMarkets.join(", "),
      regulatoryAuthority: record.regulatoryAuthorities.join(", "),
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

  const chartData = [
    { category: "Documentation", Score: 88 },
    { category: "Testing", Score: 90 },
    { category: "Compliance", Score: 84 },
    { category: "Laboratory", Score: 85 },
    { category: "AI Assessment", Score: 89 },
  ];

  return (
    <AppShell
      tabs={
        <InnovationAreaTabs
          sub={
            <CertificationReadinessTabBar
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          }
        />
      }
    >
      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-12 font-sans text-slate-900 dark:text-slate-100">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 pt-4 space-y-5">
          {/* ====================================================================
             1. BREADCRUMBS & MODULE HEADER BAR
             ==================================================================== */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Development</span>
              <ChevronRight className="h-3 w-3" />
              <span>Product Development</span>
              <ChevronRight className="h-3 w-3" />
              <span>Certification Readiness</span>
              <ChevronRight className="h-3 w-3" />
              <span className="font-semibold text-foreground">Certification Readiness Form</span>
            </div>

            {/* Form Metadata Control Card */}
            <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
              <CardContent className="p-4 sm:p-5 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/60 pb-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-primary/10 p-2.5 text-primary shrink-0">
                      <Stamp className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                          {record.certificationProjectName}
                        </h1>
                        <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary">
                          {record.certificationVersion}
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
                        ID: <span className="font-semibold">{record.certificationReadinessId}</span> | Form Code:{" "}
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
                        <DropdownMenuItem onClick={() => toast.success("Exported PDF Readiness Report")}>
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
                    <span className="text-muted-foreground block text-[10px]">Linked Testing & Validation</span>
                    <span className="font-semibold text-primary font-mono text-[11px]">
                      {record.linkedTestingId}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Compliance Manager</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {record.complianceManagerName}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Certification Coordinator</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {record.certificationCoordinatorName}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Target Market</span>
                    <span className="font-semibold text-emerald-600">
                      {record.targetMarkets.join(", ")}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Regulatory Authority</span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400">
                      {record.regulatoryAuthorities.join(", ")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ====================================================================
             2. MAIN CERTIFICATION WORKSPACE (11 Tabs + Right Insights Panel)
             ==================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* 8 Numbered Section Overview Grid matching reference screenshot */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Card 1: Certification Project Overview */}
                    <Card className="border-border/80 shadow-xs hover:shadow-md transition-all bg-white dark:bg-slate-900">
                      <CardHeader className="p-3.5 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-bold flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">
                            1
                          </span>
                          Certification Project Overview
                        </CardTitle>
                        <Badge variant="outline" className="text-[10px]">
                          Priority: {record.priority}
                        </Badge>
                      </CardHeader>
                      <CardContent className="p-3.5 text-xs space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground text-[10px]">Product Category:</span>
                          <span className="font-bold text-slate-900 dark:text-white">{record.productCategory}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-[10px] block">Target Market:</span>
                          <div className="flex gap-1 mt-0.5">
                            {record.targetMarkets.map((m) => (
                              <Badge key={m} variant="secondary" className="text-[9px] px-1.5 py-0">
                                {m}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-[10px] block">Certification Objective:</span>
                          <p className="text-slate-600 dark:text-slate-300 line-clamp-2 text-[11px]">
                            {record.certificationObjective}
                          </p>
                        </div>
                        <div className="flex justify-between text-[11px] pt-1">
                          <span className="text-muted-foreground">Authorities:</span>
                          <span className="font-bold text-purple-600">{record.regulatoryAuthorities.join(", ")}</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Card 2: Applicable Standards & Regulations */}
                    <Card className="border-border/80 shadow-xs hover:shadow-md transition-all bg-white dark:bg-slate-900">
                      <CardHeader className="p-3.5 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-bold flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">
                            2
                          </span>
                          Applicable Standards & Regulations
                        </CardTitle>
                        <Badge className="bg-emerald-500/15 text-emerald-700 text-[10px] font-bold">
                          Score: 86/100
                        </Badge>
                      </CardHeader>
                      <CardContent className="p-3.5 text-xs space-y-1.5">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground">Applicable Standards:</span>
                          <span className="font-bold text-slate-900 dark:text-white">6 Selected</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground">Applicable Regulations:</span>
                          <span className="font-bold text-slate-900 dark:text-white">5 Selected</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground">Mandatory Certifications:</span>
                          <span className="font-semibold text-primary">4 Selected</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground">Gap Analysis:</span>
                          <Button size="sm" variant="link" onClick={() => setIsGapModalOpen(true)} className="h-auto p-0 text-[11px] text-blue-600">
                            View Analysis
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Card 3: Documentation Readiness */}
                    <Card className="border-border/80 shadow-xs hover:shadow-md transition-all bg-white dark:bg-slate-900">
                      <CardHeader className="p-3.5 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-bold flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">
                            3
                          </span>
                          Documentation Readiness
                        </CardTitle>
                        <Badge className="bg-emerald-500/15 text-emerald-700 text-[10px] font-bold">
                          Score: {record.documentationScore}/100
                        </Badge>
                      </CardHeader>
                      <CardContent className="p-3.5 text-xs space-y-1.5">
                        {record.documentsList.slice(0, 4).map((doc) => (
                          <div key={doc.id} className="flex justify-between text-[11px]">
                            <span className="text-muted-foreground truncate max-w-[120px]">{doc.docName}:</span>
                            <span className="font-bold text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 inline text-emerald-500" /> {doc.status}
                            </span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* Card 4: Testing & Validation Readiness */}
                    <Card className="border-border/80 shadow-xs hover:shadow-md transition-all bg-white dark:bg-slate-900">
                      <CardHeader className="p-3.5 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-bold flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">
                            4
                          </span>
                          Testing & Validation Readiness
                        </CardTitle>
                        <Badge className="bg-emerald-500/15 text-emerald-700 text-[10px] font-bold">
                          Score: {record.testingScore}/100
                        </Badge>
                      </CardHeader>
                      <CardContent className="p-3.5 text-xs space-y-1.5">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground">Functional Testing Completed:</span>
                          <span className="font-bold text-emerald-600">Yes</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground">Performance Testing Completed:</span>
                          <span className="font-bold text-emerald-600">Yes</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground">Safety Testing Completed:</span>
                          <span className="font-bold text-emerald-600">Yes</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground">Validation Report Available:</span>
                          <span className="font-bold text-emerald-600">Yes</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Card 5: Certification Laboratory Management */}
                    <Card className="border-border/80 shadow-xs hover:shadow-md transition-all bg-white dark:bg-slate-900">
                      <CardHeader className="p-3.5 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-bold flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">
                            5
                          </span>
                          Certification Laboratory Management
                        </CardTitle>
                        <Badge className="bg-emerald-500/15 text-emerald-700 text-[10px] font-bold">
                          Score: {record.laboratoryScore}/100
                        </Badge>
                      </CardHeader>
                      <CardContent className="p-3.5 text-xs space-y-1.5">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground">Lab Name:</span>
                          <span className="font-bold text-slate-900 dark:text-white">{record.labConfig.labName}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground">Contact Person:</span>
                          <span className="font-semibold">{record.labConfig.contactPerson}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground">Submission Date:</span>
                          <span className="font-semibold text-primary">{record.labConfig.sampleSubmissionDate}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge className="bg-blue-500/15 text-blue-700 text-[9px]">{record.labConfig.status}</Badge>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Card 6: Compliance Assessment */}
                    <Card className="border-border/80 shadow-xs hover:shadow-md transition-all bg-white dark:bg-slate-900">
                      <CardHeader className="p-3.5 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-bold flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">
                            6
                          </span>
                          Compliance Assessment
                        </CardTitle>
                        <Badge className="bg-amber-500/15 text-amber-700 text-[10px] font-bold">
                          Score: {record.complianceScore}/100
                        </Badge>
                      </CardHeader>
                      <CardContent className="p-3.5 text-xs space-y-1.5">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground">Non-Conformities:</span>
                          <span className="font-bold text-amber-600">{record.complianceConfig.nonConformitiesCount}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground">Critical Findings:</span>
                          <span className="font-bold text-rose-600">{record.complianceConfig.criticalFindingsCount}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground">CAPA Status:</span>
                          <Badge className="bg-amber-500/15 text-amber-700 text-[9px]">{record.complianceConfig.capaStatus}</Badge>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Card 7: AI Compliance Assessment */}
                    <Card className="border-border/80 shadow-xs hover:shadow-md transition-all bg-white dark:bg-slate-900">
                      <CardHeader className="p-3.5 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-bold flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">
                            7
                          </span>
                          AI Compliance Assessment
                        </CardTitle>
                        <Badge variant="outline" className="text-[10px] text-purple-600 font-bold border-purple-300">
                          AI Score: {record.aiAssessment.aiReadinessScore}/100
                        </Badge>
                      </CardHeader>
                      <CardContent className="p-3.5 text-xs space-y-1.5">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground">Standards Review:</span>
                          <span className="font-bold text-emerald-600">{record.aiAssessment.aiStandardsReview}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground">Risk Assessment:</span>
                          <span className="font-bold text-emerald-600">{record.aiAssessment.aiRiskAssessment}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground">Prediction:</span>
                          <span className="font-bold text-purple-600">{record.aiAssessment.aiCertificationPrediction}</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Card 8: Certification Summary */}
                    <Card className="border-border/80 shadow-xs hover:shadow-md transition-all bg-white dark:bg-slate-900 md:col-span-2">
                      <CardHeader className="p-3.5 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-bold flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">
                            8
                          </span>
                          Certification Summary & Probability
                        </CardTitle>
                        <Badge className="bg-primary text-white text-[10px] font-bold">
                          Overall: {record.overallReadinessScore}/100
                        </Badge>
                      </CardHeader>
                      <CardContent className="p-3.5 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-900 dark:text-white">
                            Certification Success Probability:
                          </span>
                          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                            {record.certificationProbabilityPct}%
                          </span>
                        </div>
                        <Progress value={record.certificationProbabilityPct} className="h-2" />
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-muted-foreground text-[10px]">Recommendation:</span>
                          <span className="font-bold text-primary text-[11px]">
                            {record.readinessSummary.recommendation}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* TAB 2: STANDARDS & REGULATIONS */}
              {activeTab === "standards_regulations" && (
                <div className="space-y-6">
                  <Card className="border-border/80 shadow-xs">
                    <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Scale className="h-4 w-4 text-primary" /> Applicable Standards Matrix ({record.standardsList.length})
                      </CardTitle>
                      <Button size="sm" onClick={() => setIsGapModalOpen(true)} className="h-8 text-xs bg-primary text-white">
                        + Perform Gap Analysis
                      </Button>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <div className="rounded-lg border overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 dark:bg-slate-800 text-muted-foreground font-semibold border-b">
                            <tr>
                              <th className="p-2.5">Standard Code</th>
                              <th className="p-2.5">Title</th>
                              <th className="p-2.5">Category</th>
                              <th className="p-2.5">Status</th>
                              <th className="p-2.5">Gap Analysis</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/60">
                            {record.standardsList.map((std) => (
                              <tr key={std.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                                <td className="p-2.5 font-mono font-bold text-primary">{std.code}</td>
                                <td className="p-2.5 font-semibold text-slate-900 dark:text-white max-w-xs truncate">{std.title}</td>
                                <td className="p-2.5"><Badge variant="outline" className="text-[10px]">{std.category}</Badge></td>
                                <td className="p-2.5"><Badge className="bg-emerald-500/15 text-emerald-700 text-[10px]">{std.status}</Badge></td>
                                <td className="p-2.5 font-semibold text-slate-700 dark:text-slate-300">{std.gapAnalysis}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* TAB 3: DOCUMENTATION */}
              {activeTab === "documentation" && (
                <div className="space-y-6">
                  <Card className="border-border/80 shadow-xs">
                    <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" /> Required Technical Files & Declarations ({record.documentsList.length})
                      </CardTitle>
                      <Badge className="bg-emerald-500/15 text-emerald-700">Doc Score: {record.documentationScore}/100</Badge>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <div className="rounded-lg border overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 dark:bg-slate-800 text-muted-foreground font-semibold border-b">
                            <tr>
                              <th className="p-2.5">Document Name</th>
                              <th className="p-2.5">Category</th>
                              <th className="p-2.5">Status</th>
                              <th className="p-2.5">Owner</th>
                              <th className="p-2.5">Expiry Date</th>
                              <th className="p-2.5 text-right">File</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/60">
                            {record.documentsList.map((doc) => (
                              <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                                <td className="p-2.5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-primary" /> {doc.docName}
                                </td>
                                <td className="p-2.5"><Badge variant="outline" className="text-[10px]">{doc.category}</Badge></td>
                                <td className="p-2.5"><Badge className="bg-emerald-500/15 text-emerald-700 text-[10px]">{doc.status}</Badge></td>
                                <td className="p-2.5 text-muted-foreground">{doc.owner}</td>
                                <td className="p-2.5 text-muted-foreground">{doc.expiryDate}</td>
                                <td className="p-2.5 text-right">
                                  <Button size="sm" variant="ghost" onClick={() => toast.success(`Downloading ${doc.fileName}`)} className="h-7 text-xs text-primary">
                                    <Download className="h-3.5 w-3.5 mr-1" /> {doc.fileName}
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

              {/* TAB 4: TESTING READINESS */}
              {activeTab === "testing_readiness" && (
                <div className="space-y-6">
                  <Card className="border-border/80 shadow-xs">
                    <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" /> Upstream Testing & Validation Traceability
                      </CardTitle>
                      <Badge className="bg-emerald-500/15 text-emerald-700">Testing Score: {record.testingScore}/100</Badge>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                          { label: "Functional Testing", status: "Completed (24/24 Pass)" },
                          { label: "Performance Testing", status: "Completed (12,500h MTBF)" },
                          { label: "Reliability Testing", status: "Completed (2,000 Cycles)" },
                          { label: "Safety Testing", status: "Completed (IEC 61851)" },
                          { label: "EMC/EMI Testing", status: "Completed (Class B)" },
                          { label: "Environmental Testing", status: "Completed (IP54 Verified)" },
                        ].map((t) => (
                          <div key={t.label} className="rounded-lg border p-3 bg-slate-50 dark:bg-slate-800 space-y-1">
                            <span className="font-bold text-xs text-slate-900 dark:text-white block">{t.label}</span>
                            <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 inline" /> {t.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* TAB 5: LABORATORY */}
              {activeTab === "laboratory" && (
                <div className="space-y-6">
                  <Card className="border-border/80 shadow-xs">
                    <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Building className="h-4 w-4 text-primary" /> Authorized Certification Laboratory Booking
                      </CardTitle>
                      <Button size="sm" onClick={() => setIsLabModalOpen(true)} className="h-8 text-xs bg-primary text-white">
                        Inspect Booking
                      </Button>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <div className="rounded-lg border p-4 bg-white dark:bg-slate-900 space-y-3">
                        <div className="flex justify-between items-center border-b pb-2">
                          <div>
                            <h3 className="font-bold text-base text-slate-900 dark:text-white">{record.labConfig.labName}</h3>
                            <p className="text-xs text-muted-foreground">Authorized Regulatory Testing Body</p>
                          </div>
                          <Badge className="bg-blue-500/15 text-blue-700 font-bold">{record.labConfig.status}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Contact Person:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{record.labConfig.contactPerson}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Testing Scope:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{record.labConfig.scope}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Sample Submission:</span>
                            <span className="font-bold text-primary">{record.labConfig.sampleSubmissionDate}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Target Certification Date:</span>
                            <span className="font-bold text-emerald-600">{record.labConfig.plannedCertificationDate}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* TAB 6: COMPLIANCE */}
              {activeTab === "compliance" && (
                <div className="space-y-6">
                  <Card className="border-border/80 shadow-xs">
                    <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600" /> Non-Conformities & Open CAPAs ({record.complianceConfig.nonConformitiesCount})
                      </CardTitle>
                      <Button size="sm" onClick={() => setIsCapaModalOpen(true)} className="h-8 text-xs bg-amber-600 text-white hover:bg-amber-700">
                        + Manage CAPA
                      </Button>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <div className="rounded-lg border p-3 bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-xs text-amber-900 dark:text-amber-300">CAPA-2024-004: Thermal Sensor Calibration Adjustment</span>
                          <Badge className="bg-amber-500/15 text-amber-700 text-[10px]">In Progress</Badge>
                        </div>
                        <p className="text-xs text-amber-800 dark:text-amber-200">
                          Recalibrate temperature sensor offset near 70°C prior to final TÜV Rheinland submission.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* TAB 7: AI ASSESSMENT */}
              {activeTab === "ai_assessment" && (
                <div className="space-y-6">
                  <Card className="border-border/80 shadow-xs bg-gradient-to-br from-purple-50/40 via-white to-slate-50 dark:from-purple-950/20 dark:via-slate-900">
                    <CardHeader className="p-4 pb-2 border-b">
                      <CardTitle className="text-sm font-bold flex items-center gap-2 text-purple-700 dark:text-purple-300">
                        <Sparkles className="h-4 w-4" /> Magnertia AI Compliance & Certification Advisory
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      <div className="rounded-lg border bg-white dark:bg-slate-800 p-4 space-y-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">AI Standards & Risk Assessment</span>
                        <p className="text-xs text-slate-700 dark:text-slate-300">
                          Standards review completed with low risk detected across mandatory safety and EMC directives.
                        </p>
                      </div>
                      <div className="rounded-lg border bg-white dark:bg-slate-800 p-4 space-y-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">AI Optimization Suggestions</span>
                        <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
                          Close CAPA-2024-004 thermal sensor offset item before submitting sample to TÜV Rheinland for 98% pass probability.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* TAB 8: SUMMARY */}
              {activeTab === "summary" && (
                <div className="space-y-6">
                  <Card className="border-border/80 shadow-xs">
                    <CardHeader className="p-4 pb-2 border-b">
                      <CardTitle className="text-sm font-bold">Readiness Summary & Final Submission Recommendation</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      <div className="space-y-3">
                        {[
                          { label: "Documentation Score", score: record.documentationScore },
                          { label: "Testing Score", score: record.testingScore },
                          { label: "Compliance Score", score: record.complianceScore },
                          { label: "Laboratory Score", score: record.laboratoryScore },
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

              {/* TAB 9: ATTACHMENTS */}
              {activeTab === "attachments" && (
                <div className="space-y-6">
                  <Card className="border-border/80 shadow-xs">
                    <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Paperclip className="h-4 w-4 text-primary" /> Certification Package Assets ({record.attachments.length})
                      </CardTitle>
                      <Button size="sm" onClick={() => setIsUploadOpen(true)} className="h-8 text-xs bg-primary text-white">
                        + Upload File
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

              {/* TAB 10: REVIEW & APPROVAL */}
              {activeTab === "review_approval" && (
                <div className="space-y-6">
                  <Card className="border-border/80 shadow-xs">
                    <CardHeader className="p-4 pb-2 border-b">
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-primary" /> Compliance Review Board Decision Form
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
                          placeholder="Enter compliance review comments..."
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

              {/* TAB 11: SYSTEM INFO */}
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
              {/* Overall Score Card matching reference screenshot */}
              <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
                <CardHeader className="p-4 pb-2 border-b">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                    <span>Overall Readiness Score</span>
                    <Award className="h-4 w-4 text-primary" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 text-center space-y-4">
                  <div className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-primary/10 border-4 border-primary/20 p-2">
                    <div>
                      <span className="text-3xl font-black text-primary dark:text-blue-400">{record.overallReadinessScore}</span>
                      <span className="block text-[10px] font-bold text-muted-foreground">/ 100</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-left text-xs border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Documentation</span>
                      <span className="font-bold text-slate-900 dark:text-white">{record.documentationScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Testing</span>
                      <span className="font-bold text-slate-900 dark:text-white">{record.testingScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Compliance</span>
                      <span className="font-bold text-emerald-600">{record.complianceScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Laboratory</span>
                      <span className="font-bold text-slate-900 dark:text-white">{record.laboratoryScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">AI Assessment</span>
                      <span className="font-bold text-purple-600">{record.aiScore}</span>
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
                    "All critical documents are available",
                    "All mandatory tests completed",
                    "CAPA closure in progress",
                    "High probability of certification success",
                    "Ready for laboratory submission",
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
                  <Button variant="outline" size="sm" onClick={() => setIsGapModalOpen(true)} className="w-full justify-start text-xs h-8">
                    <Scale className="h-3.5 w-3.5 mr-2 text-primary" /> Run Compliance Check
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsGapModalOpen(true)} className="w-full justify-start text-xs h-8">
                    <BarChart3 className="h-3.5 w-3.5 mr-2 text-blue-600" /> View Gap Analysis
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsUploadOpen(true)} className="w-full justify-start text-xs h-8">
                    <Upload className="h-3.5 w-3.5 mr-2 text-emerald-600" /> Upload Document
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toast.success("Generating Readiness Report")} className="w-full justify-start text-xs h-8">
                    <FileText className="h-3.5 w-3.5 mr-2 text-purple-600" /> Generate Readiness Report
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsLabModalOpen(true)} className="w-full justify-start text-xs h-8">
                    <Building className="h-3.5 w-3.5 mr-2 text-indigo-600" /> Schedule Lab Submission
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toast.success("Requested Pre-Assessment")} className="w-full justify-start text-xs h-8">
                    <Award className="h-3.5 w-3.5 mr-2 text-rose-600" /> Request Pre-Assessment
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toast.success("Viewing Certification Timeline")} className="w-full justify-start text-xs h-8">
                    <Calendar className="h-3.5 w-3.5 mr-2 text-amber-600" /> View Certification Timeline
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* ====================================================================
           MODALS & DIALOGS
           ==================================================================== */}

        {/* Gap Analysis Inspector Modal */}
        <Dialog open={isGapModalOpen} onOpenChange={setIsGapModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold flex items-center gap-2">
                <Scale className="h-4 w-4 text-primary" /> Regulatory Gap Analysis Matrix
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-xs">
              <p className="text-muted-foreground">
                Analyzing 6 mandatory standards against TÜV Rheinland & BIS submission requirements...
              </p>
              <div className="rounded-lg border bg-slate-50 dark:bg-slate-900 p-3 space-y-2">
                <div className="flex justify-between items-center border-b pb-1">
                  <span className="font-bold">IEC 61851-1</span>
                  <Badge className="bg-emerald-500/15 text-emerald-700 text-[10px]">Satisfied (0 Gaps)</Badge>
                </div>
                <div className="flex justify-between items-center border-b pb-1">
                  <span className="font-bold">IEC 61000-6-3</span>
                  <Badge className="bg-amber-500/15 text-amber-700 text-[10px]">1 Minor Gap</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold">ISO 26262</span>
                  <Badge className="bg-emerald-500/15 text-emerald-700 text-[10px]">Satisfied (0 Gaps)</Badge>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button size="sm" onClick={() => setIsGapModalOpen(false)} className="bg-primary text-white text-xs">
                Close Inspector
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
