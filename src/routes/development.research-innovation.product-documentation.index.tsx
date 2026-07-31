import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute(
  "/development/research-innovation/product-documentation/",
)({
  component: ProductDocumentationIndexPage,
});

function ProductDocumentationIndexPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/development/research-innovation/product-documentation/new" as any });
  }, [navigate]);

  return (
    <div className="p-8 text-center text-muted-foreground">
      Redirecting to Product Documentation Form...
    </div>
  );
}
