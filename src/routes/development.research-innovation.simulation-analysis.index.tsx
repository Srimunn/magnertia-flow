import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute(
  "/development/research-innovation/simulation-analysis/",
)({
  component: SimulationAnalysisIndexPage,
});

function SimulationAnalysisIndexPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/development/research-innovation/simulation-analysis/new" as any });
  }, [navigate]);

  return (
    <div className="p-8 text-center text-muted-foreground">
      Redirecting to Simulation & Analysis Form...
    </div>
  );
}
