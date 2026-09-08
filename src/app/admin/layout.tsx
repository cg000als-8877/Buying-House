'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AdminGuard } from '@/components/auth/AdminGuard';

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return <AdminGuard>{children}</AdminGuard>;
}
