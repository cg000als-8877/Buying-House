'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AdminGuard } from '@/components/auth/AdminGuard';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { useAuth } from '@/lib/auth/context';
import { getNotificationsForUser } from '@/lib/notifications';

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isAuthenticated, isStaff } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isAuthenticated && isStaff && user) {
      getNotificationsForUser(user.uid)
        .then((notifs) => {
          const unread = notifs.filter((n) => !n.read).length;
          setUnreadCount(unread);
        })
        .catch(() => setUnreadCount(0));
    }
  }, [isAuthenticated, isStaff, user, pathname]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <AdminGuard>
      <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100">
        {/* Persistent Desktop Sidebar */}
        <div className="hidden lg:block w-64 h-full shrink-0">
          <AdminSidebar unreadCount={unreadCount} />
        </div>

        {/* Main Operational Workspace */}
        <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
          <AdminHeader unreadCount={unreadCount} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
