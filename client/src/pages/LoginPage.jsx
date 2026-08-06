import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Recycle, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

export const LoginPage = () => {
  const { signIn, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      await signIn(email.trim(), password);
      navigate('/waste');
    } catch (err) {
      setError(err.response?.data?.error || 'Sign in failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-parchment flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">

        {/* Logo + Heading */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-moss text-parchment flex items-center justify-center mx-auto shadow-lg">
            <Recycle className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-display font-bold text-loam">
            CircularSync <span className="text-moss italic font-normal">AI</span>
          </h1>
          <p className="text-xs font-mono text-loam/60 uppercase tracking-widest">
            Sign in to your account
          </p>
        </div>

        <Card className="p-6 space-y-5">

          {/* Error banner */}
          {error && (
            <div className="p-3 rounded-lg bg-rust/10 border border-rust/30 text-rust-deep text-xs font-mono flex items-start gap-2 animate-in fade-in">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-bold">{error}</span>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="text-xs font-mono font-semibold text-loam uppercase flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-moss" /> Email Address
              </label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2.5 rounded-lg bg-parchment border border-loam/20 text-loam text-sm font-mono placeholder:text-loam/40 focus:outline-none focus:ring-2 focus:ring-moss focus:border-moss transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="login-password" className="text-xs font-mono font-semibold text-loam uppercase flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-moss" /> Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3 py-2.5 pr-10 rounded-lg bg-parchment border border-loam/20 text-loam text-sm font-mono placeholder:text-loam/40 focus:outline-none focus:ring-2 focus:ring-moss focus:border-moss transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-loam/50 hover:text-loam transition-colors"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button type="submit" variant="primary" className="w-full py-2.5 text-sm font-bold gap-2" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-parchment/30 border-t-parchment rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-loam/10" />
            <span className="text-[10px] font-mono text-loam/40 uppercase">or</span>
            <div className="flex-1 border-t border-loam/10" />
          </div>

          {/* Links */}
          <div className="space-y-3 text-center font-mono text-xs">
            <p className="text-loam/60">
              Don't have an account?{' '}
              <Link to="/signup" className="text-moss font-bold hover:underline">
                Create Account
              </Link>
            </p>
            <div className="pt-2 border-t border-loam/10">
              <Link to="/demo-login" className="text-kraft-deep hover:underline font-bold flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Judge Quick Access (Demo)
              </Link>
            </div>
          </div>

        </Card>

        {/* Security note */}
        <p className="text-center text-[10px] font-mono text-loam/40 px-4">
          🔒 Passwords are hashed with bcrypt. Sessions use JWT tokens (24h expiry).
        </p>
      </div>
    </div>
  );
};
