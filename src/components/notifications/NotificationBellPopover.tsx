'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCheck,
  ArrowRight,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Package,
  FileText,
  Truck,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppNotification } from '@/types/notification';
import {
  getRecentNotificationsForHeader,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/lib/notifications';
import { Badge } from '@/components/ui/Badge';

interface NotificationBellPopoverProps {
  userId: string;
  isStaff?: boolean;
  notificationCenterUrl: string;
}

export function NotificationBellPopover({
  userId,
  isStaff = false,
  notificationCenterUrl,
}: NotificationBellPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState<AppNotification[]>([]);
  const popoverRef = useRef<HTMLDivElement>(null);

  const loadNotifData = useCallback(async () => {
    if (!userId) return;
    try {
      const [count, recents] = await Promise.all([
        getUnreadNotificationCount(userId),
        getRecentNotificationsForHeader(userId, 5),
      ]);
      setUnreadCount(count);
      setRecentNotifications(recents);
    } catch (err) {
      console.warn('Error loading header notification data:', err);
    }
  }, [userId]);

  useEffect(() => {
    loadNotifData();
    const interval = setInterval(loadNotifData, 30000); // 30s polling
    return () => clearInterval(interval);
  }, [loadNotifData]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Escape key to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id, userId);
    setRecentNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead(userId);
    setRecentNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true, read: true }))
    );
    setUnreadCount(0);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'PRODUCTION':
        return <Layers className="w-3.5 h-3.5" />;
      case 'QUALITY':
        return <ShieldCheck className="w-3.5 h-3.5" />;
      case 'SAMPLE':
        return <Package className="w-3.5 h-3.5" />;
      case 'DOCUMENT':
        return <FileText className="w-3.5 h-3.5" />;
      case 'SHIPMENT':
        return <Truck className="w-3.5 h-3.5" />;
      default:
        return <Bell className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Accessible Bell Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) loadNotifData();
        }}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={`Notifications, ${unreadCount} unread`}
        className={`relative p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 ${
          isStaff
            ? 'text-slate-400 hover:text-white hover:bg-slate-800 focus:ring-amber-400/50'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60 focus:ring-primary/50'
        }`}
      >
        <Bell className="w-5 h-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            className={`absolute top-1.5 right-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full ring-2 ${
              isStaff ? 'bg-amber-400 ring-slate-900' : 'bg-primary ring-background'
            }`}
          >
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                isStaff ? 'bg-amber-400' : 'bg-primary'
              }`}
            />
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            role="dialog"
            aria-label="Recent notifications"
            className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border shadow-2xl z-50 overflow-hidden ${
              isStaff
                ? 'bg-slate-900 border-slate-800 text-slate-100'
                : 'bg-card border-border text-card-foreground'
            }`}
          >
            {/* Popover Header */}
            <div
              className={`p-3.5 border-b flex items-center justify-between ${
                isStaff ? 'border-slate-800 bg-slate-950/60' : 'border-border bg-muted/40'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <Badge variant={isStaff ? 'amber' : 'brand'} size="sm">
                    {unreadCount} new
                  </Badge>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className={`text-[11px] font-medium flex items-center gap-1 hover:underline transition-colors ${
                    isStaff ? 'text-amber-400' : 'text-primary'
                  }`}
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            {/* Notification Preview List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-border/40">
              {recentNotifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>No notifications yet.</p>
                </div>
              ) : (
                recentNotifications.map((notif) => {
                  const isUnread = !notif.isRead && !notif.read;
                  return (
                    <div
                      key={notif.id}
                      className={`p-3 text-xs transition-colors flex items-start gap-3 ${
                        isUnread
                          ? isStaff
                            ? 'bg-slate-800/40 hover:bg-slate-800/70'
                            : 'bg-primary/5 hover:bg-primary/10'
                          : 'hover:bg-muted/30 opacity-80'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          notif.severity === 'critical'
                            ? 'bg-rose-500/20 text-rose-400'
                            : notif.severity === 'warning'
                            ? 'bg-amber-500/20 text-amber-400'
                            : isStaff
                            ? 'bg-slate-800 text-amber-400'
                            : 'bg-muted text-primary'
                        }`}
                      >
                        {notif.severity === 'critical' ? (
                          <ShieldAlert className="w-3.5 h-3.5" />
                        ) : (
                          getCategoryIcon(notif.category)
                        )}
                      </div>

                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-semibold truncate text-foreground">
                            {notif.title}
                          </span>
                          {isUnread && (
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                isStaff ? 'bg-amber-400' : 'bg-primary'
                              }`}
                            />
                          )}
                        </div>

                        <p className="text-muted-foreground line-clamp-2 leading-relaxed text-[11px]">
                          {notif.message}
                        </p>

                        <div className="flex items-center justify-between pt-1 text-[10px] text-muted-foreground/70 font-mono">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>

                          {isUnread && (
                            <button
                              type="button"
                              onClick={() => handleMarkAsRead(notif.id)}
                              className="hover:text-primary transition-colors underline"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Popover Footer */}
            <div
              className={`p-2.5 border-t text-center ${
                isStaff ? 'border-slate-800 bg-slate-950/60' : 'border-border bg-muted/40'
              }`}
            >
              <Link
                href={notificationCenterUrl}
                onClick={() => setIsOpen(false)}
                className={`text-xs font-semibold inline-flex items-center gap-1.5 hover:underline transition-colors ${
                  isStaff ? 'text-amber-400' : 'text-primary'
                }`}
              >
                <span>View Full Notification Center</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
