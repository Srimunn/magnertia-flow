import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Bot, RefreshCw } from "lucide-react";
import type { FactoryLayoutFormInput } from "@/services/types";
import { aiFactoryAssessmentService } from "@/services/aiFactoryAssessmentService";
import { toast } from "sonner";

export function AiFactoryAssessmentSection({
  form,
}: {
  form: UseFormReturn<FactoryLayoutFormInput>;
}) {
  const { watch, setValue } = form;

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  const aiScore = watch("aiFactoryScore") ?? 89;

  const handleRunAiAnalysis = async () => {
    setIsAnalyzing(true);
    setProgress(15);
    toast.info("AI Factory Layout Intelligence Engine launched...");

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 400);

    try {
      const result = await aiFactoryAssessmentService.analyzeFactoryLayout(watch());
      clearInterval(interval);
      setProgress(100);
      setValue("aiFactoryScore", result.aiFactoryScore);
      setValue("aiLayoutOptimization", result.layoutOptimization);
      setValue("aiBottleneckPrediction", result.bottleneckPrediction);
      setValue("aiMaterialFlowOptimization", result.materialFlowOptimization);
      setValue("aiCapacityExpansionRec", result.capacityExpansionRec);
      setValue("aiSafetyImprovementRec", result.safetyImprovementRec);
      toast.success("AI Factory Assessment completed successfully!");
    } catch (err) {
      toast.error("Failed to run AI Factory Assessment");
    } finally {
      setTimeout(() => {
        setIsAnalyzing(false);
        setProgress(0);
      }, 500);
    }
  };

  return (
    <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
              7
            </span>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              AI Factory Layout Assessment & Bottleneck Prediction
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Algorithmic material path optimization, bottleneck forecast, expansion planning & fire safety coverage.
          </CardDescription>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={handleRunAiAnalysis}
            disabled={isAnalyzing}
            className="gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs shadow-xs"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Bot className="h-4 w-4" />
                Analyze with AI
              </>
            )}
          </Button>

          <div className="flex items-center gap-2 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/60 dark:to-blue-950/60 border border-indigo-200 dark:border-indigo-800 rounded-xl px-4 py-2">
            <div>
              <span className="text-[10px] font-semibold uppercase text-indigo-600 dark:text-indigo-400 block tracking-wider">
                AI Factory Score
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-indigo-700 dark:text-indigo-300 font-mono">
                  {aiScore}
                </span>
                <span className="text-xs text-indigo-500 font-semibold">/100</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isAnalyzing && (
          <div className="space-y-1.5 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
            <div className="flex justify-between text-xs font-semibold text-blue-700 dark:text-blue-300">
              <span>Simulating material transport routes & AGV congestion risk...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-blue-200 dark:bg-blue-900" />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5">
            <span className="font-bold text-foreground block">AI Layout Optimization</span>
            <p className="text-muted-foreground leading-relaxed">
              {watch("aiLayoutOptimization") ||
                "AI suggests relocating SMT line to reduce material travel distance by 12%."}
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5">
            <span className="font-bold text-foreground block">AI Bottleneck Prediction</span>
            <p className="text-muted-foreground leading-relaxed">
              {watch("aiBottleneckPrediction") ||
                "Panel assembly zone may become a bottleneck at 85% capacity loading."}
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5">
            <span className="font-bold text-foreground block">AI Material Flow Optimization</span>
            <p className="text-muted-foreground leading-relaxed">
              {watch("aiMaterialFlowOptimization") ||
                "AI optimizes AGV routes and storage locations for better overall flow."}
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5">
            <span className="font-bold text-foreground block">AI Capacity Expansion Recommendation</span>
            <p className="text-muted-foreground leading-relaxed">
              {watch("aiCapacityExpansionRec") ||
                "Add 2 additional assembly cells in Phase 2 expansion."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
