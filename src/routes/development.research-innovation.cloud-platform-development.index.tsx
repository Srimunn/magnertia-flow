import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute(
  "/development/research-innovation/cloud-platform-development/",
)({
  component: CloudPlatformDevelopmentIndexPage,
});

function CloudPlatformDevelopmentIndexPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/development/research-innovation/cloud-platform-development/new" as any });
  }, [navigate]);

  return (
    <div className="p-8 text-center text-muted-foreground">
      Redirecting to Cloud Platform Development Form...
    </div>
  );
}
