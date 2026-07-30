import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute(
  "/development/research-innovation/mobile-app-development/",
)({
  component: MobileDevelopmentIndexPage,
});

function MobileDevelopmentIndexPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/development/research-innovation/mobile-app-development/new" as any });
  }, [navigate]);

  return (
    <div className="p-8 text-center text-muted-foreground">
      Redirecting to Mobile App Development Form...
    </div>
  );
}
