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
    <div className="min-h-screen bg-parchment flex flex-col items-center justify-center p-4 md:p-8 selection:bg-kraft">
      <div className="max-w-3xl w-full space-y-8 text-center">
        
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-moss/10 text-moss font-mono text-xs font-semibold border border-moss/20">
            <Recycle className="w-4 h-4 animate-spin-slow" />
            Hackathon Judge Quick Access
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-loam tracking-tight">
            CircularSync <span className="text-moss italic font-normal">AI</span>
          </h1>
          <p className="text-sm font-sans text-loam/80 max-w-xl mx-auto leading-relaxed">
            Select a persona below to explore the AI-powered circular economy platform in action. No credentials required.
          </p>
        </div>

        {/* Persona Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          {personas.map((p) => {
            const Icon = p.icon;
            return (
              <Card key={p.role} className="flex flex-col justify-between p-6 space-y-4 hover:border-moss transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-lg border ${p.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-loam/60">
                      {p.role}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-xl text-loam">{p.title}</h3>
                    <div className="font-mono text-xs text-moss font-semibold">{p.subtitle}</div>
                  </div>

                  <p className="text-xs text-loam/70 font-sans leading-relaxed">
                    {p.description}
                  </p>
                </div>

                <Button
                  variant="primary"
                  className="w-full justify-between mt-2"
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
        <div className="pt-4 text-xs font-mono text-loam/50 flex items-center justify-center gap-4">
          <span>Keyless Open-Meteo Weather API</span>
          <span>•</span>
          <span>D3 Force Network</span>
          <span>•</span>
          <span>Leaflet OSM</span>
        </div>

      </div>
    </div>
  );
};
