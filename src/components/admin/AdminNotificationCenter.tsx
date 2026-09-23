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
import { Badge, BadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

export function AdminNotificationCenter() {
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
      console.error('Error fetching admin notifications:', error);
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
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true, read: true }))
    );
    if (metrics) {
      setMetrics({
        ...metrics,
        unreadCount: 0,
        unreadByCategory: {
          ORDER: 0,
          PRODUCTION: 0,
          SAMPLE: 0,
          DOCUMENT: 0,
          QUALITY: 0,
          SHIPMENT: 0,
          SYSTEM: 0,
        },
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

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'ORDER':
        return <Package className="w-5 h-5" />;
      case 'PRODUCTION':
        return <Layers className="w-5 h-5" />;
      case 'SAMPLE':
        return <FileText className="w-5 h-5" />;
      case 'DOCUMENT':
        return <FileText className="w-5 h-5" />;
      case 'QUALITY':
        return <ShieldCheck className="w-5 h-5" />;
      case 'SHIPMENT':
        return <Truck className="w-5 h-5" />;
      case 'SYSTEM':
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getCategoryBadgeVariant = (category: NotificationCategory): BadgeVariant => {
    switch (category) {
      case 'ORDER':
        return 'primary';
      case 'PRODUCTION':
        return 'brand';
      case 'QUALITY':
        return 'success';
      case 'SHIPMENT':
        return 'info';
      case 'SAMPLE':
      case 'DOCUMENT':
        return 'secondary';
      case 'SYSTEM':
      default:
        return 'warning';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-label text-accent">
              Operations Telemetry
            </span>
            {metrics && metrics.unreadCount > 0 && (
              <Badge variant="warning" size="sm">
                {metrics.unreadCount} Unread
              </Badge>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-sans font-bold text-foreground">
            Staff Alerts &amp; System Dispatches
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time manufacturing variance, QA inspection audits, commercial documents, and logistics telemetry.
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
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="gap-1.5 text-xs text-accent"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All Read</span>
            </Button>
          )}
        </div>
      </div>

      {/* Category Pills & Toolbar */}
      <div className="flex flex-col gap-4">
        {/* Category tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {(
            [
              { id: 'ALL', label: 'All Telemetry' },
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
                  ? 'bg-primary text-primary-foreground font-semibold shadow-subtle'
                  : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {cat.label}
              {cat.id !== 'ALL' && metrics?.unreadByCategory[cat.id] ? (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-md bg-accent/20 text-accent font-bold text-[10px]">
                  {metrics.unreadByCategory[cat.id]}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border shadow-subtle">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by PO, issue description, or milestone..."
              className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setUnreadOnly(!unreadOnly)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                unreadOnly
                  ? 'bg-accent/15 border-accent/40 text-accent font-semibold'
                  : 'bg-background border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              Unread Only
            </button>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as NotificationSeverity | 'ALL')}
              className="bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none"
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
              <Card key={n} className="p-5 space-y-2 bg-card border-border">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
              </Card>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <Card className="p-12 text-center bg-card border-border">
            <EmptyState
              title={unreadOnly ? 'No Unread Operational Alerts' : 'No Alerts Found'}
              description={
                unreadOnly
                  ? 'All operational alerts have been acknowledged.'
                  : 'There are no active alerts matching your current filter criteria.'
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
                    ? 'bg-card border-accent/40 shadow-subtle'
                    : 'bg-card/70 border-border opacity-90'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
                        notif.severity === 'critical'
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                          : notif.severity === 'warning'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                          : 'bg-secondary border-border text-accent'
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

                      <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed">
                        {notif.message}
                      </p>

                      <div className="flex items-center gap-3 pt-1 text-[11px] text-muted-foreground font-medium">
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
                          <span className="bg-secondary px-1.5 py-0.5 rounded text-[10px] text-muted-foreground border border-border">
                            {notif.orderId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                    {notif.actionUrl ? (
                      <Link href={notif.actionUrl}>
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8 text-accent">
                          <span>Inspect</span>
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    ) : notif.relatedOrderId ? (
                      <Link href={`/admin/orders/${notif.relatedOrderId}`}>
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8 text-accent">
                          <span>View PO</span>
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    ) : null}

                    {isUnread && (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="text-[11px] text-muted-foreground hover:text-accent transition-colors underline"
                      >
                        Mark read
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
                  Staff Dispatch Preferences
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Configure real-time delivery channels and alert triggers.
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
                <span className="text-label text-accent">
                  Delivery Channels
                </span>
                <label className="flex items-center justify-between p-2.5 rounded-lg bg-background border border-border cursor-pointer">
                  <span className="text-xs font-medium text-foreground">In-App Operations Dashboard</span>
                  <input
                    type="checkbox"
                    checked={prefsForm.inAppEnabled ?? true}
                    onChange={(e) => setPrefsForm({ ...prefsForm, inAppEnabled: e.target.checked })}
                    className="rounded border-border text-accent focus:ring-ring h-4 w-4"
                  />
                </label>
                <label className="flex items-center justify-between p-2.5 rounded-lg bg-background border border-border cursor-pointer">
                  <span className="text-xs font-medium text-foreground">Email Dispatches</span>
                  <input
                    type="checkbox"
                    checked={prefsForm.emailEnabled ?? true}
                    onChange={(e) => setPrefsForm({ ...prefsForm, emailEnabled: e.target.checked })}
                    className="rounded border-border text-accent focus:ring-ring h-4 w-4"
                  />
                </label>
              </div>

              {/* Category subscriptions */}
              <div className="space-y-2">
                <span className="text-label text-accent">
                  Operational Trigger Subscriptions
                </span>
                {(
                  [
                    { key: 'orderUpdates', label: 'Order PO Life-Cycle Events' },
                    { key: 'productionUpdates', label: 'Floor Milestones & Variance Alerts' },
                    { key: 'sampleUpdates', label: 'Sample Approvals & Buyer Decisions' },
                    { key: 'documentUpdates', label: 'Commercial Document Reviews & Vault' },
                    { key: 'qualityUpdates', label: 'AQL Inspections, CAPs & Lab Certs' },
                    { key: 'shipmentUpdates', label: 'Logistics Bookings & Dispatches' },
                    { key: 'systemAlerts', label: 'System Clearance & Security Alerts' },
                  ] as const
                ).map((cat) => (
                  <label
                    key={cat.key}
                    className="flex items-center justify-between p-2 rounded-lg bg-background border border-border hover:bg-muted/40 cursor-pointer"
                  >
                    <span className="text-xs text-foreground-secondary">{cat.label}</span>
                    <input
                      type="checkbox"
                      checked={(prefsForm as Record<string, boolean | undefined>)[cat.key] ?? true}
                      onChange={(e) =>
                        setPrefsForm({ ...prefsForm, [cat.key]: e.target.checked })
                      }
                      className="rounded border-border text-accent focus:ring-ring h-4 w-4"
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
                variant="gold"
                size="sm"
                onClick={handleSavePreferences}
                disabled={savingPrefs}
                className="text-xs gap-1.5 uppercase tracking-wider"
              >
                <Check className="w-4 h-4" />
                <span>{savingPrefs ? 'Saving...' : 'Save Configuration'}</span>
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
