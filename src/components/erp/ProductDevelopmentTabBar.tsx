import { useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const TAB_BASE =
  "shrink-0 whitespace-nowrap border-b-2 border-transparent bg-transparent px-3 pb-3 pt-1 text-[13px] font-semibold text-muted-foreground shadow-none transition-all hover:text-foreground focus-visible:outline-none";
const TAB_ACTIVE = "border-primary text-primary hover:text-primary font-bold";

export const PRODUCT_DEVELOPMENT_TABS: { to: string; label: string; full: string }[] = [
  { to: "/development/product-development/overview", label: "Overview", full: "Product Development Overview" },
  { to: "/development/product-development/product-strategy", label: "Strategy", full: "Product Strategy" },
  { to: "/development/product-development/product-roadmap", label: "Roadmap", full: "Product Roadmap" },
  { to: "/development/product-development/prd", label: "Requirements", full: "Product Requirements (PRD)" },
  { to: "/development/product-development/product-architecture", label: "Architecture", full: "Product Architecture" },
  { to: "/development/product-development/industrial-design", label: "Industrial", full: "Industrial Design" },
  { to: "/development/product-development/mechanical-design", label: "Mechanical", full: "Mechanical Design" },
  { to: "/development/product-development/electrical-design", label: "Electrical", full: "Electrical Design" },
  { to: "/development/product-development/electronics-design", label: "Electronics", full: "Electronics Design" },
  { to: "/development/product-development/embedded-systems-development", label: "Embedded", full: "Embedded Systems Development" },
  { to: "/development/product-development/firmware-development", label: "Firmware", full: "Firmware Development" },
  { to: "/development/product-development/software-development", label: "Software", full: "Software Development" },
  { to: "/development/product-development/mobile-app-development", label: "Mobile", full: "Mobile App Development" },
  { to: "/development/product-development/cloud-platform-development", label: "Cloud", full: "Cloud Platform Development" },
  { to: "/development/product-development/api-development", label: "APIs", full: "API Development" },
  { to: "/development/product-development/ai-model-development", label: "AI Models", full: "AI Model Development" },
  { to: "/development/product-development/iot-development", label: "IoT", full: "IoT Development" },
  { to: "/development/product-development/ui-ux-development", label: "UI/UX", full: "UI/UX Development" },
  { to: "/development/product-development/cybersecurity-engineering", label: "Security", full: "Cybersecurity Engineering" },
  { to: "/development/product-development/simulation-analysis", label: "Simulation", full: "Simulation & Analysis" },
  { to: "/development/product-development/testing-validation", label: "Testing", full: "Testing & Validation" },
  { to: "/development/product-development/certification-readiness", label: "Certification", full: "Certification Readiness" },
  { to: "/development/product-development/product-documentation", label: "Documentation", full: "Product Documentation" },
  { to: "/development/product-development/product-release-management", label: "Release", full: "Product Release Management" },
  { to: "/development/product-development/product-lifecycle-management", label: "Lifecycle", full: "Product Lifecycle Management" },
];

export const PRODUCT_DEV_MODULE_META: Record<string, { shortLabel: string; description: string; recordLabel: string }> = {
  "product-strategy": { shortLabel: "Strategy", description: "Formulate product vision, strategic themes, portfolio positioning, and multi-year market roadmaps.", recordLabel: "STRATEGY" },
  "product-roadmap": { shortLabel: "Roadmap", description: "Track product milestones, release horizons, feature dependencies, and strategic delivery schedules.", recordLabel: "ROADMAP" },
  "prd": { shortLabel: "Requirements", description: "Define detailed product requirements, target specifications, compliance criteria, and acceptance gates.", recordLabel: "PRD" },
  "product-architecture": { shortLabel: "Architecture", description: "Engineer systemic product architecture, subsystem interfaces, modularity boundaries, and technical baselines.", recordLabel: "ARCHITECTURE" },
  "industrial-design": { shortLabel: "Industrial", description: "Govern ergonomics, CMF (Color, Material, Finish), user-interaction aesthetics, and enclosure styling.", recordLabel: "INDUSTRIAL" },
  "mechanical-design": { shortLabel: "Mechanical", description: "Engineer 3D mechanical assemblies, structural components, tolerance stack-ups, and thermal enclosures.", recordLabel: "MECHANICAL" },
  "electrical-design": { shortLabel: "Electrical", description: "Design power distribution systems, wiring harnesses, high-voltage circuits, and electrical schematics.", recordLabel: "ELECTRICAL" },
  "electronics-design": { shortLabel: "Electronics", description: "Develop circuit boards, schematic capture, component selection, signal integrity, and microchip integration.", recordLabel: "ELECTRONICS" },
  "embedded-systems-development": { shortLabel: "Embedded", description: "Develop low-level MCU code, hardware abstraction layers, RTOS scheduling, and sensor interfaces.", recordLabel: "EMBEDDED" },
  "firmware-development": { shortLabel: "Firmware", description: "Govern firmware releases, bootloaders, secure OTA updates, and device driver baselines.", recordLabel: "FIRMWARE" },
  "software-development": { shortLabel: "Software", description: "Develop core application software, microservices, algorithms, and backend enterprise services.", recordLabel: "SOFTWARE" },
  "mobile-app-development": { shortLabel: "Mobile", description: "Engineer companion mobile applications across iOS and Android for real-time telemetry and control.", recordLabel: "MOBILE" },
  "cloud-platform-development": { shortLabel: "Cloud", description: "Provision enterprise cloud infrastructure, serverless pipelines, microservices, and telemetry hubs.", recordLabel: "CLOUD" },
  "api-development": { shortLabel: "APIs", description: "Design, document, secure, and monitor REST/gRPC interfaces for internal and partner integration.", recordLabel: "API" },
  "ai-model-development": { shortLabel: "AI Models", description: "Train, evaluate, package, and deploy edge and cloud machine learning models into product software.", recordLabel: "AI MODEL" },
  "iot-development": { shortLabel: "IoT", description: "Build connected-device solutions, edge gateways, MQTT telemetry pipelines, and digital twins.", recordLabel: "IOT" },
  "ui-ux-development": { shortLabel: "UI/UX", description: "Design, prototype, validate, and standardize user interfaces and interaction workflows.", recordLabel: "UI/UX" },
  "cybersecurity-engineering": { shortLabel: "Security", description: "Enforce secure-by-design threat modeling, Zero Trust architecture, vulnerability scanning, and hardening.", recordLabel: "SECURITY" },
  "simulation-analysis": { shortLabel: "Simulation", description: "Execute multi-physics FEA/CFD CAE simulations, structural mesh validation, and thermal analyses.", recordLabel: "SIMULATION" },
  "testing-validation": { shortLabel: "Testing", description: "Manage end-to-end product verification, laboratory test suites, regulatory testing, and validation runs.", recordLabel: "TESTING" },
  "certification-readiness": { shortLabel: "Certification", description: "Evaluate product certification readiness, standards compliance, gap analysis, and regulatory approvals.", recordLabel: "CERTIFICATION" },
  "product-documentation": { shortLabel: "Documentation", description: "Compile, version, review, and publish technical manuals, datasheets, and user guides.", recordLabel: "DOCUMENTATION" },
  "product-release-management": { shortLabel: "Release", description: "Coordinate release gates verifying readiness across engineering, quality, manufacturing, and support.", recordLabel: "RELEASE" },
  "product-lifecycle-management": { shortLabel: "Lifecycle", description: "Govern product digital thread, baseline configurations, ECR/ECO change orders, and end-of-life status.", recordLabel: "LIFECYCLE" },
};

export const DEFAULT_PRODUCT_DEV_META = { shortLabel: "Module", description: "Manage product development lifecycle records and engineering baselines.", recordLabel: "PRODUCT" };

export function ProductDevelopmentTabBar() {
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
    <div className="relative border-b border-border/80 bg-background/95 backdrop-blur">
      {showLeftBtn && (
        <button
          type="button"
          onClick={scrollLeft}
          className="absolute left-0 top-0 z-10 flex h-full w-8 items-center justify-center bg-gradient-to-r from-background via-background/90 to-transparent text-muted-foreground transition-colors hover:text-foreground"
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
        {PRODUCT_DEVELOPMENT_TABS.map((tab) => {
          const isActive = pathname === tab.to || (tab.to !== "/development/product-development/overview" && pathname.startsWith(tab.to));
          return (
            <Link
              key={tab.to}
              to={tab.to}
              title={tab.full}
              aria-label={tab.full}
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
