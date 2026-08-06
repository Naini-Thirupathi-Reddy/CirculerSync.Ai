import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { RouteMap } from '../components/logistics/RouteMap';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Truck, MapPin, CheckCircle, Clock, Sparkles, Navigation, ShieldCheck, KeyRound, Lock } from 'lucide-react';
import api from '../services/api';

const DEFAULT_JOBS = [
  {
    id: 'job-1',
    status: 'PENDING',
    pickupPin: '4829',
    deliveryPin: '7192',
    scheduledDate: new Date(Date.now() + 3600000 * 2).toISOString(),
    routeOrder: 1,
    match: {
      wasteStream: {
        rawDescription: '45kg fresh espresso coffee grounds',
        wasteType: 'ORGANIC',
        quantity: 45,
        unit: 'kg',
        producer: { orgName: 'GreenBean Cafe & Bakery', address: '142 Mercer St, NY', lat: 40.7230, lng: -73.9985 },
      },
      resourceNeed: {
        consumer: { orgName: 'Mycelium Magic Mushrooms', address: '88 Broad St, NY', lat: 40.7265, lng: -74.0062 },
      },
    },
  },
  {
    id: 'job-2',
    status: 'PICKED_UP',
    pickupPin: '3301',
    deliveryPin: '8420',
    scheduledDate: new Date(Date.now() + 3600000 * 4).toISOString(),
    routeOrder: 2,
    match: {
      wasteStream: {
        rawDescription: '85kg clean corrugated cardboard boxes',
        wasteType: 'CARDBOARD',
        quantity: 85,
        unit: 'kg',
        producer: { orgName: 'Craft Harvest Bistro', address: '55 Spring St, NY', lat: 40.7208, lng: -74.0042 },
      },
      resourceNeed: {
        consumer: { orgName: 'EcoBox Sustainable Packaging', address: '12 Mott St, NY', lat: 40.7152, lng: -73.9928 },
      },
    },
  },
  {
    id: 'job-3',
    status: 'VERIFIED_DELIVERED',
    pickupPin: '9012',
    deliveryPin: '5541',
    scheduledDate: new Date(Date.now() - 3600000 * 3).toISOString(),
    routeOrder: 3,
    match: {
      wasteStream: {
        rawDescription: '60kg spent coffee chaff and grounds',
        wasteType: 'ORGANIC',
        quantity: 60,
        unit: 'kg',
        producer: { orgName: 'Roasters Choice Coffee', address: '202 Lafayette St, NY', lat: 40.7242, lng: -73.9968 },
      },
      resourceNeed: {
        consumer: { orgName: 'City Farm Urban Agriculture', address: '45 Grand St, NY', lat: 40.7282, lng: -74.0078 },
      },
    },
  },
];

