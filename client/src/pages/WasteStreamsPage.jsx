import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { WasteCard } from '../components/waste/WasteCard';
import { WasteForm } from '../components/waste/WasteForm';
import { Button } from '../components/ui/Button';
import { Plus, Recycle, Filter, Sparkles, X } from 'lucide-react';
import api from '../services/api';

export const WasteStreamsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wasteStreams, setWasteStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [filterType, setFilterType] = useState('ALL');
  const [toastMessage, setToastMessage] = useState('');

  const fetchStreams = async () => {
    setLoading(true);
    try {
      const res = await api.get('/waste');
      setWasteStreams(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreams();
  }, [user]);

  const handleCreated = (data) => {
    setShowLogModal(false);
    setToastMessage('Waste stream logged');
    fetchStreams();
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/waste/${id}`);
      setWasteStreams(prev => prev.filter(w => w.id !== id));
    } catch (err) {
      console.error(err);
    }
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
        /* Empty State per Section 3 Voice Rule */
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
              onDelete={user?.role === 'PRODUCER' || user?.role === 'ADMIN' ? handleDelete : null}
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
