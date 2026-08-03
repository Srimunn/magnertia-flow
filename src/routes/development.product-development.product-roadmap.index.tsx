import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/development/product-development/product-roadmap/")({
  component: () => {
    const navigate = useNavigate();
    useEffect(() => {
      navigate({ to: "/development/research-innovation/product-roadmap/new" });
    }, [navigate]);
    return null;
  },
});
