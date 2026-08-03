import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/development/product-development/prd/")({
  component: () => {
    const navigate = useNavigate();
    useEffect(() => {
      navigate({ to: "/development/research-innovation/prd/new" });
    }, [navigate]);
    return null;
  },
});
