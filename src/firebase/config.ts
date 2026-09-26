import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  updatePassword,
  signOut,
  User as FirebaseUser,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  getDocFromServer
} from 'firebase/firestore';
import { isSupported, getAnalytics } from 'firebase/analytics';

// The web app's Firebase configuration provided by the user
export const firebaseConfig = {
  apiKey: "AIzaSyDNMX0OBfRaFZyimpsqXbhmkl99vCU9iSA",
  authDomain: "kavyapro-ee649.firebaseapp.com",
  projectId: "kavyapro-ee649",
  storageBucket: "kavyapro-ee649.firebasestorage.app",
  messagingSenderId: "526143653988",
  appId: "1:526143653988:web:e443081162186019e67771",
  measurementId: "G-1LQS133Y1H"
};

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth & Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Analytics safely
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      getAnalytics(app);
    }
  }).catch(() => {
    // Analytics optional in preview environments
  });
}

// Error handling conforming to Firebase Integration Skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// User Profile interface
export interface UserProfileData {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  emailVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Friendly Auth Error Formatter with setup tips
export function formatAuthError(error: any): { title: string; message: string; tip?: string } {
  const errorCode = error?.code || '';
  const defaultMsg = error?.message || 'An unexpected error occurred. Please try again.';

  switch (errorCode) {
    case 'auth/invalid-email':
      return {
        title: 'Invalid Email Address',
        message: 'The email address format is not valid. Please enter a valid email (e.g., name@example.com).'
      };
    case 'auth/user-disabled':
      return {
        title: 'Account Disabled',
        message: 'This user account has been disabled by an administrator.'
      };
    case 'auth/user-not-found':
      return {
        title: 'Account Not Found',
        message: 'No account exists with this email address. Please sign up or double check your email.'
      };
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return {
        title: 'Incorrect Credentials',
        message: 'The email or password you entered is incorrect. Please try again or reset your password.'
      };
    case 'auth/email-already-in-use':
      return {
        title: 'Email Already In Use',
        message: 'An account with this email address already exists. Please sign in or use a different email.'
      };
    case 'auth/weak-password':
      return {
        title: 'Password Too Weak',
        message: 'Your password should be at least 6 characters long and include numbers or symbols.'
      };
    case 'auth/operation-not-allowed':
      return {
        title: 'Provider Not Enabled in Firebase',
        message: 'This sign-in provider is currently disabled in your Firebase Console.',
        tip: 'Go to Firebase Console -> Authentication -> Sign-in method, and enable "Email/Password" and/or "Google".'
      };
    case 'auth/unauthorized-domain':
      return {
        title: 'Domain Not Authorized',
        message: 'The current web domain is not authorized for OAuth operations in Firebase.',
        tip: `Add "${typeof window !== 'undefined' ? window.location.hostname : 'your domain'}" to Firebase Console -> Authentication -> Settings -> Authorized domains.`
      };
    case 'auth/popup-closed-by-user':
      return {
        title: 'Sign In Cancelled',
        message: 'The popup window was closed before completing the sign in.'
      };
    case 'auth/popup-blocked':
      return {
        title: 'Popup Blocked',
        message: 'The sign-in popup was blocked by your browser. Please allow popups for this site and try again.'
      };
    case 'auth/network-request-failed':
      return {
        title: 'Network Connection Issue',
        message: 'Unable to reach Firebase servers. Please verify your internet connection.'
      };
    case 'auth/too-many-requests':
      return {
        title: 'Too Many Attempts',
        message: 'Access temporarily blocked due to many failed attempts. You can reset your password or try again later.'
      };
    default:
      return {
        title: 'Authentication Error',
        message: defaultMsg
      };
  }
}

// Test Connection Helper from skill
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return { ok: true };
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore client is offline or configuration unreachable.");
    }
    return { ok: false, error };
  }
}
