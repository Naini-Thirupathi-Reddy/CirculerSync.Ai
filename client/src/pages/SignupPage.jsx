import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Recycle, User, Mail, Lock, Building2, Eye, EyeOff, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

export const SignupPage = () => {
  const { signUp, loading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [orgName, setOrgName] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) { setError('Please enter your full name.'); return; }
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPw) { setError('Passwords do not match.'); return; }

    try {
      await signUp(name.trim(), email.trim(), password, orgName.trim());
      navigate('/waste');
    } catch (err) {
      setError(err.response?.data?.error || 'Sign up failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-parchment flex flex-col items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-6">

        {/* Logo + Heading */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-moss text-parchment flex items-center justify-center mx-auto shadow-lg">
            <Recycle className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-display font-bold text-loam">
            CircularSync <span className="text-moss italic font-normal">AI</span>
          </h1>
          <p className="text-xs font-mono text-loam/60 uppercase tracking-widest">
            Create your account
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

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div className="space-y-1.5">
              <label htmlFor="signup-name" className="text-xs font-mono font-semibold text-loam uppercase flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-moss" /> Full Name
              </label>
              <input
                id="signup-name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-3 py-2.5 rounded-lg bg-parchment border border-loam/20 text-loam text-sm font-mono placeholder:text-loam/40 focus:outline-none focus:ring-2 focus:ring-moss focus:border-moss transition-all"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="signup-email" className="text-xs font-mono font-semibold text-loam uppercase flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-moss" /> Email Address
              </label>
              <input
                id="signup-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2.5 rounded-lg bg-parchment border border-loam/20 text-loam text-sm font-mono placeholder:text-loam/40 focus:outline-none focus:ring-2 focus:ring-moss focus:border-moss transition-all"
              />
            </div>

            {/* Password fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="signup-password" className="text-xs font-mono font-semibold text-loam uppercase flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-moss" /> Password
                </label>
                <div className="relative">
                  <input
                    id="signup-password"
                    type={showPw ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-3 py-2.5 pr-10 rounded-lg bg-parchment border border-loam/20 text-loam text-sm font-mono placeholder:text-loam/40 focus:outline-none focus:ring-2 focus:ring-moss transition-all"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-loam/50 hover:text-loam" tabIndex={-1}>
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="signup-confirm" className="text-xs font-mono font-semibold text-loam uppercase flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-moss" /> Confirm Password
                </label>
                <input
                  id="signup-confirm"
                  type={showPw ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full px-3 py-2.5 rounded-lg bg-parchment border border-loam/20 text-loam text-sm font-mono placeholder:text-loam/40 focus:outline-none focus:ring-2 focus:ring-moss transition-all"
                />
              </div>
            </div>

            {/* Org name (optional) */}
            <div className="space-y-1.5">
              <label htmlFor="signup-org" className="text-xs font-mono font-semibold text-loam uppercase flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-moss" /> Organization Name <span className="text-loam/40">(optional)</span>
              </label>
              <input
                id="signup-org"
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Your business or org name"
                className="w-full px-3 py-2.5 rounded-lg bg-parchment border border-loam/20 text-loam text-sm font-mono placeholder:text-loam/40 focus:outline-none focus:ring-2 focus:ring-moss transition-all"
              />
            </div>

            {/* Submit */}
            <Button type="submit" variant="primary" className="w-full py-2.5 text-sm font-bold gap-2 mt-2" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-parchment/30 border-t-parchment rounded-full animate-spin" />
                  Creating Account…
                </span>
              ) : (
                <>Create Account <ArrowRight className="w-4 h-4" /></>
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
              Already have an account?{' '}
              <Link to="/login" className="text-moss font-bold hover:underline">
                Sign In
              </Link>
            </p>
            <div className="pt-2 border-t border-loam/10">
              <Link to="/demo-login" className="text-kraft-deep hover:underline font-bold flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Judge Quick Access (Demo)
              </Link>
            </div>
          </div>

        </Card>

        <p className="text-center text-[10px] font-mono text-loam/40 px-4">
          🔒 Passwords are hashed with bcrypt (12 rounds). Sessions use JWT tokens (24h expiry).
        </p>
      </div>
    </div>
  );
};
