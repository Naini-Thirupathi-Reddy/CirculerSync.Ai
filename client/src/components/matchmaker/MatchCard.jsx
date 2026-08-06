import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { CompatibilitySeal } from '../ui/CompatibilitySeal';
import { MapPin, ArrowRight, Truck, CheckCircle2 } from 'lucide-react';

export const MatchCard = ({ match, onOpenReasoning, onAcceptMatch }) => {
  const {
    id,
    score = 90,
    reasoning = '',
    status = 'PROPOSED',
    wasteStream = {},
    resourceNeed = {},
  } = match;

  const producer = wasteStream.producer || {};
  const consumer = resourceNeed.consumer || {};

  const isAccepted = status === 'ACCEPTED';

  return (
    <Card className="flex flex-col justify-between space-y-4 border-l-4 border-l-moss">
      
      {/* Top Header: Compatibility Seal + Status */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <CompatibilitySeal
            score={score}
            reasoning={reasoning}
            onClick={() => onOpenReasoning(match)}
          />
          <Badge variant={isAccepted ? 'active' : 'kraft'}>
            {status}
          </Badge>
        </div>

        {/* Symbiosis Match Details */}
        <div className="p-3 bg-parchment/60 rounded-md border border-loam/10 space-y-2 text-xs font-mono">
          
          {/* Producer -> Consumer Material Flow */}
          <div className="flex items-center justify-between text-loam font-bold">
            <div className="truncate max-w-[140px]" title={producer.orgName}>
              {producer.orgName || 'Producer'}
            </div>
            <ArrowRight className="w-4 h-4 text-moss shrink-0" />
            <div className="truncate max-w-[140px] text-right" title={consumer.orgName}>
              {consumer.orgName || 'Consumer'}
            </div>
          </div>

          {/* Material Specs */}
          <div className="flex justify-between text-[11px] text-loam/70 pt-1 border-t border-loam/10">
            <span>Material: <strong className="text-moss">{wasteStream.wasteType || 'ORGANIC'}</strong></span>
            <span>Quantity: <strong>{wasteStream.quantity || 30} {wasteStream.unit || 'kg'}</strong></span>
          </div>

        </div>
      </div>

      {/* Footer Action */}
      <div className="pt-2 border-t border-loam/10 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onOpenReasoning(match)}
          className="text-xs font-mono font-bold text-loam/70 hover:text-moss underline"
        >
          View AI Reasoning breakdown
        </button>

        {isAccepted ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-mono text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Pickup Job Scheduled</span>
          </div>
        ) : (
          <Button
            variant="primary"
            size="sm"
            className="gap-1.5"
            onClick={() => onAcceptMatch(id)}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Request pickup</span>
          </Button>
        )}
      </div>

    </Card>
  );
};
