'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { BuyerGuard } from '@/components/auth/BuyerGuard';
import { BuyerSidebar } from '@/components/buyer/BuyerSidebar';
import { BuyerHeader } from '@/components/buyer/BuyerHeader';
import { useAuth } from '@/lib/auth/context';
import { getNotificationsForUser } from '@/lib/notifications';

export default function BuyerRootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isAuthenticated, isBuyer } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const isLoginPage = pathname === '/buyer/login';

  useEffect(() => {
    if (isAuthenticated && isBuyer && user) {
      getNotificationsForUser(user.uid)
        .then((notifs) => {
          const unread = notifs.filter((n) => !n.read).length;
          setUnreadCount(unread);
        })
        .catch(() => setUnreadCount(0));
    }
  }, [isAuthenticated, isBuyer, user, pathname]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <BuyerGuard>
      <div className="flex h-screen overflow-hidden bg-background text-foreground">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 h-full shrink-0">
          <BuyerSidebar unreadCount={unreadCount} />
        </div>

        {/* Main Workspace Area */}
        <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
          <BuyerHeader unreadCount={unreadCount} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </BuyerGuard>
  );
}
