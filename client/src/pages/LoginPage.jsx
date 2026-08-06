import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Recycle, ArrowRight, ShieldAlert, KeyRound, UserCheck } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const sampleAccounts = [
    { role: 'PRODUCER', email: 'sarah@greenbean.com', name: 'Waste Producer (GreenBean Cafe)' },
    { role: 'CONSUMER', email: 'aris@cityfarm.org', name: 'Resource Consumer (City Farm)' },
    { role: 'LOGISTICS', email: 'driver@circularsync.com', name: 'Logistics Partner (Driver)' },
    { role: 'ADMIN', email: 'admin@circularsync.com', name: 'Community Manager (Admin)' },
  ];

  const handleQuickFill = (accEmail) => {
    setEmail(accEmail);
    setPassword('demo1234');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/waste');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-parchment flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-moss text-parchment flex items-center justify-center mx-auto shadow-md">
            <Recycle className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-display font-bold text-loam">
            CircularSync <span className="text-moss italic font-normal">AI</span>
          </h1>
          <p className="text-xs font-mono text-loam/60 uppercase tracking-widest">
            Sign in to your organization account
          </p>
        </div>

        <Card className="p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded bg-rust/10 border border-rust/30 text-rust-deep text-xs font-mono flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-mono font-semibold text-loam uppercase">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah@greenbean.com"
                className="w-full px-3 py-2 rounded-md bg-parchment border border-loam/20 text-loam text-sm focus:outline-none focus:ring-2 focus:ring-moss font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono font-semibold text-loam uppercase">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-md bg-parchment border border-loam/20 text-loam text-sm focus:outline-none focus:ring-2 focus:ring-moss font-mono"
              />
            </div>

            <Button type="submit" variant="primary" className="w-full py-2.5 text-sm" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </Button>
          </form>

          {/* Quick Account Fill Selector */}
          <div className="pt-3 border-t border-loam/10 space-y-2">
            <div className="flex items-center gap-1 text-[11px] font-mono font-bold uppercase text-loam/60">
              <KeyRound className="w-3.5 h-3.5 text-moss" />
              <span>Pre-Seeded User Test Credentials (Password: demo1234):</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5 font-mono text-xs">
              {sampleAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleQuickFill(acc.email)}
                  className="w-full text-left p-2 rounded bg-parchment/70 hover:bg-mycelium border border-loam/10 flex items-center justify-between transition-colors"
                >
                  <span className="truncate text-loam font-sans font-medium">{acc.name}</span>
                  <span className="text-[10px] text-moss font-bold underline shrink-0 pl-2">Fill</span>
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
