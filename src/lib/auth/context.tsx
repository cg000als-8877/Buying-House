'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Permission } from '@/types/auth';
import { hasPermission } from './permissions';
import { canAccessBuyerOrganization, isStaffRole, isBuyerRole } from './session';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isStaff: boolean;
  isBuyer: boolean;
  hasPermission: (permission: Permission) => boolean;
  canAccessOrg: (buyerOrgId: string) => boolean;
  loginDemoUser: (role: UserRole, buyerOrgId?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initializing auth session state
    const savedUser = typeof window !== 'undefined' ? localStorage.getItem('demo_auth_user') : null;
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  const loginDemoUser = (role: UserRole, buyerOrgId?: string) => {
    const demoUser: User = {
      uid: `usr-${Date.now()}`,
      email: `${role.toLowerCase().replace(/\s+/g, '.')}@xyzbuyinghouse.com`,
      displayName: `${role} User`,
      role,
      buyerOrganizationId: role === 'Buyer' ? buyerOrgId || 'org-nordic' : null,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    setUser(demoUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('demo_auth_user', JSON.stringify(demoUser));
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('demo_auth_user');
    }
  };

  const checkPermission = (permission: Permission) => {
    return hasPermission(user?.role, permission);
  };

  const checkOrgAccess = (buyerOrgId: string) => {
    return canAccessBuyerOrganization(user, buyerOrgId);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: Boolean(user),
        isStaff: isStaffRole(user?.role),
        isBuyer: isBuyerRole(user?.role),
        hasPermission: checkPermission,
        canAccessOrg: checkOrgAccess,
        loginDemoUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
