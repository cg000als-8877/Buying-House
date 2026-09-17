'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth/context';
import { BuyerSidebar } from './BuyerSidebar';
import { NotificationBellPopover } from '@/components/notifications/NotificationBellPopover';

interface BuyerHeaderProps {
  unreadCount?: number;
}

export function BuyerHeader({ unreadCount = 0 }: BuyerHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile Menu Toggle & Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="font-sans font-bold text-base text-foreground lg:hidden">
              XYZ Buying House
            </span>
            <span className="hidden sm:inline-block text-xs font-medium text-muted-foreground">
              Secure Buyer Portal
            </span>
          </div>
        </div>

        {/* Right Actions: Tenant Org Pill, Notifications, User Profile */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-muted/60 border border-border text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-muted-foreground">Tenant:</span>
            <span className="font-medium font-bold text-foreground">
              {user?.buyerOrganizationId || 'buyer-org-001'}
            </span>
          </div>

          {/* Notifications Popover */}
          <NotificationBellPopover
            userId={user?.uid || 'buyer-001'}
            isStaff={false}
            notificationCenterUrl="/buyer/notifications"
          />

          {/* Profile Quick Pill */}
          <Link
            href="/buyer/profile"
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/60 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'B'}
            </div>
            <span className="hidden md:inline-block text-xs font-medium text-foreground max-w-[120px] truncate">
              {user?.displayName || user?.email?.split('@')[0] || 'Buyer'}
            </span>
          </Link>
        </div>
      </header>

      {/* Mobile Drawer (Framer Motion) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />

            {/* Slide-over Drawer */}
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

              <BuyerSidebar
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
