import React, { useState } from 'react';
import { Mail, ArrowLeft, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatAuthError } from '../firebase/config';

interface ForgotPasswordModalProps {
  onBackToLogin: () => void;
  initialEmail?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  onBackToLogin,
  initialEmail = ''
}) => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState<{ title: string; message: string; tip?: string } | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorInfo({
        title: 'Email Required',
        message: 'Please enter your registered email address.'
      });
      return;
    }

    setLoading(true);
    setErrorInfo(null);

    try {
      await resetPassword(email.trim());
      setSuccess(true);
    } catch (err: any) {
      setErrorInfo(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3 text-indigo-400">
          <Mail size={24} />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Reset Password</h2>
        <p className="text-sm text-slate-400 mt-1">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      {errorInfo && (
        <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex gap-2.5">
          <AlertCircle className="shrink-0 mt-0.5" size={16} />
          <div>
            <p className="font-semibold text-rose-200">{errorInfo.title}</p>
            <p className="mt-0.5 text-rose-300/90">{errorInfo.message}</p>
            {errorInfo.tip && (
              <p className="mt-1 text-rose-200/80 italic font-mono text-[11px] bg-rose-950/40 p-1.5 rounded">
                💡 {errorInfo.tip}
              </p>
            )}
          </div>
        </div>
      )}

      {success ? (
        <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center space-y-3">
          <CheckCircle2 size={40} className="text-emerald-400 mx-auto" />
          <h3 className="text-lg font-semibold text-emerald-300">Password Reset Email Sent!</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            We've sent a password reset link to <strong className="text-white">{email}</strong>. 
            Check your inbox (and spam/junk folder) and click the link to choose a new password.
          </p>
          <div className="pt-2">
            <button
              onClick={onBackToLogin}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl transition-colors"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Account Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Sending Reset Link...
              </>
            ) : (
              <>
                <Send size={16} />
                Send Password Reset Email
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onBackToLogin}
            className="w-full py-2 text-center text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <ArrowLeft size={14} /> Back to Sign In
          </button>
        </form>
      )}
    </div>
  );
};
