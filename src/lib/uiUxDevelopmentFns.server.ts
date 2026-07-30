import { createServerFn } from "@tanstack/react-start";
import type {
  UiUxDevelopmentApprovalDecision,
  UiUxDevelopmentFormInput,
  UiUxDevelopmentRecord,
  UiUxDevelopmentStatus,
} from "@/services/types";

/* ===========================================================================
   UI/UX Development — Server Functions & Workflow Engine
   =========================================================================== */

export function calculateUiUxDevelopmentScores(input: Partial<UiUxDevelopmentFormInput>) {
  const researchReadiness = input.researchReadinessScore ?? 88;
  const uxReadiness = input.uxReadinessScore ?? 88;
  const uiReadiness = input.uiReadinessScore ?? 87;
  const accessibilityScore = input.accessibilityScore ?? 90;
  const developmentReadiness = input.developmentReadinessScore ?? 90;

  const overallDesignScore = Math.round(
    researchReadiness * 0.15 +
      uxReadiness * 0.25 +
      uiReadiness * 0.25 +
      accessibilityScore * 0.15 +
      developmentReadiness * 0.2
  );

  return {
    researchReadiness,
    uxReadiness,
    uiReadiness,
    accessibilityScore,
    developmentReadiness,
    overallDesignScore: input.overallDesignScore ?? overallDesignScore,
  };
}

