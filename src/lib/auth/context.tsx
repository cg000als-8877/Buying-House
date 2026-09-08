'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { User, UserRole, Permission } from '@/types/auth';
import { auth, isConfigured } from '@/lib/firebase/client';
import {
  signIn as firebaseSignIn,
  signOutUser as firebaseSignOut,
  getFirestoreUserProfile,
  requestPasswordReset,
} from '@/lib/firebase/auth';
import { logSecurityEvent } from '@/lib/audit';
import { hasPermission } from './permissions';
import { canAccessBuyerOrganization, isStaffRole, isBuyerRole, isAccountActive } from './session';

export interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isStaff: boolean;
  isBuyer: boolean;
  role: UserRole | null;
  buyerOrganizationId: string | null;
  hasPermission: (permission: Permission) => boolean;
  canAccessOrg: (buyerOrgId: string) => boolean;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; message: string; error?: string }>;
  devLogin: (role: UserRole, buyerOrgId?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEV_STORAGE_KEY = 'xyz_auth_dev_session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync with Firebase Auth state
  useEffect(() => {
    if (auth && isConfigured) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        setFirebaseUser(fbUser);
        if (fbUser) {
          const profile = await getFirestoreUserProfile(fbUser.uid);
          if (profile) {
            // Check if account is active
            if (!isAccountActive(profile)) {
              await firebaseSignOut();
              setUser(null);
              setFirebaseUser(null);
              setIsLoading(false);
              return;
            }
            setUser(profile);
          } else {
            // Fallback user profile if Firestore document does not exist yet
            setUser({
              uid: fbUser.uid,
              email: fbUser.email || '',
              displayName: fbUser.displayName || 'Authorized User',
              role: 'Buyer', // Default client role pending administrative assignment
              buyerOrganizationId: null,
              status: 'active',
              photoURL: fbUser.photoURL || null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
            });
          }
        } else {
          setUser(null);
        }
        setIsLoading(false);
      });

      return () => unsubscribe();
    } else {
      // Offline / Development fallback session
      if (typeof window !== 'undefined') {
        const savedDevUser = localStorage.getItem(DEV_STORAGE_KEY);
        if (savedDevUser) {
          try {
            const parsed = JSON.parse(savedDevUser);
            if (isAccountActive(parsed)) {
              setUser(parsed);
            } else {
              localStorage.removeItem(DEV_STORAGE_KEY);
            }
          } catch {
            localStorage.removeItem(DEV_STORAGE_KEY);
          }
        }
      }
      setIsLoading(false);
    }
  }, []);

  const signIn = useCallback(
    async (email: string, pass: string): Promise<{ success: boolean; user?: User; error?: string }> => {
      setIsLoading(true);

      // Real Firebase authentication
      if (auth && isConfigured) {
        const { user: fbUser, error } = await firebaseSignIn(email, pass);
        if (error || !fbUser) {
          setIsLoading(false);
          await logSecurityEvent({
            actorUid: 'anonymous',
            actorRole: 'ANONYMOUS',
            action: 'AUTH_LOGIN_FAILED',
            entityId: email,
            before: null,
            after: { reason: error },
          });
          return { success: false, error: error || 'Authentication failed' };
        }

        const profile = await getFirestoreUserProfile(fbUser.uid);
        if (profile && !isAccountActive(profile)) {
          await firebaseSignOut();
          setIsLoading(false);
          return {
            success: false,
            error: 'This account has been deactivated or suspended. Please contact your XYZ representative.',
          };
        }

        const resolvedUser: User = profile || {
          uid: fbUser.uid,
          email: fbUser.email || email,
          displayName: fbUser.displayName || 'Authorized User',
          role: 'Buyer',
          buyerOrganizationId: null,
          status: 'active',
          photoURL: fbUser.photoURL || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };

        setUser(resolvedUser);
        setFirebaseUser(fbUser);
        setIsLoading(false);

        await logSecurityEvent({
          actorUid: resolvedUser.uid,
          actorRole: resolvedUser.role,
          action: 'AUTH_LOGIN_SUCCESS',
          entityId: resolvedUser.uid,
        });

        return { success: true, user: resolvedUser };
      }

      // Offline / Development fallback sign-in
      setIsLoading(false);
      return {
        success: false,
        error: 'Firebase credentials are not configured in .env.local. Please use the development role switch below or configure Firebase keys.',
      };
    },
    []
  );

  const signOut = useCallback(async () => {
    setIsLoading(true);
    if (user) {
      await logSecurityEvent({
        actorUid: user.uid,
        actorRole: user.role,
        action: 'AUTH_LOGOUT',
        entityId: user.uid,
      });
    }

    if (auth && isConfigured) {
      await firebaseSignOut();
    }

    setUser(null);
    setFirebaseUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(DEV_STORAGE_KEY);
    }
    setIsLoading(false);
  }, [user]);

  const sendPasswordReset = useCallback(
    async (email: string): Promise<{ success: boolean; message: string; error?: string }> => {
      await logSecurityEvent({
        actorUid: 'anonymous',
        actorRole: 'ANONYMOUS',
        action: 'AUTH_PASSWORD_RESET_REQUEST',
        entityId: email,
      });
      return requestPasswordReset(email);
    },
    []
  );

  const devLogin = useCallback((role: UserRole, buyerOrgId?: string) => {
    const devUser: User = {
      uid: `dev-user-${Date.now()}`,
      email: `${role.toLowerCase().replace(/\s+/g, '.')}@xyzbuyinghouse.com`,
      displayName: `${role} (Dev Mode)`,
      role,
      buyerOrganizationId: role === 'Buyer' ? buyerOrgId || 'org-nordic' : null,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    setUser(devUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem(DEV_STORAGE_KEY, JSON.stringify(devUser));
    }
  }, []);

  const checkPermission = useCallback(
    (permission: Permission) => {
      return hasPermission(user?.role, permission);
    },
    [user?.role]
  );

  const checkOrgAccess = useCallback(
    (buyerOrgId: string) => {
      return canAccessBuyerOrganization(user, buyerOrgId);
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isLoading,
        isAuthenticated: Boolean(user),
        isStaff: isStaffRole(user?.role),
        isBuyer: isBuyerRole(user?.role),
        role: user?.role || null,
        buyerOrganizationId: user?.buyerOrganizationId || null,
        hasPermission: checkPermission,
        canAccessOrg: checkOrgAccess,
        signIn,
        signOut,
        sendPasswordReset,
        devLogin,
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
