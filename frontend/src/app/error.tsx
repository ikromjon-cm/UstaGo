"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-danger">500</h1>
        <p className="text-2xl font-semibold mt-4">Something went wrong</p>
        <p className="text-gray-500 mt-2">An unexpected error occurred. Please try again.</p>
        <button onClick={reset} className="btn-primary inline-block mt-8 px-8 py-3 rounded-[12px]">
          Try Again
        </button>
      </div>
    </div>
  );
}
