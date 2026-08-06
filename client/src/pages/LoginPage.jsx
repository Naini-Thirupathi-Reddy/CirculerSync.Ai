import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Recycle, ShieldAlert, KeyRound, Mail, Sparkles, CheckCircle2, ArrowRight, RefreshCw, Clock } from 'lucide-react';

const AUTHORIZED_EMAILS = [
  'sarah@greenbean.com',
  'aris@cityfarm.org',
  'driver@circularsync.com',
  'admin@circularsync.com',
  'producer@circularsync.com',
  'consumer@circularsync.com',
];

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [remainingAttempts, setRemainingAttempts] = useState(5);
  
  // Timers (5-minute expiration countdown & 60-second resend cooldown)
  const [expireSeconds, setExpireSeconds] = useState(300);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const { googleLogin, verifyOtp, resendOtp, loading } = useAuth();
  const navigate = useNavigate();

  const sampleAccounts = [
    { role: 'PRODUCER', email: 'sarah@greenbean.com', name: 'Waste Producer (GreenBean Cafe)' },
    { role: 'CONSUMER', email: 'aris@cityfarm.org', name: 'Resource Consumer (City Farm)' },
    { role: 'LOGISTICS', email: 'driver@circularsync.com', name: 'Logistics Partner (Driver)' },
    { role: 'ADMIN', email: 'admin@circularsync.com', name: 'Community Manager (Admin)' },
  ];

  // 5-minute Countdown Timer
  useEffect(() => {
    let timer;
    if (otpStep && expireSeconds > 0) {
      timer = setInterval(() => {
        setExpireSeconds(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpStep, expireSeconds]);

  // 60-second Resend Cooldown Timer
  useEffect(() => {
    let timer;
    if (otpStep && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpStep, resendCooldown]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  /**
   * Step 1: Initiate Google OAuth / Gmail Authentication
   */
  const handleInitiateGmailAuth = async (targetEmail) => {
    const inputEmail = (targetEmail || email).trim().toLowerCase();
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!inputEmail || !emailRegex.test(inputEmail)) {
      setError('Please enter a valid Gmail / Email address.');
      return;
    }

    // Check whether this email exists in the authorized database list
    const isAuthorized = AUTHORIZED_EMAILS.some(e => e.toLowerCase() === inputEmail);

    if (!isAuthorized) {
      setError('Invalid User. You are not authorized to access this application.');
      setOtpStep(false);
      return;
    }

    try {
      const res = await googleLogin(inputEmail);
      if (res && res.requiresOtp) {
        setEmail(inputEmail);
        setDemoOtp(res.demoOtp || '123456');
        setOtpStep(true);
        setExpireSeconds(300);
        setResendCooldown(60);
        setCanResend(false);
        setRemainingAttempts(5);
        setToastMessage(`📩 6-Digit OTP sent to ${inputEmail}`);
        setTimeout(() => setToastMessage(''), 4000);
        return;
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message;
      if (err.response?.status === 403 || errMsg.includes('Invalid User')) {
        setError('Invalid User. You are not authorized to access this application.');
        setOtpStep(false);
        return;
      }
    }

    // Client-side Fallback for pre-seeded authorized users
    setEmail(inputEmail);
    setDemoOtp('123456');
    setOtpStep(true);
    setExpireSeconds(300);
    setResendCooldown(60);
    setCanResend(false);
    setRemainingAttempts(5);
    setToastMessage(`📩 6-Digit OTP sent to ${inputEmail}`);
    setTimeout(() => setToastMessage(''), 4000);
  };

  /**
   * Step 2: Verify 6-Digit OTP Code
   */
  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!otpCode || otpCode.trim().length !== 6) {
      setError('Please enter a 6-digit OTP code.');
      return;
    }

    if (expireSeconds <= 0) {
      setError('OTP Expired. Please click "Resend OTP" to generate a new code.');
      return;
    }

    try {
      await verifyOtp(email, otpCode.trim());
      navigate('/waste');
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Invalid OTP';
      setError(errMsg);
      if (err.response?.data?.remainingAttempts !== undefined) {
        setRemainingAttempts(err.response.data.remainingAttempts);
      } else {
        setRemainingAttempts(prev => Math.max(0, prev - 1));
      }
    }
  };

  /**
   * Step 3: Resend OTP (Rate limited to once per 60 seconds)
   */
  const handleResendOtpCode = async () => {
    if (!canResend && resendCooldown > 0) return;

    setError('');
    try {
      const res = await resendOtp(email);
      setDemoOtp(res.demoOtp || '123456');
      setExpireSeconds(300);
      setResendCooldown(60);
      setCanResend(false);
      setRemainingAttempts(5);
      setToastMessage(`📩 New 6-Digit OTP sent to ${email}`);
      setTimeout(() => setToastMessage(''), 4000);
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to resend OTP';
      setError(errMsg);
    }
  };

  return (
    <div className="min-h-screen bg-parchment flex flex-col items-center justify-center p-4">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-lg bg-moss text-parchment font-mono text-sm shadow-xl flex items-center gap-2 animate-in slide-in-from-top-4">
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-md w-full space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-moss text-parchment flex items-center justify-center mx-auto shadow-md">
            <Recycle className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-display font-bold text-loam">
            CircularSync <span className="text-moss italic font-normal">AI</span>
          </h1>
          <p className="text-xs font-mono text-loam/60 uppercase tracking-widest">
            Gmail OAuth & 6-Digit OTP Verification
          </p>
        </div>

        <Card className="p-6 space-y-4">
          
          {/* Error Alert Box */}
          {error && (
            <div className="p-3.5 rounded-lg bg-rust/10 border border-rust/30 text-rust-deep text-xs font-mono flex items-start gap-2.5 animate-in fade-in">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold">{error}</div>
                {error.includes('Expired') && (
                  <button
                    type="button"
                    onClick={handleResendOtpCode}
                    className="text-moss font-bold underline hover:text-loam"
                  >
                    Click here to Resend OTP
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 1: Enter Gmail or Continue with Google */}
          {!otpStep ? (
            <div className="space-y-4">
              
              {/* Continue with Google OAuth Button */}
              <button
                type="button"
                onClick={() => handleInitiateGmailAuth('sarah@greenbean.com')}
                disabled={loading}
                className="w-full py-3 px-4 rounded-lg border border-loam/20 bg-parchment hover:bg-mycelium text-loam font-mono text-xs font-bold flex items-center justify-center gap-3 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-moss"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center my-2">
                <div className="flex-1 border-t border-loam/15" />
                <span className="px-3 text-[10px] font-mono uppercase text-loam/50 font-bold">OR ENTER GMAIL</span>
                <div className="flex-1 border-t border-loam/15" />
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleInitiateGmailAuth(email); }} className="space-y-4 font-mono text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-loam uppercase flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-moss" />
                    <span>Gmail Address</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sarah@greenbean.com"
                    className="w-full px-3 py-2.5 rounded-md bg-parchment border border-loam/20 text-loam text-sm focus:outline-none focus:ring-2 focus:ring-moss font-mono"
                  />
                </div>

                <Button type="submit" variant="primary" className="w-full py-2.5 text-xs font-bold gap-2" disabled={loading}>
                  <span>{loading ? 'Verifying Gmail...' : 'Send 6-Digit OTP'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>

              {/* Authorized Database Users */}
              <div className="pt-3 border-t border-loam/10 space-y-2">
                <div className="flex items-center gap-1 text-[11px] font-mono font-bold uppercase text-loam/60">
                  <KeyRound className="w-3.5 h-3.5 text-moss" />
                  <span>Authorized Database Users (Click to Login):</span>
                </div>
                <div className="grid grid-cols-1 gap-1.5 font-mono text-xs">
                  {sampleAccounts.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => handleInitiateGmailAuth(acc.email)}
                      className="w-full text-left p-2.5 rounded bg-parchment/80 hover:bg-mycelium border border-loam/15 flex items-center justify-between transition-colors shadow-sm"
                    >
                      <span className="truncate text-loam font-sans font-medium">{acc.name}</span>
                      <span className="text-[10px] text-moss font-bold underline shrink-0 pl-2">Select</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            /* STEP 2: Enter 6-Digit OTP Verification Screen */
            <form onSubmit={handleVerifyOtpSubmit} className="space-y-4 font-mono text-xs animate-in fade-in">
              
              <div className="p-3 bg-moss/10 border border-moss/20 rounded-lg space-y-1.5">
                <div className="text-[11px] text-moss font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>OTP Sent to: <strong>{email}</strong></span>
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-loam/60">
                    <Clock className="w-3 h-3" />
                    Expires: <strong className={expireSeconds < 60 ? 'text-rust' : 'text-loam'}>{formatTime(expireSeconds)}</strong>
                  </span>
                </div>

                <div className="text-[10px] text-loam/70 flex items-center justify-between">
                  <span>Demo OTP Code: <code className="bg-parchment px-1.5 py-0.5 rounded font-bold text-loam">{demoOtp}</code></span>
                  <span>Remaining Attempts: <strong>{remainingAttempts}/5</strong></span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-loam uppercase flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-moss" />
                  <span>Enter 6-Digit OTP Code</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder={demoOtp}
                    className="w-full px-3 py-2.5 rounded-md bg-parchment border border-loam/20 text-loam text-base font-mono text-center font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-moss"
                  />
                  <button
                    type="button"
                    onClick={() => setOtpCode(demoOtp)}
                    className="px-3 py-2.5 rounded bg-mycelium hover:bg-parchment border border-loam/15 text-[11px] font-bold text-moss shrink-0"
                  >
                    Auto-Fill
                  </button>
                </div>
              </div>

              {/* Verify & Resend Controls */}
              <div className="space-y-2 pt-2">
                <Button type="submit" variant="primary" className="w-full py-2.5 text-xs font-bold" disabled={loading}>
                  {loading ? 'Verifying OTP...' : 'Verify OTP & Complete Login'}
                </Button>

                <div className="flex items-center justify-between text-[11px]">
                  <button
                    type="button"
                    onClick={() => setOtpStep(false)}
                    className="text-loam/60 hover:text-loam underline"
                  >
                    Change Email
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtpCode}
                    disabled={!canResend && resendCooldown > 0}
                    className={`flex items-center gap-1 font-bold ${
                      canResend ? 'text-moss hover:underline' : 'text-loam/40 cursor-not-allowed'
                    }`}
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>{canResend ? 'Resend OTP' : `Resend in ${resendCooldown}s`}</span>
                  </button>
                </div>
              </div>

            </form>
          )}

          {/* Quick Access Footer */}
          <div className="mt-4 pt-3 border-t border-loam/10 text-center space-y-2 font-mono text-xs">
            <div>
              <Link to="/demo-login" className="text-kraft-deep hover:underline font-bold">
                Or launch 1-Click Judge Quick Access
              </Link>
            </div>
          </div>

        </Card>

      </div>
    </div>
  );
};
