import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/development/product-development/product-strategy/")({
  component: () => {
    const navigate = useNavigate();
    useEffect(() => {
      navigate({ to: "/development/research-innovation/product-strategy/overview" });
    }, [navigate]);
    return null;
  },
});
