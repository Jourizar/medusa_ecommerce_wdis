"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isNetworkError =
    error.message.includes("fetch failed") ||
    error.message.includes("ECONNREFUSED");

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="bg-cream border-[4px] border-black shadow-[6px_6px_0_0_#000] p-8 md:p-12 text-center max-w-lg">
        <p className="text-brutal text-3xl md:text-4xl text-black">
          SOMETHING BROKE.
        </p>
        <p className="text-sm font-bold uppercase tracking-wider text-muted mt-4">
          {isNetworkError
            ? "We couldn't reach the store server. Please try again in a moment."
            : "An unexpected error occurred. Please try again."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex items-center text-xs font-black uppercase tracking-widest border-[3px] border-black bg-hotpink text-black px-4 py-2 hover:bg-accent transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
