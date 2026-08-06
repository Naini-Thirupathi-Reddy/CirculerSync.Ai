import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Recycle, ShieldAlert, KeyRound, Mail, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [otpStep, setOtpStep] = useState(false); // false: Enter Email, true: Enter OTP
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('123456');
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const { login, googleLogin, loading } = useAuth();
  const navigate = useNavigate();

  const sampleAccounts = [
    { role: 'PRODUCER', email: 'sarah@greenbean.com', name: 'Waste Producer (GreenBean Cafe)' },
    { role: 'CONSUMER', email: 'aris@cityfarm.org', name: 'Resource Consumer (City Farm)' },
    { role: 'LOGISTICS', email: 'driver@circularsync.com', name: 'Logistics Partner (Driver)' },
    { role: 'ADMIN', email: 'admin@circularsync.com', name: 'Community Manager (Admin)' },
  ];

  const handleSendOtp = (e) => {
    e.preventDefault();
    setError('');

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      setError('Invalid Gmail / Email address format. Please enter a valid email.');
      return;
    }

    // Generate random 6-digit OTP code
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomOtp);
    setOtpStep(true);

    setToastMessage(`📩 Verification OTP sent to ${email} (Demo OTP: ${randomOtp})`);
  };

  const handleVerifyOtpAndLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (otpCode.trim() !== generatedOtp && otpCode.trim() !== '123456') {
      setError(`Invalid OTP code. Please enter the 6-digit code sent to your email (${generatedOtp}).`);
      return;
    }

    await login(email || 'sarah@greenbean.com', 'demo1234');
    navigate('/waste');
  };

  const handleQuickFillAccount = async (accEmail) => {
    setEmail(accEmail);
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomOtp);
    setOtpCode(randomOtp);
    setOtpStep(true);
    await login(accEmail, 'demo1234');
    navigate('/waste');
  };

  const handleGoogleSignIn = async () => {
    await googleLogin('user.gmail@gmail.com', 'Google User');
    navigate('/waste');
  };

  return (
    <div className="min-h-screen bg-parchment flex flex-col items-center justify-center p-4">
      
      {/* Toast Notification for OTP Delivery */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-lg bg-moss text-parchment font-mono text-sm shadow-xl flex items-center gap-2 animate-in slide-in-from-top-4">
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-md w-full space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-moss text-parchment flex items-center justify-center mx-auto shadow-md">
            <Recycle className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-display font-bold text-loam">
            CircularSync <span className="text-moss italic font-normal">AI</span>
          </h1>
          <p className="text-xs font-mono text-loam/60 uppercase tracking-widest">
            Gmail OTP Verification & Sign In
          </p>
        </div>

        <Card className="p-6 space-y-4">
          
          {/* Single-Click Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-md border border-loam/20 bg-parchment hover:bg-mycelium text-loam font-mono text-xs font-bold flex items-center justify-center gap-3 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-moss"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google / Gmail</span>
          </button>

          <div className="flex items-center my-2">
            <div className="flex-1 border-t border-loam/15" />
            <span className="px-3 text-[10px] font-mono uppercase text-loam/50 font-bold">OR EMAIL OTP</span>
            <div className="flex-1 border-t border-loam/15" />
          </div>

          {error && (
            <div className="p-3 rounded bg-rust/10 border border-rust/30 text-rust-deep text-xs font-mono flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Enter Gmail Address */}
          {!otpStep ? (
            <form onSubmit={handleSendOtp} className="space-y-4 font-mono text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-loam uppercase flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-moss" />
                  <span>Enter Gmail / Email Address</span>
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

              <Button type="submit" variant="primary" className="w-full py-2.5 text-xs font-bold gap-2">
                <span>Send OTP Verification Code</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          ) : (
            /* STEP 2: Enter 6-Digit Verification OTP */
            <form onSubmit={handleVerifyOtpAndLogin} className="space-y-4 font-mono text-xs animate-in fade-in">
              <div className="p-3 bg-moss/10 border border-moss/20 rounded-lg space-y-1">
                <div className="text-[11px] text-moss font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>OTP Sent to: <strong>{email}</strong></span>
                </div>
                <div className="text-[10px] text-loam/70">
                  Demo Verification OTP: <code className="bg-parchment px-1.5 py-0.5 rounded font-bold text-loam">{generatedOtp}</code>
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
                    placeholder={generatedOtp}
                    className="w-full px-3 py-2.5 rounded-md bg-parchment border border-loam/20 text-loam text-base font-mono text-center font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-moss"
                  />
                  <button
                    type="button"
                    onClick={() => setOtpCode(generatedOtp)}
                    className="px-3 py-2.5 rounded bg-mycelium hover:bg-parchment border border-loam/15 text-[11px] font-bold text-moss shrink-0"
                  >
                    Auto-Fill
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOtpStep(false)}
                  className="w-1/3 py-2.5 rounded border border-loam/20 text-loam/70 hover:text-loam font-bold text-xs"
                >
                  Change Email
                </button>

                <Button type="submit" variant="primary" className="w-2/3 py-2.5 text-xs font-bold">
                  Verify OTP & Sign In
                </Button>
              </div>
            </form>
          )}

          {/* Quick Account Fill Selector */}
          <div className="pt-3 border-t border-loam/10 space-y-2">
            <div className="flex items-center gap-1 text-[11px] font-mono font-bold uppercase text-loam/60">
              <KeyRound className="w-3.5 h-3.5 text-moss" />
              <span>Pre-Seeded Demo Accounts (Click to Fill & Login):</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5 font-mono text-xs">
              {sampleAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleQuickFillAccount(acc.email)}
                  className="w-full text-left p-2.5 rounded bg-parchment/80 hover:bg-mycelium border border-loam/15 flex items-center justify-between transition-colors shadow-sm"
                >
                  <span className="truncate text-loam font-sans font-medium">{acc.name}</span>
                  <span className="text-[10px] text-moss font-bold underline shrink-0 pl-2">Sign In</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-loam/10 text-center space-y-2 font-mono text-xs">
            <div>
              Don't have an account?{' '}
              <Link to="/signup" className="text-moss font-bold hover:underline">
                Create Account
              </Link>
            </div>
            <div>
              <Link to="/demo-login" className="text-kraft-deep hover:underline">
                Or launch 1-Click Judge Quick Access
              </Link>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
};
