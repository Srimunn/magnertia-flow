import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/* ===========================================================================
   Research & Innovation — area-level tab bar (Finance-style).
   One tab per module, short label + full-name tooltip/aria-label. Mirrors
   FinanceTabBar exactly (scroll + chevron overflow + wheel-to-scroll). The
   whole innovation area is a single tabbed screen, like Management > Finance.
   =========================================================================== */

const TAB_BASE =
  "shrink-0 whitespace-nowrap border-b-2 border-transparent bg-transparent px-3 pb-3 pt-1 text-[13px] font-semibold text-muted-foreground shadow-none transition-all hover:text-foreground focus-visible:outline-none";
const TAB_ACTIVE = "border-primary text-primary hover:text-primary font-bold";

/** Module registry — short label (visible) + full name (tooltip / a11y). Patent
 *  keeps its existing /ip-development URL; everything else is under
 *  /development/research-innovation. Shared so the sidebar + Overview stay in
 *  sync with this one source of truth. */
export const RESEARCH_INNOVATION_TABS: { to: string; label: string; full: string }[] = [
  { to: "/development/research-innovation/overview", label: "Overview", full: "Research & Innovation Overview" },
  { to: "/development/research-innovation/certification-readiness/new", label: "Certification", full: "Certification Readiness" },
  { to: "/development/research-innovation/product-documentation/new", label: "Documentation", full: "Product Documentation" },
  { to: "/development/research-innovation/product-release-management/new", label: "Release", full: "Product Release Management" },
  { to: "/development/research-innovation/product-lifecycle-management/new", label: "PLM", full: "Product Lifecycle Management (PLM)" },
  { to: "/development/research-innovation/iot-development/new", label: "IoT", full: "IoT Development" },
  { to: "/development/research-innovation/testing-validation/new", label: "Testing", full: "Testing & Validation" },
  { to: "/development/research-innovation/simulation-analysis/new", label: "Simulation", full: "Simulation & Analysis" },
  { to: "/development/research-innovation/cybersecurity-engineering/new", label: "Cybersecurity", full: "Cybersecurity Engineering" },
  { to: "/development/research-innovation/cloud-platform-development/new", label: "Cloud Platform", full: "Cloud Platform Development" },
  { to: "/development/research-innovation/ai-model-development/new", label: "AI Model", full: "AI Model Development" },
  { to: "/development/research-innovation/idea-management", label: "Ideas", full: "Idea Management" },
  { to: "/development/research-innovation/opportunity-discovery", label: "Opportunities", full: "Opportunity Discovery" },
  { to: "/development/research-innovation/design-thinking", label: "Design", full: "Design Thinking" },
  { to: "/development/research-innovation/problem-validation", label: "Validation", full: "Problem Validation" },
  { to: "/development/research-innovation/innovation-portfolio", label: "Portfolio", full: "Innovation Portfolio" },
  { to: "/development/research-innovation/technology-scouting", label: "Scouting", full: "Technology Scouting" },
  { to: "/development/research-innovation/research-management", label: "Research", full: "Research Management" },
  { to: "/development/research-innovation/feasibility-study", label: "Feasibility", full: "Feasibility Study" },
  { to: "/development/research-innovation/proof-of-concept", label: "PoC", full: "Proof of Concept (PoC)" },
  { to: "/development/research-innovation/prototype-development", label: "Prototype", full: "Prototype Development" },
  { to: "/development/research-innovation/experiment-management", label: "Experiments", full: "Experiment Management" },
  { to: "/development/research-innovation/trl-assessment", label: "TRL", full: "TRL Assessment" },
  { to: "/development/research-innovation/commercialization-planning", label: "Commercialization", full: "Commercialization Planning" },
  { to: "/development/research-innovation/product-strategy", label: "Strategy", full: "Product Strategy" },
  { to: "/development/research-innovation/continuous-innovation", label: "Innovation", full: "Continuous Innovation" },
  { to: "/development/ip-development/patent-management", label: "Patents", full: "Patent Management" },
  { to: "/development/research-innovation/ui-ux-development/new", label: "UI/UX", full: "UI/UX Development" },
  { to: "/development/research-innovation/pilot-production/new", label: "Process Dev", full: "Process Development" },
  { to: "/development/research-innovation/production-engineering/new", label: "Production Eng", full: "Production Engineering" },
  { to: "/development/research-innovation/assembly-line-development/new", label: "Assembly Line", full: "Assembly Line Development" },
  { to: "/development/research-innovation/fixture-development/new", label: "Fixture Dev", full: "Fixture Development" },
  { to: "/development/research-innovation/tooling-development/new", label: "Tooling Dev", full: "Tooling Development" },
  { to: "/development/research-innovation/jig-development/new", label: "Jig Dev", full: "Jig Development" },
  { to: "/development/research-innovation/factory-layout-design/new", label: "Factory Layout", full: "Factory Layout Design" },
  { to: "/development/research-innovation/capacity-planning/new", label: "Capacity Plan", full: "Capacity Planning" },
  { to: "/development/research-innovation/work-instruction-development/new", label: "Work Instruction", full: "Work Instruction Development" },
  { to: "/development/research-innovation/sop-development/new", label: "SOP Dev", full: "SOP Development" },
  { to: "/development/research-innovation/bom-engineering/new", label: "BOM Eng", full: "BOM Engineering" },
  { to: "/development/research-innovation/routing-development/new", label: "Routing Dev", full: "Routing Development" },
  { to: "/development/research-innovation/quality-planning-apqp/new", label: "APQP Quality", full: "Quality Planning (APQP)" },
  { to: "/development/research-innovation/pfmea-development/new", label: "PFMEA Dev", full: "PFMEA Development" },
  { to: "/development/research-innovation/control-plan/new", label: "Control Plan", full: "Control Plan Development" },
  { to: "/development/research-innovation/process-validation/new", label: "Process Validation", full: "Process Validation" },
  { to: "/development/research-innovation/smart-factory-development/new", label: "Smart Factory", full: "Smart Factory Development" },
  { to: "/development/research-innovation/manufacturing-excellence/new", label: "Excellence", full: "Manufacturing Excellence" },
  { to: "/development/research-innovation/api-development/new", label: "API", full: "API Development" },





  { to: "/development/research-innovation/reports", label: "Reports", full: "Research & Innovation Reports" }
];

