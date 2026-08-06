import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Recycle,
  Sparkles,
  TrendingUp,
  Truck,
  BarChart3,
  Network,
  Map,
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role || 'PRODUCER';

  // Role-specific navigation items
  const allNavItems = [
    {
      title: 'Log & Match',
      roles: ['PRODUCER', 'ADMIN'],
      items: [
        { label: 'Waste Streams', path: '/waste', icon: Recycle, roles: ['PRODUCER', 'ADMIN'] },
        { label: 'AI Matches', path: '/matches', icon: Sparkles, roles: ['PRODUCER', 'CONSUMER', 'ADMIN'] },
        { label: 'Waste Forecasts', path: '/forecasts', icon: TrendingUp, roles: ['PRODUCER', 'ADMIN'] },
      ],
    },
    {
      title: 'Resource Intake',
      roles: ['CONSUMER'],
      items: [
        { label: 'Incoming Matches', path: '/matches', icon: Sparkles, roles: ['CONSUMER'] },
        { label: 'Available Streams', path: '/waste', icon: Recycle, roles: ['CONSUMER'] },
      ],
    },
    {
      title: 'Logistics & Dispatch',
      roles: ['LOGISTICS', 'ADMIN'],
      items: [
        { label: 'Pickup Jobs', path: '/logistics', icon: Truck, roles: ['LOGISTICS', 'ADMIN'] },
        { label: 'Route Map', path: '/logistics/map', icon: Map, roles: ['LOGISTICS', 'ADMIN'] },
      ],
    },
    {
      title: 'Impact & Network',
      roles: ['PRODUCER', 'CONSUMER', 'LOGISTICS', 'ADMIN'],
      items: [
        { label: 'Impact Intelligence', path: '/impact', icon: BarChart3, roles: ['PRODUCER', 'CONSUMER', 'ADMIN'] },
        { label: 'Community Network', path: '/network', icon: Network, roles: ['CONSUMER', 'ADMIN'] },
      ],
    },
  ];

  // Filter sections by role
  const visibleSections = allNavItems
    .map(section => ({
      ...section,
      items: section.items.filter(item => item.roles.includes(role)),
    }))
    .filter(section => section.items.length > 0);

  return (
    <aside className="w-64 bg-mycelium/60 border-r border-loam/15 min-h-[calc(100vh-4rem)] p-4 hidden md:flex flex-col justify-between shrink-0">
      
      <div className="space-y-6">
        
        {/* Role Badge Header */}
        <div className="p-3 rounded-lg bg-parchment border border-loam/15 font-mono text-xs">
          <div className="text-[10px] text-loam/60 font-bold uppercase">Active Dashboard Mode</div>
          <div className="text-moss font-bold text-sm mt-0.5 truncate">{user?.orgName || 'Organization'}</div>
          <div className="text-[11px] text-kraft-deep font-bold mt-0.5 uppercase tracking-wider">{role}</div>
        </div>

        {/* Dynamic Navigation Sections */}
        <nav className="space-y-6">
          {visibleSections.map((group, idx) => (
            <div key={idx} className="space-y-2">
              <div className="text-[10px] font-mono font-bold text-loam/50 uppercase tracking-wider px-2">
                {group.title}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg font-sans text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-moss text-parchment shadow-sm font-bold'
                            : 'text-loam/80 hover:bg-parchment hover:text-loam'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

      </div>

      {/* Footer Branding */}
      <div className="pt-4 border-t border-loam/15 font-mono text-[10px] text-loam/50 flex items-center justify-between">
        <span>CircularSync AI</span>
        <span>v1.0</span>
      </div>

    </aside>
  );
};
