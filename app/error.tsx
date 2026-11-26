"use client";

import { useEffect } from "react";
import { ServiceUnavailable } from "@/components/service-unavailable";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error boundary caught:", error);
  }, [error]);

  return (
    <ServiceUnavailable
      title="Oops! Something Went Wrong"
      message="We ran into a temporary system issue while loading this page. Our database or server might be restarting — please try again in a moment."
      onRetry={reset}
    />
  );
}
