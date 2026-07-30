import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Grid,
  Code,
  ShieldCheck,
  Cpu,
  FileText,
  CheckCircle2,
  Rocket,
  Activity,
  Sparkles,
  Award,
  Paperclip,
  Workflow,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export type ApiDevelopmentTabId =
  | "overview"
  | "design"
  | "security"
  | "integration"
  | "documentation"
  | "testing"
  | "deployment"
  | "monitoring"
  | "ai_assessment"
  | "summary"
  | "attachments"
  | "review_approval"
  | "system_info";

export interface ApiDevelopmentTabItem {
  id: ApiDevelopmentTabId;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  badge?: string | number;
}

export const API_DEVELOPMENT_TABS: ApiDevelopmentTabItem[] = [
  { id: "overview", label: "Overview", shortLabel: "Overview", icon: Grid },
  { id: "design", label: "API Design", shortLabel: "Design", icon: Code },
  { id: "security", label: "Security", shortLabel: "Security", icon: ShieldCheck },
  { id: "integration", label: "Integration", shortLabel: "Integration", icon: Cpu },
  { id: "documentation", label: "Documentation", shortLabel: "Docs", icon: FileText },
  { id: "testing", label: "Testing", shortLabel: "Testing", icon: CheckCircle2 },
  { id: "deployment", label: "Deployment", shortLabel: "Deploy", icon: Rocket },
  { id: "monitoring", label: "Monitoring", shortLabel: "Monitor", icon: Activity },
  { id: "ai_assessment", label: "AI Assessment", shortLabel: "AI Review", icon: Sparkles },
  { id: "summary", label: "Summary", shortLabel: "Summary", icon: Award },
  { id: "attachments", label: "Attachments", shortLabel: "Files", icon: Paperclip, badge: 5 },
  { id: "review_approval", label: "Review & Approval", shortLabel: "Approval", icon: Workflow },
  { id: "system_info", label: "System Info", shortLabel: "System", icon: Info },
];

interface ApiDevelopmentTabBarProps {
  activeTab: ApiDevelopmentTabId;
  onTabChange: (tab: ApiDevelopmentTabId) => void;
  className?: string;
}

export function ApiDevelopmentTabBar({
  activeTab,
  onTabChange,
  className,
}: ApiDevelopmentTabBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScroll = () => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setShowLeftArrow(scrollLeft > 4);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!containerRef.current) return;
    const amount = direction === "left" ? -240 : 240;
    containerRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <div className={cn("sticky top-0 z-30 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-border shadow-xs", className)}>
      <div className="relative mx-auto max-w-[1720px] px-2 sm:px-4 flex items-center">
        {/* Scroll Left Button */}
        {showLeftArrow && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-1 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-background border shadow-xs hover:bg-muted text-muted-foreground"
            aria-label="Scroll tabs left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        {/* Scrollable Tabs Track */}
        <div
          ref={containerRef}
          onScroll={checkScroll}
          className="flex flex-1 items-center gap-1 overflow-x-auto py-2 scrollbar-none no-scrollbar"
        >
          {API_DEVELOPMENT_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "group relative flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all shrink-0 cursor-pointer select-none",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <Icon className={cn("h-3.5 w-3.5 transition-transform group-hover:scale-110", isActive ? "text-primary-foreground" : "text-slate-500 dark:text-slate-400")} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="inline sm:hidden">{tab.shortLabel}</span>

                {tab.badge !== undefined && (
                  <span
                    className={cn(
                      "ml-1 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold",
                      isActive
                        ? "bg-white/20 text-primary-foreground"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Scroll Right Button */}
        {showRightArrow && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-1 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-background border shadow-xs hover:bg-muted text-muted-foreground"
            aria-label="Scroll tabs right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
