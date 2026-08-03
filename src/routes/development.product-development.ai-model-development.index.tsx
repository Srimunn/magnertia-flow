import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/development/product-development/ai-model-development/")({
  component: () => {
    const navigate = useNavigate();
    useEffect(() => { navigate({ to: "/development/research-innovation/ai-model-development/new" }); }, [navigate]);
    return null;
  },
});
