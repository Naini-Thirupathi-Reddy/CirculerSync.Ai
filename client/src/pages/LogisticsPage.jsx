import React, { useState, useEffect } from 'react';
import { RouteMap } from '../components/logistics/RouteMap';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Truck, MapPin, CheckCircle2, Clock, Navigation, Sparkles } from 'lucide-react';
import api from '../services/api';

export const LogisticsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [jobsRes, routeRes] = await Promise.all([
        api.get('/logistics/jobs'),
        api.get('/logistics/route'),
      ]);
      setJobs(jobsRes.data);
      setRouteData(routeRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (jobId, nextStatus) => {
    try {
      const res = await api.patch(`/logistics/jobs/${jobId}`, { status: nextStatus });
      setToastMessage(`Pickup status updated to ${nextStatus}`);
      fetchData();
      setTimeout(() => setToastMessage(''), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const statusVariants = {
    PENDING: 'kraft',
    PICKED_UP: 'moss',
    DELIVERED: 'active',
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
      <div className="border-b border-loam/10 pb-4">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-loam">
          Dynamic Logistics Optimizer
        </h1>
        <p className="text-xs font-mono text-loam/60 uppercase tracking-widest mt-1">
          Grid-Based Spatial Clustering • Nearest-Neighbor TSP Route Dispatch
        </p>
      </div>

      {/* Route Map Section */}
      <Card className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-loam/10">
          <div className="flex items-center gap-2 font-display font-bold text-lg text-loam">
            <Navigation className="w-5 h-5 text-moss" />
            <span>Consolidated Pickup Route Map (Leaflet / OSM)</span>
          </div>
          <div className="font-mono text-xs text-moss font-bold">
            {routeData?.totalStops || jobs.length} Scheduled Stops
          </div>
        </div>

        <RouteMap stops={routeData?.stops || jobs} />
      </Card>

      {/* Pickup Jobs Tracker List */}
      <div className="space-y-4">
        <h3 className="font-display font-bold text-xl text-loam">Assigned Pickup Jobs</h3>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-28 bg-mycelium/40 animate-pulse rounded-lg border border-loam/10" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-loam/20 rounded-lg font-mono text-xs text-loam/60">
            No active pickup jobs found. Accept a match in the matchmaker to dispatch a route stop.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {jobs.map(job => {
              const producer = job.match?.wasteStream?.producer || {};
              const consumer = job.match?.resourceNeed?.consumer || {};
              const wasteStream = job.match?.wasteStream || {};

              return (
                <Card key={job.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* Left: Route Order & Details */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-moss/20 border border-moss text-moss-deep dark:text-moss font-mono font-bold flex items-center justify-center text-sm shrink-0">
                      #{job.routeOrder || 1}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-base text-loam">
                          {producer.orgName || 'Producer'} → {consumer.orgName || 'Consumer'}
                        </span>
                        <Badge variant={statusVariants[job.status] || 'neutral'}>
                          {job.status}
                        </Badge>
                      </div>

                      <div className="font-mono text-xs text-loam/80 flex flex-wrap gap-4 pt-1">
                        <span>Material: <strong>{wasteStream.wasteType} ({wasteStream.quantity}kg)</strong></span>
                        <span>Address: {producer.address || 'Mercer St, NY'}</span>
                        <span className="text-moss">ETA: {new Date(job.estimatedTime || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Status Tracker Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-loam/10">
                    {job.status === 'PENDING' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleUpdateStatus(job.id, 'PICKED_UP')}
                        className="gap-1.5"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Confirm Picked Up</span>
                      </Button>
                    )}

                    {job.status === 'PICKED_UP' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleUpdateStatus(job.id, 'DELIVERED')}
                        className="gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm Delivered</span>
                      </Button>
                    )}

                    {job.status === 'DELIVERED' && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-mono text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Delivered & Impact Logged</span>
                      </div>
                    )}
                  </div>

                </Card>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
