'use client';

import { useFlightStats } from '@/lib/hooks/use-flight-stats';
import { AlertCircle, Clock, Plane, XCircle } from 'lucide-react';

export function FlightTicker() {
  const { flights, isLoading, cached, nextUpdate } = useFlightStats();

  if (isLoading) {
    return (
      <div className="fixed top-16 left-64 right-0 bg-slate-900/80 border-b border-slate-700 py-2 px-4 z-40">
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Plane className="h-4 w-4 animate-pulse" />
          <span>Loading live flight data...</span>
        </div>
      </div>
    );
  }

  // Filter for delayed and cancelled flights for ticker
  const importantFlights = flights.filter(
    f => f.status === 'Delayed' || f.status === 'Cancelled'
  );

  if (importantFlights.length === 0) {
    return (
      <div className="fixed top-16 left-64 right-0 bg-green-900/20 border-b border-green-700/30 py-2 px-4 z-40">
        <div className="flex items-center gap-2 text-green-400 text-sm">
          <Plane className="h-4 w-4" />
          <span>✈️ All tracked flights are operating on time!</span>
          {cached && nextUpdate && (
            <span className="ml-auto text-xs text-slate-500">
              Next update: {new Date(nextUpdate).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-16 left-64 right-0 bg-slate-900/80 border-b border-slate-700 py-2 overflow-hidden z-40">
      <div className="relative flex">
        {/* Animated ticker */}
        <div className="flex animate-scroll gap-8">
          {/* Duplicate the items for seamless loop */}
          {[...importantFlights, ...importantFlights].map((flight, idx) => (
            <div
              key={`${flight.flightNumber}-${idx}`}
              className="flex items-center gap-2 whitespace-nowrap px-4"
            >
              {flight.status === 'Delayed' ? (
                <Clock className="h-4 w-4 text-yellow-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span
                className={`font-semibold ${
                  flight.status === 'Delayed' ? 'text-yellow-400' : 'text-red-400'
                }`}
              >
                {flight.airline}
              </span>
              <span className="text-slate-300">{flight.flightNumber}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">
                {flight.origin} → {flight.destination}
              </span>
              <span className="text-slate-500">•</span>
              {flight.status === 'Delayed' && flight.delay ? (
                <span className="text-yellow-400 font-medium">
                  Delayed by {flight.delay} min
                </span>
              ) : (
                <span className="text-red-400 font-medium">CANCELLED</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Update indicator */}
      {cached && nextUpdate && (
        <div className="absolute right-4 top-2 text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded">
          Updates every 5min • Next: {new Date(nextUpdate).toLocaleTimeString()}
        </div>
      )}

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}

