import React from "react";
import { BookOpen, FileCheck, Activity, CheckCircle2, Lock } from "lucide-react";
import type { StandardWorkReleaseActions } from "@/lib/lean-manufacturing/types";

interface LeanStandardWorkReleasePanelProps {
  actions: StandardWorkReleaseActions;
  isAuthorized: boolean;
  onFireAction: (
    actionKey: "releaseStandardWork" | "deployNewStandards" | "initiateContinuousImprovement"
  ) => void;
}

export const LeanStandardWorkReleasePanel: React.FC<LeanStandardWorkReleasePanelProps> = ({
  actions,
  isAuthorized,
  onFireAction,
}) => {
  const allFired =
    !!actions.releaseStandardWork &&
    !!actions.deployNewStandards &&
    !!actions.initiateContinuousImprovement;

  return (
    <div className="bg-card text-card-foreground border-2 border-emerald-500/40 rounded-xl p-5 shadow-sm space-y-4 bg-gradient-to-br from-emerald-500/5 via-card to-card">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-foreground">Standard Work Release Panel</h3>
            <p className="text-xs text-muted-foreground">
              Publish standard work updates and deploy new manufacturing standards across lines.
            </p>
          </div>
        </div>
        {allFired ? (
          <span className="px-3 py-1 bg-emerald-600 text-white font-extrabold text-xs rounded-full shadow flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Continuous Improvement Active
          </span>
        ) : isAuthorized ? (
          <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs rounded-full border border-emerald-300">
            Project Approved — Ready for Release
          </span>
        ) : (
          <span className="px-3 py-1 bg-muted text-muted-foreground font-semibold text-xs rounded-full flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" /> Locked until Project Approval
          </span>
        )}
      </div>

      {/* 3 Action Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        {/* Action 1: Release Standard Work */}
        <div className="p-3 bg-background border border-border rounded-lg space-y-2 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-500" />
            <span className="font-bold text-foreground">1. Release Standard Work</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Publish updated Standard Work documents to Standard Work module.</p>
          {actions.releaseStandardWork ? (
            <span className="text-[10px] font-bold text-emerald-600 block">
              ✓ Fired {actions.releaseStandardWork.firedAt}
            </span>
          ) : (
            <button
              disabled={!isAuthorized}
              onClick={() => onFireAction("releaseStandardWork")}
              className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded text-xs transition-colors"
            >
              Release Standard Work
            </button>
          )}
        </div>

        {/* Action 2: Deploy New Manufacturing Standards */}
        <div className="p-3 bg-background border border-border rounded-lg space-y-2 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-purple-500" />
            <span className="font-bold text-foreground">2. Deploy New Standards</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Update Process Engineering, Routing, and Work Instructions.</p>
          {actions.deployNewStandards ? (
            <span className="text-[10px] font-bold text-emerald-600 block">
              ✓ Fired {actions.deployNewStandards.firedAt}
            </span>
          ) : (
            <button
              disabled={!isAuthorized}
              onClick={() => onFireAction("deployNewStandards")}
              className="w-full py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold rounded text-xs transition-colors"
            >
              Deploy Standards
            </button>
          )}
        </div>

        {/* Action 3: Initiate Continuous Improvement Tracking */}
        <div className="p-3 bg-background border border-border rounded-lg space-y-2 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            <span className="font-bold text-foreground">3. Initiate CI Tracking</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Activate sustained improvement KPI tracking.</p>
          {actions.initiateContinuousImprovement ? (
            <span className="text-[10px] font-bold text-emerald-600 block">
              ✓ Fired {actions.initiateContinuousImprovement.firedAt}
            </span>
          ) : (
            <button
              disabled={!isAuthorized}
              onClick={() => onFireAction("initiateContinuousImprovement")}
              className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded text-xs transition-colors"
            >
              Initiate CI Tracking
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
