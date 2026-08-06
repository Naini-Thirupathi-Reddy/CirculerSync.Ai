import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Recycle, ArrowRight, ShieldAlert } from 'lucide-react';

export const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('PRODUCER');
  const [orgName, setOrgName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const { signup, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signup({
        name,
        email,
        password,
        role,
        orgName: orgName || name,
        address: address || 'New York, NY',
        phone: phone || '+1 212-555-0199',
      });
      navigate('/waste');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-parchment flex flex-col items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-moss text-parchment flex items-center justify-center mx-auto shadow-md">
            <Recycle className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-display font-bold text-loam">
            CircularSync <span className="text-moss italic font-normal">AI</span>
          </h1>
          <p className="text-xs font-mono text-loam/60 uppercase tracking-widest">
            Register your organization in the neighborhood loop
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
            {error && (
              <div className="p-3 rounded bg-rust/10 border border-rust/30 text-rust-deep font-mono flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-mono font-semibold text-loam uppercase">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sarah Jenkins"
                  className="w-full px-3 py-2 rounded-md bg-parchment border border-loam/20 text-loam text-sm focus:outline-none focus:ring-2 focus:ring-moss font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono font-semibold text-loam uppercase">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah@greenbean.com"
                  className="w-full px-3 py-2 rounded-md bg-parchment border border-loam/20 text-loam text-sm focus:outline-none focus:ring-2 focus:ring-moss font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-mono font-semibold text-loam uppercase">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-md bg-parchment border border-loam/20 text-loam text-sm focus:outline-none focus:ring-2 focus:ring-moss font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono font-semibold text-loam uppercase">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-parchment border border-loam/20 text-loam text-xs font-mono focus:outline-none focus:ring-2 focus:ring-moss"
                >
                  <option value="PRODUCER">Waste Producer (Cafe/Restaurant/Retailer)</option>
                  <option value="CONSUMER">Resource Consumer (Urban Farm/Mushroom Grower)</option>
                  <option value="LOGISTICS">Logistics Partner (Driver)</option>
                  <option value="ADMIN">Community Manager (Admin)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-mono font-semibold text-loam uppercase">Organization Name</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="GreenBean Cafe & Bakery"
                className="w-full px-3 py-2 rounded-md bg-parchment border border-loam/20 text-loam text-sm focus:outline-none focus:ring-2 focus:ring-moss font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-mono font-semibold text-loam uppercase">Business Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="142 Mercer St, New York, NY 10012"
                className="w-full px-3 py-2 rounded-md bg-parchment border border-loam/20 text-loam text-sm focus:outline-none focus:ring-2 focus:ring-moss font-mono"
              />
            </div>

            <Button type="submit" variant="primary" className="w-full text-sm py-2.5 mt-2" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-loam/10 text-center space-y-2 font-mono text-xs">
            <div>
              Already have an account?{' '}
              <Link to="/login" className="text-moss font-bold hover:underline">
                Sign In
              </Link>
            </div>
            <div>
              <Link to="/demo-login" className="text-kraft-deep hover:underline">
                Or launch 1-Click Judge Demo Login
              </Link>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
};
