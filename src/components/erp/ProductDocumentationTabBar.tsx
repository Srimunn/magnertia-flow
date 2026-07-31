import { useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type ProductDocumentationTabId =
  | "overview"
  | "engineering_docs"
  | "manufacturing_docs"
  | "quality_compliance"
  | "customer_docs"
  | "version_control"
  | "ai_assessment"
  | "summary"
  | "attachments"
  | "review_approval";

export interface ProductDocumentationTabItem {
  id: ProductDocumentationTabId;
  label: string;
  badge?: string | number;
}

export const PRODUCT_DOCUMENTATION_TABS: ProductDocumentationTabItem[] = [
  { id: "overview", label: "Overview" },
  { id: "engineering_docs", label: "Engineering Docs", badge: "92" },
  { id: "manufacturing_docs", label: "Manufacturing Docs", badge: "90" },
  { id: "quality_compliance", label: "Quality & Compliance", badge: "89" },
  { id: "customer_docs", label: "Customer Docs", badge: "91" },
  { id: "version_control", label: "Version Control", badge: "88" },
  { id: "ai_assessment", label: "AI Assessment", badge: "90/100" },
  { id: "summary", label: "Summary", badge: "90/100" },
  { id: "attachments", label: "Attachments", badge: "15 Files" },
  { id: "review_approval", label: "Review & Approval", badge: "In Review" },
];

export function ProductDocumentationTabBar({
  activeTab = "overview",
  onTabChange,
  scores,
  attachmentsCount,
  status,
}: {
  activeTab?: ProductDocumentationTabId;
  onTabChange?: (tabId: ProductDocumentationTabId) => void;
  scores?: {
    eng?: number;
    mfg?: number;
    qual?: number;
    cust?: number;
    ver?: number;
    ai?: number;
    overall?: number;
  };
  attachmentsCount?: number;
  status?: string;
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

  // Dynamic tab badges if scores/counts provided
  const tabs = PRODUCT_DOCUMENTATION_TABS.map((t) => {
    let b = t.badge;
    if (scores) {
      if (t.id === "engineering_docs" && scores.eng !== undefined) b = scores.eng.toString();
      if (t.id === "manufacturing_docs" && scores.mfg !== undefined) b = scores.mfg.toString();
      if (t.id === "quality_compliance" && scores.qual !== undefined) b = scores.qual.toString();
      if (t.id === "customer_docs" && scores.cust !== undefined) b = scores.cust.toString();
      if (t.id === "version_control" && scores.ver !== undefined) b = scores.ver.toString();
      if (t.id === "ai_assessment" && scores.ai !== undefined) b = `${scores.ai}/100`;
      if (t.id === "summary" && scores.overall !== undefined) b = `${scores.overall}/100`;
    }
    if (t.id === "attachments" && attachmentsCount !== undefined) b = `${attachmentsCount} Files`;
    if (t.id === "review_approval" && status) b = status;
    return { ...t, badge: b };
  });

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
        {tabs.map((tab) => {
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
              {tab.badge !== undefined && (
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
