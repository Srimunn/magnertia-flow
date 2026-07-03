import { Info } from "lucide-react";
import type { ReactNode } from "react";

export function CardHeader({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-1.5">
        <h3 className="font-display text-[15px] font-semibold text-foreground">{title}</h3>
        <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
      </div>
      {right}
    </div>
  );
}
