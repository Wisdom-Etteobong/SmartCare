import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  HeartPulse,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const LoginPage: React.FC = () => {
  const { login, verifyOtp } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Primary credentials state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // 2FA OTP Challenge state
  const [otpMode, setOtpMode] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [demoOtp, setDemoOtp] = useState('');

  // Redirection target from state
  const state = location.state as { from?: { pathname: string; search?: string }; message?: string } | null;
  const customMessage = state?.message;

  const handleSubmitCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please enter your email and password');
      return;
    }

    setLoading(true);
    try {
      const result = await login({ email: email.trim(), password });

      if (result.requireOtp && result.tempToken) {
        setOtpMode(true);
        setTempToken(result.tempToken);
        setMaskedEmail(result.otpSentTo || email);
        if (result.demoOtp) {
          setDemoOtp(result.demoOtp);
          setOtpCode(result.demoOtp); // pre-populate for quick testing convenience
        }
        success('Verification code generated. Please enter your 6-digit OTP.');
        return;
      }

      // If direct login (e.g. Patient)
      navigateAfterLogin();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Invalid email or password';
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      error('Please enter the 6-digit OTP verification code');
      return;
    }

    setLoading(true);
    try {
      await verifyOtp({ tempToken, otp: otpCode.trim() });
      success('Two-factor authentication verified successfully!');
      navigateAfterLogin();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Invalid or expired OTP code';
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  const navigateAfterLogin = () => {
    const savedUserStr = localStorage.getItem('smartcare_user');
    let userRole = 'patient';
    if (savedUserStr) {
      try {
        userRole = JSON.parse(savedUserStr).role || 'patient';
      } catch {
        // ignore
      }
    }

    let target = state?.from ? `${state.from.pathname}${state.from.search || ''}` : '/dashboard';
    if (!state?.from) {
      if (userRole === 'doctor') target = '/doctor/dashboard';
      else if (userRole === 'admin') target = '/admin';
    }

    navigate(target, { replace: true });
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-3 text-center">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20">
            <HeartPulse className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            Smart<span className="text-teal-600">Care</span>
          </span>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {otpMode ? 'Two-Factor Authentication' : 'Hospital Portal Sign In'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          {otpMode
            ? 'Enhanced security verification required for clinical and administrative access.'
            : 'Sign in to access patient bookings, doctor consultation queues, and clinical tools.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md space-y-6">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
          {/* Custom redirection notice */}
          {customMessage && !otpMode && (
            <div className="p-3.5 bg-teal-50 border border-teal-200/80 rounded-2xl text-xs text-teal-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span>{customMessage}</span>
            </div>
          )}

          {otpMode ? (
            /* 2FA OTP Step */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-xs text-blue-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-blue-800">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Security Verification Active</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  A 6-digit verification code has been dispatched for account <span className="font-semibold text-slate-800">{maskedEmail}</span>.
                </p>
                {demoOtp && (
                  <div className="mt-2 pt-2 border-t border-blue-200/60 flex items-center justify-between">
                    <span className="text-[11px] text-blue-700 font-medium">In-App Demo Code:</span>
                    <span className="font-mono font-black text-blue-900 tracking-widest bg-white px-2 py-0.5 rounded-lg border border-blue-200">
                      {demoOtp}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Enter 6-Digit OTP Code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="otp-code-input"
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    placeholder="e.g. 849201"
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-center font-mono text-lg font-extrabold tracking-widest text-slate-900 outline-hidden"
                  />
                </div>
              </div>

              <button
                id="otp-submit-btn"
                type="submit"
                disabled={loading || otpCode.length < 6}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-bold text-sm shadow-md shadow-teal-600/20 transition-all hover:scale-[1.01] cursor-pointer disabled:cursor-not-allowed"
              >
                <span>{loading ? 'Verifying...' : 'Verify & Continue'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setOtpMode(false)}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 py-1 transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to email sign in</span>
              </button>
            </form>
          ) : (
            /* Standard Password Form */
            <form onSubmit={handleSubmitCredentials} className="space-y-4">
              {/* Email field */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-email-input"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-sm font-semibold text-slate-800 outline-hidden"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    id="login-forgot-password-link"
                    className="text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-sm font-semibold text-slate-800 outline-hidden"
                  />
                  <button
                    type="button"
                    id="login-toggle-password-btn"
                    onClick={() => setShowPassword(prev => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:text-teal-600 rounded-md transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="login-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/20 transition-all hover:scale-[1.01] disabled:opacity-50 cursor-pointer"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            Need a patient account?{' '}
            <Link
              to="/register"
              state={state}
              className="text-teal-600 hover:text-teal-700 font-bold underline"
            >
              Register as Patient
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
