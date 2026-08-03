import { useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const TAB_BASE =
  "shrink-0 whitespace-nowrap border-b-2 border-transparent bg-transparent px-3 pb-3 pt-1 text-[13px] font-semibold text-muted-foreground shadow-none transition-all hover:text-foreground focus-visible:outline-none";
const TAB_ACTIVE = "border-primary text-primary hover:text-primary font-bold";

export const MANUFACTURING_DEVELOPMENT_TABS: { to: string; label: string; full: string }[] = [
  { to: "/development/manufacturing-development/overview", label: "Overview", full: "Manufacturing Development Overview" },
  { to: "/development/manufacturing-development/quality-planning-apqp", label: "APQP", full: "Quality Planning (APQP)" },
  { to: "/development/manufacturing-development/production-engineering", label: "Process", full: "Process Engineering & Validation" },
  { to: "/development/manufacturing-development/control-plan", label: "Control Plan", full: "Control Plan Development" },
  { to: "/development/manufacturing-development/pfmea-development", label: "PFMEA", full: "PFMEA Development" },
  { to: "/development/manufacturing-development/pilot-production", label: "Pilot", full: "Pilot Production" },
  { to: "/development/manufacturing-development/process-validation", label: "PPAP", full: "Process Validation & PPAP" },
  { to: "/development/manufacturing-development/mass-production-readiness", label: "Readiness", full: "Mass Production Readiness" },
  { to: "/development/manufacturing-development/lean-manufacturing", label: "Lean", full: "Lean Manufacturing" },
  { to: "/development/manufacturing-development/six-sigma-projects", label: "Six Sigma", full: "Six Sigma Projects" },
  { to: "/development/manufacturing-development/automation-development", label: "Automation", full: "Automation Development" },
  { to: "/development/manufacturing-development/robotics-integration", label: "Robotics", full: "Robotics Integration" },
  { to: "/development/manufacturing-development/assembly-line-development", label: "Assembly Line", full: "Assembly Line Development" },
  { to: "/development/manufacturing-development/fixture-development", label: "Fixture", full: "Fixture Development" },
  { to: "/development/manufacturing-development/tooling-development", label: "Tooling", full: "Tooling Development" },
  { to: "/development/manufacturing-development/jig-development", label: "Jig", full: "Jig Development" },
  { to: "/development/manufacturing-development/factory-layout-design", label: "Factory Layout", full: "Factory Layout Design" },
  { to: "/development/manufacturing-development/smart-factory-development", label: "Smart Factory", full: "Smart Factory Development" },
  { to: "/development/manufacturing-development/manufacturing-excellence", label: "Excellence", full: "Manufacturing Excellence" },
  { to: "/development/manufacturing-development/capacity-planning", label: "Capacity", full: "Capacity Planning" },
  { to: "/development/manufacturing-development/work-instruction-development", label: "Work Instruction", full: "Work Instruction Development" },
  { to: "/development/manufacturing-development/sop-development", label: "SOP", full: "SOP Development" },
  { to: "/development/manufacturing-development/bom-engineering", label: "BOM", full: "BOM Engineering" },
  { to: "/development/manufacturing-development/routing-development", label: "Routing", full: "Routing Development" },
];

export const MANUFACTURING_DEV_MODULE_META: Record<string, { shortLabel: string; description: string; recordLabel: string }> = {
  "quality-planning-apqp": { shortLabel: "APQP", description: "Structure Advanced Product Quality Planning gates, feasibility commits, and product quality timing plans.", recordLabel: "APQP" },
  "production-engineering": { shortLabel: "Process", description: "Govern production process flows, line layouts, cycle times, operating parameters, and work cell design.", recordLabel: "PROCESS" },
  "control-plan": { shortLabel: "Control Plan", description: "Establish process control points, inspection criteria, sampling frequencies, and reaction plans.", recordLabel: "CONTROL PLAN" },
  "pfmea-development": { shortLabel: "PFMEA", description: "Identify process failure modes, severity/occurrence/detection scoring, and risk mitigation actions.", recordLabel: "PFMEA" },
  "pilot-production": { shortLabel: "Pilot", description: "Run pilot production builds, trial run yield analyses, line validation, and operator readiness runs.", recordLabel: "PILOT" },
  "process-validation": { shortLabel: "PPAP", description: "Execute Production Part Approval Process (PPAP) submissions, dimensional reports, and customer approvals.", recordLabel: "PPAP" },
  "mass-production-readiness": { shortLabel: "Readiness", description: "Verify ramp-up readiness, supplier capability, line staffing, tooling capacity, and sign-off for full rate.", recordLabel: "READINESS" },
  "lean-manufacturing": { shortLabel: "Lean", description: "Drive kaizen initiatives, value stream mapping, 5S audits, waste reduction, and continuous flow.", recordLabel: "LEAN" },
  "six-sigma-projects": { shortLabel: "Six Sigma", description: "Manage DMAIC projects, statistical process control, process capability (Cpk), and defect reduction.", recordLabel: "SIX SIGMA" },
  "automation-development": { shortLabel: "Automation", description: "Design Automated Guided Vehicles (AGV), conveyor systems, PLC programming, and smart sensors.", recordLabel: "AUTOMATION" },
  "robotics-integration": { shortLabel: "Robotics", description: "Program robotic arms, end-effectors, vision systems, safety interlocks, and cell integration.", recordLabel: "ROBOTICS" },
  "assembly-line-development": { shortLabel: "Assembly Line", description: "Balance assembly lines, takt time distribution, ergonomic workstations, and automated line feeds.", recordLabel: "ASSEMBLY LINE" },
  "fixture-development": { shortLabel: "Fixture", description: "Engineer custom clamping fixtures, locating pins, welding jigs, and holding apparatus.", recordLabel: "FIXTURE" },
  "tooling-development": { shortLabel: "Tooling", description: "Design molds, dies, cutting tools, stamping tooling, and tool maintenance schedules.", recordLabel: "TOOLING" },
  "jig-development": { shortLabel: "Jig", description: "Fabricate precision drilling, alignment, soldering, and testing jigs for shop floor operations.", recordLabel: "JIG" },
  "factory-layout-design": { shortLabel: "Factory Layout", description: "Design plant floor layouts, material flow paths, utility drops, and cell arrangements.", recordLabel: "FACTORY LAYOUT" },
  "smart-factory-development": { shortLabel: "Smart Factory", description: "Deploy SCADA, IIoT sensors, edge computing, MES integration, and real-time shop floor telemetry.", recordLabel: "SMART FACTORY" },
  "manufacturing-excellence": { shortLabel: "Excellence", description: "Benchmark operational metrics, OEE improvements, TPM compliance, and world-class manufacturing standards.", recordLabel: "EXCELLENCE" },
  "capacity-planning": { shortLabel: "Capacity", description: "Model equipment utilization, shift patterns, machine bottlenecks, and line throughput limits.", recordLabel: "CAPACITY" },
  "work-instruction-development": { shortLabel: "Work Instruction", description: "Author visual work instructions, standard operation sheets (SOS), and digital operator guides.", recordLabel: "WORK INSTRUCTION" },
  "sop-development": { shortLabel: "SOP", description: "Standardize Standard Operating Procedures (SOPs) for safety, setup, maintenance, and quality control.", recordLabel: "SOP" },
  "bom-engineering": { shortLabel: "BOM", description: "Maintain manufacturing bill of materials (MBOM), Phantom BOMs, effectivity dates, and alternate parts.", recordLabel: "BOM" },
  "routing-development": { shortLabel: "Routing", description: "Define manufacturing operations, work center assignments, setup times, run times, and scrap factors.", recordLabel: "ROUTING" },
};

export const DEFAULT_MANUFACTURING_DEV_META = { shortLabel: "Module", description: "Manage manufacturing engineering records, tooling, and plant readiness.", recordLabel: "MANUFACTURING" };

export function ManufacturingDevelopmentTabBar() {
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
      container.addEventListener("scroll", checkScroll, { passive: true });
      const observer = new ResizeObserver(() => checkScroll());
      observer.observe(container);
      return () => {
        container.removeEventListener("scroll", checkScroll);
        observer.disconnect();
      };
    }
  }, []);

  // Smoothly scroll active tab to center whenever route/pathname changes
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const activeEl = container.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
      setTimeout(checkScroll, 350);
    }
  }, [pathname]);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollWidth, clientWidth } = container;
      if (scrollWidth > clientWidth) {
        container.scrollLeft += e.deltaY;
      }
    }
  };

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 200, behavior: "smooth" });
  };

  return (
    <div className="sticky-tab-bar relative border-b border-border/80 bg-background/95 backdrop-blur">
      {showLeftBtn && (
        <button
          type="button"
          onClick={scrollLeft}
          className="absolute left-0 top-0 z-10 flex h-full w-8 items-center justify-center bg-gradient-to-r from-background via-background/90 to-transparent text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
          aria-label="Scroll tabs left"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}

      <div
        ref={scrollContainerRef}
        onWheel={handleWheel}
        className="no-scrollbar flex items-center gap-1 overflow-x-auto px-2 pt-2 scroll-smooth"
      >
        {MANUFACTURING_DEVELOPMENT_TABS.map((tab) => {
          const isActive = pathname === tab.to || (tab.to !== "/development/manufacturing-development/overview" && pathname.startsWith(tab.to));
          return (
            <Link
              key={tab.to}
              to={tab.to}
              title={tab.full}
              aria-label={tab.full}
              data-active={isActive ? "true" : "false"}
              className={cn(TAB_BASE, isActive && TAB_ACTIVE)}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {showRightBtn && (
        <button
          type="button"
          onClick={scrollRight}
          className="absolute right-0 top-0 z-10 flex h-full w-8 items-center justify-center bg-gradient-to-l from-background via-background/90 to-transparent text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Scroll tabs right"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
