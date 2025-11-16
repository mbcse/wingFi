'use client';

import { useFlightStats } from '@/lib/hooks/use-flight-stats';
import { TrendingUp, TrendingDown, Clock, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LiveAirlineStatsProps {
  airlineCode: string;
  airlineName: string;
}

export function LiveAirlineStats({ airlineCode, airlineName }: LiveAirlineStatsProps) {
  const { flights, stats, isLoading } = useFlightStats();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <div className="h-2 w-2 rounded-full bg-slate-600 animate-pulse" />
        <span>Loading live stats...</span>
      </div>
    );
  }

  // Filter flights for this airline
  const airlineFlights = flights.filter(f => {
    // Match by airline code or name
    const flightAirlineCode = f.flightNumber.substring(0, 2);
    return flightAirlineCode === airlineCode || f.airline.toLowerCase().includes(airlineName.toLowerCase());
  });

  if (airlineFlights.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <CheckCircle className="h-4 w-4" />
        <span>No recent data</span>
      </div>
    );
  }

  const delayed = airlineFlights.filter(f => f.status === 'Delayed').length;
  const cancelled = airlineFlights.filter(f => f.status === 'Cancelled').length;
  const onTime = airlineFlights.filter(f => f.status === 'On Time').length;
  const total = airlineFlights.length;
  const onTimePercent = ((onTime / total) * 100).toFixed(0);

  // Calculate average delay for delayed flights
  const avgDelay = delayed > 0
    ? Math.round(
        airlineFlights
          .filter(f => f.status === 'Delayed' && f.delay)
          .reduce((sum, f) => sum + (f.delay || 0), 0) / delayed
      )
    : 0;

  return (
    <div className="space-y-2">
      {/* On-Time Performance */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onTime > delayed ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span className="text-sm text-slate-300">On-Time Rate:</span>
        </div>
        <Badge
          variant={Number(onTimePercent) >= 80 ? 'default' : 'destructive'}
          className="font-semibold"
        >
          {onTimePercent}%
        </Badge>
      </div>

      {/* Flight Status Breakdown */}
      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-slate-400">{onTime} On Time</span>
        </div>
        {delayed > 0 && (
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-yellow-500" />
            <span className="text-slate-400">{delayed} Delayed</span>
          </div>
        )}
        {cancelled > 0 && (
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <span className="text-slate-400">{cancelled} Cancelled</span>
          </div>
        )}
      </div>

      {/* Average Delay */}
      {avgDelay > 0 && (
        <div className="flex items-center gap-2 text-xs text-yellow-400">
          <Clock className="h-3 w-3" />
          <span>Avg delay: {avgDelay} min</span>
        </div>
      )}

      {/* Live Indicator */}
      <div className="flex items-center gap-1 text-xs text-slate-500">
        <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
        <span>Live data • {total} tracked flights</span>
      </div>
    </div>
  );
}

