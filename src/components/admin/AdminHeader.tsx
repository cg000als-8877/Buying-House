'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth/context';
import { Badge } from '@/components/ui/Badge';
import { AdminSidebar } from './AdminSidebar';
import { NotificationBellPopover } from '@/components/notifications/NotificationBellPopover';

interface AdminHeaderProps {
  unreadCount?: number;
}

export function AdminHeader({ unreadCount = 0 }: AdminHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-card/85 backdrop-blur-md border-b border-border flex items-center justify-between px-4 sm:px-6 lg:px-8 transition-colors">
        {/* Mobile menu toggle & title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            aria-label="Open operations menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="font-sans font-bold text-base text-foreground lg:hidden">
              XYZ Operations
            </span>
            <span className="hidden sm:inline-block text-xs font-medium text-muted-foreground">
              Internal Control Center
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-secondary border border-border text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-accent" />
            <span className="text-muted-foreground">Clearance:</span>
            <Badge variant="warning" size="sm">
              {user?.role || 'Staff'}
            </Badge>
          </div>

          {/* Notifications Popover */}
          <NotificationBellPopover
            userId={user?.uid || 'staff-admin-001'}
            isStaff={true}
            notificationCenterUrl="/admin/notifications"
          />

          {/* User Avatar */}
          <div className="flex items-center gap-2 p-1.5 rounded-lg bg-secondary border border-border">
            <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent font-bold text-xs">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'A'}
            </div>
            <span className="hidden md:inline-block text-xs font-medium text-foreground max-w-[130px] truncate">
              {user?.displayName || user?.email?.split('@')[0] || 'Admin'}
            </span>
          </div>
        </div>
      </header>

      {/* Mobile Drawer (Framer Motion) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-card shadow-2xl lg:hidden flex flex-col"
            >
              <div className="absolute top-4 right-4 z-10">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pt-2">
                <AdminSidebar
                  unreadCount={unreadCount}
                  onNavigate={() => setMobileMenuOpen(false)}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
