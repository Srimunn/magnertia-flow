import { ChevronLeft, ChevronRight } from "lucide-react";
import { FilterSelect } from "./FilterButton";

// Shared "Showing X to Y of Z" pagination footer for any list/table module
// (Transactions, General Ledger, ...). Total is always the real filtered
// count, never a fixed headline number — see architecture.md's "Mock
// pagination" note for why a smaller-but-honest total beats a fake one.
export function PaginationFooter({
  page,
  pageSize,
  total,
  entityLabel = "entries",
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  entityLabel?: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4 text-[12.5px]">
      <span className="text-muted-foreground">
        Showing {start} to {end} of {total} {entityLabel}
      </span>
      <div className="flex items-center gap-3">
        <FilterSelect
          value={String(pageSize)}
          onChange={(v) => onPageSizeChange(Number(v))}
          options={[10, 25, 50].map((n) => ({ label: `${n} per page`, value: String(n) }))}
        />
        <div className="flex items-center gap-1">
          <button
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="grid h-7 w-7 place-items-center rounded-md border border-border text-muted-foreground hover:bg-muted disabled:opacity-40"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          {pages.map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`grid h-7 w-7 place-items-center rounded-md text-[12px] font-medium ${
                p === page ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            disabled={page >= pageCount}
            onClick={() => onPageChange(page + 1)}
            className="grid h-7 w-7 place-items-center rounded-md border border-border text-muted-foreground hover:bg-muted disabled:opacity-40"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
