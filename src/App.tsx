import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { ForgotPasswordModal } from './components/ForgotPasswordModal';
import { UserProfileDashboard } from './components/UserProfileDashboard';
import { FirebaseStatusBadge } from './components/FirebaseStatusBadge';
import { ShieldCheck, Sparkles, User, LogIn, UserPlus } from 'lucide-react';

function AuthAppContent() {
  const { currentUser, authReady } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot-password'>('login');
  const [resetEmailPrefill, setResetEmailPrefill] = useState('');

  const handleOpenForgotPassword = (email?: string) => {
    setResetEmailPrefill(email || '');
    setAuthMode('forgot-password');
  };

  if (!authReady) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm">Connecting to KavyaPro Authentication...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white relative overflow-hidden font-sans">
      {/* Background Glow Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[30%] w-[300px] h-[300px] bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Subtle Grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.8) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Top Navbar */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <ShieldCheck size={20} />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                KavyaPro
              </span>
              <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider ml-1.5 px-1.5 py-0.5 rounded bg-indigo-950/80 border border-indigo-800/50">
                Auth
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2.5">
                <img
                  src={
                    currentUser.photoURL ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.uid}`
                  }
                  alt="Avatar"
                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 object-cover"
                />
                <span className="text-xs font-medium text-slate-300 hidden sm:inline-block">
                  {currentUser.displayName || currentUser.email}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setAuthMode('login')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    authMode === 'login'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LogIn size={13} />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => setAuthMode('register')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    authMode === 'register'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UserPlus size={13} />
                  <span>Register</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Page Area */}
      <main className="relative z-10 flex-1 flex flex-col justify-center px-4 py-8 sm:py-12">
        {/* Firebase Config details banner */}
        <FirebaseStatusBadge />

        {currentUser ? (
          /* Authenticated Dashboard */
          <UserProfileDashboard />
        ) : (
          /* Unauthenticated Auth Form */
          <div className="w-full max-w-md mx-auto">
            {/* Card Shell */}
            <div className="bg-slate-900/85 backdrop-blur-2xl border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 relative">
              {/* Subtle top card glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

              {/* Mode switch tabs */}
              {authMode !== 'forgot-password' && (
                <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-2xl border border-slate-800/80 mb-6">
                  <button
                    onClick={() => setAuthMode('login')}
                    className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                      authMode === 'login'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setAuthMode('register')}
                    className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                      authMode === 'register'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Register
                  </button>
                </div>
              )}

              {/* Form Views */}
              {authMode === 'login' && (
                <LoginForm
                  onSwitchToRegister={() => setAuthMode('register')}
                  onSwitchToForgotPassword={handleOpenForgotPassword}
                />
              )}

              {authMode === 'register' && (
                <RegisterForm
                  onSwitchToLogin={() => setAuthMode('login')}
                />
              )}

              {authMode === 'forgot-password' && (
                <ForgotPasswordModal
                  onBackToLogin={() => setAuthMode('login')}
                  initialEmail={resetEmailPrefill}
                />
              )}
            </div>

            {/* Bottom trust badges */}
            <div className="mt-6 flex items-center justify-center gap-6 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-indigo-400" />
                Firebase Auth &amp; SSL Encrypted
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-400" />
                Real-time Sync
              </span>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 py-4 text-center text-xs text-slate-500">
        <p>
          KavyaPro Authentication • Configured with Firebase Project <code className="text-slate-400 font-mono">kavyapro-ee649</code>
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthAppContent />
    </AuthProvider>
  );
}
