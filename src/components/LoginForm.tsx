import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatAuthError } from '../firebase/config';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onSwitchToForgotPassword: (email?: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSwitchToRegister,
  onSwitchToForgotPassword
}) => {
  const { loginWithEmail, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState<{ title: string; message: string; tip?: string } | null>(null);

  useEffect(() => {
    const savedEmail = localStorage.getItem('kavyapro_saved_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorInfo({
        title: 'Missing Fields',
        message: 'Please provide both your email address and password.'
      });
      return;
    }

    setLoading(true);
    setErrorInfo(null);

    try {
      if (rememberMe) {
        localStorage.setItem('kavyapro_saved_email', email.trim());
      } else {
        localStorage.removeItem('kavyapro_saved_email');
      }

      await loginWithEmail(email, password);
    } catch (err: any) {
      setErrorInfo(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setErrorInfo(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setErrorInfo(formatAuthError(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h2>
        <p className="text-sm text-slate-400 mt-1">
          Sign in to your KavyaPro account to continue
        </p>
      </div>

      {errorInfo && (
        <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/25 rounded-xl text-rose-300 text-xs flex gap-2.5 animate-fadeIn">
          <AlertCircle className="shrink-0 mt-0.5 text-rose-400" size={16} />
          <div>
            <p className="font-semibold text-rose-200">{errorInfo.title}</p>
            <p className="mt-0.5 text-rose-300/90 leading-relaxed">{errorInfo.message}</p>
            {errorInfo.tip && (
              <p className="mt-2 text-amber-200 font-mono text-[11px] bg-amber-950/40 border border-amber-800/40 p-2 rounded-lg">
                💡 <span className="font-semibold">Setup Tip:</span> {errorInfo.tip}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Google Login Provider */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={googleLoading || loading}
        className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-850 border border-slate-700/80 hover:border-slate-600 rounded-xl text-sm font-medium text-slate-200 flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow cursor-pointer disabled:opacity-50"
      >
        {googleLoading ? (
          <Loader2 size={18} className="animate-spin text-slate-400" />
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.41 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.59 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
        )}
        <span>Continue with Google</span>
      </button>

      <div className="relative my-5 flex items-center justify-center">
        <div className="border-t border-slate-800 w-full"></div>
        <span className="bg-slate-950 px-3 text-[11px] uppercase tracking-wider text-slate-400 absolute">
          Or sign in with email
        </span>
      </div>

      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Password
            </label>
            <button
              type="button"
              onClick={() => onSwitchToForgotPassword(email)}
              className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 bg-slate-900/90 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-0.5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-950"
            />
            <span>Remember my email</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Signing In...
            </>
          ) : (
            <>
              <LogIn size={16} />
              Sign In
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
        <p className="text-xs text-slate-400">
          Don't have an account yet?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-indigo-400 hover:text-indigo-300 font-semibold hover:underline cursor-pointer ml-1"
          >
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
};
