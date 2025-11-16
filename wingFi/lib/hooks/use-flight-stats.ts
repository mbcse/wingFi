'use client';

import { useEffect, useState } from 'react';

export interface FlightData {
  airline: string;
  flightNumber: string;
  status: 'On Time' | 'Delayed' | 'Cancelled';
  delay?: number; // minutes
  origin: string;
  destination: string;
  scheduledTime: string;
}

interface FlightStatsResponse {
  flights: FlightData[];
  cached: boolean;
  nextUpdate: string;
}

/**
 * Hook to fetch live flight stats from FlightAPI
 * Data is cached server-side for 5 minutes to save API credits
 */
export function useFlightStats() {
  const [data, setData] = useState<FlightStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/flight-stats');
      
      if (!response.ok) {
        throw new Error('Failed to fetch flight stats');
      }

      const json = await response.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchStats();

    // Refresh every 24 hours (matches server cache)
    // Cache is file-based and lasts 24 hours to save API credits
    const interval = setInterval(fetchStats, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Calculate stats from flight data
  const stats = data?.flights ? {
    totalFlights: data.flights.length,
    onTime: data.flights.filter(f => f.status === 'On Time').length,
    delayed: data.flights.filter(f => f.status === 'Delayed').length,
    cancelled: data.flights.filter(f => f.status === 'Cancelled').length,
    delayedFlights: data.flights.filter(f => f.status === 'Delayed'),
    cancelledFlights: data.flights.filter(f => f.status === 'Cancelled'),
    onTimePercentage: data.flights.length > 0 
      ? (data.flights.filter(f => f.status === 'On Time').length / data.flights.length) * 100 
      : 0,
  } : null;

  return {
    flights: data?.flights || [],
    stats,
    isLoading,
    error,
    cached: data?.cached || false,
    nextUpdate: data?.nextUpdate,
    refetch: fetchStats,
  };
}

