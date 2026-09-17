'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  FileText,
  Bell,
  Building2,
  LogOut,
  ShieldCheck,
  Truck,
  BarChart3,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface BuyerSidebarProps {
  unreadCount?: number;
  className?: string;
  onNavigate?: () => void;
}

export function BuyerSidebar({
  unreadCount = 0,
  className = '',
  onNavigate,
}: BuyerSidebarProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const navItems = [
    {
      label: 'Dashboard',
      href: '/buyer/dashboard',
      icon: LayoutDashboard,
      active: pathname === '/buyer/dashboard',
    },
    {
      label: 'Purchase Orders',
      href: '/buyer/orders',
      icon: Package,
      active: pathname.startsWith('/buyer/orders'),
    },
    {
      label: 'Document Vault',
      href: '/buyer/documents',
      icon: FileText,
      active: pathname.startsWith('/buyer/documents'),
    },
    {
      label: 'Quality Assurance',
      href: '/buyer/quality',
      icon: ShieldCheck,
      active: pathname.startsWith('/buyer/quality'),
    },
    {
      label: 'Logistics & Shipments',
      href: '/buyer/shipments',
      icon: Truck,
      active: pathname.startsWith('/buyer/shipments'),
    },
    {
      label: 'Reports & Analytics',
      href: '/buyer/reports',
      icon: BarChart3,
      active: pathname.startsWith('/buyer/reports'),
    },
    {
      label: 'Notifications',
      href: '/buyer/notifications',
      icon: Bell,
      active: pathname === '/buyer/notifications',
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      label: 'Profile & Organization',
      href: '/buyer/profile',
      icon: Building2,
      active: pathname === '/buyer/profile',
    },
  ];

  return (
    <aside
      className={`flex flex-col h-full bg-card/95 border-r border-border select-none ${className}`}
    >
      {/* Brand Header */}
      <div className="p-6 border-b border-border/80">
        <Link
          href="/buyer/dashboard"
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
              Buyer Portal
            </div>
          </div>
        </Link>

        {/* Tenant Organization Pill */}
        <div className="mt-4 p-2.5 rounded-lg bg-muted/50 border border-border/60">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">Tenant Org:</span>
            <Badge variant="blue" size="sm">
              {user?.buyerOrganizationId || 'buyer-org-001'}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-muted-foreground">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span className="truncate">Isolated Tenant Workspace</span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] uppercase tracking-wider text-muted-foreground/70 font-semibold">
          Main Navigation
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
          Public Website
        </div>
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
        >
          <span>XYZ Public Portal</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </nav>

      {/* User Session Footer */}
      <div className="p-4 border-t border-border/80 bg-muted/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs">
            {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'B'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">
              {user?.displayName || user?.email || 'Authorized Buyer'}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              Role: {user?.role || 'buyer'}
            </p>
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
