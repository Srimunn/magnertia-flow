import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User } from "lucide-react";
import type { WorkInstructionAuditEntry } from "@/services/types";

export function WorkInstructionActivityHistorySection({
  activities,
}: {
  activities: WorkInstructionAuditEntry[];
}) {
  return (
    <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
            11
          </span>
          <CardTitle className="text-base font-bold">Activity History & Audit Trail</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Immutable audit log capturing instruction revisions, step edits, SOP uploads & executive sign-offs.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-6 text-xs">
          {activities.map((act) => (
            <div key={act.id} className="relative group">
              <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full border-2 border-primary bg-white dark:bg-slate-900 flex items-center justify-center shadow-xs">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800/80 transition-colors space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <span>{act.action}</span>
                    {act.newStatus && (
                      <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700">
                        {act.newStatus}
                      </Badge>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {act.timestamp}
                  </span>
                </div>

                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                  {act.description}
                </p>

                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pt-1">
                  <User className="h-3 w-3 text-slate-400" />
                  <span>Performed by {act.user}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
