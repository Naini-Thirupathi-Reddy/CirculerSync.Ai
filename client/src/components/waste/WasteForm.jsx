import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Sparkles, Upload, FileText, Calendar, Clock, AlertCircle } from 'lucide-react';
import api from '../../services/api';

export const WasteForm = ({ onSuccess, onCancel }) => {
  const [rawDescription, setRawDescription] = useState('');
  const [frequency, setFrequency] = useState('DAILY');
  const [pickupReadyAt, setPickupReadyAt] = useState(() => {
    const d = new Date(Date.now() + 3600000 * 3);
    return d.toISOString().slice(0, 16);
  });
  const [photoUrl, setPhotoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [nlpPreview, setNlpPreview] = useState(null);

  // Live NLP parsing feedback as user types
  const handleDescriptionChange = (e) => {
    const val = e.target.value;
    setRawDescription(val);

    if (val.length > 8) {
      const lower = val.toLowerCase();
      let type = 'ORGANIC';
      let qty = '15 kg (inferred)';
      if (lower.includes('cardboard') || lower.includes('box')) {
        type = 'CARDBOARD';
      } else if (lower.includes('burlap') || lower.includes('textile')) {
        type = 'TEXTILE';
      }
      
      const qtyMatch = lower.match(/(\d+(?:\.\d+)?)\s*(kg|lbs|tons)/i);
      if (qtyMatch) {
        qty = `${qtyMatch[1]} ${qtyMatch[2]}`;
      }

      setNlpPreview({ type, qty });
    } else {
      setNlpPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rawDescription) return;

    setLoading(true);
    try {
      const res = await api.post('/waste', {
        rawDescription,
        frequency,
        pickupReadyAt: new Date(pickupReadyAt).toISOString(),
        photoUrl: photoUrl || undefined,
      });

      if (onSuccess) {
        onSuccess(res.data);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to log waste stream');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left font-sans">
      
      {/* Description Field */}
      <div className="space-y-1">
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-loam">
          Raw Waste Description (AI NLP Input)
        </label>
        <textarea
          required
          rows={3}
          value={rawDescription}
          onChange={handleDescriptionChange}
          placeholder="e.g. 45kg fresh espresso coffee grounds, clean single-origin arabica substrate..."
          className="w-full p-3 rounded-md bg-parchment border border-loam/20 text-loam text-sm focus:outline-none focus:ring-2 focus:ring-moss font-mono"
        />
      </div>

      {/* Live NLP Preview Badge */}
      {nlpPreview && (
        <div className="p-2.5 rounded bg-moss/10 border border-moss/30 text-xs font-mono text-moss-deep flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-1.5 font-bold">
            <Sparkles className="w-4 h-4 text-moss" />
            <span>AI Parser Detected: {nlpPreview.type}</span>
          </div>
          <span className="opacity-80">Est. Quantity: {nlpPreview.qty}</span>
        </div>
      )}

      {/* Pickup Window & Frequency */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-mono font-bold uppercase tracking-wider text-loam flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Ready for Pickup At</span>
          </label>
          <input
            type="datetime-local"
            required
            value={pickupReadyAt}
            onChange={(e) => setPickupReadyAt(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-parchment border border-loam/20 text-loam text-xs font-mono focus:outline-none focus:ring-2 focus:ring-moss"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-mono font-bold uppercase tracking-wider text-loam flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Generation Frequency</span>
          </label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-parchment border border-loam/20 text-loam text-xs font-mono focus:outline-none focus:ring-2 focus:ring-moss"
          >
            <option value="DAILY">Daily Batch</option>
            <option value="WEEKLY">Weekly Pickup</option>
            <option value="BIWEEKLY">Bi-Weekly</option>
            <option value="ONE_TIME">One-Time Clearing</option>
          </select>
        </div>
      </div>

      {/* Photo URL / Upload */}
      <div className="space-y-1">
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-loam flex items-center gap-1">
          <Upload className="w-3.5 h-3.5" />
          <span>Waste Stream Photo URL (Supabase Storage)</span>
        </label>
        <input
          type="url"
          value={photoUrl}
          onChange={(e) => setPhotoUrl(e.target.value)}
          placeholder="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd"
          className="w-full px-3 py-2 rounded-md bg-parchment border border-loam/20 text-loam text-xs font-mono focus:outline-none focus:ring-2 focus:ring-moss"
        />
        <p className="text-[10px] font-mono text-loam/50">
          Leave blank to use verified material placeholder image.
        </p>
      </div>

      {/* Submit Buttons */}
      <div className="flex items-center justify-end gap-2 pt-4 border-t border-loam/10">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Analyzing with AI Matcher...' : 'Log waste stream'}
        </Button>
      </div>

    </form>
  );
};
