import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type CertificationTabKey =
  | "overview"
  | "standards_regulations"
  | "documentation"
  | "testing_readiness"
  | "laboratory"
  | "compliance"
  | "ai_assessment"
  | "summary"
  | "attachments"
  | "review_approval"
  | "system_info";

export const CERTIFICATION_READINESS_TABS: { key: CertificationTabKey; label: string; num: number }[] = [
  { key: "overview", label: "Overview", num: 1 },
  { key: "standards_regulations", label: "Standards & Regulations", num: 2 },
  { key: "documentation", label: "Documentation", num: 3 },
  { key: "testing_readiness", label: "Testing Readiness", num: 4 },
  { key: "laboratory", label: "Laboratory", num: 5 },
  { key: "compliance", label: "Compliance", num: 6 },
  { key: "ai_assessment", label: "AI Assessment", num: 7 },
  { key: "summary", label: "Summary", num: 8 },
  { key: "attachments", label: "Attachments", num: 9 },
  { key: "review_approval", label: "Review & Approval", num: 10 },
  { key: "system_info", label: "System Info", num: 11 },
];

interface CertificationReadinessTabBarProps {
  activeTab: CertificationTabKey;
  onTabChange: (key: CertificationTabKey) => void;
  className?: string;
}

export function CertificationReadinessTabBar({
  activeTab,
  onTabChange,
  className,
}: CertificationReadinessTabBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  const scrollByAmount = (amt: number) => {
    scrollRef.current?.scrollBy({ left: amt, behavior: "smooth" });
  };

  return (
    <div className={cn("relative flex items-center border-b border-border bg-background/95 backdrop-blur-xs sticky top-0 z-20 px-2", className)}>
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollByAmount(-200)}
          className="absolute left-0 z-30 flex h-9 w-7 items-center justify-center bg-gradient-to-r from-background via-background to-transparent text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex space-x-1 overflow-x-auto no-scrollbar py-1.5 scroll-smooth"
      >
        {CERTIFICATION_READINESS_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={cn(
                "group relative flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150",
                isActive
                  ? "bg-primary text-white shadow-xs"
                  : "text-muted-foreground hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800"
              )}
            >
              <span
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                  isActive ? "bg-white text-primary" : "bg-muted text-muted-foreground group-hover:bg-slate-200 dark:group-hover:bg-slate-700"
                )}
              >
                {tab.num}
              </span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollByAmount(200)}
          className="absolute right-0 z-30 flex h-9 w-7 items-center justify-center bg-gradient-to-l from-background via-background to-transparent text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
