import React, { useState } from "react";
import {
  GitCommit,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  ArrowDown,
  Layers,
  CheckCircle2,
} from "lucide-react";

export const ProcessFlowDiagram: React.FC = () => {
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.15, 1.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.15, 0.7));
  const handleReset = () => setZoomLevel(1);

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden flex flex-col h-full text-xs">
      <div className="p-3 border-b border-border bg-muted/20 flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <GitCommit className="w-4 h-4 text-primary" />
          <h2 className="font-bold text-foreground text-xs">Process Flow Diagram</h2>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-1 hover:bg-muted rounded text-muted-foreground"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1 hover:bg-muted rounded text-muted-foreground"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleReset}
            title="Reset"
            className="p-1 hover:bg-muted rounded text-muted-foreground"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Process Flowchart Viewport */}
      <div className="relative flex-1 min-h-[380px] max-h-[520px] bg-muted/10 overflow-y-auto p-4 flex flex-col items-center">
        <div
          className="flex flex-col items-center space-y-2 transition-transform duration-300 w-full max-w-sm"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top center" }}
        >
          {/* Start Pill */}
          <div className="px-4 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow">
            Start
          </div>

          <ArrowDown className="w-3 h-3 text-muted-foreground" />

          {/* OP-10 */}
          <div className="w-full text-center p-2 rounded-lg bg-card border border-border shadow-sm hover:border-primary transition-colors">
            <div className="font-bold text-foreground">Incoming Material Inspection</div>
            <span className="text-[10px] text-muted-foreground font-mono">OP-10</span>
          </div>

          <ArrowDown className="w-3 h-3 text-muted-foreground" />

          {/* OP-20 */}
          <div className="w-full text-center p-2 rounded-lg bg-card border border-border shadow-sm hover:border-primary transition-colors">
            <div className="font-bold text-foreground">Cutting</div>
            <span className="text-[10px] text-muted-foreground font-mono">OP-20</span>
          </div>

          <ArrowDown className="w-3 h-3 text-muted-foreground" />

          {/* OP-30 */}
          <div className="w-full text-center p-2 rounded-lg bg-card border border-border shadow-sm hover:border-primary transition-colors">
            <div className="font-bold text-foreground">Bending</div>
            <span className="text-[10px] text-muted-foreground font-mono">OP-30</span>
          </div>

          <ArrowDown className="w-3 h-3 text-muted-foreground" />

          {/* OP-40 */}
          <div className="w-full text-center p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 shadow-sm">
            <div className="font-bold text-amber-900 dark:text-amber-200">Welding</div>
            <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 font-bold">OP-40 (Critical)</span>
          </div>

          <ArrowDown className="w-3 h-3 text-muted-foreground" />

          {/* OP-50 */}
          <div className="w-full text-center p-2 rounded-lg bg-card border border-border shadow-sm">
            <div className="font-bold text-foreground">Grinding</div>
            <span className="text-[10px] text-muted-foreground font-mono">OP-50</span>
          </div>

          <ArrowDown className="w-3 h-3 text-muted-foreground" />

          {/* Parallel Flow: OP-60 Coating & OP-70 PCB Assembly */}
          <div className="grid grid-cols-2 gap-2 w-full">
            <div className="text-center p-2 rounded-lg bg-card border border-border shadow-sm">
              <div className="font-bold text-foreground">Coating</div>
              <span className="text-[10px] text-muted-foreground font-mono">OP-60</span>
            </div>
            <div className="text-center p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-800 shadow-sm">
              <div className="font-bold text-purple-900 dark:text-purple-200">PCB Assembly</div>
              <span className="text-[10px] font-mono text-purple-700 dark:text-purple-400 font-bold">OP-70</span>
            </div>
          </div>

          <ArrowDown className="w-3 h-3 text-muted-foreground" />

          {/* OP-80 */}
          <div className="w-full text-center p-2 rounded-lg bg-card border border-border shadow-sm">
            <div className="font-bold text-foreground">Module Assembly</div>
            <span className="text-[10px] text-muted-foreground font-mono">OP-80</span>
          </div>

          <ArrowDown className="w-3 h-3 text-muted-foreground" />

          {/* OP-90 */}
          <div className="w-full text-center p-2 rounded-lg bg-card border border-border shadow-sm">
            <div className="font-bold text-foreground">Sub Assembly</div>
            <span className="text-[10px] text-muted-foreground font-mono">OP-90</span>
          </div>

          <ArrowDown className="w-3 h-3 text-muted-foreground" />

          {/* OP-100 */}
          <div className="w-full text-center p-2 rounded-lg bg-card border border-border shadow-sm">
            <div className="font-bold text-foreground">Final Assembly</div>
            <span className="text-[10px] text-muted-foreground font-mono">OP-100</span>
          </div>

          <ArrowDown className="w-3 h-3 text-muted-foreground" />

          {/* OP-110 */}
          <div className="w-full text-center p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-800 shadow-sm">
            <div className="font-bold text-blue-900 dark:text-blue-200">Functional Testing</div>
            <span className="text-[10px] font-mono text-blue-700 dark:text-blue-400 font-bold">OP-110 (22kW Test)</span>
          </div>

          <ArrowDown className="w-3 h-3 text-muted-foreground" />

          {/* OP-120 */}
          <div className="w-full text-center p-2 rounded-lg bg-card border border-border shadow-sm">
            <div className="font-bold text-foreground">Final Inspection & Packing</div>
            <span className="text-[10px] text-muted-foreground font-mono">OP-120</span>
          </div>

          <ArrowDown className="w-3 h-3 text-muted-foreground" />

          {/* End Pill */}
          <div className="px-4 py-1 rounded-full bg-slate-800 text-white text-[10px] font-bold shadow">
            End
          </div>
        </div>
      </div>
    </div>
  );
};