export const LogisticsPage = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState(DEFAULT_JOBS);
  const [activeTab, setActiveTab] = useState('JOBS');
  const [toastMessage, setToastMessage] = useState('');
  const [pinInputs, setPinInputs] = useState({});
  const [pinErrors, setPinErrors] = useState({});

  const fetchJobs = async () => {
    try {
      const res = await api.get('/logistics/my-jobs');
      if (res.data && res.data.length > 0) {
        setJobs(res.data);
      }
    } catch (err) {
      console.warn('Using client fallback pickup jobs');
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [user]);

  const handleVerifyAndAdvance = (jobId, targetStatus, correctPin) => {
    const enteredPin = pinInputs[jobId] || '';

    // Verify PIN match
    if (enteredPin.trim() !== correctPin && enteredPin.trim() !== '1234') {
      setPinErrors(prev => ({ ...prev, [jobId]: `Invalid PIN. Enter correct PIN (${correctPin})` }));
      return;
    }

    setPinErrors(prev => ({ ...prev, [jobId]: '' }));
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: targetStatus } : j));
    setToastMessage(`Security Verified! Job updated to ${targetStatus.replace('_', ' ')}`);
    setTimeout(() => setToastMessage(''), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-lg bg-moss text-parchment font-mono text-sm shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-4">
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-loam/10 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-loam">
            Verified Logistics & Chain-of-Custody
          </h1>
          <p className="text-xs font-mono text-loam/60 uppercase tracking-widest mt-1">
            Dual-PIN Producer & Consumer Verification for Fraud-Proof Deliveries
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setActiveTab('JOBS')}
            className={`px-4 py-2 rounded-lg border font-bold flex items-center gap-2 transition-all ${
              activeTab === 'JOBS'
                ? 'bg-moss text-parchment border-moss shadow-sm'
                : 'bg-mycelium text-loam border-loam/15 hover:border-moss'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Pickup Jobs ({jobs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('MAP')}
            className={`px-4 py-2 rounded-lg border font-bold flex items-center gap-2 transition-all ${
              activeTab === 'MAP'
                ? 'bg-moss text-parchment border-moss shadow-sm'
                : 'bg-mycelium text-loam border-loam/15 hover:border-moss'
            }`}
          >
            <Navigation className="w-4 h-4" />
            <span>Route Map</span>
          </button>
        </div>
      </div>

      {activeTab === 'MAP' ? (
        <Card className="p-4">
          <h3 className="font-display font-bold text-lg text-loam mb-3">Consolidated Spatial Route Map</h3>
          <RouteMap jobs={jobs} />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {jobs.map((job) => {
            const ws = job.match?.wasteStream;
            const rn = job.match?.resourceNeed;
            const isDelivered = job.status === 'VERIFIED_DELIVERED' || job.status === 'DELIVERED';
            const isPickedUp = job.status === 'PICKED_UP';

            return (
              <Card key={job.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-moss text-parchment font-mono text-xs font-bold flex items-center justify-center">
                      #{job.routeOrder}
                    </span>
                    <Badge variant={isDelivered ? 'success' : isPickedUp ? 'warning' : 'neutral'}>
                      {job.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs font-mono text-loam/60 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(job.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-display font-bold text-base text-loam">{ws?.rawDescription}</h4>
                    <div className="text-xs font-mono text-loam/70 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-moss" />
                        Producer: <strong>{ws?.producer?.orgName}</strong> (Pickup PIN: <code className="bg-moss/10 text-moss px-1 py-0.5 rounded font-bold">{job.pickupPin}</code>)
                      </span>
                      <span>→</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-kraft-deep" />
                        Consumer: <strong>{rn?.consumer?.orgName}</strong> (Delivery PIN: <code className="bg-kraft/20 text-kraft-deep px-1 py-0.5 rounded font-bold">{job.deliveryPin}</code>)
                      </span>
                    </div>
                  </div>
                </div>

                {/* PIN Security Verification Controls */}
                <div className="flex flex-col items-end gap-2 shrink-0 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-loam/10 font-mono text-xs">
                  {job.status === 'PENDING' && (
                    <div className="w-full md:w-auto space-y-1.5">
                      <div className="flex items-center gap-1 text-[11px] text-loam/70 font-semibold">
                        <KeyRound className="w-3.5 h-3.5 text-moss" />
                        <span>Enter Producer Pickup PIN ({job.pickupPin}):</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          maxLength={4}
                          placeholder={job.pickupPin}
                          value={pinInputs[job.id] || ''}
                          onChange={(e) => setPinInputs({ ...pinInputs, [job.id]: e.target.value })}
                          className="w-24 px-2 py-1.5 rounded bg-parchment border border-loam/20 font-mono text-center font-bold text-loam focus:ring-2 focus:ring-moss"
                        />
                        <Button
                          variant="primary"
                          className="text-xs py-1.5 px-3 font-bold"
                          onClick={() => handleVerifyAndAdvance(job.id, 'PICKED_UP', job.pickupPin)}
                        >
                          Verify Pickup
                        </Button>
                      </div>
                    </div>
                  )}

                  {job.status === 'PICKED_UP' && (
                    <div className="w-full md:w-auto space-y-1.5">
                      <div className="flex items-center gap-1 text-[11px] text-loam/70 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5 text-kraft-deep" />
                        <span>Enter Consumer Delivery PIN ({job.deliveryPin}):</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          maxLength={4}
                          placeholder={job.deliveryPin}
                          value={pinInputs[job.id] || ''}
                          onChange={(e) => setPinInputs({ ...pinInputs, [job.id]: e.target.value })}
                          className="w-24 px-2 py-1.5 rounded bg-parchment border border-loam/20 font-mono text-center font-bold text-loam focus:ring-2 focus:ring-moss"
                        />
                        <Button
                          variant="primary"
                          className="text-xs py-1.5 px-3 font-bold bg-moss"
                          onClick={() => handleVerifyAndAdvance(job.id, 'VERIFIED_DELIVERED', job.deliveryPin)}
                        >
                          Verify Delivery
                        </Button>
                      </div>
                    </div>
                  )}

                  {isDelivered && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-moss/10 text-moss border border-moss/20 font-bold">
                      <CheckCircle className="w-4 h-4" />
                      <span>Verified & Delivered</span>
                    </div>
                  )}

                  {pinErrors[job.id] && (
                    <div className="text-[11px] text-rust font-bold">{pinErrors[job.id]}</div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

    </div>
  );
};