/** Per-module metadata — the single source of truth for the header subtitle
 *  description and the record-type badge word. Keyed by route slug. New modules
 *  fall back to DEFAULT_MODULE_META if an entry is missing. */
export const MODULE_META: Record<string, { description: string; recordLabel: string }> = {
  "certification-readiness": { description: "Evaluate product certification readiness, standards compliance, gap analysis, and regulatory approvals.", recordLabel: "CERTIFICATION READINESS" },
  "product-documentation": { description: "Collect, version, review, and release multi-stream product documentation packages for release readiness.", recordLabel: "PRODUCT DOCUMENTATION" },
  "product-release-management": { description: "Release gate verifying readiness across engineering, manufacturing, commercial, quality, and authorizing launch.", recordLabel: "PRODUCT RELEASE" },
  "product-lifecycle-management": { description: "Product digital thread managing product baseline from configuration through ECR/ECO to end-of-life.", recordLabel: "PRODUCT LIFECYCLE" },
  "iot-development": { description: "Build connected-device solutions, gateways, MQTT telemetry pipelines, and digital twin analytics.", recordLabel: "IOT DEVELOPMENT" },
  "testing-validation": { description: "Manage end-to-end product verification, laboratory testing, regulatory compliance, and validation.", recordLabel: "TESTING & VALIDATION" },
  "simulation-analysis": { description: "Execute multi-physics FEA/CFD CAE simulations, mesh validation, and digital twin correlation.", recordLabel: "SIMULATION" },
  "cybersecurity-engineering": { description: "Govern secure-by-design threat modeling, Zero Trust, IAM, and DevSecOps compliance.", recordLabel: "CYBERSECURITY" },
  "cloud-platform-development": { description: "Design, provision, secure, monitor and scale enterprise cloud platforms.", recordLabel: "CLOUD PLATFORM" },
  "ai-model-development": { description: "Develop, train, evaluate, govern, and deploy enterprise AI models.", recordLabel: "AI MODEL" },
  "api-development": { description: "Design, secure, test, deploy and monitor enterprise APIs.", recordLabel: "API" },
  "ui-ux-development": { description: "Design, validate, and hand off enterprise UI/UX design systems and wireframes.", recordLabel: "UI/UX" },
  "pilot-production": { description: "Govern enterprise process engineering, validation, standardization, resource capacity, and AI-assisted process optimization.", recordLabel: "PROCESS DEVELOPMENT" },
  "production-engineering": { description: "Govern mass production process design, workstation allocation, pilot runs, PFMEA, OEE Targets, and AI optimization.", recordLabel: "PRODUCTION ENGINEERING" },
  "assembly-line-development": { description: "Govern assembly line layout design, workstations planning, takt time line balancing, automation level, OEE targets, and AI quality checks.", recordLabel: "ASSEMBLY LINE DEVELOPMENT" },
  "fixture-development": { description: "Govern fixture design drawings, bill of materials locator designs, clamp designs, safety inspections, commissioning logs, and wear predictions.", recordLabel: "FIXTURE DEVELOPMENT" },
  "tooling-development": { description: "Govern tooling design drawings, bill of materials, process engineering, validation runs, calibration schedules, and wear predictions.", recordLabel: "TOOLING DEVELOPMENT" },
  "idea-management": { description: "Capture, evaluate, and track ideas through the innovation pipeline.", recordLabel: "IDEA" },
  "opportunity-discovery": { description: "Discover and qualify innovation opportunities from validated ideas.", recordLabel: "OPPORTUNITY" },
  "design-thinking": { description: "Run design-thinking cycles from empathy through tested prototypes.", recordLabel: "DESIGN" },
  "problem-validation": { description: "Validate problems against customer, market, technical, and business evidence.", recordLabel: "VALIDATION" },
  "innovation-portfolio": { description: "Balance and prioritize the innovation portfolio across projects.", recordLabel: "PORTFOLIO" },
  "technology-scouting": { description: "Scout, assess, and track emerging technologies.", recordLabel: "TECHNOLOGY" },
  "research-management": { description: "Plan, execute, and review applied research projects.", recordLabel: "RESEARCH" },
  "feasibility-study": { description: "Assess technical, market, financial, and operational feasibility.", recordLabel: "FEASIBILITY" },
  "proof-of-concept": { description: "Build and validate proofs of concept before prototyping.", recordLabel: "POC" },
  "prototype-development": { description: "Engineer, manufacture, and test working prototypes.", recordLabel: "PROTOTYPE" },
  "experiment-management": { description: "Design, run, and validate structured experiments.", recordLabel: "EXPERIMENT" },
  "trl-assessment": { description: "Assess and advance technology readiness levels.", recordLabel: "TRL" },
  "commercialization-planning": { description: "Plan go-to-market, financials, and launch readiness.", recordLabel: "COMMERCIALIZATION" },
  "continuous-innovation": { description: "Drive continuous, period-over-period product improvement.", recordLabel: "INNOVATION" },
  "smart-factory-development": { description: "Govern planning, architecture, integration, automation, AI analytics, and Industry 4.0 smart factory deployment.", recordLabel: "SMART FACTORY" },
  "manufacturing-excellence": { description: "Govern continuous improvement, operational excellence, productivity, quality, cost, sustainability, and AI performance benchmarking.", recordLabel: "EXCELLENCE" },
  "patent-management": { description: "Manage patent filing, prosecution, grant, and portfolio.", recordLabel: "PATENT" },
};
export const DEFAULT_MODULE_META = { description: "Manage records through the innovation pipeline.", recordLabel: "RECORD" };

