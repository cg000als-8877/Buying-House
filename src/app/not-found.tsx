import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <span className="text-xs font-mono uppercase tracking-widest text-primary font-bold">404 Error</span>
      <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Page Not Found</h2>
      <p className="text-sm text-muted-foreground max-w-md">
        The requested resource or order record does not exist or you do not have permission to view it.
      </p>
      <div className="pt-2">
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
