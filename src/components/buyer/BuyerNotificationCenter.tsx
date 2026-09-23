'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Bell,
  Clock,
  FileText,
  ShieldCheck,
  Package,
  ArrowRight,
  CheckCheck,
  Search,
  Truck,
  Layers,
  ShieldAlert,
  Settings,
  X,
  Check,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import {
  getNotificationsForUser,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getNotificationPreferences,
  updateNotificationPreferences,
  getNotificationMetrics,
} from '@/lib/notifications';
import {
  AppNotification,
  NotificationCategory,
  NotificationSeverity,
  NotificationSummaryMetrics,
} from '@/types/notification';
import { NotificationPreferences } from '@/types/notificationPreferences';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

export function BuyerNotificationCenter() {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [metrics, setMetrics] = useState<NotificationSummaryMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<NotificationCategory | 'ALL'>('ALL');
  const [severityFilter, setSeverityFilter] = useState<NotificationSeverity | 'ALL'>('ALL');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Preference modal
  const [prefsModalOpen, setPrefsModalOpen] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsForm, setPrefsForm] = useState<Partial<NotificationPreferences>>({});

  const loadData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [notifsData, metricsData, prefsData] = await Promise.all([
        getNotificationsForUser(user.uid, {
          category: categoryFilter,
          severity: severityFilter,
          unreadOnly,
          search: searchQuery,
        }),
        getNotificationMetrics(user.uid),
        getNotificationPreferences(user.uid, user.role),
      ]);
      setNotifications(notifsData);
      setMetrics(metricsData);
      setPrefsForm(prefsData);
    } catch (error) {
      console.error('Error fetching buyer notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, categoryFilter, severityFilter, unreadOnly, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id, user?.uid);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true, read: true } : n))
    );
    if (metrics) {
      setMetrics({
        ...metrics,
        unreadCount: Math.max(0, metrics.unreadCount - 1),
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    await markAllNotificationsAsRead(user.uid);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, read: true })));
    if (metrics) {
      setMetrics({
        ...metrics,
        unreadCount: 0,
      });
    }
  };

  const handleSavePreferences = async () => {
    if (!user) return;
    setSavingPrefs(true);
    try {
      await updateNotificationPreferences(user.uid, prefsForm);
      setPrefsModalOpen(false);
    } catch (err) {
      console.error('Error saving notification preferences:', err);
    } finally {
      setSavingPrefs(false);
    }
  };

  const getCategoryBadgeVariant = (category: NotificationCategory) => {
    switch (category) {
      case 'PRODUCTION':
        return 'amber';
      case 'QUALITY':
        return 'emerald';
      case 'SAMPLE':
        return 'purple';
      case 'DOCUMENT':
        return 'teal';
      case 'SHIPMENT':
        return 'blue';
      case 'ORDER':
        return 'brand';
      default:
        return 'slate';
    }
  };

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'PRODUCTION':
        return <Layers className="w-4 h-4" />;
      case 'QUALITY':
        return <ShieldCheck className="w-4 h-4" />;
      case 'SAMPLE':
        return <Package className="w-4 h-4" />;
      case 'DOCUMENT':
        return <FileText className="w-4 h-4" />;
      case 'SHIPMENT':
        return <Truck className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header & Metric Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium uppercase tracking-widest text-primary font-bold">
              Activity &amp; Approvals
            </span>
            {metrics && metrics.unreadCount > 0 && (
              <Badge variant="amber" size="sm">
                {metrics.unreadCount} Unread
              </Badge>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-sans font-bold text-foreground">
            Notifications &amp; Alerts
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Stay updated with real-time floor telemetry, sample reviews, quality certificates, and consignments.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPrefsModalOpen(true)}
            className="gap-1.5 text-xs"
          >
            <Settings className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Preferences</span>
          </Button>

          {metrics && metrics.unreadCount > 0 && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="gap-1.5 text-xs"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All Read</span>
            </Button>
          )}
        </div>
      </div>

      {/* Category Pills & Filters Bar */}
      <div className="flex flex-col gap-4">
        {/* Category tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {(
            [
              { id: 'ALL', label: 'All Activities' },
              { id: 'ORDER', label: 'Orders' },
              { id: 'PRODUCTION', label: 'Production' },
              { id: 'SAMPLE', label: 'Samples' },
              { id: 'DOCUMENT', label: 'Documents' },
              { id: 'QUALITY', label: 'Quality' },
              { id: 'SHIPMENT', label: 'Shipments' },
            ] as const
          ).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
                categoryFilter === cat.id
                  ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                  : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {cat.label}
              {cat.id !== 'ALL' && metrics?.unreadByCategory[cat.id] ? (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[10px]">
                  {metrics.unreadByCategory[cat.id]}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Sub-toolbar: Search & Unread toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/30 p-3 rounded-xl border border-border">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications by title, order PO, or milestone..."
              className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setUnreadOnly(!unreadOnly)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                unreadOnly
                  ? 'bg-primary/10 border-primary text-primary font-bold'
                  : 'bg-card border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              Unread Only
            </button>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as NotificationSeverity | 'ALL')}
              className="bg-card border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none"
            >
              <option value="ALL">All Severities</option>
              <option value="critical">Critical Only</option>
              <option value="warning">Warnings</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <Card key={n} className="p-5 space-y-2">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
              </Card>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <Card className="p-12 text-center border-border">
            <EmptyState
              title={unreadOnly ? 'No Unread Notifications' : 'No Notifications Found'}
              description={
                unreadOnly
                  ? 'All notifications in this category have been reviewed.'
                  : 'There are no active dispatches matching your current filter criteria.'
              }
            />
          </Card>
        ) : (
          notifications.map((notif) => {
            const isUnread = !notif.isRead && !notif.read;

            return (
              <Card
                key={notif.id}
                className={`p-5 transition-all border ${
                  isUnread
                    ? 'bg-card border-primary/40 shadow-sm'
                    : 'bg-card/60 border-border/60 opacity-85'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                        notif.severity === 'critical'
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                          : notif.severity === 'warning'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          : 'bg-muted/60 border-border text-primary'
                      }`}
                    >
                      {notif.severity === 'critical' ? (
                        <ShieldAlert className="w-5 h-5" />
                      ) : (
                        getCategoryIcon(notif.category)
                      )}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={getCategoryBadgeVariant(notif.category)} size="sm">
                          {notif.category}
                        </Badge>
                        <h4 className="font-semibold text-sm sm:text-base text-foreground truncate">
                          {notif.title}
                        </h4>
                        {isUnread && (
                          <Badge variant="warning" size="sm">
                            Unread
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {notif.message}
                      </p>

                      <div className="flex items-center gap-3 pt-1 text-[11px] text-muted-foreground/80 font-medium">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {new Date(notif.createdAt).toLocaleDateString()} at{' '}
                            {new Date(notif.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        {notif.orderId && (
                          <span className="bg-muted/60 px-1.5 py-0.5 rounded text-[10px]">
                            {notif.orderId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                    {notif.actionUrl ? (
                      <Link href={notif.actionUrl}>
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                          <span>Open Item</span>
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    ) : notif.relatedOrderId ? (
                      <Link href={`/buyer/orders/${notif.relatedOrderId}`}>
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                          <span>View Order</span>
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    ) : null}

                    {isUnread && (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="text-[11px] text-muted-foreground hover:text-primary transition-colors underline"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Preferences Modal */}
      {prefsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-lg w-full p-6 space-y-6 bg-card border-border shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <h3 className="text-lg font-sans font-bold text-foreground">
                  Communication Preferences
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Customize channels and category subscription dispatches.
                </p>
              </div>
              <button
                onClick={() => setPrefsModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Channel toggles */}
              <div className="space-y-2 pb-3 border-b border-border">
                <span className="text-xs font-medium uppercase tracking-wider text-primary font-bold">
                  Notification Channels
                </span>
                <label className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border cursor-pointer">
                  <span className="text-xs font-medium text-foreground">In-App Dashboard Alerts</span>
                  <input
                    type="checkbox"
                    checked={prefsForm.inAppEnabled ?? true}
                    onChange={(e) => setPrefsForm({ ...prefsForm, inAppEnabled: e.target.checked })}
                    className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                  />
                </label>
                <label className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border cursor-pointer">
                  <span className="text-xs font-medium text-foreground">Email Notifications</span>
                  <input
                    type="checkbox"
                    checked={prefsForm.emailEnabled ?? true}
                    onChange={(e) => setPrefsForm({ ...prefsForm, emailEnabled: e.target.checked })}
                    className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                  />
                </label>
              </div>

              {/* Category subscriptions */}
              <div className="space-y-2">
                <span className="text-xs font-medium uppercase tracking-wider text-primary font-bold">
                  Category Subscriptions
                </span>
                {(
                  [
                    { key: 'orderUpdates', label: 'Order Milestones & Status Progression' },
                    { key: 'productionUpdates', label: 'Production Floor Telemetry & Line Updates' },
                    { key: 'sampleUpdates', label: 'Sample Approvals & Revisions' },
                    { key: 'documentUpdates', label: 'Certified Commercial Documents' },
                    { key: 'qualityUpdates', label: 'AQL Inspection Audits & Lab Reports' },
                    { key: 'shipmentUpdates', label: 'Logistics Consignments & Tracking' },
                  ] as const
                ).map((cat) => (
                  <label
                    key={cat.key}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/60 hover:bg-muted/40 cursor-pointer"
                  >
                    <span className="text-xs text-foreground">{cat.label}</span>
                    <input
                      type="checkbox"
                      checked={(prefsForm as Record<string, boolean | undefined>)[cat.key] ?? true}
                      onChange={(e) =>
                        setPrefsForm({ ...prefsForm, [cat.key]: e.target.checked })
                      }
                      className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPrefsModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSavePreferences}
                disabled={savingPrefs}
                className="text-xs gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{savingPrefs ? 'Saving...' : 'Save Preferences'}</span>
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
