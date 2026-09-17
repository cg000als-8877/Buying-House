'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, isStaff } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          Verifying staff credentials & permissions...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  if (!isStaff) {
    return (
      <div className="max-w-md mx-auto my-20 p-6 space-y-4">
        <Alert variant="error" title="Restricted Area">
          Access restricted to authorized XYZ Buying House internal staff. Your account ({user?.role}) does not have administrative clearance.
        </Alert>
        <div className="flex justify-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.push('/buyer/dashboard')}>
            Go to Buyer Portal
          </Button>
          <Button variant="primary" size="sm" onClick={() => router.push('/admin/login')}>
            Staff Sign In
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
