import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { MapPin, Calendar, Scale, Sparkles, Trash2 } from 'lucide-react';

export const WasteCard = ({ wasteStream, onViewMatches, onDelete }) => {
  const {
    id,
    rawDescription,
    wasteType,
    subtype,
    quantity,
    unit = 'kg',
    frequency,
    qualityGrade,
    photoUrl,
    pickupReadyAt,
    status,
    producer = {},
  } = wasteStream;

  const statusVariants = {
    ACTIVE: 'moss',
    MATCHED: 'kraft',
    COMPLETED: 'active',
    EXPIRED: 'rust',
  };

  return (
    <Card className="flex flex-col justify-between space-y-4">
      
      {/* Top Header with Image & Status */}
      <div className="space-y-3">
        <div className="relative h-36 rounded-md overflow-hidden bg-mycelium border border-loam/10 group">
          <img
            src={photoUrl || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80'}
            alt={wasteType}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2">
            <Badge variant={statusVariants[status] || 'neutral'}>
              {status}
            </Badge>
          </div>
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-loam/80 backdrop-blur text-parchment text-[10px] font-mono">
            {wasteType} • {subtype}
          </div>
        </div>

        {/* Title / Description */}
        <div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-loam/50 uppercase font-bold">{id}</span>
            <span className="font-mono text-xs font-bold text-moss">{qualityGrade}</span>
          </div>
          <p className="font-sans text-sm text-loam font-medium line-clamp-2 mt-0.5 leading-snug">
            {rawDescription}
          </p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono py-2 border-y border-loam/10 text-loam/80">
        <div className="flex items-center gap-1.5">
          <Scale className="w-3.5 h-3.5 text-moss shrink-0" />
          <span className="font-bold">{quantity} {unit}</span>
          <span className="text-[10px] opacity-60">({frequency})</span>
        </div>

        <div className="flex items-center gap-1.5 truncate">
          <MapPin className="w-3.5 h-3.5 text-kraft shrink-0" />
          <span className="truncate">{producer.orgName || 'Producer Hub'}</span>
        </div>

        <div className="col-span-2 flex items-center gap-1.5 text-[11px] text-loam/60 pt-0.5">
          <Calendar className="w-3.5 h-3.5 shrink-0 text-rust" />
          <span>Ready: {new Date(pickupReadyAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <Button
          variant="primary"
          size="sm"
          className="flex-1 gap-1.5"
          onClick={() => onViewMatches(wasteStream)}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>View Matches</span>
        </Button>

        {onDelete && (
          <button
            onClick={() => onDelete(id)}
            className="p-1.5 text-loam/40 hover:text-rust rounded transition-colors"
            title="Delete waste stream"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

    </Card>
  );
};