const DEFAULT_RECORD: UiUxDevelopmentRecord = {
  id: "uiux-rec-0017",
  uiUxDevelopmentId: "UIUX-2024-0017",
  formCode: "UIUX-F-2024-25",
  uiUxProjectName: "Smart EV Charger UI/UX",
  designVersion: "v2.1.0",
  workflowStatus: "In Review",
  createdOn: "18 Jun 2024 10:15 AM",
  dateCreated: "2024-06-18T10:15:00Z",
  lastModified: "2024-06-20T16:25:00Z",
  lastUpdated: "20 Jun 2024 04:25 PM",
  linkedPrdId: "PRD-2024-0009",
  linkedPrdTitle: "Smart EV Platform PRD",
  linkedSoftwareDevId: "SWD-2024-0012",
  linkedSoftwareDevTitle: "EV Cloud Control Backend",
  linkedMobileAppDevId: "MAD-2024-0005",
  linkedMobileAppDevTitle: "Smart Charger Mobile App",
  linkedProductArchitectureId: "PA-2024-0011",
  linkedProductArchitectureTitle: "EV Ecosystem Architecture",
  linkedProductId: "PROD-EV-100",
  linkedProductName: "Smart EV Platform",
  businessUnit: "EV Mobility Division",
  designerId: "usr-rahul-sharma",
  designerName: "Rahul Sharma",
  designerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",

  // Section 1: Overview
  productName: "Smart EV Platform",
  projectObjective:
    "Create intuitive and seamless user experience for EV charger monitoring, remote session control, fleet energy distribution, and automated billing management.",
  businessGoals:
    "Improve user engagement and operational efficiency by 35%, reduce support tickets by 45%, and accelerate driver onboarding.",
  targetPlatforms: ["Web App", "Android", "iOS"],
  designStatus: "In Progress",

  // Section 2: Research
  researchMethods: ["Interviews", "Survey", "Analytics", "Usability Audit"],
  personasCount: 3,
  userJourneysCount: 5,
  painPointsCount: 12,
  customerFeedbackCount: 128,
  customerFeedbackScore: 4.8,
  competitorsAnalyzed: 4,
  personas: [
    {
      id: "p1",
      name: "Marcus Vance",
      role: "EV Fleet Manager",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      age: 38,
      location: "San Jose, CA",
      bio: "Oversees 150 commercial delivery EVs. Needs real-time telemetry, rapid error resolution, and bulk charging scheduling.",
      goals: ["Minimize fleet downtime", "Monitor peak electricity tariffs", "Automate driver expense reports"],
      painPoints: ["Oversaturated telemetry dashboards", "Delayed status notifications", "Complex multi-vehicle billing"],
      techSavviness: 8,
      quote: "I need to know which charger has issues before my drivers report it.",
    },
    {
      id: "p2",
      name: "Elena Rostova",
      role: "Residential EV Owner",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      age: 31,
      location: "Austin, TX",
      bio: "Drives a Tesla Model Y. Charges nightly at home and relies on phone widgets for battery status and cost tracking.",
      goals: ["Schedule off-peak charging", "Track monthly energy expenditure", "One-tap remote start"],
      painPoints: ["Confusing solar offset statistics", "Bluetooth pairing dropouts"],
      techSavviness: 9,
      quote: "Charging should be as effortless as plugging in my phone.",
    },
    {
      id: "p3",
      name: "David Kalu",
      role: "Field Service Technician",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      age: 44,
      location: "Chicago, IL",
      bio: "Maintains hardware chargers in public hubs. Uses tablets on-site under high ambient sunlight and wearing work gloves.",
      goals: ["Instant diagnostic readout", "High contrast sunlight mode", "Large glove-friendly touch targets"],
      painPoints: ["Small font sizes", "Missing offline error log access"],
      techSavviness: 6,
      quote: "If buttons are too small, I can't tap them with safety gloves.",
    },
  ],
  userJourneys: [
    {
      id: "j1",
      title: "First-Time Driver Onboarding & NFC Wallet Setup",
      steps: ["App Store Download", "Account Creation", "RFID/NFC Scan", "Payment Method Link", "First Plug-in"],
      satisfactionScore: 94,
      keyTakeaway: "Reduced onboarding friction from 4 mins to 45 seconds using NFC auto-pair.",
    },
    {
      id: "j2",
      title: "Active Fast-Charging & Live Telemetry Monitoring",
      steps: ["QR Plug-in", "Session Initiate", "Live kW/SoC Monitor", "Session Complete Alert", "Receipt Generation"],
      satisfactionScore: 91,
      keyTakeaway: "Added high-contrast ring gauge for SoC progress visible from 10 feet away.",
    },
    {
      id: "j3",
      title: "Fleet Manager Peak-Load Tariff Optimization",
      steps: ["Dashboard Login", "Tariff Rule Config", "Load Balance Slider", "Cost Projection Preview", "Apply Config"],
      satisfactionScore: 89,
      keyTakeaway: "Visual drag sliders for load limits improved tariff compliance by 28%.",
    },
    {
      id: "j4",
      title: "Remote Diagnostic & Hardware Error Resolution",
      steps: ["Push Alert Received", "Diagnostic Screen", "Remote Reboot Trigger", "Status Verification"],
      satisfactionScore: 88,
      keyTakeaway: "One-click hardware remote reset saved 32% unnecessary technician dispatch.",
    },
    {
      id: "j5",
      title: "Automated Monthly Billing & Carbon Credit Export",
      steps: ["Billing Tab", "Date Range Filter", "Invoice Generate", "PDF/CSV Export", "ERP Sync"],
      satisfactionScore: 95,
      keyTakeaway: "Direct SAP/Magnertia ledger sync praised by fleet finance leads.",
    },
  ],
  painPoints: [
    { id: "pp1", issue: "Cluttered charging statistics on mobile view", severity: "High", category: "UX Layout", impact: "Driver confusion during quick status checks" },
    { id: "pp2", issue: "Low color contrast ratio on outdoor diagnostic screen", severity: "High", category: "Accessibility", impact: "Technician visibility issues in daylight" },
    { id: "pp3", issue: "Unclear error message when grid power dips", severity: "Medium", category: "Content UX", impact: "Increased customer support calls" },
    { id: "pp4", issue: "Hidden schedule charging off-peak toggle", severity: "High", category: "Information Architecture", impact: "Users missing tariff savings" },
  ],
  competitors: [
    { competitor: "Tesla Supercharger UI", strength: "Ultra-slick visual minimalism & vehicle integration", weakness: "Proprietary ecosystem & limited third-party fleet tools", marketShare: "34%", rating: 4.7 },
    { competitor: "ChargePoint Enterprise", strength: "Extensive fleet management telemetry & reports", weakness: "Complex multi-level navigation and outdated UI theme", marketShare: "26%", rating: 4.2 },
    { competitor: "EVgo Commercial", strength: "Fast station locator and instant RFID start", weakness: "High app crash rate on Android & dark mode bugs", marketShare: "18%", rating: 3.9 },
    { competitor: "ABB E-Mobility Portal", strength: "Industrial grade hardware telemetry & safety controls", weakness: "Non-responsive web app UI requiring desktop monitors", marketShare: "15%", rating: 4.0 },
  ],

  // Section 3: Information Architecture
  sitemapPages: 25,
  navigationStructure: "Module-Based Top + Side Navigation",
  screenHierarchyLevels: 4,
  contentStructure: "Card Grid, Table View, Interactive Canvas",
  navigationPattern: "Side Navigation + Contextual Sticky Action Bar",
  architectureReadinessScore: 90,

  // Section 4: Wireframes & Flow
  lowFiCount: 32,
  hiFiCount: 32,
  screenFlowsCount: 5,
  taskFlowsCount: 8,
  wireframeStatus: "Completed",
  uxScore: 88,
  wireframes: [
    { id: "wf1", title: "Charger Telemetry Overview Dashboard", type: "Hi-Fi", screenFlow: "Main Fleet View", previewUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&auto=format&fit=crop&q=80", status: "Completed", version: "v2.1" },
    { id: "wf2", title: "Interactive Charging Session Monitor", type: "Hi-Fi", screenFlow: "Session Control", previewUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400&auto=format&fit=crop&q=80", status: "Completed", version: "v2.1" },
    { id: "wf3", title: "Fleet Tariff Optimization & Load Balance", type: "Hi-Fi", screenFlow: "Energy Mgmt", previewUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop&q=80", status: "Completed", version: "v2.0" },
    { id: "wf4", title: "Field Technician Remote Diagnostics", type: "Hi-Fi", screenFlow: "Maintenance", previewUrl: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=400&auto=format&fit=crop&q=80", status: "Completed", version: "v2.1" },
  ],

  // Section 5: Visual Design
  designSystemVersion: "Magnertia Design System (v3.2)",
  colorPaletteCount: 6,
  typographyFont: "Poppins (Headings) & Inter (Body)",
  iconLibraryName: "Lucide React + Magnertia EV Iconpack (250+ icons)",
  componentCount: 120,
  brandComplianceStatus: "Compliant",
  visualDesignScore: 87,

  // Section 6: Accessibility
  accessibilityStandard: "WCAG 2.2 AA Compliant",
  keyboardNavStatus: "100% Tested & Verified",
  screenReaderStatus: "NVDA & VoiceOver Verified",
  responsiveDesignStatus: "Desktop, Tablet & Mobile Tested",
  darkModeStatus: "Full Support (4.5:1 Minimum Contrast)",
  localizationLanguages: ["English (US)", "Spanish", "German", "Japanese"],
  accessibilityScore: 90,
  wcagAudits: [
    { id: "wcag1", criteria: "1.4.3 Contrast (Minimum)", wcagLevel: "AA", status: "Pass", notes: "All body text meets 4.5:1 contrast against light/dark card backgrounds." },
    { id: "wcag2", criteria: "2.1.1 Keyboard Navigation", wcagLevel: "A", status: "Pass", notes: "Full focus trap and tab sequence validated across all dialogs." },
    { id: "wcag3", criteria: "2.4.7 Focus Visible", wcagLevel: "AA", status: "Pass", notes: "High contrast primary blue focus rings on interactive elements." },
    { id: "wcag4", criteria: "4.1.2 Name, Role, Value", wcagLevel: "A", status: "Pass", notes: "All visual charts include hidden ARIA table descriptions for screen readers." },
  ],

  // Section 7: Prototype & Validation
  interactivePrototypeAvailable: true,
  prototypeTool: "Figma Enterprise (v124)",
  usabilityTestingStatus: "Completed (30 participants)",
  abTestingStatus: "Completed (Variant B +24% conversion)",
  userSatisfactionScore: 87,
  validationReportStatus: "Available",
  prototypeStatus: "Completed",
  prototypeEmbedUrl: "https://www.figma.com/embed?embed_host=share&url=https://www.figma.com/file/sample-ev-charger-ui",

  // Section 8: Developer Handoff
  designSpecificationStatus: "Fully Documented",
  designTokensStatus: "Exported (JSON & CSS variables)",
  uiAssetsStatus: "Available (SVG & 2x PNG package)",
  componentLibraryStatus: "Available (React + Tailwind primitives)",
  cssStyleGuideStatus: "Completed",
  handoffStatus: "Completed",
  developmentReadinessScore: 90,

  // Section 9: AI Assessment
  aiUxScore: 89,
  aiAccessibilityReview: 91,
  aiConsistencyAnalysis: 88,
  aiUserJourneyAnalysis: 87,
  aiVisualDesignReview: 90,
  aiImprovementSuggestionsCount: 4,
  aiOverallDesignScore: 89,
  aiSuggestions: [
    "Increase touch target padding on mobile footer action buttons from 36px to 44px for WCAG 2.2 touch target compliance.",
    "Add secondary status pill for offline hardware chargers in the sitemap node view.",
    "Export CSS variables directly into Tailwind v4 @theme inline definitions for zero-runtime theme switches.",
    "Include ARIA live-region announcements when charger SoC updates during live telemetry stream.",
  ],

  // Section 10: Summary & Recommendation
  researchReadinessScore: 88,
  uxReadinessScore: 88,
  uiReadinessScore: 87,
  overallDesignScore: 88,
  recommendation: "Proceed to Frontend Development",

  // Section 11: Attachments
  attachments: [
    { id: "att1", name: "UI_Research_Report.pdf", size: "2.4 MB", date: "20 Jun 2024", type: "PDF", version: "v1.2" },
    { id: "att2", name: "Personas.pdf", size: "1.8 MB", date: "20 Jun 2024", type: "PDF", version: "v1.0" },
    { id: "att3", name: "Journey_Maps.pdf", size: "3.1 MB", date: "20 Jun 2024", type: "PDF", version: "v2.0" },
    { id: "att4", name: "Wireframes.pdf", size: "3.6 MB", date: "20 Jun 2024", type: "PDF", version: "v2.1" },
    { id: "att5", name: "High_Fidelity_Design.fig", size: "45.2 MB", date: "20 Jun 2024", type: "FIG", version: "v2.1" },
    { id: "att6", name: "Prototype_Link.txt", size: "0.2 KB", date: "20 Jun 2024", type: "TXT", version: "v1.0" },
    { id: "att7", name: "Usability_Test_Report.pdf", size: "1.9 MB", date: "20 Jun 2024", type: "PDF", version: "v1.1" },
    { id: "att8", name: "Design_System_guide.pdf", size: "3.0 MB", date: "20 Jun 2024", type: "PDF", version: "v3.2" },
  ],

  // Section 12: Review & Approval
  reviewers: [
    { role: "Lead UX Designer", person: "Rahul Sharma", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", decision: "Approved", date: "20 Jun 2024", comments: "Great work! Information architecture and persona alignment are outstanding." },
    { role: "Senior UI Designer", person: "Ananya Iyer", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80", decision: "Approved", date: "20 Jun 2024", comments: "Looks Good! Design system component tokens are clean and fully accessible." },
    { role: "Product Manager", person: "Vikram Singh", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", decision: "Approved", date: "20 Jun 2024", comments: "Approved. All PRD customer requirement gates are met." },
    { role: "Software Architect", person: "Neha Verma", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80", decision: "Approved", date: "20 Jun 2024", comments: "Ready for Dev. Component specifications align with our React component tree." },
    { role: "QA Manager", person: "Rohit Nair", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80", decision: "Approved", date: "20 Jun 2024", comments: "Test Plan Ready. Usability edge cases covered in task flows." },
    { role: "CTO", person: "Dr. Anil Patel", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80", decision: "Pending", date: "20 Jun 2024", comments: "Review Pending final executive sign-off." },
  ],
  approvalDecision: "Approved",
  approvalDate: "20 Jun 2024",
  reviewComments: "Executive board pre-approval passed. Proceeding with frontend component integration.",

  // Section 13: Audit Trail
  auditTrail: [
    { id: "aud1", timestamp: "20 Jun 2024 04:25 PM", user: "Rahul Sharma", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", action: "Submitted for Review", details: "Submitted Smart EV Charger UI/UX v2.1.0 to executive review board.", ipAddress: "192.168.1.104" },
    { id: "aud2", timestamp: "20 Jun 2024 02:10 PM", user: "Ananya Iyer", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80", action: "Updated Design Tokens", details: "Exported Magnertia Design System v3.2 color palette & typography tokens.", ipAddress: "192.168.1.112" },
    { id: "aud3", timestamp: "19 Jun 2024 11:45 AM", user: "Rahul Sharma", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", action: "Uploaded Attachments", details: "Uploaded High_Fidelity_Design.fig (45.2 MB) and WCAG Audit report.", ipAddress: "192.168.1.104" },
    { id: "aud4", timestamp: "18 Jun 2024 10:15 AM", user: "Rahul Sharma", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", action: "Created Project", details: "Initialized UI/UX Development Record UIUX-2024-0017.", ipAddress: "192.168.1.104" },
  ],
};

export { DEFAULT_RECORD };

let currentRecord: UiUxDevelopmentRecord = { ...DEFAULT_RECORD };

export const getUiUxDevelopmentFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ success: boolean; data: UiUxDevelopmentRecord }> => {
    return { success: true, data: currentRecord };
  }
);

export const saveUiUxDevelopmentDraftFn = createServerFn({ method: "POST" })
  .validator((data: { id?: string; input: Partial<UiUxDevelopmentFormInput> }) => data)
  .handler(async ({ data }): Promise<{ success: boolean; data: UiUxDevelopmentRecord }> => {
    const input = data.input;
    const scores = calculateUiUxDevelopmentScores({ ...currentRecord, ...input });

    currentRecord = {
      ...currentRecord,
      ...input,
      ...scores,
      lastModified: new Date().toISOString(),
      lastUpdated:
        new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }) +
        " " +
        new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };

    return { success: true, data: currentRecord };
  });

export const submitUiUxDevelopmentFn = createServerFn({ method: "POST" })
  .validator((data?: string) => data)
  .handler(async (): Promise<{ success: boolean; data: UiUxDevelopmentRecord }> => {
    currentRecord = {
      ...currentRecord,
      workflowStatus: "In Review",
      lastModified: new Date().toISOString(),
    };
    return { success: true, data: currentRecord };
  });

export const reviewUiUxDevelopmentFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      id: string;
      decision: UiUxDevelopmentApprovalDecision;
      comments?: string;
    }) => data
  )
  .handler(async ({ data }): Promise<{ success: boolean; data: UiUxDevelopmentRecord }> => {
    const { decision, comments } = data;
    const statusMap: Record<UiUxDevelopmentApprovalDecision, UiUxDevelopmentStatus> = {
      Approved: "Approved",
      "Approved with Conditions": "In Review",
      "Changes Requested": "Changes Requested",
      Rejected: "Archived",
      Pending: "In Review",
    };

    currentRecord = {
      ...currentRecord,
      approvalDecision: decision,
      reviewComments: comments ?? currentRecord.reviewComments,
      approvalDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      workflowStatus: statusMap[decision] ?? currentRecord.workflowStatus,
      lastModified: new Date().toISOString(),
    };

    return { success: true, data: currentRecord };
  });

