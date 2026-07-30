import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute(
  "/development/research-innovation/embedded-systems-development/",
)({
  component: EmbeddedDevelopmentIndexPage,
});

function EmbeddedDevelopmentIndexPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/development/research-innovation/embedded-systems-development/new" as any });
  }, [navigate]);

  return (
    <div className="p-8 text-center text-muted-foreground">
      Redirecting to Embedded Systems Development Form...
    </div>
  );
}
