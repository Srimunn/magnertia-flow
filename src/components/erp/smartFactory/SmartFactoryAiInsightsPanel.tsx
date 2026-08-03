import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Zap, ShieldAlert, Cpu, CheckCircle } from "lucide-react";

interface SmartFactoryAiInsightsPanelProps {
  onViewFullAnalysis: () => void;
}

export const SmartFactoryAiInsightsPanel: React.FC<SmartFactoryAiInsightsPanelProps> = ({
  onViewFullAnalysis,
}) => {
  const insights = [
    {
      icon: Sparkles,
      color: "text-teal-600 bg-teal-50 dark:bg-teal-950 dark:text-teal-400",
      title: "Production Optimization",
      description: "AI suggests increasing robot utilization to improve OEE by 8.6%.",
    },
    {
      icon: ShieldAlert,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400",
      title: "Predictive Maintenance",
      description: "3 equipment are at high risk of failure in next 30 days.",
    },
    {
      icon: Zap,
      color: "text-purple-600 bg-purple-50 dark:bg-purple-950 dark:text-purple-400",
      title: "Energy Optimization",
      description: "Potential energy savings of ₹ 12,40,000 annually.",
    },
    {
      icon: CheckCircle,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400",
      title: "Quality Improvement",
      description: "AI vision system accuracy 98.7%, defects reduced by 18%.",
    },
    {
      icon: Cpu,
      color: "text-pink-600 bg-pink-50 dark:bg-pink-950 dark:text-pink-400",
      title: "Digital Twin Simulation",
      description: "Digital twin validation successful with 94% model accuracy.",
    },
  ];

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="border-b border-border/60 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <CardTitle className="text-sm font-bold text-foreground">
              AI Smart Factory Insights
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-4">
        {insights.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="flex items-start gap-3 rounded-lg border border-border/60 bg-card p-2.5 transition-colors hover:bg-muted/30"
            >
              <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${item.color}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 text-xs">
                <span className="font-bold text-foreground">{item.title}</span>
                <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}

        <Button
          variant="outline"
          size="sm"
          onClick={onViewFullAnalysis}
          className="mt-1 w-full gap-1.5 text-xs font-semibold text-primary hover:bg-primary/5"
        >
          <span>View Full AI Analysis</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </CardContent>
    </Card>
  );
};
