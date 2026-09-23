'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Search,
  UserPlus,
  RotateCcw,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import {
  getAllUsers,
  updateUserStatus,
  updateUserRole,
  updateUserBuyerOrg,
  inviteUser,
} from '@/lib/users';
import { getBuyerOrganizations } from '@/lib/buyers';
import { User, UserRole, UserStatus } from '@/types/auth';
import { BuyerOrganization } from '@/types/buyer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

const SYSTEM_ROLES: UserRole[] = [
  'Super Admin',
  'Admin',
  'Operations Manager',
  'Merchandiser',
  'Production Staff',
  'QC Staff',
  'Buyer',
];

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [buyerOrgs, setBuyerOrgs] = useState<BuyerOrganization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteData, setInviteData] = useState({
    displayName: '',
    email: '',
    role: 'Merchandiser' as UserRole,
    buyerOrganizationId: '',
  });
  const [modalError, setModalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Action feedback
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      try {
        const [usersData, orgsData] = await Promise.all([
          getAllUsers(),
          getBuyerOrganizations(),
        ]);

        if (isMounted) {
          setUsers(usersData);
          setBuyerOrgs(orgsData);
        }
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
      if (statusFilter !== 'ALL' && u.status !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = u.displayName.toLowerCase().includes(q);
        const matchesEmail = u.email.toLowerCase().includes(q);
        const matchesOrg = u.buyerOrganizationId ? u.buyerOrganizationId.toLowerCase().includes(q) : false;
        return matchesName || matchesEmail || matchesOrg;
      }
      return true;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const handleStatusUpdate = async (targetUid: string, newStatus: UserStatus) => {
    if (!currentUser) return;
    if (targetUid === currentUser.uid && (newStatus === 'suspended' || newStatus === 'disabled')) {
      setActionNotice('Security Policy: You cannot suspend or disable your own active user account.');
      return;
    }

    try {
      const updated = await updateUserStatus(targetUid, newStatus, {
        uid: currentUser.uid,
        role: currentUser.role,
      });
      if (updated) {
        setUsers((prev) => prev.map((u) => (u.uid === targetUid ? updated : u)));
        setActionNotice(`User status updated to ${newStatus}.`);
        setTimeout(() => setActionNotice(null), 4000);
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      setActionNotice(err.message || 'Error updating status.');
    }
  };

  const handleRoleUpdate = async (targetUid: string, newRole: UserRole) => {
    if (!currentUser) return;
    if (targetUid === currentUser.uid) {
      setActionNotice('Security Policy: Self-role modification is strictly prohibited.');
      return;
    }

    try {
      const updated = await updateUserRole(targetUid, newRole, {
        uid: currentUser.uid,
        role: currentUser.role,
      });
      if (updated) {
        setUsers((prev) => prev.map((u) => (u.uid === targetUid ? updated : u)));
        setActionNotice(`User role updated to ${newRole}.`);
        setTimeout(() => setActionNotice(null), 4000);
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      setActionNotice(err.message || 'Error updating role.');
    }
  };

  const handleOrgAssignment = async (targetUid: string, newOrgId: string) => {
    if (!currentUser) return;

    try {
      const updated = await updateUserBuyerOrg(targetUid, newOrgId || null, {
        uid: currentUser.uid,
        role: currentUser.role,
      });
      if (updated) {
        setUsers((prev) => prev.map((u) => (u.uid === targetUid ? updated : u)));
        setActionNotice(`Organization tenant assigned.`);
        setTimeout(() => setActionNotice(null), 4000);
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      setActionNotice(err.message || 'Error updating organization assignment.');
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteData.displayName.trim() || !inviteData.email.trim()) {
      setModalError('Name and email are required.');
      return;
    }

    if (!currentUser) return;
    setIsSubmitting(true);
    setModalError('');

    try {
      const invited = await inviteUser(
        {
          displayName: inviteData.displayName.trim(),
          email: inviteData.email.trim(),
          role: inviteData.role,
          buyerOrganizationId: inviteData.role === 'Buyer' ? inviteData.buyerOrganizationId : null,
        },
        { uid: currentUser.uid, role: currentUser.role }
      );

      setUsers((prev) => [invited, ...prev]);
      setIsInviteModalOpen(false);
      setInviteData({
        displayName: '',
        email: '',
        role: 'Merchandiser',
        buyerOrganizationId: '',
      });
      setActionNotice(`Invitation dispatched for ${invited.email}.`);
      setTimeout(() => setActionNotice(null), 4000);
    } catch (error: unknown) {
      const err = error as { message?: string };
      setModalError(err.message || 'Failed to invite user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium uppercase tracking-widest text-amber-400 font-bold">
              Access Control &amp; RBAC
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-medium text-slate-400">{users.length} Users</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-sans font-bold text-white tracking-tight">
            User Directory &amp; Role Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Staff clearance assignments, buyer organization linking, and administrative account controls.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsInviteModalOpen(true)}
          className="gap-2 shrink-0 text-xs"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Invite / Provision User</span>
        </Button>
      </div>

      {/* Action Notification Banner */}
      {actionNotice && (
        <div className="p-3 rounded-lg bg-amber-950/60 border border-amber-800/80 text-amber-300 text-xs flex items-center justify-between">
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="text-amber-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card className="p-4 sm:p-5 bg-slate-900/80 border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, or org..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 focus:outline-none focus:border-amber-400 text-white placeholder:text-slate-600"
            />
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 focus:outline-none focus:border-amber-400 text-white"
            >
              <option value="ALL">All System Roles</option>
              {SYSTEM_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 focus:outline-none focus:border-amber-400 text-white"
            >
              <option value="ALL">All Account Statuses</option>
              <option value="active">Active Accounts</option>
              <option value="invited">Invited (Pending First Login)</option>
              <option value="suspended">Suspended</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        </div>

        {(searchQuery || roleFilter !== 'ALL' || statusFilter !== 'ALL') && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
            <span className="text-slate-400">
              Showing <strong className="text-white font-medium">{filteredUsers.length}</strong> of {users.length} users
            </span>
            <button
              onClick={() => {
                setSearchQuery('');
                setRoleFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="flex items-center gap-1 text-amber-400 hover:underline text-xs"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </Card>

      {/* Users Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <Card key={n} className="p-6 space-y-3">
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-3 w-1/2" />
            </Card>
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card className="p-12 text-center">
          <EmptyState
            title="No Users Found"
            description="No user records match your search or filter parameters."
          />
        </Card>
      ) : (
        <Card className="overflow-hidden border-slate-800 bg-slate-900/80">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 border-b border-slate-800 text-[11px] uppercase font-medium text-slate-400">
                <tr>
                  <th className="py-3.5 px-4">User Details</th>
                  <th className="py-3.5 px-4">System Role</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4">Tenant / Org</th>
                  <th className="py-3.5 px-4">Last Activity</th>
                  <th className="py-3.5 px-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.map((u) => {
                  const isSelf = currentUser?.uid === u.uid;

                  return (
                    <tr key={u.uid} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-amber-400 text-xs">
                            {u.displayName ? u.displayName.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <span className="font-semibold text-white block">
                              {u.displayName}
                              {isSelf && (
                                <span className="ml-1.5 text-[10px] font-medium text-amber-400 font-normal">
                                  (You)
                                </span>
                              )}
                            </span>
                            <span className="text-[11px] font-medium text-slate-400">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* System Role Selector */}
                      <td className="py-3.5 px-4">
                        {isSelf ? (
                          <Badge variant="purple" size="sm">
                            {u.role}
                          </Badge>
                        ) : (
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleUpdate(u.uid, e.target.value as UserRole)}
                            className="px-2 py-1 text-xs bg-slate-950 rounded border border-slate-700 text-white font-medium focus:outline-none focus:border-amber-400"
                          >
                            {SYSTEM_ROLES.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>

                      {/* Account Status Selector */}
                      <td className="py-3.5 px-4">
                        {isSelf ? (
                          <Badge variant="emerald" size="sm">
                            {u.status}
                          </Badge>
                        ) : (
                          <select
                            value={u.status}
                            onChange={(e) => handleStatusUpdate(u.uid, e.target.value as UserStatus)}
                            className="px-2 py-1 text-xs bg-slate-950 rounded border border-slate-700 text-white font-medium focus:outline-none focus:border-amber-400"
                          >
                            <option value="active">Active</option>
                            <option value="invited">Invited</option>
                            <option value="suspended">Suspended</option>
                            <option value="disabled">Disabled</option>
                          </select>
                        )}
                      </td>

                      {/* Buyer Organization Tenant */}
                      <td className="py-3.5 px-4">
                        {u.role === 'Buyer' ? (
                          <select
                            value={u.buyerOrganizationId || ''}
                            onChange={(e) => handleOrgAssignment(u.uid, e.target.value)}
                            className="px-2 py-1 text-xs bg-slate-950 rounded border border-slate-700 text-amber-400 font-medium focus:outline-none focus:border-amber-400 max-w-[150px]"
                          >
                            <option value="">Unassigned</option>
                            {buyerOrgs.map((org) => (
                              <option key={org.id} value={org.id}>
                                {org.name} ({org.id})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="font-medium text-slate-500 text-[11px]">
                            Internal Staff
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 font-medium text-[11px]">
                        {u.lastLoginAt ? (
                          new Date(u.lastLoginAt).toLocaleDateString()
                        ) : (
                          <span className="text-slate-600">Never</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {isSelf ? (
                          <span className="text-[11px] font-medium text-slate-600">Locked Session</span>
                        ) : (
                          <button
                            onClick={() => handleStatusUpdate(u.uid, u.status === 'active' ? 'suspended' : 'active')}
                            className="text-[11px] text-slate-400 hover:text-amber-400 underline font-medium"
                          >
                            {u.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Invite / Provision User Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl space-y-4">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-sans font-bold text-base text-white">
                    Provision / Invite User Account
                  </h3>
                  <p className="text-xs text-slate-400">Assign role clearance and tenant organization</p>
                </div>
              </div>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="p-6 pt-0 space-y-4">
              {modalError && (
                <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs">
                  {modalError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nusrat Jahan"
                  value={inviteData.displayName}
                  onChange={(e) => setInviteData({ ...inviteData, displayName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Corporate / Buyer Email Address <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={inviteData.email}
                  onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    System Role <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={inviteData.role}
                    onChange={(e) => setInviteData({ ...inviteData, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                  >
                    {SYSTEM_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                {inviteData.role === 'Buyer' ? (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Buyer Organization <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={inviteData.buyerOrganizationId}
                      onChange={(e) => setInviteData({ ...inviteData, buyerOrganizationId: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-amber-400 focus:outline-none focus:border-amber-400 font-medium"
                    >
                      <option value="">Select Tenant Organization</option>
                      {buyerOrgs.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">
                      Organization Scope
                    </label>
                    <div className="px-3 py-2 text-xs bg-slate-950/60 rounded-lg border border-slate-800/80 text-slate-500 font-medium">
                      Internal HQ Hub
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsInviteModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Dispatching...' : 'Provision User Account'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
