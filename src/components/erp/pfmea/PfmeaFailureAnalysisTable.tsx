import React, { useState } from "react";
import {
  ShieldAlert,
  Search,
  Download,
  Plus,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";
import type { PfmeaFailureMode } from "@/services/types";

interface PfmeaFailureAnalysisTableProps {
  failureModes: PfmeaFailureMode[];
  onAddFailureMode?: () => void;
}

export const PfmeaFailureAnalysisTable: React.FC<PfmeaFailureAnalysisTableProps> = ({
  failureModes,
  onAddFailureMode,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("All");

  const filteredModes = failureModes.filter((fm) => {
    const matchesSearch =
      fm.processStep.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fm.potentialFailureMode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fm.potentialCause.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterPriority === "All") return matchesSearch;
    return matchesSearch && fm.actionPriority.includes(filterPriority);
  });

  const getApBadge = (ap: string) => {
    if (ap.includes("H")) {
      return (
        <span className="px-2 py-0.5 rounded font-black text-[10px] bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300">
          H
        </span>
      );
    }
    if (ap.includes("M")) {
      return (
        <span className="px-2 py-0.5 rounded font-black text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300">
          M
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded font-black text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300">
        L
      </span>
    );
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden text-xs">
      {/* Table Header Controls matching mockup */}
      <div className="p-3 border-b border-border bg-muted/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-foreground">
            Failure Analysis
          </h2>
          <span className="text-xs text-muted-foreground font-normal">
            (Total {failureModes.length} Failure Modes)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search failure modes, causes, controls..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border border-input rounded-md pl-8 pr-2.5 py-1 text-xs focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Filter Priority Dropdown */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-background border border-input rounded-md px-2.5 py-1 text-xs font-semibold focus:ring-1 focus:ring-primary"
          >
            <option value="All">All Priorities</option>
            <option value="H">High (H)</option>
            <option value="M">Medium (M)</option>
            <option value="L">Low (L)</option>
          </select>

          <button
            onClick={onAddFailureMode}
            className="px-2.5 py-1 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold rounded flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Add Failure Mode
          </button>

          <button className="px-2.5 py-1 border border-input bg-background hover:bg-accent text-xs font-medium rounded shadow-sm flex items-center gap-1">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      {/* Failure Modes Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
              <th className="py-2.5 px-2 w-10 text-center">Step No.</th>
              <th className="py-2.5 px-3 min-w-[130px]">Process Step</th>
              <th className="py-2.5 px-3 min-w-[150px]">Potential Failure Mode</th>
              <th className="py-2.5 px-2 text-center w-10">S</th>
              <th className="py-2.5 px-3 min-w-[160px]">Potential Effect</th>
              <th className="py-2.5 px-2 text-center w-10">O</th>
              <th className="py-2.5 px-3 min-w-[150px]">Potential Cause</th>
              <th className="py-2.5 px-3 min-w-[160px]">Current Controls</th>
              <th className="py-2.5 px-2 text-center w-10">D</th>
              <th className="py-2.5 px-2 text-center w-12">AP</th>
              <th className="py-2.5 px-2.5 text-center font-bold text-foreground">RPN</th>
              <th className="py-2.5 px-2.5 text-center font-bold text-primary">RPN (After)</th>
              <th className="py-2.5 px-3 text-center w-24">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filteredModes.map((fm) => (
              <tr key={fm.id} className="hover:bg-muted/30 transition-colors">
                <td className="py-2.5 px-2 text-center font-bold text-muted-foreground">{fm.stepNo}</td>
                <td className="py-2.5 px-3 font-semibold text-foreground">{fm.processStep}</td>
                <td className="py-2.5 px-3 font-bold text-foreground">{fm.potentialFailureMode}</td>
                <td className="py-2.5 px-2 text-center font-mono font-bold text-rose-600 dark:text-rose-400">{fm.severity}</td>
                <td className="py-2.5 px-3 text-muted-foreground text-[11px]">{fm.potentialEffect}</td>
                <td className="py-2.5 px-2 text-center font-mono font-medium">{fm.occurrence}</td>
                <td className="py-2.5 px-3 text-muted-foreground text-[11px]">{fm.potentialCause}</td>
                <td className="py-2.5 px-3 text-muted-foreground text-[11px]">{fm.currentControls}</td>
                <td className="py-2.5 px-2 text-center font-mono font-medium">{fm.detection}</td>
                <td className="py-2.5 px-2 text-center">{getApBadge(fm.actionPriority)}</td>
                <td className="py-2.5 px-2.5 text-center font-mono font-extrabold text-foreground">{fm.rpnBefore}</td>
                <td className="py-2.5 px-2.5 text-center font-mono font-extrabold text-emerald-600 dark:text-emerald-400">{fm.rpnAfter}</td>
                <td className="py-2.5 px-3 text-center">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold ${
                      fm.status === "In Progress"
                        ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                        : fm.status === "Open"
                        ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                        : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                    }`}
                  >
                    {fm.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer info */}
      <div className="p-3 bg-muted/30 border-t border-border flex flex-col sm:flex-row justify-between items-center text-[10px] text-muted-foreground gap-2">
        <span className="font-semibold">
          AP: Action Priority (H-High, M-Medium, L-Low) | Auto Formula: RPN = Severity × Occurrence × Detection
        </span>
        <span className="font-mono">
          Showing 1 to {filteredModes.length} of {failureModes.length} entries
        </span>
      </div>
    </div>
  );
};
