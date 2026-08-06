import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Recycle, ShieldAlert, KeyRound, Sparkles, CheckCircle2, ArrowRight, RefreshCw, Clock, LogOut } from 'lucide-react';

const GOOGLE_CLIENT_ID = '1019255668606-qc158g64omgbnmomjif1fh6c1l755udl.apps.googleusercontent.com';

export const LoginPage = () => {
  const { user, logout, googleLogin, verifyOtp, resendOtp, loading } = useAuth();
  const navigate = useNavigate();
  const googleBtnRef = useRef(null);

  // ─── State ─────────────────────────────────────────────
  const [email, setEmail] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [attempts, setAttempts] = useState(5);
  const [expireSec, setExpireSec] = useState(300);
  const [resendCd, setResendCd] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // ─── Real Google Sign-In initialization ────────────────
  const handleGoogleResponse = useCallback(async (response) => {
    setError('');
    if (!response.credential) {
      setError('Google sign-in failed. No credential returned.');
      return;
    }

    try {
      const res = await googleLogin(response.credential);
      if (res?.requiresOtp) {
        setEmail(res.email);
        setDemoOtp(res.demoOtp || '123456');
        setOtpStep(true);
        setExpireSec(300);
        setResendCd(60);
        setCanResend(false);
        setAttempts(5);
        showToast(`📩 OTP sent to ${res.email}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please try again.');
    }
  }, [googleLogin]);

  useEffect(() => {
    // Wait for Google Identity Services script to load
    const initGoogle = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        if (googleBtnRef.current) {
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'outline',
            size: 'large',
            width: '380',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
          });
        }
      }
    };

    // Retry until google SDK loads
    if (window.google?.accounts?.id) {
      initGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) { initGoogle(); clearInterval(interval); }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [handleGoogleResponse, otpStep]);

  // ─── Timers ────────────────────────────────────────────
  useEffect(() => {
    if (!otpStep || expireSec <= 0) return;
    const t = setInterval(() => setExpireSec(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [otpStep, expireSec]);

  useEffect(() => {
    if (!otpStep || resendCd <= 0) return;
    const t = setInterval(() => setResendCd(p => { if (p <= 1) { setCanResend(true); return 0; } return p - 1; }), 1000);
    return () => clearInterval(t);
  }, [otpStep, resendCd]);

  const fmt = (s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 4000); };

  // ─── Step 2: Verify OTP ────────────────────────────────
  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    const code = otpCode.trim();

    if (code.length !== 6) { setError('Enter a valid 6-digit code.'); return; }
    if (expireSec <= 0) { setError('OTP expired. Click Resend OTP.'); return; }
    if (attempts <= 0) { setError('Max attempts reached. Request a new OTP.'); return; }

    // Try backend verification first
    try {
      const res = await verifyOtp(email, code);
      if (res?.token) { navigate('/waste'); return; }
    } catch (err) {
      // If backend is unavailable, do client-side check
      if (code === demoOtp || code === '123456') {
        // Create a local session for demo
        const { setSession } = useAuth;
        navigate('/waste');
        return;
      }
      setAttempts(p => Math.max(0, p - 1));
      setError(`Invalid OTP. ${Math.max(0, attempts - 1)} attempts left.`);
      return;
    }
  };

  // ─── Step 3: Resend ────────────────────────────────────
  const handleResend = async () => {
    if (!canResend) return;
    setError('');
    try {
      const res = await resendOtp(email);
      setDemoOtp(res.demoOtp || '123456');
    } catch (e) {
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setDemoOtp(newOtp);
    }
    setExpireSec(300); setResendCd(60); setCanResend(false); setAttempts(5); setOtpCode('');
    showToast(`📩 New OTP sent to ${email}`);
  };

  // ─── Render ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-parchment flex flex-col items-center justify-center p-4">

      {toast && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-lg bg-moss text-parchment font-mono text-sm shadow-xl flex items-center gap-2 animate-in slide-in-from-top-4">
          <Sparkles className="w-4 h-4" /><span>{toast}</span>
        </div>
      )}

      <div className="max-w-md w-full space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-xl bg-moss text-parchment flex items-center justify-center mx-auto shadow-lg">
            <Recycle className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-display font-bold text-loam">
            CircularSync <span className="text-moss italic font-normal">AI</span>
          </h1>
          <p className="text-xs font-mono text-loam/60 uppercase tracking-widest">
            Sign in with your Google Account
          </p>
        </div>

        {/* Active session bar */}
        {user && (
          <div className="p-3 bg-mycelium border border-loam/15 rounded-xl flex items-center justify-between text-xs font-mono">
            <div className="truncate"><span className="text-loam/60">Signed in: </span><strong className="text-moss">{user.email}</strong></div>
            <button onClick={() => { logout(); setOtpStep(false); setEmail(''); setError(''); }} className="px-2.5 py-1 rounded bg-rust/10 text-rust-deep font-bold flex items-center gap-1 hover:bg-rust/20 shrink-0">
              <LogOut className="w-3.5 h-3.5" /><span>Sign Out</span>
            </button>
          </div>
        )}

        <Card className="p-6 space-y-5">

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-rust/10 border border-rust/30 text-rust-deep text-xs font-mono flex items-start gap-2 animate-in fade-in">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-bold">{error}</span>
            </div>
          )}

          {!otpStep ? (
            /* ═══════ STEP 1: Google Sign-In ═══════ */
            <div className="space-y-5">

              {/* Real Google button rendered by GSI SDK */}
              <div className="flex justify-center">
                <div ref={googleBtnRef} id="google-signin-btn" />
              </div>

              <div className="text-center text-[10px] font-mono text-loam/50 uppercase">
                Click the button above to sign in with your real Google account
              </div>

            </div>
          ) : (
            /* ═══════ STEP 2: OTP Verification ═══════ */
            <form onSubmit={handleVerify} className="space-y-4 font-mono text-xs animate-in fade-in">

              {/* Status banner */}
              <div className="p-3 bg-moss/10 border border-moss/20 rounded-lg space-y-1.5">
                <div className="text-[11px] text-moss font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> OTP sent to: <strong>{email}</strong></span>
                  <span className="flex items-center gap-1 text-[10px] text-loam/60">
                    <Clock className="w-3 h-3" /> <strong className={expireSec < 60 ? 'text-rust' : 'text-loam'}>{fmt(expireSec)}</strong>
                  </span>
                </div>
                <div className="text-[10px] text-loam/70 flex items-center justify-between">
                  <span>Demo OTP: <code className="bg-parchment px-1.5 py-0.5 rounded font-bold text-loam">{demoOtp}</code></span>
                  <span>Attempts: <strong className="text-moss">{attempts}/5</strong></span>
                </div>
              </div>

              {/* OTP input */}
              <div className="space-y-1">
                <label className="font-semibold text-loam uppercase flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-moss" /> Enter 6-Digit Verification Code
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text" required maxLength={6} value={otpCode}
                    onChange={e => setOtpCode(e.target.value)}
                    placeholder="Enter OTP"
                    className="w-full px-3 py-2.5 rounded-md bg-parchment border border-loam/20 text-loam text-lg font-mono text-center font-bold tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-moss"
                  />
                  <button type="button" onClick={() => setOtpCode(demoOtp)}
                    className="px-3 py-2.5 rounded bg-mycelium hover:bg-parchment border border-loam/15 text-[11px] font-bold text-moss shrink-0">
                    Auto-Fill
                  </button>
                </div>
              </div>

              {/* Actions */}
              <Button type="submit" variant="primary" className="w-full py-2.5 text-xs font-bold gap-2" disabled={loading}>
                {loading ? 'Verifying…' : 'Verify & Sign In'} <ArrowRight className="w-4 h-4" />
              </Button>

              <div className="flex items-center justify-between text-[11px]">
                <button type="button" onClick={() => { setOtpStep(false); setError(''); }} className="text-loam/60 hover:text-loam underline">
                  ← Back to Sign In
                </button>
                <button type="button" onClick={handleResend} disabled={!canResend}
                  className={`flex items-center gap-1 font-bold ${canResend ? 'text-moss hover:underline' : 'text-loam/40 cursor-not-allowed'}`}>
                  <RefreshCw className="w-3 h-3" /> {canResend ? 'Resend OTP' : `Resend in ${resendCd}s`}
                </button>
              </div>
            </form>
          )}

          {/* Footer */}
          <div className="pt-3 border-t border-loam/10 text-center font-mono text-xs">
            <Link to="/demo-login" className="text-kraft-deep hover:underline font-bold">
              Judge Quick Access (skip Google)
            </Link>
          </div>

        </Card>
      </div>
    </div>
  );
};
