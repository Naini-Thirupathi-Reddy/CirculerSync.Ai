import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Bell, Recycle, UserCheck, ChevronDown, LogOut } from 'lucide-react';
import api from '../../services/api';

export const Topbar = () => {
  const { user, switchRole, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  useEffect(() => {
    if (user) {
      api.get('/notifications')
        .then(res => setNotifications(res.data))
        .catch(err => console.error(err));
    }
  }, [user]);

  const roles = [
    { key: 'PRODUCER', label: 'Waste Producer' },
    { key: 'CONSUMER', label: 'Resource Consumer' },
    { key: 'LOGISTICS', label: 'Logistics Partner' },
    { key: 'ADMIN', label: 'Community Admin' },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-16 bg-mycelium/80 backdrop-blur border-b border-loam/10 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
      
      {/* Left: Platform Logo & Title */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-moss flex items-center justify-center text-parchment shadow-sm">
          <Recycle className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-display font-bold text-lg leading-none tracking-tight text-loam">
            CircularSync <span className="text-moss italic font-normal">AI</span>
          </h1>
          <p className="text-[10px] font-mono text-loam/60 uppercase tracking-widest">
            Circular Economy Intelligence
          </p>
        </div>
      </div>

      {/* Right: Actions (Role Switcher, Notifications, Theme, User) */}
      <div className="flex items-center gap-2 md:gap-4">
        
        {/* Role Switcher */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-parchment border border-loam/15 text-xs font-mono font-medium hover:border-moss transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-moss animate-pulse" />
              <span className="hidden sm:inline text-loam/70">Role:</span>
              <span className="font-bold text-moss">{user.role}</span>
              <ChevronDown className="w-3.5 h-3.5 text-loam/60" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-mycelium border border-loam/15 rounded-lg shadow-xl py-1 z-40 animate-in fade-in">
                <div className="px-3 py-1.5 text-[10px] font-mono uppercase text-loam/50 font-bold border-b border-loam/10">
                  Switch Active Persona
                </div>
                {roles.map(r => (
                  <button
                    key={r.key}
                    onClick={() => {
                      switchRole(r.key);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-mono flex items-center justify-between hover:bg-parchment transition-colors ${
                      user.role === r.key ? 'text-moss font-bold bg-parchment/60' : 'text-loam'
                    }`}
                  >
                    <span>{r.label}</span>
                    {user.role === r.key && <UserCheck className="w-3.5 h-3.5 text-moss" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md hover:bg-parchment text-loam transition-colors"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-kraft" />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="p-2 rounded-md hover:bg-parchment text-loam relative transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rust animate-ping" />
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 bg-mycelium border border-loam/15 rounded-lg shadow-xl p-3 z-40 animate-in fade-in text-xs font-mono">
              <div className="flex items-center justify-between pb-2 border-b border-loam/10 font-bold">
                <span>Activity Feed</span>
                <span className="text-[10px] text-moss">{notifications.length} updates</span>
              </div>
              <div className="max-h-60 overflow-y-auto divide-y divide-loam/10 py-1">
                {notifications.map(n => (
                  <div key={n.id} className="py-2 space-y-0.5">
                    <p className="text-loam text-[11px] font-sans">{n.message}</p>
                    <p className="text-[9px] text-loam/50">{new Date(n.createdAt).toLocaleTimeString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Info / Logout */}
        {user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-loam/15">
            <div className="w-8 h-8 rounded-full bg-kraft/30 border border-kraft text-kraft-deep font-mono font-bold flex items-center justify-center text-xs">
              {user.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="hidden md:block text-xs leading-tight">
              <div className="font-bold text-loam truncate max-w-[120px]">{user.orgName || user.name}</div>
              <div className="text-[10px] font-mono text-loam/60">{user.email}</div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-loam/60 hover:text-rust hover:bg-parchment rounded transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : null}

      </div>
    </header>
  );
};
