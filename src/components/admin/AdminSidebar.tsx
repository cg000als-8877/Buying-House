'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Package,
  Factory,
  Users,
  FileText,
  Bell,
  ShieldCheck,
  Truck,
  BarChart3,
  Settings,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface AdminSidebarProps {
  unreadCount?: number;
  className?: string;
  onNavigate?: () => void;
}

export function AdminSidebar({
  unreadCount = 0,
  className = '',
  onNavigate,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const navItems = [
    {
      label: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      active: pathname === '/admin/dashboard',
    },
    {
      label: 'Buyer Organizations',
      href: '/admin/buyers',
      icon: Building2,
      active: pathname.startsWith('/admin/buyers'),
    },
    {
      label: 'Purchase Orders',
      href: '/admin/orders',
      icon: Package,
      active: pathname.startsWith('/admin/orders'),
    },
    {
      label: 'Partner Factories',
      href: '/admin/factories',
      icon: Factory,
      active: pathname.startsWith('/admin/factories'),
    },
    {
      label: 'Document Vault',
      href: '/admin/documents',
      icon: FileText,
      active: pathname.startsWith('/admin/documents'),
    },
    {
      label: 'Quality Assurance',
      href: '/admin/quality',
      icon: ShieldCheck,
      active: pathname.startsWith('/admin/quality'),
    },
    {
      label: 'Logistics & Shipments',
      href: '/admin/shipments',
      icon: Truck,
      active: pathname.startsWith('/admin/shipments'),
    },
    {
      label: 'Reports & Analytics',
      href: '/admin/reports',
      icon: BarChart3,
      active: pathname.startsWith('/admin/reports'),
    },
    {
      label: 'User Management',
      href: '/admin/users',
      icon: Users,
      active: pathname === '/admin/users',
    },
    {
      label: 'Notifications',
      href: '/admin/notifications',
      icon: Bell,
      active: pathname === '/admin/notifications',
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      label: 'System Audit Logs',
      href: '/admin/audit-logs',
      icon: ShieldCheck,
      active: pathname === '/admin/audit-logs',
    },
    {
      label: 'Platform Settings',
      href: '/admin/settings',
      icon: Settings,
      active: pathname === '/admin/settings',
    },
  ];

  return (
    <aside
      className={`flex flex-col h-full bg-card/95 border-r border-border select-none ${className}`}
    >
      {/* Brand Header */}
      <div className="p-6 border-b border-border/80">
        <Link
          href="/admin/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
            <span className="font-bold text-lg">XYZ</span>
          </div>
          <div>
            <div className="font-bold text-base text-foreground leading-tight">
              Buying House
            </div>
            <div className="text-[10px] uppercase tracking-widest text-primary font-bold">
              Operations Control
            </div>
          </div>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] uppercase tracking-wider text-muted-foreground/70 font-semibold">
          Operations Management
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                item.active
                  ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${item.active ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    item.active
                      ? 'bg-primary-foreground text-primary'
                      : 'bg-primary/20 text-primary border border-primary/30'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-6 px-3 pb-2 text-[10px] uppercase tracking-wider text-muted-foreground/70 font-semibold">
          Portals
        </div>
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
        >
          <span>Public Website</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
        <Link
          href="/buyer/dashboard"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
        >
          <span>Buyer Portal Preview</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </nav>

      {/* Staff Session Footer */}
      <div className="p-4 border-t border-border/80 bg-muted/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs">
            {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'S'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">
              {user?.displayName || user?.email || 'Operations Staff'}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge variant="warning" size="sm">
                {user?.role || 'Staff'}
              </Badge>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut()}
          className="w-full justify-center text-xs h-8 gap-2 text-muted-foreground hover:text-rose-400 hover:border-rose-800/60"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </Button>
      </div>
    </aside>
  );
}
