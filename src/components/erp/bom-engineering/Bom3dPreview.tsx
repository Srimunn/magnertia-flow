import React, { useState } from "react";
import {
  Box,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Eye,
  Layers,
  Sparkles,
  RefreshCw,
} from "lucide-react";

export const Bom3dPreview: React.FC = () => {
  const [wireframe, setWireframe] = useState(false);
  const [exploded, setExploded] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleRotate = () => setRotation((prev) => (prev + 45) % 360);
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.2, 1.8));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.2, 0.6));
  const handleReset = () => {
    setWireframe(false);
    setExploded(false);
    setZoomLevel(1);
    setRotation(0);
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-3 border-b border-border bg-muted/20 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Box className="w-4 h-4 text-primary" />
          <h2 className="text-xs font-bold text-foreground">BOM Structure 3D Preview</h2>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800">
          Interactive CAD Model
        </span>
      </div>

      {/* Interactive 3D Canvas Area */}
      <div className="relative flex-1 min-h-[300px] bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 flex items-center justify-center overflow-hidden p-6">
        {/* Render EVSE Charging Station 3D Mockup Container */}
        <div
          className="relative transition-transform duration-500 ease-out flex flex-col items-center justify-center"
          style={{
            transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
          }}
        >
          {/* Charger Body Representation */}
          <div
            className={`w-36 h-72 rounded-2xl border-2 transition-all duration-300 flex flex-col justify-between p-4 shadow-2xl relative ${
              wireframe
                ? "border-cyan-400 bg-cyan-950/20 text-cyan-300"
                : "border-slate-600 bg-slate-800 text-slate-100"
            } ${exploded ? "scale-105 shadow-cyan-500/20" : ""}`}
          >
            {/* Top Display Status Screen */}
            <div className="w-full h-12 bg-slate-950 rounded-lg border border-slate-700 p-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] font-mono text-emerald-400 font-bold">22 kW READY</span>
              </div>
              <Sparkles className="w-3 h-3 text-cyan-400" />
            </div>

            {/* Cable Docking Arm Interface */}
            <div className="my-auto py-4 flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-full border-4 border-cyan-500/60 bg-cyan-950/40 flex items-center justify-center shadow-inner">
                <div className="w-10 h-10 rounded-full border-2 border-emerald-400 bg-emerald-950/60 flex items-center justify-center">
                  <span className="text-[8px] font-mono text-emerald-300 font-bold">COIL-TX</span>
                </div>
              </div>
              <span className="text-[9px] font-semibold text-slate-400">Autonomous Docking Plug</span>
            </div>

            {/* Base Connector Pedestal */}
            <div className="w-full h-8 bg-slate-900 border-t border-slate-700 rounded-b-lg flex items-center justify-center">
              <span className="text-[8px] font-mono text-slate-400">AW-EVSE-ASSY v2.1</span>
            </div>
          </div>
        </div>

        {/* 3D View Toolbar Controls at Bottom */}
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-slate-900/90 backdrop-blur border border-slate-700 rounded-full px-3 py-1.5 flex items-center gap-2 text-slate-300 shadow-xl">
          <button
            onClick={handleRotate}
            title="Rotate 3D View"
            className="p-1.5 hover:bg-slate-800 rounded-full hover:text-white transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-1.5 hover:bg-slate-800 rounded-full hover:text-white transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1.5 hover:bg-slate-800 rounded-full hover:text-white transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setWireframe(!wireframe)}
            title="Toggle Wireframe"
            className={`p-1.5 rounded-full transition-colors ${
              wireframe ? "bg-cyan-600 text-white" : "hover:bg-slate-800"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setExploded(!exploded)}
            title="Toggle Exploded View"
            className={`p-1.5 rounded-full transition-colors ${
              exploded ? "bg-amber-600 text-white" : "hover:bg-slate-800"
            }`}
          >
            <Box className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleReset}
            title="Reset Camera"
            className="p-1.5 hover:bg-slate-800 rounded-full hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
