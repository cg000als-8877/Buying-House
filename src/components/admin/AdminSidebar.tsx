'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Factory,
  FileCheck2,
  Users,
  MessageSquare,
  Settings,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AdminSidebarProps {
  activeSection?: string;
  onSelectSection?: (section: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Overview & Metrics', icon: LayoutDashboard },
  { id: 'orders', label: 'Order Management', icon: ShoppingBag, badge: '14 Active' },
  { id: 'production', label: 'Production Lines', icon: Factory },
  { id: 'rfq', label: 'Buyer RFQs & Inquiries', icon: MessageSquare, badge: '3 New' },
  { id: 'compliance', label: 'Audit & Certifications', icon: ShieldCheck },
  { id: 'clients', label: 'Client Accounts', icon: Users },
  { id: 'settings', label: 'System Settings', icon: Settings },
];

export function AdminSidebar({ activeSection = 'dashboard', onSelectSection }: AdminSidebarProps) {
  return (
    <aside className="w-full lg:w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between space-y-6">
      <div className="space-y-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-serif font-black text-lg">
            BH
          </div>
          <div>
            <span className="font-serif font-bold text-base text-white block leading-tight">
              ATELIER ADMIN
            </span>
            <span className="text-[10px] text-amber-400 font-mono">Merchandising Hub</span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectSection && onSelectSection(item.id)}
                className={cn(
                  'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer',
                  isActive
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={cn('w-4 h-4', isActive ? 'text-slate-950' : 'text-slate-400')} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      'text-[10px] px-2 py-0.5 rounded-full font-bold',
                      isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-amber-400'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Return to website */}
      <div className="pt-4 border-t border-slate-800">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit to Main Website</span>
        </Link>
      </div>
    </aside>
  );
}
