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

import { ResearchInnovationTabBar } from "@/components/erp/ResearchInnovationTabBar";
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

const DEFAULT_CERTIFICATION_RECORD: CertificationReadinessRecord = {
  id: "cr-rec-0041",
  certificationReadinessId: "CR-2024-0041",
  formCode: "CRF-2024-25",
  certificationProjectName: "Smart EV Charger Certification",
  certificationVersion: "v1.2.0",
  workflowStatus: "In Progress",
  createdOn: "18 Jun 2024 10:15 AM",
  dateCreated: "2024-06-18T10:15:00Z",
  lastModified: "2024-06-20T16:25:00Z",
  lastUpdated: "20 Jun 2024 04:25 PM",

  linkedProductId: "Smart EV Charger AC 7kW",
  linkedTestingId: "TV-2024-0075",
  complianceManagerName: "Rahul Sharma",
  complianceManagerAvatar:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  certificationCoordinatorName: "Ananya Iyer",
  certificationCoordinatorAvatar:
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
  targetMarkets: ["India", "EU", "USA"],
  regulatoryAuthorities: ["BIS", "IEC", "CE", "FCC"],
  developmentStage: "Prototype Validation",
  priority: "High",

  productCategory: "EV Charger",
  certificationObjective: "Obtain mandatory certifications for global market launch.",

  documentationScore: 88,
  testingScore: 90,
  complianceScore: 84,
  laboratoryScore: 85,
  aiScore: 89,
  overallReadinessScore: 88,
  certificationProbabilityPct: 92,

  standardsList: [
    {
      id: "std1",
      code: "IEC 61851-1",
      title: "Electric vehicle conductive charging system - General requirements",
      category: "Mandatory Standard",
      region: "Global / IEC",
      status: "Compliant",
      gapAnalysis: "Satisfied (0 Gaps)",
    },
    {
      id: "std2",
      code: "IEC 62196-2",
      title: "Plugs, socket-outlets, vehicle connectors and vehicle inlets",
      category: "Mandatory Standard",
      region: "Global / IEC",
      status: "Compliant",
      gapAnalysis: "Satisfied (0 Gaps)",
    },
  ],

  documentsList: [
    {
      id: "doc1",
      docName: "Technical File",
      category: "Technical Documentation",
      status: "Uploaded",
      owner: "Rahul Sharma",
      expiryDate: "31 Dec 2026",
      fileName: "technical_file_v1.2.pdf",
    },
  ],

  labConfig: {
    id: "lab1",
    labName: "TÜV Rheinland",
    contactPerson: "Mr. Peter Klaus",
    scope: "EMC, Safety, Performance, Environmental",
    sampleSubmissionDate: "25 Jun 2024",
    plannedCertificationDate: "20 Aug 2024",
    status: "Scheduled",
  },

  complianceConfig: {
    nonConformitiesCount: 2,
    criticalFindingsCount: 1,
    correctiveActionsStatus: "View Actions",
    preventiveActionsStatus: "View Actions",
    capaStatus: "In Progress",
    complianceScore: 84,
  },

  aiAssessment: {
    aiStandardsReview: "Completed",
    aiDocumentationReview: "Completed",
    aiRiskAssessment: "Low Risk",
    aiCertificationPrediction: "High Probability",
    aiImprovementSuggestions: "3 Suggestions",
    aiReadinessScore: 89,
  },

  readinessSummary: {
    documentationScore: 88,
    testingScore: 90,
    complianceScore: 84,
    laboratoryScore: 85,
    aiScore: 89,
    overallReadinessScore: 88,
    certificationProbabilityPct: 92,
    recommendation: "Ready for Certification Submission",
  },

  attachments: [],
  reviewers: [],
  auditTrail: [],
};

