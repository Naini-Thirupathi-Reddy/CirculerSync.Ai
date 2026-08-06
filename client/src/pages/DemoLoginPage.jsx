import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Recycle, Factory, Sprout, Truck, ShieldCheck, ArrowRight } from 'lucide-react';

export const DemoLoginPage = () => {
  const { demoLogin, loading } = useAuth();
  const navigate = useNavigate();

  const handleDemoSelect = async (role) => {
    try {
      await demoLogin(role);
      navigate('/waste');
    } catch (err) {
      console.error(err);
      navigate('/waste');
    }
  };

  const personas = [
    {
      role: 'PRODUCER',
      title: 'Waste Producer',
      subtitle: 'GreenBean Cafe & Bakery',
      description: 'Log food scraps, coffee grounds, and cardboard to trigger neighborhood resource matching.',
      icon: Factory,
      color: 'bg-moss/20 text-moss border-moss/30',
    },
    {
      role: 'CONSUMER',
      title: 'Resource Consumer',
      subtitle: 'City Farm / Mushroom Grower',
      description: 'Set material intake specifications, match with nearby producers, and request pickups.',
      icon: Sprout,
      color: 'bg-kraft/20 text-kraft-deep border-kraft/30',
    },
    {
      role: 'LOGISTICS',
      title: 'Logistics Driver',
      subtitle: 'Swift Eco Logistics',
      description: 'View optimized spatial cluster routes, pick up raw materials, and track deliveries.',
      icon: Truck,
      color: 'bg-rust/20 text-rust-deep border-rust/30',
    },
    {
      role: 'ADMIN',
      title: 'Community Manager',
      subtitle: 'Circular Economy Hub Director',
      description: 'Monitor neighborhood material flows, ecosystem symbiosis gaps, and CO2 ESG metrics.',
      icon: ShieldCheck,
      color: 'bg-loam/20 text-loam border-loam/30',
    },
  ];

  return (
    <div className="min-h-screen bg-parchment flex flex-col items-center justify-center p-3 sm:p-6 selection:bg-kraft overflow-x-hidden">
      <div className="max-w-3xl w-full space-y-6 sm:space-y-8 text-center">
        
        {/* Header */}
        <div className="space-y-2 sm:space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-moss/10 text-moss font-mono text-[11px] font-semibold border border-moss/20">
            <Recycle className="w-3.5 h-3.5 animate-spin-slow" />
            Hackathon Judge Quick Access
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-bold text-loam tracking-tight">
            CircularSync <span className="text-moss italic font-normal">AI</span>
          </h1>
          <p className="text-xs sm:text-sm font-sans text-loam/80 max-w-xl mx-auto leading-relaxed px-2">
            Select a persona below to explore the AI-powered circular economy platform in action. No credentials required.
          </p>
        </div>

        {/* Persona Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-left px-1">
          {personas.map((p) => {
            const Icon = p.icon;
            return (
              <Card key={p.role} className="flex flex-col justify-between p-4 sm:p-6 space-y-3 hover:border-moss transition-all">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 sm:p-2.5 rounded-lg border ${p.color}`}>
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-loam/60">
                      {p.role}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-lg sm:text-xl text-loam">{p.title}</h3>
                    <div className="font-mono text-xs text-moss font-semibold">{p.subtitle}</div>
                  </div>

                  <p className="text-xs text-loam/70 font-sans leading-relaxed">
                    {p.description}
                  </p>
                </div>

                <Button
                  variant="primary"
                  className="w-full justify-between mt-2 py-2.5 text-xs font-mono font-bold active:scale-95 touch-manipulation"
                  disabled={loading}
                  onClick={() => handleDemoSelect(p.role)}
                >
                  <span>Launch as {p.title}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Card>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-2 text-[10px] font-mono text-loam/50 flex items-center justify-center gap-3">
          <span>Open-Meteo API</span>
          <span>•</span>
          <span>D3 Force Network</span>
          <span>•</span>
          <span>Leaflet OSM</span>
        </div>

      </div>
    </div>
  );
};
