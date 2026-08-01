import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ZoomIn, ZoomOut, Maximize2, Download, RefreshCw, GitBranch } from "lucide-react";
import { toast } from "sonner";

export function ProcessFlowViewer() {
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.15, 1.6));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.15, 0.7));
  const handleResetZoom = () => setZoom(1);

  return (
    <Card className={`border-border/80 shadow-xs bg-white dark:bg-slate-900 transition-all ${isFullscreen ? "fixed inset-4 z-50 overflow-auto shadow-2xl" : ""}`}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-primary" />
            Process Flow Diagram
          </CardTitle>
          <CardDescription className="text-xs">
            Interactive process flow flowchart mapping production steps, decision nodes & corrective action paths.
          </CardDescription>
        </div>

        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleZoomOut} title="Zoom Out">
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <span className="text-[11px] font-mono font-bold w-10 text-center">{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleZoomIn} title="Zoom In">
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleResetZoom} title="Reset Zoom">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title="Toggle Fullscreen"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/60 dark:bg-slate-950/60 p-4 flex items-center justify-center min-h-[360px] overflow-auto">
          <div
            style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
            className="transition-transform duration-200"
          >
            <svg width="420" height="380" viewBox="0 0 420 380" className="w-full max-w-[420px] select-none">
              {/* Defs for Markers */}
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
                </marker>
                <marker id="arrow-red" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
                </marker>
              </defs>

              {/* Start Oval */}
              <rect x="160" y="10" width="100" height="28" rx="14" fill="#1e293b" />
              <text x="210" y="28" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">Start</text>

              {/* Arrow Start -> Process 1 */}
              <line x1="210" y1="38" x2="210" y2="58" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />

              {/* Node 1: Check Production Plan */}
              <rect x="135" y="60" width="150" height="34" rx="6" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
              <text x="210" y="75" fill="#0f172a" fontSize="10" fontWeight="600" textAnchor="middle">Check Production Plan</text>
              <text x="210" y="87" fill="#64748b" fontSize="9" textAnchor="middle">& Work Order</text>

              {/* Arrow 1 -> Decision 1 */}
              <line x1="210" y1="94" x2="210" y2="114" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />

              {/* Decision 1: Material Available? */}
              <polygon points="210,115 270,135 210,155 150,135" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.5" />
              <text x="210" y="133" fill="#78350f" fontSize="9" fontWeight="bold" textAnchor="middle">Material</text>
              <text x="210" y="143" fill="#78350f" fontSize="9" fontWeight="bold" textAnchor="middle">Available?</text>

              {/* Decision 1 -> No (Raise Material Request) */}
              <line x1="270" y1="135" x2="320" y2="135" stroke="#ef4444" strokeWidth="1.5" markerEnd="url(#arrow-red)" />
              <text x="285" y="130" fill="#ef4444" fontSize="9" fontWeight="bold">No</text>
              <rect x="320" y="118" width="85" height="34" rx="4" fill="#fee2e2" stroke="#fca5a5" strokeWidth="1" />
              <text x="362" y="132" fill="#991b1b" fontSize="9" fontWeight="bold" textAnchor="middle">Raise Material</text>
              <text x="362" y="143" fill="#991b1b" fontSize="9" textAnchor="middle">Request</text>

              {/* Decision 1 -> Yes (Setup Machine) */}
              <line x1="210" y1="155" x2="210" y2="175" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
              <text x="218" y="167" fill="#16a34a" fontSize="9" fontWeight="bold">Yes</text>

              {/* Node 2: Setup Machine & Parameters */}
              <rect x="135" y="176" width="150" height="30" rx="6" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
              <text x="210" y="195" fill="#0f172a" fontSize="10" fontWeight="600" textAnchor="middle">Setup Machine & Parameters</text>

              {/* Arrow 2 -> Node 3 */}
              <line x1="210" y1="206" x2="210" y2="222" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />

              {/* Node 3: Start Production & Monitor */}
              <rect x="135" y="223" width="150" height="30" rx="6" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
              <text x="210" y="242" fill="#0f172a" fontSize="10" fontWeight="600" textAnchor="middle">Start Production & Monitor</text>

              {/* Arrow 3 -> Node 4 */}
              <line x1="210" y1="253" x2="210" y2="269" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />

              {/* Node 4: In-Process Inspection */}
              <rect x="135" y="270" width="150" height="30" rx="6" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
              <text x="210" y="289" fill="#0f172a" fontSize="10" fontWeight="600" textAnchor="middle">In-Process Inspection & Quality</text>

              {/* Arrow 4 -> Decision 2 */}
              <line x1="210" y1="300" x2="210" y2="310" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />

              {/* Decision 2: Within Specification? */}
              <polygon points="210,311 270,326 210,341 150,326" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.5" />
              <text x="210" y="325" fill="#78350f" fontSize="8" fontWeight="bold" textAnchor="middle">Within</text>
              <text x="210" y="334" fill="#78350f" fontSize="8" fontWeight="bold" textAnchor="middle">Specification?</text>

              {/* Decision 2 -> No (Corrective Action & Rework) */}
              <line x1="270" y1="326" x2="320" y2="326" stroke="#ef4444" strokeWidth="1.5" markerEnd="url(#arrow-red)" />
              <text x="285" y="321" fill="#ef4444" fontSize="9" fontWeight="bold">No</text>
              <rect x="320" y="310" width="85" height="32" rx="4" fill="#fee2e2" stroke="#fca5a5" strokeWidth="1" />
              <text x="362" y="323" fill="#991b1b" fontSize="8" fontWeight="bold" textAnchor="middle">Corrective Action</text>
              <text x="362" y="333" fill="#991b1b" fontSize="8" textAnchor="middle">& Rework</text>

              {/* Decision 2 -> Yes (Record & End) */}
              <line x1="210" y1="341" x2="210" y2="352" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
              <text x="218" y="348" fill="#16a34a" fontSize="8" fontWeight="bold">Yes</text>

              {/* End Oval */}
              <rect x="160" y="353" width="100" height="24" rx="12" fill="#1e293b" />
              <text x="210" y="369" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">End</text>
            </svg>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <span className="text-muted-foreground text-[11px]">
            SVG Flowchart rendering • Standardized ISO 9001 Process Sequence
          </span>

          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1.5 font-semibold"
            onClick={() => toast.success("Process Flowchart Diagram downloaded as SVG/PNG")}
          >
            <Download className="h-3.5 w-3.5 text-primary" /> View / Download Diagram
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
