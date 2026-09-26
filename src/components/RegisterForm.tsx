import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  UserPlus, 
  Check, 
  X, 
  AlertCircle, 
  Loader2, 
  Sparkles,
  ShieldAlert,
  Smile
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatAuthError } from '../firebase/config';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

const AVATAR_SEEDS = ['Felix', 'Luna', 'Nova', 'Atlas', 'Aria', 'Kavya'];

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const { registerWithEmail, loginWithGoogle } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(
    `https://api.dicebear.com/7.x/bottts/svg?seed=Felix`
  );
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState<{ title: string; message: string; tip?: string } | null>(null);

  // Password validation checks
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  // Calculate score 0-4
  const strengthScore = [hasMinLength, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;

  const getStrengthMeta = () => {
    if (password.length === 0) return { label: '', color: 'bg-slate-700' };
    if (strengthScore <= 1) return { label: 'Weak', color: 'bg-rose-500' };
    if (strengthScore === 2) return { label: 'Fair', color: 'bg-amber-500' };
    if (strengthScore === 3) return { label: 'Good', color: 'bg-blue-500' };
    return { label: 'Strong', color: 'bg-emerald-500' };
  };

  const strengthMeta = getStrengthMeta();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorInfo({ title: 'Name Required', message: 'Please enter your full name.' });
      return;
    }
    if (!email.trim()) {
      setErrorInfo({ title: 'Email Required', message: 'Please provide a valid email address.' });
      return;
    }
    if (password.length < 6) {
      setErrorInfo({
        title: 'Password Too Short',
        message: 'Password must be at least 6 characters long (8+ recommended).'
      });
      return;
    }
    if (password !== confirmPassword) {
      setErrorInfo({
        title: 'Passwords Mismatch',
        message: 'The password and confirm password fields do not match.'
      });
      return;
    }
    if (!agreeTerms) {
      setErrorInfo({
        title: 'Agreement Required',
        message: 'Please accept the Terms of Service to create an account.'
      });
      return;
    }

    setLoading(true);
    setErrorInfo(null);

    try {
      await registerWithEmail(name, email, password, selectedAvatar);
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
        <h2 className="text-2xl font-bold text-white tracking-tight">Create Account</h2>
        <p className="text-sm text-slate-400 mt-1">
          Join KavyaPro with your email or Google account
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

      {/* Google Quick Sign-Up */}
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
        <span>Sign up with Google</span>
      </button>

      <div className="relative my-5 flex items-center justify-center">
        <div className="border-t border-slate-800 w-full"></div>
        <span className="bg-slate-950 px-3 text-[11px] uppercase tracking-wider text-slate-400 absolute">
          Or register with email
        </span>
      </div>

      <form onSubmit={handleRegister} className="space-y-3.5">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Kavya Sharma"
              maxLength={80}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="kavya@example.com"
              maxLength={120}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Avatar Selection */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
            <span>Choose Your Avatar</span>
            <span className="text-[11px] text-slate-400">Click to select</span>
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {AVATAR_SEEDS.map((seed) => {
              const url = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
              const isSelected = selectedAvatar === url;
              return (
                <button
                  key={seed}
                  type="button"
                  onClick={() => setSelectedAvatar(url)}
                  className={`w-9 h-9 rounded-xl p-0.5 border-2 transition-all flex items-center justify-center bg-slate-900 cursor-pointer shrink-0 ${
                    isSelected
                      ? 'border-indigo-500 ring-2 ring-indigo-500/30 scale-105'
                      : 'border-slate-800 hover:border-slate-600'
                  }`}
                  title={seed}
                >
                  <img src={url} alt={seed} className="w-full h-full object-cover rounded-lg" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full pl-10 pr-10 py-2.5 bg-slate-900/90 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Password Strength Meter */}
          {password.length > 0 && (
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Password strength:</span>
                <span className={`font-semibold ${
                  strengthScore <= 1 ? 'text-rose-400' :
                  strengthScore === 2 ? 'text-amber-400' :
                  strengthScore === 3 ? 'text-blue-400' : 'text-emerald-400'
                }`}>
                  {strengthMeta.label}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden flex gap-1">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-full flex-1 rounded-full transition-all duration-300 ${
                      step <= strengthScore ? strengthMeta.color : 'bg-slate-800'
                    }`}
                  />
                ))}
              </div>

              {/* Requirement Checklist */}
              <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-400 pt-1">
                <span className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {hasMinLength ? <Check size={12} /> : <X size={12} />} 8+ characters
                </span>
                <span className={`flex items-center gap-1 ${hasUppercase ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {hasUppercase ? <Check size={12} /> : <X size={12} />} Uppercase letter
                </span>
                <span className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {hasNumber ? <Check size={12} /> : <X size={12} />} At least 1 number
                </span>
                <span className={`flex items-center gap-1 ${hasSpecial ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {hasSpecial ? <Check size={12} /> : <X size={12} />} Special symbol
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              className={`w-full pl-10 pr-10 py-2.5 bg-slate-900/90 border rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all ${
                confirmPassword.length > 0
                  ? passwordsMatch
                    ? 'border-emerald-500/80 focus:border-emerald-500'
                    : 'border-rose-500/80 focus:border-rose-500'
                  : 'border-slate-700/80 focus:border-indigo-500'
              }`}
            />
            {confirmPassword.length > 0 && (
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                {passwordsMatch ? (
                  <Check size={16} className="text-emerald-400" />
                ) : (
                  <X size={16} className="text-rose-400" />
                )}
              </span>
            )}
          </div>
        </div>

        {/* Terms and conditions */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 text-xs text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-950"
            />
            <span>
              I agree to the{' '}
              <span className="text-indigo-400 hover:underline">Terms of Service</span> and{' '}
              <span className="text-indigo-400 hover:underline">Privacy Policy</span>.
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Creating Account...
            </>
          ) : (
            <>
              <UserPlus size={16} />
              Register Account
            </>
          )}
        </button>
      </form>

      <div className="mt-5 pt-4 border-t border-slate-800/80 text-center">
        <p className="text-xs text-slate-400">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-indigo-400 hover:text-indigo-300 font-semibold hover:underline cursor-pointer ml-1"
          >
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
};
