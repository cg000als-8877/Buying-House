'use client';

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Application Error Boundary]', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <span className="text-xs font-mono uppercase tracking-widest text-error font-bold">System Exception</span>
      <h2 className="text-2xl font-bold text-foreground">Something went wrong</h2>
      <p className="text-xs text-muted-foreground max-w-md">
        An unexpected error occurred. Please try again or contact system support.
      </p>
      <div className="pt-2">
        <button
          onClick={() => reset()}
          className="px-5 py-2 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity cursor-pointer"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
