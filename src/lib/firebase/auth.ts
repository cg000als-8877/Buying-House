import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  User as FirebaseUser,
  AuthError,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db, isConfigured } from './client';
import { User, UserRole, UserStatus } from '@/types/auth';

/**
 * Maps Firebase Auth error codes to user-friendly, secure error messages.
 * Prevents account enumeration and hides raw internal stack traces.
 */
export function mapAuthError(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return 'An unexpected authentication error occurred. Please try again.';
  }

  const authError = error as AuthError;
  const code = authError.code || '';

  switch (code) {
    case 'auth/invalid-email':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email address or password. Please verify your credentials.';
    case 'auth/user-disabled':
      return 'This account has been deactivated. Please contact your XYZ Buying House representative.';
    case 'auth/too-many-requests':
      return 'Too many unsuccessful attempts. Access is temporarily restricted for security. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network connection issue detected. Please check your internet connectivity.';
    case 'auth/operation-not-allowed':
      return 'Email/password authentication is currently disabled in system configuration.';
    default:
      return 'Authentication could not be completed. Please try again or contact support.';
  }
}

/**
 * Fetches user profile data from Firestore `users/{uid}`.
 */
export async function getFirestoreUserProfile(uid: string): Promise<User | null> {
  if (!db) return null;

  try {
    const userDocRef = doc(db, 'users', uid);
    const userSnapshot = await getDoc(userDocRef);

    if (userSnapshot.exists()) {
      const data = userSnapshot.data();
      return {
        uid,
        email: data.email || '',
        displayName: data.displayName || '',
        role: (data.role as UserRole) || 'Buyer',
        buyerOrganizationId: data.buyerOrganizationId || null,
        status: (data.status as UserStatus) || 'active',
        photoURL: data.photoURL || null,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
        lastLoginAt: data.lastLoginAt?.toDate?.()?.toISOString() || data.lastLoginAt || new Date().toISOString(),
      };
    }
    return null;
  } catch (err) {
    console.error('[Firebase Auth] Failed to fetch user profile from Firestore:', err);
    return null;
  }
}

/**
 * Updates last login timestamp in Firestore.
 */
export async function recordUserLogin(uid: string): Promise<void> {
  if (!db) return;
  try {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, {
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    // Non-fatal if document does not exist yet
    console.warn('[Firebase Auth] Could not update last login timestamp:', err);
  }
}

/**
 * Signs in user with email and password via Firebase Auth.
 */
export async function signIn(
  email: string,
  pass: string
): Promise<{ user: FirebaseUser | null; error: string | null }> {
  if (!auth || !isConfigured) {
    return {
      user: null,
      error: 'Firebase is not configured in this environment.',
    };
  }

  try {
    const credential = await signInWithEmailAndPassword(auth, email.trim(), pass);
    if (credential.user) {
      await recordUserLogin(credential.user.uid);
    }
    return { user: credential.user, error: null };
  } catch (err) {
    return { user: null, error: mapAuthError(err) };
  }
}

/**
 * Signs out current Firebase Auth session.
 */
export async function signOutUser(): Promise<{ error: string | null }> {
  if (!auth || !isConfigured) {
    return { error: null };
  }

  try {
    await firebaseSignOut(auth);
    return { error: null };
  } catch (err) {
    return { error: mapAuthError(err) };
  }
}

/**
 * Sends a password reset email via Firebase Auth.
 * Returns a generic success response to mitigate account enumeration risks.
 */
export async function requestPasswordReset(
  email: string
): Promise<{ success: boolean; message: string }> {
  if (!auth || !isConfigured) {
    return {
      success: true,
      message: 'If an account exists with this email address, password reset instructions have been sent.',
    };
  }

  try {
    await sendPasswordResetEmail(auth, email.trim());
    return {
      success: true,
      message: 'If an account exists with this email address, password reset instructions have been sent.',
    };
  } catch (err) {
    // Return standard message to prevent account enumeration
    console.warn('[Firebase Auth] Password reset request logged:', err);
    return {
      success: true,
      message: 'If an account exists with this email address, password reset instructions have been sent.',
    };
  }
}
