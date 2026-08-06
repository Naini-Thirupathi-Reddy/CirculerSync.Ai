import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { RouteMap } from '../components/logistics/RouteMap';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Truck, MapPin, CheckCircle, Clock, Sparkles, Navigation } from 'lucide-react';
import api from '../services/api';

const DEFAULT_JOBS = [
  {
    id: 'job-1',
    status: 'PENDING',
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
    status: 'DELIVERED',
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

  const handleUpdateStatus = async (jobId, newStatus) => {
    try {
      await api.patch(`/logistics/jobs/${jobId}/status`, { status: newStatus });
    } catch (err) {
      console.warn(err);
    }
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
    setToastMessage(`Job status updated to ${newStatus.replace('_', ' ')}`);
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
            Dynamic Logistics Optimizer
          </h1>
          <p className="text-xs font-mono text-loam/60 uppercase tracking-widest mt-1">
            Spatial cluster routes & nearest-neighbor TSP dispatch for Eco Logistics
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
            return (
              <Card key={job.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-moss text-parchment font-mono text-xs font-bold flex items-center justify-center">
                      #{job.routeOrder}
                    </span>
                    <Badge variant={job.status === 'DELIVERED' ? 'success' : job.status === 'PICKED_UP' ? 'warning' : 'neutral'}>
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
                        From: <strong>{ws?.producer?.orgName}</strong> ({ws?.producer?.address})
                      </span>
                      <span>→</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-kraft-deep" />
                        To: <strong>{rn?.consumer?.orgName}</strong> ({rn?.consumer?.address})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-loam/10">
                  {job.status === 'PENDING' && (
                    <Button
                      variant="primary"
                      className="w-full md:w-auto text-xs py-2 font-mono font-bold"
                      onClick={() => handleUpdateStatus(job.id, 'PICKED_UP')}
                    >
                      Mark Picked Up
                    </Button>
                  )}
                  {job.status === 'PICKED_UP' && (
                    <Button
                      variant="primary"
                      className="w-full md:w-auto text-xs py-2 font-mono font-bold bg-moss"
                      onClick={() => handleUpdateStatus(job.id, 'DELIVERED')}
                    >
                      Mark Delivered
                    </Button>
                  )}
                  {job.status === 'DELIVERED' && (
                    <div className="flex items-center gap-1 text-xs font-mono text-moss font-bold">
                      <CheckCircle className="w-4 h-4" />
                      <span>Completed</span>
                    </div>
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
