import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Shield, 
  Key, 
  LogOut, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  RefreshCw, 
  Edit3, 
  Save, 
  Database,
  ExternalLink,
  Sparkles,
  Lock,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { firebaseConfig, testFirestoreConnection } from '../firebase/config';

const AVATAR_SEEDS = ['Felix', 'Luna', 'Nova', 'Atlas', 'Aria', 'Kavya', 'Leo', 'Milo'];

export const UserProfileDashboard: React.FC = () => {
  const { 
    currentUser, 
    userProfile, 
    logout, 
    resendVerificationEmail, 
    updateUserData,
    changeAccountPassword,
    refreshUserProfile 
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'edit' | 'security' | 'firebase'>('overview');

  // Edit Profile States
  const [displayName, setDisplayName] = useState(userProfile?.displayName || currentUser?.displayName || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [selectedAvatar, setSelectedAvatar] = useState(
    userProfile?.photoURL || currentUser?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=Felix`
  );
  const [savingProfile, setSavingProfile] = useState(false);

  // Security States
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  // Status / Feedback
  const [copiedUid, setCopiedUid] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [sendingVerif, setSendingVerif] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Firestore status check
  const [testingDb, setTestingDb] = useState(false);
  const [dbStatus, setDbStatus] = useState<'idle' | 'connected' | 'error'>('idle');

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCopyUid = () => {
    if (currentUser?.uid) {
      navigator.clipboard.writeText(currentUser.uid);
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    }
  };

  const handleSendVerification = async () => {
    setSendingVerif(true);
    try {
      await resendVerificationEmail();
      setVerificationSent(true);
      showNotification('Verification email sent! Please check your inbox.');
    } catch (err: any) {
      showNotification(err.message || 'Could not send verification email', 'error');
    } finally {
      setSendingVerif(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      showNotification('Display name cannot be empty', 'error');
      return;
    }

    setSavingProfile(true);
    try {
      await updateUserData(displayName, selectedAvatar, bio);
      showNotification('Profile updated successfully!');
      setActiveTab('overview');
    } catch (err: any) {
      showNotification(err.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showNotification('New password must be at least 6 characters long', 'error');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showNotification('Passwords do not match', 'error');
      return;
    }

    setChangingPass(true);
    try {
      await changeAccountPassword(newPassword);
      showNotification('Password updated successfully! Keep it secure.');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      showNotification(
        err.code === 'auth/requires-recent-login'
          ? 'This action requires a recent sign-in. Please log out and log back in to change your password.'
          : err.message,
        'error'
      );
    } finally {
      setChangingPass(false);
    }
  };

  const handleTestDatabase = async () => {
    setTestingDb(true);
    const res = await testFirestoreConnection();
    setTestingDb(false);
    setDbStatus(res.ok ? 'connected' : 'error');
  };

  const isEmailVerified = currentUser?.emailVerified || false;
  const isGoogleUser = currentUser?.providerData.some(p => p.providerId === 'google.com');
  const creationDate = currentUser?.metadata.creationTime
    ? new Date(currentUser.metadata.creationTime).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Recently';
  const lastLoginDate = currentUser?.metadata.lastSignInTime
    ? new Date(currentUser.metadata.lastSignInTime).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        month: 'short',
        day: 'numeric'
      })
    : 'Just now';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs animate-fadeIn ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Verification Notice Banner */}
      {!isEmailVerified && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-200">
          <div className="flex items-start sm:items-center gap-3">
            <AlertTriangle className="text-amber-400 shrink-0 mt-0.5 sm:mt-0" size={18} />
            <div>
              <p className="font-semibold text-amber-100">Email Address Unverified</p>
              <p className="text-amber-200/80">
                Your email ({currentUser?.email}) hasn't been verified yet. Check your inbox or click to resend.
              </p>
            </div>
          </div>
          <button
            onClick={handleSendVerification}
            disabled={sendingVerif || verificationSent}
            className="px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-lg text-amber-200 font-medium text-xs transition-colors shrink-0 disabled:opacity-60 cursor-pointer self-start sm:self-auto"
          >
            {sendingVerif ? 'Sending...' : verificationSent ? 'Email Sent ✓' : 'Send Verification Email'}
          </button>
        </div>
      )}

      {/* Main Profile Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl p-1 bg-gradient-to-tr from-indigo-500 to-violet-500 shadow-xl overflow-hidden">
                <img
                  src={
                    userProfile?.photoURL ||
                    currentUser?.photoURL ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser?.uid || 'Felix'}`
                  }
                  alt={displayName}
                  className="w-full h-full object-cover rounded-xl bg-slate-950"
                />
              </div>
              <button
                onClick={() => setActiveTab('edit')}
                className="absolute -bottom-1 -right-1 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-md border border-slate-900 transition-colors cursor-pointer"
                title="Edit Avatar"
              >
                <Edit3 size={13} />
              </button>
            </div>

            {/* Profile Info */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {userProfile?.displayName || currentUser?.displayName || 'Registered User'}
                </h1>
                {isEmailVerified ? (
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1">
                    <CheckCircle2 size={11} /> Verified
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full flex items-center gap-1">
                    Unverified
                  </span>
                )}
                {isGoogleUser && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full">
                    Google Auth
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-400 flex items-center justify-center sm:justify-start gap-1.5">
                <Mail size={14} className="text-slate-500" />
                {currentUser?.email}
              </p>

              {userProfile?.bio && (
                <p className="text-xs text-slate-300 italic pt-1 max-w-md">
                  "{userProfile.bio}"
                </p>
              )}

              {/* UID chip */}
              <div className="pt-2 flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-400">
                <span className="font-mono text-[11px] bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300">
                  UID: {currentUser?.uid?.slice(0, 10)}...{currentUser?.uid?.slice(-6)}
                </span>
                <button
                  onClick={handleCopyUid}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
                  title="Copy full UID"
                >
                  {copiedUid ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex sm:flex-col items-center gap-2 shrink-0">
            <button
              onClick={() => logout()}
              className="px-4 py-2 bg-slate-800/90 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/30 border border-slate-700/80 rounded-xl text-xs font-semibold text-slate-200 flex items-center gap-2 transition-all cursor-pointer"
            >
              <LogOut size={14} />
              Sign Out
            </button>
            <button
              onClick={refreshUserProfile}
              className="p-2 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Refresh User Data"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 border-b border-slate-800 flex gap-2 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'edit', label: 'Edit Profile', icon: Edit3 },
            { id: 'security', label: 'Security & Auth', icon: Shield },
            { id: 'firebase', label: 'Firebase Config', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-indigo-500 text-indigo-400 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="pt-6">
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Account Created</span>
                    <Calendar size={14} className="text-indigo-400" />
                  </div>
                  <p className="text-base font-semibold text-white">{creationDate}</p>
                  <p className="text-[11px] text-slate-500">Firebase Auth Timestamp</p>
                </div>

                <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Last Sign-In</span>
                    <Clock size={14} className="text-violet-400" />
                  </div>
                  <p className="text-base font-semibold text-white">{lastLoginDate}</p>
                  <p className="text-[11px] text-slate-500">Current active session</p>
                </div>

                <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Sign-in Provider</span>
                    <Key size={14} className="text-amber-400" />
                  </div>
                  <p className="text-base font-semibold text-white capitalize">
                    {currentUser?.providerData[0]?.providerId === 'password'
                      ? 'Email & Password'
                      : currentUser?.providerData[0]?.providerId || 'Custom Auth'}
                  </p>
                  <p className="text-[11px] text-slate-500">Authenticated via Firebase</p>
                </div>
              </div>

              {/* Account Details Box */}
              <div className="bg-slate-950/50 rounded-2xl border border-slate-800 p-5 space-y-3">
                <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                  User Account Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/60">
                    <span className="text-slate-400 block text-[11px]">Registered Email</span>
                    <span className="text-white font-medium text-sm">{currentUser?.email}</span>
                  </div>
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/60">
                    <span className="text-slate-400 block text-[11px]">Display Name</span>
                    <span className="text-white font-medium text-sm">
                      {userProfile?.displayName || currentUser?.displayName || 'Not set'}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/60">
                    <span className="text-slate-400 block text-[11px]">Email Verification</span>
                    <span className={isEmailVerified ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}>
                      {isEmailVerified ? 'Verified ✓' : 'Unverified (Action needed)'}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/60">
                    <span className="text-slate-400 block text-[11px]">Firebase Auth UID</span>
                    <span className="font-mono text-slate-300 text-[11px] select-all truncate block">
                      {currentUser?.uid}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: EDIT PROFILE */}
          {activeTab === 'edit' && (
            <form onSubmit={handleSaveProfile} className="space-y-5 max-w-lg">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your full name"
                  maxLength={60}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 focus:border-indigo-500 rounded-xl text-sm text-white placeholder-slate-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Bio / Status
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us a little about yourself"
                  rows={3}
                  maxLength={200}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 focus:border-indigo-500 rounded-xl text-sm text-white placeholder-slate-500 outline-none resize-none"
                />
                <span className="text-[10px] text-slate-500 block text-right">
                  {bio.length}/200 characters
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Choose New Avatar
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {AVATAR_SEEDS.map((seed) => {
                    const url = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
                    const isSelected = selectedAvatar === url;
                    return (
                      <button
                        key={seed}
                        type="button"
                        onClick={() => setSelectedAvatar(url)}
                        className={`p-1 rounded-xl border-2 transition-all bg-slate-950 cursor-pointer ${
                          isSelected
                            ? 'border-indigo-500 ring-2 ring-indigo-500/30 scale-105'
                            : 'border-slate-800 hover:border-slate-600'
                        }`}
                        title={seed}
                      >
                        <img src={url} alt={seed} className="w-full h-10 object-contain rounded-lg" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save size={14} />
                  {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className="px-4 py-2.5 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* TAB: SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-6 max-w-lg">
              <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <Lock size={16} className="text-indigo-400" />
                  <h4>Change Password</h4>
                </div>

                {isGoogleUser && !currentUser?.providerData.some(p => p.providerId === 'password') ? (
                  <p className="text-xs text-slate-400">
                    You signed in using Google. Password changes are managed through your Google Account settings.
                  </p>
                ) : (
                  <form onSubmit={handleChangePassword} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl text-sm text-white placeholder-slate-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Re-type new password"
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl text-sm text-white placeholder-slate-500 outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={changingPass}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                    >
                      {changingPass ? 'Updating Password...' : 'Update Password'}
                    </button>
                  </form>
                )}
              </div>

              {/* Password Reset Email Trigger */}
              <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-white">Reset via Email</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Send a password reset email link to {currentUser?.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (currentUser?.email) {
                      try {
                        const { sendPasswordResetEmail } = await import('firebase/auth');
                        const { auth } = await import('../firebase/config');
                        await sendPasswordResetEmail(auth, currentUser.email);
                        showNotification('Password reset link sent to your email!');
                      } catch (err: any) {
                        showNotification(err.message, 'error');
                      }
                    }
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors shrink-0 cursor-pointer"
                >
                  Send Reset Link
                </button>
              </div>
            </div>
          )}

          {/* TAB: FIREBASE DETAILS */}
          {activeTab === 'firebase' && (
            <div className="space-y-4">
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database size={16} className="text-amber-400" />
                    <h4 className="text-xs font-semibold text-white">Configured Firebase Environment</h4>
                  </div>
                  <button
                    onClick={handleTestDatabase}
                    disabled={testingDb}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw size={12} className={testingDb ? 'animate-spin' : ''} />
                    Test Firestore Ping
                  </button>
                </div>

                {dbStatus === 'connected' && (
                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 size={14} />
                    <span>Firestore database reachable and responding!</span>
                  </div>
                )}
                {dbStatus === 'error' && (
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center gap-2">
                    <AlertTriangle size={14} />
                    <span>
                      Firestore connection check finished. (If not provisioned yet, Auth continues to work seamlessly).
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Project ID</span>
                    <span className="text-slate-200 font-mono text-xs">{firebaseConfig.projectId}</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Auth Domain</span>
                    <span className="text-slate-200 font-mono text-xs">{firebaseConfig.authDomain}</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Storage Bucket</span>
                    <span className="text-slate-200 font-mono text-xs">{firebaseConfig.storageBucket}</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">App ID</span>
                    <span className="text-slate-200 font-mono text-xs truncate block">{firebaseConfig.appId}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/overview`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 hover:underline"
                  >
                    Open Firebase Console <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
