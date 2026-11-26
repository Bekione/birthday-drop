"use client";

import { useRouter } from "next/navigation";
import { RefreshCw, ServerCrash, Home } from "lucide-react";
import { Logo } from "@/components/logo";

interface ServiceUnavailableProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ServiceUnavailable({
  title = "Service Temporarily Unavailable",
  message = "We're having trouble connecting to our database right now (it may be waking up from a pause). Please try again in a few moments.",
  onRetry,
}: ServiceUnavailableProps) {
  const router = useRouter();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-6">
        <Logo size="lg" />
      </div>
      <div className="w-full max-w-md rounded-3xl bg-white/95 backdrop-blur-md shadow-xl border border-purple-100 p-8 space-y-5">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 shadow-sm">
          <ServerCrash size={30} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-adlam text-purple-800">{title}</h1>
          <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleRetry}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-3 text-sm font-bold text-white shadow-md hover:scale-105 active:scale-95 transition-all"
          >
            <RefreshCw size={16} /> Try Again
          </button>
          <a
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-white border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
          >
            <Home size={16} /> Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
