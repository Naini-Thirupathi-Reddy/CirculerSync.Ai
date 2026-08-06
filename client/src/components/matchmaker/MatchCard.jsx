import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CompatibilitySeal } from '../ui/CompatibilitySeal';
import { ArrowRight, Truck, CheckCircle, ShieldCheck, KeyRound } from 'lucide-react';

export const MatchCard = ({ match, onOpenReasoning, onAcceptMatch }) => {
  const [consumerVerified, setConsumerVerified] = useState(false);
  const wasteStream = match.wasteStream || {};
  const producer = wasteStream.producer || {};
  const resourceNeed = match.resourceNeed || {};
  const consumer = resourceNeed.consumer || {};

  const isAccepted = match.status === 'ACCEPTED' || consumerVerified;

  const handleConsumerVerify = () => {
    setConsumerVerified(true);
    if (onAcceptMatch) {
      onAcceptMatch(match.id);
    }
  };

  return (
    <Card className="p-5 flex flex-col justify-between space-y-4 hover:border-moss transition-all">
      
      {/* Header: Score & Status */}
      <div className="flex items-start justify-between gap-3">
        <CompatibilitySeal score={match.score} size="md" />
        <Badge variant={isAccepted ? 'success' : 'neutral'}>
          {isAccepted ? 'ACCEPTED & DISPATCHED' : match.status || 'PROPOSED'}
        </Badge>
      </div>

      {/* Match Link Details */}
      <div className="space-y-3 font-sans">
        <div className="flex items-center justify-between gap-2 p-3 bg-parchment/60 rounded-lg border border-loam/10 font-mono text-xs">
          <div>
            <div className="font-bold text-loam truncate max-w-[140px]">{producer.orgName || 'Producer'}</div>
            <div className="text-[10px] text-loam/60">Material: {wasteStream.wasteType}</div>
          </div>
          <ArrowRight className="w-4 h-4 text-moss shrink-0" />
          <div className="text-right">
            <div className="font-bold text-loam truncate max-w-[140px]">{consumer.orgName || 'Consumer'}</div>
            <div className="text-[10px] text-loam/60">Quantity: {wasteStream.quantity} {wasteStream.unit || 'kg'}</div>
          </div>
        </div>

        {/* Security Verification Pins */}
        <div className="p-2.5 bg-mycelium rounded-lg border border-loam/15 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5 text-moss font-bold">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Pickup PIN: <code className="bg-moss/10 px-1.5 py-0.5 rounded text-loam">4829</code></span>
          </div>
          <div className="flex items-center gap-1.5 text-kraft-deep font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Delivery PIN: <code className="bg-kraft/20 px-1.5 py-0.5 rounded text-loam">7192</code></span>
          </div>
        </div>

        {/* AI Match Reasoning Snippet */}
        <p className="text-xs text-loam/70 font-mono italic">
          "{match.reasoning}"
        </p>
      </div>

      {/* Footer Controls */}
      <div className="pt-3 border-t border-loam/10 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onOpenReasoning(match)}
          className="text-xs font-mono text-moss font-bold hover:underline"
        >
          View AI Reasoning breakdown
        </button>

        {isAccepted ? (
          <div className="flex items-center gap-1 text-xs font-mono text-moss font-bold">
            <CheckCircle className="w-4 h-4" />
            <span>Pickup Job Scheduled</span>
          </div>
        ) : (
          <Button
            variant="primary"
            className="gap-1.5 text-xs py-2 font-mono font-bold"
            onClick={handleConsumerVerify}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Confirm & Request Pickup</span>
          </Button>
        )}
      </div>

    </Card>
  );
};
