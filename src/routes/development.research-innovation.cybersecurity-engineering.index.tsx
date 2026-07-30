import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute(
  "/development/research-innovation/cybersecurity-engineering/",
)({
  component: CybersecurityEngineeringIndexPage,
});

function CybersecurityEngineeringIndexPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/development/research-innovation/cybersecurity-engineering/new" as any });
  }, [navigate]);

  return (
    <div className="p-8 text-center text-muted-foreground">
      Redirecting to Cybersecurity Engineering Form...
    </div>
  );
}
