"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-6 text-center font-sans antialiased">
        <div className="w-full max-w-md rounded-3xl bg-white shadow-xl border border-purple-100 p-8 space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 text-2xl">
            ⚠️
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-purple-800">
              Service Temporarily Unavailable
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed">
              We&apos;re having trouble reaching our servers right now. Please try again in a few moments.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={reset}
              className="w-full sm:w-auto rounded-full bg-purple-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
            <a
              href="/"
              className="w-full sm:w-auto rounded-full border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Back to Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
