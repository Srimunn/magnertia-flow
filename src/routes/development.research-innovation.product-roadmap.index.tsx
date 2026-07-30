import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute(
  "/development/research-innovation/product-roadmap/",
)({
  component: ProductRoadmapIndexPage,
});

function ProductRoadmapIndexPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/development/research-innovation/product-roadmap/new" });
  }, [navigate]);

  return (
    <div className="p-8 text-center text-muted-foreground">
      Redirecting to Product Roadmap Form...
    </div>
  );
}
