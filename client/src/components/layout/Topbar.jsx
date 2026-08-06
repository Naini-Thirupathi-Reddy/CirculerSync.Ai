import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Recycle, Sun, Moon, Bell, LogOut, Shield } from 'lucide-react';

export const Topbar = () => {
  const { user, logout, switchRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    switchRole(newRole);

    // Auto-navigate to role's primary landing page for clean data separation
    if (newRole === 'PRODUCER') {
      navigate('/waste');
    } else if (newRole === 'CONSUMER') {
      navigate('/matches');
    } else if (newRole === 'LOGISTICS') {
      navigate('/logistics');
    } else if (newRole === 'ADMIN') {
      navigate('/network');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-mycelium border-b border-loam/15 px-4 md:px-8 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md bg-mycelium/90">
      
      {/* Brand & Logo */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/waste')}>
        <div className="w-9 h-9 rounded-lg bg-moss text-parchment flex items-center justify-center shadow-sm">
          <Recycle className="w-5 h-5" />
        </div>
        <div className="hidden sm:block">
          <div className="font-display font-bold text-lg text-loam tracking-tight leading-none">
            CircularSync <span className="text-moss italic font-normal">AI</span>
          </div>
          <div className="font-mono text-[9px] text-loam/60 uppercase tracking-widest mt-0.5">
            Circular Economy Intelligence
          </div>
        </div>
      </div>

      {/* Center Role Selector */}
      <div className="flex items-center gap-2 bg-parchment px-3 py-1 rounded-lg border border-loam/15 shadow-sm">
        <Shield className="w-3.5 h-3.5 text-moss shrink-0" />
        <label className="text-[10px] font-mono font-bold uppercase text-loam/60 hidden sm:inline">Role:</label>
        <select
          value={user?.role || 'PRODUCER'}
          onChange={handleRoleChange}
          className="bg-transparent font-mono text-xs font-bold text-loam focus:outline-none cursor-pointer"
        >
          <option value="PRODUCER">PRODUCER (Cafe/Bakery)</option>
          <option value="CONSUMER">CONSUMER (Urban Farm/Mushroom)</option>
          <option value="LOGISTICS">LOGISTICS (Eco Driver)</option>
          <option value="ADMIN">ADMIN (Community Manager)</option>
        </select>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-loam/80 hover:bg-parchment transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Badge */}
        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-loam/15">
            <div className="w-8 h-8 rounded-full bg-kraft/20 border border-kraft/40 text-kraft-deep font-mono text-xs font-bold flex items-center justify-center">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden lg:block text-left font-mono">
              <div className="text-xs font-bold text-loam truncate max-w-[120px]">{user.orgName || user.name}</div>
              <div className="text-[9px] text-loam/60 truncate max-w-[120px]">{user.email}</div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-loam/60 hover:text-rust transition-colors ml-1"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>

    </header>
  );
};
