import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, Clock, User, GitCommit } from "lucide-react";
import type { SmartFactoryDevelopmentRecord } from "@/services/types";

interface SmartFactorySystemInfoCardProps {
  record: SmartFactoryDevelopmentRecord;
}

export const SmartFactorySystemInfoCard: React.FC<SmartFactorySystemInfoCardProps> = ({
  record,
}) => {
  const MaicwBadge = ({ type, tooltip }: { type: "M" | "A" | "I" | "C" | "W"; tooltip: string }) => {
    const colors = {
      M: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-200",
      A: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200",
      I: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200",
      C: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200",
      W: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200",
    };
    return (
      <span
        title={tooltip}
        className={`ml-1.5 inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-extrabold uppercase border ${colors[type]}`}
      >
        {type}
      </span>
    );
  };

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="border-b border-border/60 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-bold text-foreground">
              11. System Information & Audit Trail
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-xs font-bold">
            v{record.version.toFixed(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 pt-4">
        {/* System Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3 md:grid-cols-6">
          <div className="flex flex-col gap-1 rounded-lg border border-border/60 bg-muted/20 p-2.5">
            <span className="text-[10px] font-semibold text-muted-foreground">
              Created By
              <MaicwBadge type="I" tooltip="Information Lookup" />
            </span>
            <span className="font-bold text-foreground">{record.createdBy}</span>
          </div>

          <div className="flex flex-col gap-1 rounded-lg border border-border/60 bg-muted/20 p-2.5">
            <span className="text-[10px] font-semibold text-muted-foreground">
              Created Date
              <MaicwBadge type="A" tooltip="Auto-generated Timestamp" />
            </span>
            <span className="font-bold text-foreground">{record.createdDate}</span>
          </div>

          <div className="flex flex-col gap-1 rounded-lg border border-border/60 bg-muted/20 p-2.5">
            <span className="text-[10px] font-semibold text-muted-foreground">
              Last Modified By
              <MaicwBadge type="I" tooltip="Information Lookup" />
            </span>
            <span className="font-bold text-foreground">{record.lastModifiedBy}</span>
          </div>

          <div className="flex flex-col gap-1 rounded-lg border border-border/60 bg-muted/20 p-2.5">
            <span className="text-[10px] font-semibold text-muted-foreground">
              Last Modified Date
              <MaicwBadge type="A" tooltip="Auto-generated Timestamp" />
            </span>
            <span className="font-bold text-foreground">{record.lastModifiedDate}</span>
          </div>

          <div className="flex flex-col gap-1 rounded-lg border border-border/60 bg-muted/20 p-2.5">
            <span className="text-[10px] font-semibold text-muted-foreground">
              Workflow Stage
              <MaicwBadge type="W" tooltip="Workflow Dropdown" />
            </span>
            <span className="font-bold text-primary">{record.workflowStage}</span>
          </div>

          <div className="flex flex-col gap-1 rounded-lg border border-border/60 bg-muted/20 p-2.5">
            <span className="text-[10px] font-semibold text-muted-foreground">
              Version
              <MaicwBadge type="A" tooltip="Auto-incremented" />
            </span>
            <span className="font-bold text-foreground">v{record.version.toFixed(1)}</span>
          </div>
        </div>

        {/* Audit Trail Timeline Log */}
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Audit Trail & Activity Log
          </h4>
          <div className="divide-y divide-border/60 rounded-lg border border-border">
            {record.auditTrail.map((log) => (
              <div key={log.id} className="flex items-start justify-between gap-4 p-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <GitCommit className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{log.action}</span>
                      <span className="text-[10px] font-semibold text-muted-foreground">by {log.user}</span>
                    </div>
                    <p className="mt-0.5 text-muted-foreground">{log.details}</p>
                  </div>
                </div>
                <span className="whitespace-nowrap text-[10px] font-medium text-muted-foreground">
                  {log.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