export function ResearchInnovationTabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftBtn, setShowLeftBtn] = useState(false);
  const [showRightBtn, setShowRightBtn] = useState(false);

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setShowLeftBtn(scrollLeft > 5);
      setShowRightBtn(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      checkScroll();
      container.addEventListener("scroll", checkScroll);
      const observer = new ResizeObserver(() => checkScroll());
      observer.observe(container);
      return () => {
        container.removeEventListener("scroll", checkScroll);
        observer.disconnect();
      };
    }
  }, []);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollWidth, clientWidth } = container;
      if (scrollWidth > clientWidth) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    }
  };

  const scrollBy = (amount: number) => {
    scrollContainerRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <div className="relative flex items-center border-b border-border bg-white px-2 shadow-sm">
      {showLeftBtn && (
        <button
          onClick={() => scrollBy(-200)}
          className="absolute left-0 z-10 flex h-full w-8 items-center justify-center bg-gradient-to-r from-white via-white to-transparent text-muted-foreground hover:text-foreground"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5 bg-white rounded-full border border-border shadow-md" />
        </button>
      )}

      <div
        ref={scrollContainerRef}
        onWheel={handleWheel}
        className="flex w-full gap-4 overflow-x-auto scroll-smooth py-2 px-1 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {RESEARCH_INNOVATION_TABS.map((tab) => {
          const active = pathname.startsWith(tab.to);
          return (
            <Link
              key={tab.to}
              to={tab.to}
              title={tab.full}
              aria-label={tab.full}
              className={cn(TAB_BASE, active && TAB_ACTIVE)}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {showRightBtn && (
        <button
          onClick={() => scrollBy(200)}
          className="absolute right-0 z-10 flex h-full w-8 items-center justify-end bg-gradient-to-l from-white via-white to-transparent text-muted-foreground hover:text-foreground"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5 bg-white rounded-full border border-border shadow-md" />
        </button>
      )}
    </div>
  );
}

/** Two-level tab region: the area-level module bar on top, the module's own
 *  Register/Form sub-bar beneath it. Passed into AppShell's `tabs` slot so the
 *  pattern is defined once and inherited by every module page. */
export function InnovationAreaTabs({ sub }: { sub?: ReactNode }) {
  return (
    <div>
      <ResearchInnovationTabBar />
      {sub}
    </div>
  );
}
