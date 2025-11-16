'use client';

import Link from 'next/link';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { LiveAirlineStats } from './live-airline-stats';

interface AirlinePoolData {
  id: string;
  code: string;
  airline: string;
  logo: string;
  onTime: number;
  delayRate: number;
  cancellationRate: number;
  tvl: number;
  tvlFormatted?: string;
  apy: number;
  riskLevel: 'low' | 'medium' | 'high';
  premiumIncome: number;
  claimsPaid: number;
  utilization: number;
  address?: string;
  isLoading?: boolean;
}

interface AirlinePoolCardProps {
  pool: AirlinePoolData;
}

export function AirlinePoolCard({ pool }: AirlinePoolCardProps) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'medium':
        return 'bg-chart-5/10 text-chart-5 border-chart-5/20';
      case 'high':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  return (
    <Card className="glass-card overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <img
              src={pool.logo || "/placeholder.svg"}
              alt={pool.airline}
              className="h-12 w-12 rounded-lg object-cover"
            />
            <div>
              <h3 className="text-lg font-bold">{pool.airline}</h3>
              <Badge variant="outline" className={getRiskColor(pool.riskLevel)}>
                {pool.riskLevel} risk
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{pool.apy}%</p>
            <p className="text-sm text-muted-foreground">APY</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">On-Time %</p>
            <div className="flex items-center gap-1 mt-1">
              <p className="text-lg font-semibold">{pool.onTime}%</p>
              {pool.onTime >= 85 ? (
                <TrendingUp className="h-4 w-4 text-accent" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">TVL</p>
            <p className="text-lg font-semibold mt-1">
              ${(pool.tvl / 1000).toFixed(0)}K
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Utilization</p>
            <p className="text-lg font-semibold mt-1">{pool.utilization}%</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="rounded-lg bg-secondary/30 p-3">
            <p className="text-muted-foreground">Delay Rate</p>
            <p className="font-semibold mt-1">{pool.delayRate}%</p>
          </div>
          <div className="rounded-lg bg-secondary/30 p-3">
            <p className="text-muted-foreground">Cancellation</p>
            <p className="font-semibold mt-1">{pool.cancellationRate}%</p>
          </div>
        </div>

        {/* Live Flight Stats */}
        <div className="mb-4 rounded-lg border border-green-500/20 bg-green-500/5 p-4">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-xs font-semibold text-green-400 uppercase tracking-wide">
              Live Flight Data
            </p>
          </div>
          <LiveAirlineStats airlineCode={pool.code} airlineName={pool.airline} />
        </div>

        <Link href={`/airline-pools/${pool.code.toLowerCase()}`}>
          <Button className="w-full">View Pool Details</Button>
        </Link>
      </div>
    </Card>
  );
}
