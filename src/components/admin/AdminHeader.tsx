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
      <header className="sticky top-0 z-30 h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile menu toggle & title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Open operations menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-base text-white lg:hidden">
              XYZ Operations
            </span>
            <span className="hidden sm:inline-block text-xs font-mono text-slate-400">
              Internal Control Center
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Clearance:</span>
            <Badge variant="amber" size="sm">
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
          <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <div className="w-7 h-7 rounded-full bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400 font-bold text-xs">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'A'}
            </div>
            <span className="hidden md:inline-block text-xs font-medium text-slate-200 max-w-[130px] truncate">
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
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-slate-900 shadow-2xl lg:hidden flex flex-col"
            >
              <div className="absolute top-4 right-4 z-10">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <AdminSidebar
                unreadCount={unreadCount}
                onNavigate={() => setMobileMenuOpen(false)}
                className="h-full border-none"
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
