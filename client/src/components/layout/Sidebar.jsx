import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FilePlus2,
  Sparkles,
  TrendingUp,
  Truck,
  MapPin,
  BarChart3,
  Network,
} from 'lucide-react';

export const Sidebar = () => {
  const sections = [
    {
      title: 'Log & Match',
      items: [
        { path: '/waste', label: 'Waste Streams', icon: FilePlus2 },
        { path: '/matches', label: 'AI Matches', icon: Sparkles },
        { path: '/forecasts', label: 'Waste Forecasts', icon: TrendingUp },
      ],
    },
    {
      title: 'Move',
      items: [
        { path: '/logistics', label: 'Pickup Jobs', icon: Truck },
        { path: '/logistics/map', label: 'Route Map', icon: MapPin },
      ],
    },
    {
      title: 'Measure',
      items: [
        { path: '/impact', label: 'Impact Intelligence', icon: BarChart3 },
        { path: '/network', label: 'Community Network', icon: Network },
      ],
    },
  ];

  return (
    <>
      {/* Desktop Sidebar (Left) */}
      <aside className="hidden md:flex flex-col w-64 bg-mycelium/60 border-r border-loam/10 p-4 space-y-6 shrink-0 min-h-[calc(100vh-4rem)]">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <h3 className="px-3 text-[11px] font-mono font-bold uppercase tracking-widest text-loam/50">
              {section.title}
            </h3>
            <nav className="space-y-1 pt-1">
              {section.items.map(item => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/waste' || item.path === '/logistics'}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-sans font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-moss text-parchment shadow-sm font-semibold'
                          : 'text-loam hover:bg-parchment hover:text-moss-deep'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        ))}
      </aside>

      {/* Mobile Bottom Tab Bar (<375px & mobile screens) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-mycelium border-t border-loam/15 z-40 flex items-center justify-around px-2 text-[10px] font-mono">
        <NavLink
          to="/waste"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 p-1 ${isActive ? 'text-moss font-bold' : 'text-loam/70'}`
          }
        >
          <FilePlus2 className="w-4 h-4" />
          <span>Waste</span>
        </NavLink>

        <NavLink
          to="/matches"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 p-1 ${isActive ? 'text-moss font-bold' : 'text-loam/70'}`
          }
        >
          <Sparkles className="w-4 h-4" />
          <span>Matches</span>
        </NavLink>

        <NavLink
          to="/logistics"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 p-1 ${isActive ? 'text-moss font-bold' : 'text-loam/70'}`
          }
        >
          <Truck className="w-4 h-4" />
          <span>Move</span>
        </NavLink>

        <NavLink
          to="/impact"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 p-1 ${isActive ? 'text-moss font-bold' : 'text-loam/70'}`
          }
        >
          <BarChart3 className="w-4 h-4" />
          <span>Impact</span>
        </NavLink>

        <NavLink
          to="/network"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 p-1 ${isActive ? 'text-moss font-bold' : 'text-loam/70'}`
          }
        >
          <Network className="w-4 h-4" />
          <span>Network</span>
        </NavLink>
      </nav>
    </>
  );
};
