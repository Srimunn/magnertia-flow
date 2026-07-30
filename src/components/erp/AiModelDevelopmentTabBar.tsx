import { useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type AiModelDevelopmentTabId =
  | "overview"
  | "dataset"
  | "features"
  | "architecture"
  | "training"
  | "evaluation"
  | "governance"
  | "deployment"
  | "ai_assessment"
  | "summary"
  | "attachments"
  | "review_approval"
  | "system_info";

export interface AiModelDevelopmentTabItem {
  id: AiModelDevelopmentTabId;
  label: string;
  badge?: string | number;
}

export const AI_MODEL_TABS: AiModelDevelopmentTabItem[] = [
  { id: "overview", label: "Overview" },
  { id: "dataset", label: "Dataset", badge: "2.4 TB" },
  { id: "features", label: "Features", badge: "88/100" },
  { id: "architecture", label: "Architecture", badge: "XGBoost" },
  { id: "training", label: "Training", badge: "200 Ep" },
  { id: "evaluation", label: "Evaluation", badge: "92.4% Acc" },
  { id: "governance", label: "Governance", badge: "GDPR" },
  { id: "deployment", label: "Deployment", badge: "Deployed" },
  { id: "ai_assessment", label: "AI Assessment", badge: "92/100" },
  { id: "summary", label: "Summary", badge: "90/100" },
  { id: "attachments", label: "Attachments", badge: "8 Files" },
  { id: "review_approval", label: "Review & Approval", badge: "In Review" },
  { id: "system_info", label: "System Info" },
];

export function AiModelDevelopmentTabBar({
  activeTab = "overview",
  onTabChange,
}: {
  activeTab?: AiModelDevelopmentTabId;
  onTabChange?: (tabId: AiModelDevelopmentTabId) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 2);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const distance = 240;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
  };

  return (
    <div className="sticky top-[56px] z-20 flex items-center border-b border-border/80 bg-white/95 backdrop-blur-md dark:bg-slate-900/95 shadow-xs transition-colors">
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll("left")}
          aria-label="Scroll tabs left"
          className="absolute left-1 z-30 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-white shadow-sm hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 text-slate-600 dark:text-slate-200 transition-all"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex items-center gap-1.5 px-4 overflow-x-auto scrollbar-none py-1.5 w-full transition-all"
      >
        {AI_MODEL_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange?.(tab.id)}
              className={cn(
                "relative group flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer select-none",
                isActive
                  ? "bg-blue-600/10 text-blue-600 font-bold shadow-xs dark:bg-blue-500/20 dark:text-blue-400"
                  : "text-muted-foreground hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800/60 dark:text-slate-400"
              )}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-tight transition-colors",
                    isActive
                      ? "bg-blue-600 text-white dark:bg-blue-500"
                      : "bg-slate-200/80 text-slate-700 dark:bg-slate-800 dark:text-slate-300 group-hover:bg-slate-300 dark:group-hover:bg-slate-700"
                  )}
                >
                  {tab.badge}
                </span>
              )}
              {isActive && (
                <div className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-blue-600 dark:bg-blue-400 shadow-sm" />
              )}
            </button>
          );
        })}
      </div>

      {canScrollRight && (
        <button
          type="button"
          onClick={() => scroll("right")}
          aria-label="Scroll tabs right"
          className="absolute right-1 z-30 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-white shadow-sm hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 text-slate-600 dark:text-slate-200 transition-all"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
