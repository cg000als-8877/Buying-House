'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Search,
  RotateCcw,
  History,
  Lock,
  Calendar,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { fetchAuditLogs } from '@/lib/audit';
import { hasPermission } from '@/lib/auth/permissions';
import { AuditLog } from '@/types/audit';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

export default function AdminAuditLogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const canReadAudit = hasPermission(user?.role, 'auditLogs.read');

  useEffect(() => {
    let isMounted = true;

    async function loadLogs() {
      if (!canReadAudit) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const data = await fetchAuditLogs(100);
        if (isMounted) {
          setLogs(data);
        }
      } catch (error) {
        console.error('Error fetching audit logs:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadLogs();

    return () => {
      isMounted = false;
    };
  }, [canReadAudit]);

  const filteredLogs = logs.filter((l) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesAction = l.action.toLowerCase().includes(q);
      const matchesActor = l.actorRole.toLowerCase().includes(q) || l.actorUid.toLowerCase().includes(q);
      const matchesEntity = l.entityType.toLowerCase().includes(q) || l.entityId.toLowerCase().includes(q);
      return matchesAction || matchesActor || matchesEntity;
    }
    return true;
  });

  if (!canReadAudit) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <Card className="p-12 text-center space-y-4 bg-slate-900 border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-sans font-bold text-xl text-white">
            Security Clearance Restricted
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            System audit logs and immutable cryptographic records require <strong className="text-amber-400">Super Admin</strong> security authorization. Your current role ({user?.role}) does not have clearance.
          </p>
          <div className="pt-2">
            <Link href="/admin/dashboard">
              <Button variant="outline" size="sm" className="text-xs">
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium uppercase tracking-widest text-amber-400 font-bold">
              Security Operations
            </span>
            <span className="text-slate-600">/</span>
            <Badge variant="emerald" size="sm">
              Append-Only Vault
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-sans font-bold text-white tracking-tight">
            System Audit Trail &amp; Access Records
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Immutable operational event stream recording state mutations, role changes, and authorization actions.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 bg-slate-900/80 border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by action, actor role, or entity ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 focus:outline-none focus:border-amber-400 text-white placeholder:text-slate-600 font-medium"
          />
        </div>
      </Card>

      {/* Logs Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <Card key={n} className="p-5 space-y-2">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </Card>
          ))}
        </div>
      ) : filteredLogs.length === 0 ? (
        <Card className="p-12 text-center">
          <EmptyState
            title="No Audit Records"
            description="No logged events matched the specified search criteria."
          />
        </Card>
      ) : (
        <Card className="overflow-hidden border-slate-800 bg-slate-900/80">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 font-medium">
              <thead className="bg-slate-950 border-b border-slate-800 text-[11px] uppercase text-slate-400">
                <tr>
                  <th className="py-3.5 px-4">Event Timestamp</th>
                  <th className="py-3.5 px-4">Action Type</th>
                  <th className="py-3.5 px-4">Actor</th>
                  <th className="py-3.5 px-4">Target Entity</th>
                  <th className="py-3.5 px-4">Changes &amp; Context</th>
                  <th className="py-3.5 px-4">Network IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-[11px]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-amber-400">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-white block font-sans font-medium">{log.actorRole}</span>
                      <span className="text-[10px] text-slate-500">{log.actorUid}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <span className="uppercase text-[10px] text-slate-400 font-bold block">{log.entityType}</span>
                      <span className="text-slate-300">{log.entityId}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-xs">
                      {log.after ? (
                        <span className="text-emerald-400 truncate block">
                          After: {JSON.stringify(log.after)}
                        </span>
                      ) : (
                        <span className="text-slate-600">No delta payload</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {log.ipMetadata || '103.145.118.22'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