export function CertificationReadinessNewPage({
  breadcrumb = "Development > Product Development",
  tabs,
}: {
  breadcrumb?: string;
  tabs?: React.ReactNode;
} = {}) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<CertificationTabKey>("overview");
  const [selectedStandard, setSelectedStandard] = useState<StandardRecord | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<DocReadinessRecord | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // Form State for Approval Decision
  const [reviewDecision, setReviewDecision] = useState<CertificationApprovalDecision>("Approved");
  const [reviewCommentInput, setReviewCommentInput] = useState("");

  // Modals state
  const [isGapModalOpen, setIsGapModalOpen] = useState(false);
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [isCapaModalOpen, setIsCapaModalOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Data Fetching
  const { data: record, isLoading } = useQuery<CertificationReadinessRecord>({
    queryKey: ["certificationRecord"],
    queryFn: () => certificationReadinessService.fetchRecord(),
  });
  const safeRecord = record ?? DEFAULT_CERTIFICATION_RECORD;

  // Save Draft Mutation
  const saveDraftMutation = useMutation({
    mutationFn: (input: Partial<CertificationFormInput>) =>
      certificationReadinessService.saveDraft(input),
    onSuccess: (updated) => {
      queryClient.setQueryData(["certificationRecord"], updated);
      toast.success("Draft saved successfully!", {
        description: "Certification readiness parameters updated.",
      });
    },
    onError: (err: any) => {
      toast.error("Failed to save draft", {
        description: err?.message || "An error occurred while saving.",
      });
    },
  });

  // Submit for Review Mutation
  const submitReviewMutation = useMutation({
    mutationFn: (id?: string) => certificationReadinessService.submitForReview(id),
    onSuccess: (updated) => {
      queryClient.setQueryData(["certificationRecord"], updated);
      toast.success("Submitted for Executive Board Review!", {
        description: "Regulatory affairs and quality assurance leads notified.",
      });
    },
  });

  // Review Decision Mutation
  const reviewDecisionMutation = useMutation({
    mutationFn: (args: {
      id: string;
      decision: CertificationApprovalDecision;
      comments?: string;
    }) => certificationReadinessService.reviewDecision(args),
    onSuccess: (updated) => {
      queryClient.setQueryData(["certificationRecord"], updated);
      toast.success(`Decision recorded: ${reviewDecision}`, {
        description: "Certification workflow status updated.",
      });
    },
  });

  if (isLoading && !record) {
    return (
      <AppShell
        title="Certification Readiness"
        breadcrumb={breadcrumb}
        tabs={tabs ?? <ResearchInnovationTabBar />}
      >
        <div className="p-8 text-center text-muted-foreground animate-pulse font-semibold">
          Loading Certification Readiness Master Record...
        </div>
      </AppShell>
    );
  }

  const handleSaveDraft = () => {
    saveDraftMutation.mutate({
      certificationProjectName: safeRecord.certificationProjectName,
      targetMarkets: safeRecord.targetMarkets,
      regulatoryAuthorities: safeRecord.regulatoryAuthorities,
      standards: safeRecord.standards,
      documentationReadiness: safeRecord.documentationReadiness,
      testingComplianceScore: safeRecord.testingComplianceScore,
      gapAnalysisScore: safeRecord.gapAnalysisScore,
      aiAssessmentScore: safeRecord.aiAssessmentScore,
      overallReadinessScore: safeRecord.overallReadinessScore,
      approvalDecision: safeRecord.approvalDecision,
      reviewComments: safeRecord.reviewComments,
    });
  };

  const handleSubmitDecision = () => {
    reviewDecisionMutation.mutate({
      id: safeRecord.id,
      decision: reviewDecision,
      comments: reviewCommentInput || undefined,
    });
  };

  const handleSubmitReview = () => {
    submitReviewMutation.mutate(safeRecord.id);
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
      title="Certification Readiness"
      breadcrumb={breadcrumb}
      description="Track ISO, CE, FCC, UL, and regulatory compliance certification readiness matrix."
      tabs={tabs ?? <ResearchInnovationTabBar />}
    >
      <div className="space-y-6 pb-12 font-sans text-slate-900 dark:text-slate-100">

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
                          {safeRecord.certificationProjectName}
                        </h1>
                        <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary">
                          {safeRecord.certificationVersion}
                        </Badge>
                        <Badge
                          className={
                            safeRecord.workflowStatus === "Approved"
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                              : safeRecord.workflowStatus === "In Review"
                              ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                              : "bg-blue-500/15 text-blue-700 dark:text-blue-300"
                          }
                        >
                          {safeRecord.workflowStatus}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        ID: <span className="font-semibold">{safeRecord.certificationReadinessId}</span> | Form Code:{" "}
                        <span className="font-semibold">{safeRecord.formCode}</span> | Created: {safeRecord.createdOn}
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
                      disabled={submitReviewMutation.isPending}
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
                      {safeRecord.linkedProductId}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Linked Testing & Validation</span>
                    <span className="font-semibold text-primary font-mono text-[11px]">
                      {safeRecord.linkedTestingId}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Compliance Manager</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {safeRecord.complianceManagerName}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Certification Coordinator</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {safeRecord.certificationCoordinatorName}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Target Market</span>
                    <span className="font-semibold text-emerald-600">
                      {(safeRecord.targetMarkets || []).join(", ")}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Regulatory Authority</span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400">
                      {(safeRecord.regulatoryAuthorities || []).join(", ")}
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
                          Priority: {safeRecord.priority}
                        </Badge>
                      </CardHeader>
                      <CardContent className="p-3.5 text-xs space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground text-[10px]">Product Category:</span>
                          <span className="font-bold text-slate-900 dark:text-white">{safeRecord.productCategory}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-[10px] block">Target Market:</span>
                          <div className="flex gap-1 mt-0.5">
                            {(safeRecord.targetMarkets || []).map((m) => (
                              <Badge key={m} variant="secondary" className="text-[9px] px-1.5 py-0">
                                {m}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-[10px] block">Certification Objective:</span>
                          <p className="text-slate-600 dark:text-slate-300 line-clamp-2 text-[11px]">
                            {safeRecord.certificationObjective}
                          </p>
                        </div>
                        <div className="flex justify-between text-[11px] pt-1">
                          <span className="text-muted-foreground">Authorities:</span>
                          <span className="font-bold text-purple-600">{(safeRecord.regulatoryAuthorities || []).join(", ")}</span>
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
                          Score: {safeRecord.documentationScore}/100
                        </Badge>
                      </CardHeader>
                      <CardContent className="p-3.5 text-xs space-y-1.5">
                        {(safeRecord.documentsList || []).slice(0, 4).map((doc) => (
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
                          Score: {safeRecord.testingScore}/100
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
                          Score: {safeRecord.laboratoryScore}/100
                        </Badge>
                      </CardHeader>
                      <CardContent className="p-3.5 text-xs space-y-1.5">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground">Lab Name:</span>
                          <span className="font-bold text-slate-900 dark:text-white">{safeRecord.labConfig?.labName}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground">Contact Person:</span>
                          <span className="font-semibold">{safeRecord.labConfig?.contactPerson}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground">Submission Date:</span>
                          <span className="font-semibold text-primary">{safeRecord.labConfig?.sampleSubmissionDate}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge className="bg-blue-500/15 text-blue-700 text-[9px]">{safeRecord.labConfig?.status}</Badge>
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
                          Score: {safeRecord.complianceScore}/100
                        </Badge>
                      </CardHeader>
                      <CardContent className="p-3.5 text-xs space-y-1.5">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground">Non-Conformities:</span>
                          <span className="font-bold text-amber-600">{safeRecord.complianceConfig?.nonConformitiesCount}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground">Critical Findings:</span>
                          <span className="font-bold text-rose-600">{safeRecord.complianceConfig?.criticalFindingsCount}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground">CAPA Status:</span>
                          <Badge className="bg-amber-500/15 text-amber-700 text-[9px]">{safeRecord.complianceConfig?.capaStatus}</Badge>
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
                          AI Score: {safeRecord.aiAssessment?.aiReadinessScore}/100
                        </Badge>
                      </CardHeader>
                      <CardContent className="p-3.5 text-xs space-y-1.5">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground">Standards Review:</span>
                          <span className="font-bold text-emerald-600">{safeRecord.aiAssessment?.aiStandardsReview}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground">Risk Assessment:</span>
                          <span className="font-bold text-emerald-600">{safeRecord.aiAssessment?.aiRiskAssessment}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground">Prediction:</span>
                          <span className="font-bold text-purple-600">{safeRecord.aiAssessment?.aiCertificationPrediction}</span>
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
                          Overall: {safeRecord.overallReadinessScore}/100
                        </Badge>
                      </CardHeader>
                      <CardContent className="p-3.5 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-900 dark:text-white">
                            Certification Success Probability:
                          </span>
                          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                            {safeRecord.certificationProbabilityPct}%
                          </span>
                        </div>
                        <Progress value={safeRecord.certificationProbabilityPct} className="h-2" />
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-muted-foreground text-[10px]">Recommendation:</span>
                          <span className="font-bold text-primary text-[11px]">
                            {safeRecord.readinessSummary?.recommendation}
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
                        <Scale className="h-4 w-4 text-primary" /> Applicable Standards Matrix ({(safeRecord.standardsList || []).length})
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
                            {(safeRecord.standardsList || []).map((std) => (
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
                        <FileText className="h-4 w-4 text-primary" /> Required Technical Files & Declarations ({(safeRecord.documentsList || []).length})
                      </CardTitle>
                      <Badge className="bg-emerald-500/15 text-emerald-700">Doc Score: {safeRecord.documentationScore}/100</Badge>
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
                            {(safeRecord.documentsList || []).map((doc) => (
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
                      <Badge className="bg-emerald-500/15 text-emerald-700">Testing Score: {safeRecord.testingScore}/100</Badge>
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
                            <h3 className="font-bold text-base text-slate-900 dark:text-white">{safeRecord.labConfig?.labName}</h3>
                            <p className="text-xs text-muted-foreground">Authorized Regulatory Testing Body</p>
                          </div>
                          <Badge className="bg-blue-500/15 text-blue-700 font-bold">{safeRecord.labConfig?.status}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Contact Person:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{safeRecord.labConfig?.contactPerson}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Testing Scope:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{safeRecord.labConfig?.scope}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Sample Submission:</span>
                            <span className="font-bold text-primary">{safeRecord.labConfig?.sampleSubmissionDate}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Target Certification Date:</span>
                            <span className="font-bold text-emerald-600">{safeRecord.labConfig?.plannedCertificationDate}</span>
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
                        <AlertTriangle className="h-4 w-4 text-amber-600" /> Non-Conformities & Open CAPAs ({safeRecord.complianceConfig?.nonConformitiesCount})
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
                          { label: "Documentation Score", score: safeRecord.documentationScore },
                          { label: "Testing Score", score: safeRecord.testingScore },
                          { label: "Compliance Score", score: safeRecord.complianceScore },
                          { label: "Laboratory Score", score: safeRecord.laboratoryScore },
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
                        <Paperclip className="h-4 w-4 text-primary" /> Certification Package Assets ({(safeRecord.attachments || []).length})
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
                            {(safeRecord.attachments || []).map((att) => (
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

                      <Button onClick={handleSubmitDecision} disabled={reviewDecisionMutation.isPending} className="bg-primary text-white text-xs">
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
                        {(safeRecord.auditTrail || []).map((aud) => (
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
                      <span className="text-3xl font-black text-primary dark:text-blue-400">{safeRecord.overallReadinessScore}</span>
                      <span className="block text-[10px] font-bold text-muted-foreground">/ 100</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-left text-xs border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Documentation</span>
                      <span className="font-bold text-slate-900 dark:text-white">{safeRecord.documentationScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Testing</span>
                      <span className="font-bold text-slate-900 dark:text-white">{safeRecord.testingScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Compliance</span>
                      <span className="font-bold text-emerald-600">{safeRecord.complianceScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Laboratory</span>
                      <span className="font-bold text-slate-900 dark:text-white">{safeRecord.laboratoryScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">AI Assessment</span>
                      <span className="font-bold text-purple-600">{safeRecord.aiScore}</span>
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
    </AppShell>
  );
}
