import { useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const TAB_BASE =
  "shrink-0 whitespace-nowrap border-b-2 border-transparent bg-transparent px-3 pb-3 pt-1 text-[13px] font-semibold text-muted-foreground shadow-none transition-all hover:text-foreground focus-visible:outline-none";
const TAB_ACTIVE = "border-primary text-primary hover:text-primary font-bold";

const FINANCE_TABS = [
  { to: "/management/finance/overview", label: "Overview" },
  { to: "/management/finance/payables", label: "Accounts Payable (AP)" },
  { to: "/management/finance/receivables", label: "Accounts Receivable (AR)" },
  { to: "/management/finance/audit", label: "Audit Trail" },
  { to: "/management/finance/budgeting", label: "Budgeting" },
  { to: "/management/finance/cash-bank", label: "Cash & Bank" },
  { to: "/management/finance/consolidation", label: "Consolidation" },
  { to: "/management/finance/cost-centers", label: "Cost Centers" },
  { to: "/management/finance/reports", label: "Financial Reports" },
  { to: "/management/finance/assets", label: "Fixed Assets" },
  { to: "/management/finance/ledger", label: "General Ledger (GL)" },
  { to: "/management/finance/profitability", label: "Profitability" },
  { to: "/management/finance/setup", label: "Setup & Integrations" },
  { to: "/management/finance/tax", label: "Tax Management" },
  { to: "/settings", label: "Settings" },
];

export function FinanceTabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftBtn, setShowLeftBtn] = useState(false);
  const [showRightBtn, setShowRightBtn] = useState(false);

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      // Show left button if we are scrolled right by more than 5px
      setShowLeftBtn(scrollLeft > 5);
      // Show right button if there is scrollable content remaining
      setShowRightBtn(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      // Run once initially
      checkScroll();

      // Set up scroll listener
      container.addEventListener("scroll", checkScroll);

      // Set up resize observer for width changes
      const observer = new ResizeObserver(() => checkScroll());
      observer.observe(container);

      // Clean up
      return () => {
        container.removeEventListener("scroll", checkScroll);
        observer.disconnect();
      };
    }
  }, []);

  // Intercept scroll wheel to scroll horizontally
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const container = scrollContainerRef.current;
    if (container) {
      // Prevent standard page scroll if container is actually scrollable
      const { scrollWidth, clientWidth } = container;
      if (scrollWidth > clientWidth) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    }
  };

  // Click handler for left/right scroll buttons
  const scrollBy = (amount: number) => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  return (
    <div className="relative flex items-center border-b border-border bg-white px-2 shadow-sm">
      {/* Left Scroll Button */}
      {showLeftBtn && (
        <button
          onClick={() => scrollBy(-200)}
          className="absolute left-0 z-10 flex h-full w-8 items-center justify-center bg-gradient-to-r from-white via-white to-transparent text-muted-foreground hover:text-foreground"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5 bg-white rounded-full border border-border shadow-md" />
        </button>
      )}

      {/* Navigation Scrollable Wrapper */}
      <div
        ref={scrollContainerRef}
        onWheel={handleWheel}
        className="flex w-full gap-4 overflow-x-auto scroll-smooth py-2 px-1 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {FINANCE_TABS.map((tab) => {
          const active = pathname.startsWith(tab.to);
          return (
            <Link key={tab.to} to={tab.to} className={cn(TAB_BASE, active && TAB_ACTIVE)}>
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Right Scroll Button */}
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
