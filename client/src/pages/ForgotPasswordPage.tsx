import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  HeartPulse,
  Mail,
  Lock,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const ForgotPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { success, error } = useToast();

  // Multi-step form state: 'request' | 'verify' | 'success'
  const [step, setStep] = useState<'request' | 'verify' | 'success'>('request');

  // Step 1 Form
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [isRequesting, setIsRequesting] = useState(false);

  // Step 2 Form
  const [resetToken, setResetToken] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Auto-fill demo OTP when received for quick preview testing
  const handleAutoFillOtp = () => {
    if (demoOtp) {
      setOtpCode(demoOtp);
    }
  };

  // Step 1: Submit email to receive verification OTP
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.trim()) {
      error('Please enter your account email address');
      return;
    }

    setIsRequesting(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: email.trim() });
      const data = res.data?.data;

      setResetToken(data?.resetToken || '');
      setMaskedEmail(data?.maskedEmail || email);
      if (data?.demoOtp) {
        setDemoOtp(data.demoOtp);
        setOtpCode(data.demoOtp); // pre-populate for effortless testing
      }
      setStep('verify');
      success(res.data?.message || 'Verification code dispatched to your email.');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to process password reset request';
      error(msg);
    } finally {
      setIsRequesting(false);
    }
  };

  // Step 2: Submit OTP and new password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      error('Please enter the full 6-digit verification code');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      error('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      error('Password confirmation does not match');
      return;
    }

    setIsResetting(true);
    try {
      const res = await api.post('/auth/reset-password', {
        email: email.trim(),
        resetToken,
        otp: otpCode.trim(),
        newPassword,
      });

      setStep('success');
      success(res.data?.message || 'Password reset successfully! You can now log in.');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to reset password';
      error(msg);
    } finally {
      setIsResetting(false);
    }
  };

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score += 25;
    if (pass.length >= 8) score += 25;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 25;
    return score;
  };

  const strength = getPasswordStrength(newPassword);

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
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
          {step === 'request' && 'Reset Account Password'}
          {step === 'verify' && 'Verify Code & Set Password'}
          {step === 'success' && 'Password Reset Complete'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          {step === 'request' && 'Enter your registered email address to receive a secure password recovery code.'}
          {step === 'verify' && `We sent a 6-digit recovery code to ${maskedEmail || 'your email'}.`}
          {step === 'success' && 'Your account security credentials have been updated successfully.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md space-y-6">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
          {/* STEP 1: Request Reset Code */}
          {step === 'request' && (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="forgot-email-input"
                    type="email"
                    required
                    autoFocus
                    autoComplete="email"
                    placeholder="e.g. patient@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-sm font-semibold text-slate-800 outline-hidden"
                  />
                </div>
              </div>

              <button
                id="forgot-submit-email-btn"
                type="submit"
                disabled={isRequesting || !email.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-bold text-sm shadow-md shadow-teal-600/20 transition-all hover:scale-[1.01] cursor-pointer disabled:cursor-not-allowed"
              >
                <span>{isRequesting ? 'Sending Code...' : 'Send Recovery Code'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-teal-600 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </form>
          )}

          {/* STEP 2: Verify Code & Set New Password */}
          {step === 'verify' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* Security info banner */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-xs text-blue-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-blue-800">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Verification Code Dispatched</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Enter the 6-digit code sent to <strong className="text-slate-800">{maskedEmail}</strong>. Valid for 15 minutes.
                </p>
                {demoOtp && (
                  <div
                    onClick={handleAutoFillOtp}
                    className="mt-2 pt-2 border-t border-blue-200/60 flex items-center justify-between cursor-pointer group"
                    title="Click to auto-fill code"
                  >
                    <span className="text-[11px] text-blue-700 font-medium group-hover:underline">
                      In-App Demo Code (Click to use):
                    </span>
                    <span className="font-mono font-black text-blue-900 tracking-widest bg-white px-2.5 py-0.5 rounded-lg border border-blue-200 shadow-xs">
                      {demoOtp}
                    </span>
                  </div>
                )}
              </div>

              {/* 6-Digit OTP input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  6-Digit Recovery Code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="reset-otp-input"
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    placeholder="e.g. 123456"
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-center font-mono text-lg font-black tracking-widest text-slate-900 outline-hidden"
                  />
                </div>
              </div>

              {/* New Password input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="reset-new-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-sm font-semibold text-slate-800 outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:text-teal-600 rounded-md transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password strength indicator */}
                {newPassword && (
                  <div className="mt-1.5 space-y-1">
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          strength <= 25
                            ? 'bg-rose-500 w-1/4'
                            : strength <= 50
                            ? 'bg-amber-500 w-2/4'
                            : strength <= 75
                            ? 'bg-teal-500 w-3/4'
                            : 'bg-emerald-500 w-full'
                        }`}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Strength</span>
                      <span className="font-bold">
                        {strength <= 25 && 'Too Weak'}
                        {strength === 50 && 'Moderate'}
                        {strength === 75 && 'Good'}
                        {strength === 100 && 'Strong & Secure'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="reset-confirm-password-input"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-sm font-semibold text-slate-800 outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(prev => !prev)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:text-teal-600 rounded-md transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1">Passwords do not match</p>
                )}
              </div>

              {/* Submit Reset Button */}
              <button
                id="reset-confirm-btn"
                type="submit"
                disabled={isResetting || otpCode.length < 6 || newPassword.length < 6 || newPassword !== confirmPassword}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-bold text-sm shadow-md shadow-teal-600/20 transition-all hover:scale-[1.01] cursor-pointer disabled:cursor-not-allowed"
              >
                <span>{isResetting ? 'Updating Password...' : 'Save New Password & Sign In'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setStep('request')}
                  className="font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  &larr; Change email address
                </button>

                <button
                  type="button"
                  onClick={handleRequestReset}
                  disabled={isRequesting}
                  className="font-bold text-teal-600 hover:text-teal-700 cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRequesting ? 'animate-spin' : ''}`} />
                  <span>Resend code</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Success Confirmation */}
          {step === 'success' && (
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20 animate-in zoom-in-50">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900">
                  Password Updated!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Your SmartCare account password has been reset successfully. You can now log into your portal with your new credentials.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  to="/login"
                  state={{ message: 'Password reset successful! Please sign in with your new credentials.' }}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/20 transition-all hover:scale-[1.01]"
                >
                  <span>Proceed to Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
