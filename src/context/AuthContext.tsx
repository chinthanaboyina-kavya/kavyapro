import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  updatePassword
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  UserProfileData,
  handleFirestoreError,
  OperationType,
  formatAuthError
} from '../firebase/config';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfileData | null;
  loading: boolean;
  authReady: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, pass: string, photoURL?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  updateUserData: (displayName: string, photoURL?: string, bio?: string) => Promise<void>;
  changeAccountPassword: (newPassword: string) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authReady, setAuthReady] = useState<boolean>(false);

  // Sync user profile from Firestore or create initial doc
  const fetchOrSyncProfile = async (fbUser: FirebaseUser): Promise<UserProfileData> => {
    const userDocRef = doc(db, 'users', fbUser.uid);
    try {
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        const data = snap.data() as UserProfileData;
        setUserProfile(data);
        return data;
      } else {
        // Create initial profile
        const initialProfile: UserProfileData = {
          uid: fbUser.uid,
          email: fbUser.email || '',
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
          photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${fbUser.uid}`,
          bio: 'Welcome to my KavyaPro profile!',
          emailVerified: fbUser.emailVerified,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        try {
          await setDoc(userDocRef, initialProfile);
        } catch (err) {
          // If Firestore write fails (e.g. firestore permissions or database not created yet),
          // don't block the auth session; keep local profile
          console.warn('Could not persist user to Firestore (may need database provisioning):', err);
        }

        setUserProfile(initialProfile);
        return initialProfile;
      }
    } catch (err) {
      console.warn('Firestore fetch failed:', err);
      // Fallback local representation
      const fallback: UserProfileData = {
        uid: fbUser.uid,
        email: fbUser.email || '',
        displayName: fbUser.displayName || 'User',
        photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${fbUser.uid}`,
        emailVerified: fbUser.emailVerified
      };
      setUserProfile(fallback);
      return fallback;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchOrSyncProfile(user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const refreshUserProfile = async () => {
    if (auth.currentUser) {
      await fetchOrSyncProfile(auth.currentUser);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), pass);
  };

  const registerWithEmail = async (name: string, email: string, pass: string, photoURL?: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    const chosenPhoto = photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${cred.user.uid}`;
    
    // Update Firebase Auth profile
    await updateProfile(cred.user, {
      displayName: name.trim(),
      photoURL: chosenPhoto
    });

    // Create Firestore document
    const userDocRef = doc(db, 'users', cred.user.uid);
    const profileData: UserProfileData = {
      uid: cred.user.uid,
      email: cred.user.email || email.trim(),
      displayName: name.trim(),
      photoURL: chosenPhoto,
      bio: 'New member at KavyaPro.',
      emailVerified: cred.user.emailVerified,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(userDocRef, profileData);
      setUserProfile(profileData);
    } catch (err) {
      console.warn('Could not write to Firestore users collection:', err);
      setUserProfile(profileData);
    }

    // Try sending email verification
    try {
      await sendEmailVerification(cred.user);
    } catch (verifErr) {
      console.warn('Auto verification email skipped or throttled:', verifErr);
    }
  };

  const loginWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    if (cred.user) {
      await fetchOrSyncProfile(cred.user);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const resendVerificationEmail = async () => {
    if (!auth.currentUser) throw new Error('No user is currently signed in.');
    await sendEmailVerification(auth.currentUser);
  };

  const updateUserData = async (displayName: string, photoURL?: string, bio?: string) => {
    if (!auth.currentUser) throw new Error('No user signed in.');
    
    // Update Auth profile
    await updateProfile(auth.currentUser, {
      displayName: displayName.trim(),
      ...(photoURL ? { photoURL } : {})
    });

    // Update Firestore if available
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    const updated = {
      displayName: displayName.trim(),
      ...(photoURL ? { photoURL } : {}),
      ...(bio !== undefined ? { bio } : {}),
      updatedAt: new Date().toISOString()
    };

    try {
      await updateDoc(userDocRef, updated);
    } catch (err) {
      console.warn('Firestore update failed, fallback to state:', err);
    }

    setUserProfile((prev) => prev ? { ...prev, ...updated } : null);
  };

  const changeAccountPassword = async (newPassword: string) => {
    if (!auth.currentUser) throw new Error('No user signed in.');
    await updatePassword(auth.currentUser, newPassword);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        authReady,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
        resetPassword,
        resendVerificationEmail,
        updateUserData,
        changeAccountPassword,
        refreshUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
