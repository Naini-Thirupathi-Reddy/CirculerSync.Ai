import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { WasteCard } from '../components/waste/WasteCard';
import { WasteForm } from '../components/waste/WasteForm';
import { Button } from '../components/ui/Button';
import { Plus, Recycle, Filter, Sparkles, X } from 'lucide-react';
import api from '../services/api';

const DEFAULT_STREAMS = [
  {
    id: 'ws-1',
    rawDescription: '45kg fresh espresso coffee grounds, clean single-origin arabica substrate',
    wasteType: 'ORGANIC',
    subtype: 'nitrogen_rich',
    quantity: 45.0,
    unit: 'kg',
    frequency: 'DAILY',
    qualityGrade: 'GRADE_A',
    photoUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    pickupReadyAt: new Date(Date.now() + 3600000 * 2).toISOString(),
    status: 'ACTIVE',
    producer: { orgName: 'GreenBean Cafe & Bakery', lat: 40.7230, lng: -73.9985 },
  },
  {
    id: 'ws-2',
    rawDescription: '60kg spent coffee chaff and espresso grounds, pure nitrogen compost booster',
    wasteType: 'ORGANIC',
    subtype: 'nitrogen_rich',
    quantity: 60.0,
    unit: 'kg',
    frequency: 'DAILY',
    qualityGrade: 'GRADE_A',
    photoUrl: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=600&q=80',
    pickupReadyAt: new Date(Date.now() + 3600000 * 4).toISOString(),
    status: 'ACTIVE',
    producer: { orgName: 'Roasters Choice Coffee', lat: 40.7242, lng: -73.9968 },
  },
  {
    id: 'ws-3',
    rawDescription: '85kg clean corrugated cardboard boxes, unprinted packaging scraps',
    wasteType: 'CARDBOARD',
    subtype: 'corrugated',
    quantity: 85.0,
    unit: 'kg',
    frequency: 'WEEKLY',
    qualityGrade: 'GRADE_A',
    photoUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
    pickupReadyAt: new Date(Date.now() + 3600000 * 6).toISOString(),
    status: 'MATCHED',
    producer: { orgName: 'Craft Harvest Bistro', lat: 40.7208, lng: -74.0042 },
  },
  {
    id: 'ws-4',
    rawDescription: '30kg stale artisan bread scraps and flour sweepings',
    wasteType: 'ORGANIC',
    subtype: 'bakery_waste',
    quantity: 30.0,
    unit: 'kg',
    frequency: 'DAILY',
    qualityGrade: 'GRADE_B',
    photoUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    pickupReadyAt: new Date(Date.now() + 3600000 * 1).toISOString(),
    status: 'ACTIVE',
    producer: { orgName: 'Artisan Bakery Co', lat: 40.7235, lng: -73.9958 },
  },
  {
    id: 'ws-5',
    rawDescription: '120kg vegetable trimmings and fruit peels from prep kitchen',
    wasteType: 'ORGANIC',
    subtype: 'produce_waste',
    quantity: 120.0,
    unit: 'kg',
    frequency: 'DAILY',
    qualityGrade: 'GRADE_B',
    photoUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    pickupReadyAt: new Date(Date.now() + 3600000 * 5).toISOString(),
    status: 'ACTIVE',
    producer: { orgName: 'Urban Market Grocers', lat: 40.7248, lng: -73.9972 },
  },
  {
    id: 'ws-6',
    rawDescription: '150kg spent barley grain mash from craft brewing batch',
    wasteType: 'ORGANIC',
    subtype: 'brewery_waste',
    quantity: 150.0,
    unit: 'kg',
    frequency: 'BIWEEKLY',
    qualityGrade: 'GRADE_A',
    photoUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
    pickupReadyAt: new Date(Date.now() + 3600000 * 8).toISOString(),
    status: 'ACTIVE',
    producer: { orgName: 'EcoBrew Microbrewery', lat: 40.7212, lng: -73.9982 },
  },
];

export const WasteStreamsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wasteStreams, setWasteStreams] = useState(DEFAULT_STREAMS);
  const [loading, setLoading] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [filterType, setFilterType] = useState('ALL');
  const [toastMessage, setToastMessage] = useState('');

  const fetchStreams = async () => {
    try {
      const res = await api.get('/waste');
      if (res.data && res.data.length > 0) {
        setWasteStreams(res.data);
      }
    } catch (err) {
      console.warn('Using client fallback waste streams');
    }
  };

  useEffect(() => {
    fetchStreams();
  }, [user]);

  const handleCreated = (data) => {
    setShowLogModal(false);
    setToastMessage('Waste stream logged');
    if (data && data.wasteStream) {
      setWasteStreams(prev => [data.wasteStream, ...prev]);
    }
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/waste/${id}`);
    } catch (err) {
      console.warn(err);
    }
    setWasteStreams(prev => prev.filter(w => w.id !== id));
  };

  const filteredStreams = wasteStreams.filter(w => {
    if (filterType === 'ALL') return true;
    return w.wasteType === filterType;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-lg bg-moss text-parchment font-mono text-sm shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-4">
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-loam/10 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-loam">
            Waste Stream Intelligence
          </h1>
          <p className="text-xs font-mono text-loam/60 uppercase tracking-widest mt-1">
            Log raw materials & discard streams for neighborhood matching
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setShowLogModal(true)}
          className="gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Log waste stream</span>
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs font-mono">
        <span className="text-loam/60 flex items-center gap-1 font-bold">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter:</span>
        </span>
        {['ALL', 'ORGANIC', 'CARDBOARD', 'TEXTILE'].map(t => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3 py-1 rounded-full border transition-all ${
              filterType === t
                ? 'bg-moss text-parchment border-moss font-bold'
                : 'bg-mycelium text-loam border-loam/15 hover:border-moss'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Waste Stream Card Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-mycelium/40 animate-pulse rounded-lg border border-loam/10" />
          ))}
        </div>
      ) : filteredStreams.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-loam/20 rounded-xl space-y-3 bg-mycelium/30">
          <Recycle className="w-10 h-10 text-loam/40 mx-auto" />
          <h3 className="font-display font-bold text-lg text-loam">No waste streams yet</h3>
          <p className="text-xs font-mono text-loam/70 max-w-sm mx-auto">
            No waste streams yet. Log one to start matching.
          </p>
          <Button variant="primary" onClick={() => setShowLogModal(true)}>
            Log waste stream
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStreams.map(ws => (
            <WasteCard
              key={ws.id}
              wasteStream={ws}
              onViewMatches={(s) => navigate(`/matches?wasteId=${s.id}`)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-loam/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-mycelium border border-loam/20 rounded-xl p-6 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-loam/15">
              <h2 className="font-display font-bold text-xl text-loam">Log New Waste Stream</h2>
              <button
                onClick={() => setShowLogModal(false)}
                className="p-1 text-loam/60 hover:text-loam rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <WasteForm
              onSuccess={handleCreated}
              onCancel={() => setShowLogModal(false)}
            />
          </div>
        </div>
      )}

    </div>
  );
};
