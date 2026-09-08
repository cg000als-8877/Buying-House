'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { BuyerGuard } from '@/components/auth/BuyerGuard';

export default function BuyerRootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/buyer/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return <BuyerGuard>{children}</BuyerGuard>;
}
