'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import { SidebarNav } from '@/components/sidebar-nav';
import { Topbar } from '@/components/topbar';
import { StatCard } from '@/components/stat-card';
import { DepositWithdrawForm } from '@/components/deposit-withdraw-form';
import { RiskScoreBadge } from '@/components/risk-score-badge';
import { PerformanceChart } from '@/components/performance-chart';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DollarSign, TrendingUp, Activity, Percent, AlertCircle, Clock, XCircle } from 'lucide-react';
import { useAirlinePools, useAirlinePoolData } from '@/lib/web3/airline-pool-data';
import { FlightTicker } from '@/components/flight-ticker';
import { LiveAirlineStats } from '@/components/live-airline-stats';

export default function AirlinePoolDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const allPools = useAirlinePools();
  const selectedPool = allPools.find((p) => p.code.toLowerCase() === id.toLowerCase());

  const pool = selectedPool ? useAirlinePoolData(selectedPool.address, selectedPool.name, selectedPool.code) : null;

  if (!selectedPool || !pool) {
    notFound();
  }

  // Generate historical data based on current values
  const generateHistoricalData = (currentValue: number, months: number = 6) => {
    const now = new Date();
    const data = [];
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      // Simulate growth curve
      const growthFactor = (months - i) / months;
      const randomVariation = 0.85 + Math.random() * 0.15;
      const value = currentValue * growthFactor * randomVariation;
      data.push({ date: monthName, value: Math.max(0, value) });
    }
    
    return data;
  };

  const historicalTVL = generateHistoricalData(pool.tvl);
  const premiumsHistory = generateHistoricalData(pool.premiumsCollected);
  
  // For delay rate, we want fluctuation around current value, not growth
  const delayHistory = Array.from({ length: 6 }, (_, i) => {
    const now = new Date();
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    const variation = 0.9 + Math.random() * 0.2;
    return { date: monthName, value: pool.delayRate * variation };
  });

  const getRiskScore = (riskLevel: 'low' | 'medium' | 'high') => {
    if (riskLevel === 'low') return 3;
    if (riskLevel === 'medium') return 6;
    return 8;
  };

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
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <Topbar />
      <FlightTicker />

      <main className="ml-64 pt-28">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <img
                src={pool.logo || "/placeholder.svg"}
                alt={pool.airline}
                className="h-16 w-16 rounded-lg object-cover"
              />
              <div>
                <h1 className="text-4xl font-bold">{pool.airline} Pool</h1>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline" className={getRiskColor(pool.riskLevel)}>
                    {pool.riskLevel} risk
                  </Badge>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">
                    {pool.onTime}% on-time performance
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Value Locked"
              value={pool.isLoading ? 'Loading...' : `$${(pool.tvl / 1000).toFixed(0)}K`}
              change="Live from contract"
              changeType="neutral"
              icon={DollarSign}
            />
            <StatCard
              title="Current APY"
              value={`${pool.apy.toFixed(1)}%`}
              change="Based on risk profile"
              changeType="neutral"
              icon={TrendingUp}
            />
            <StatCard
              title="Pool Utilization"
              value={`${pool.utilization}%`}
              change="Tracked via events"
              changeType="neutral"
              icon={Activity}
            />
            <StatCard
              title="On-Time Rate"
              value={`${pool.onTime}%`}
              change={pool.onTime >= 85 ? 'Above average' : 'Below average'}
              changeType={pool.onTime >= 85 ? 'positive' : 'negative'}
              icon={Clock}
            />
          </div>

          <div className="mb-8 grid gap-6 lg:grid-cols-3">
            {/* Pool Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Airline Statistics */}
              <Card className="glass-card p-6">
                <h2 className="mb-6 text-xl font-bold">Airline Performance Stats</h2>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="rounded-lg bg-secondary/30 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-accent" />
                      <span className="text-sm text-muted-foreground">On-Time %</span>
                    </div>
                    <p className="text-3xl font-bold">{pool.onTime}%</p>
                    <Progress value={pool.onTime} className="mt-3 h-2" />
                  </div>

                  <div className="rounded-lg bg-secondary/30 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-chart-5" />
                      <span className="text-sm text-muted-foreground">Delay Rate</span>
                    </div>
                    <p className="text-3xl font-bold">{pool.delayRate}%</p>
                    <Progress value={pool.delayRate} className="mt-3 h-2" />
                  </div>

                  <div className="rounded-lg bg-secondary/30 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="h-4 w-4 text-destructive" />
                      <span className="text-muted-foreground text-sm">
                        Cancellation
                      </span>
                    </div>
                    <p className="text-3xl font-bold">{pool.cancellationRate}%</p>
                    <Progress value={pool.cancellationRate * 10} className="mt-3 h-2" />
                  </div>
                </div>
              </Card>

              {/* Pool Metrics */}
              <Card className="glass-card p-6">
                <h2 className="mb-6 text-xl font-bold">Pool Metrics</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        Premium Income
                      </span>
                      <span className="font-semibold">
                        ${(pool.premiumIncome / 1000).toFixed(0)}K
                      </span>
                    </div>
                    <Progress
                      value={pool.tvl > 0 ? (pool.premiumIncome / pool.tvl) * 100 : 0}
                      className="h-2"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Claims Paid</span>
                      <span className="font-semibold">
                        ${(pool.claimsPaid / 1000).toFixed(0)}K
                      </span>
                    </div>
                    <Progress
                      value={pool.tvl > 0 ? (pool.claimsPaid / pool.tvl) * 100 : 0}
                      className="h-2"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Utilization</span>
                      <span className="font-semibold">{pool.utilization}%</span>
                    </div>
                    <Progress value={pool.utilization} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Risk Score</span>
                      <span className="font-semibold">{getRiskScore(pool.riskLevel)}/10</span>
                    </div>
                    <Progress value={getRiskScore(pool.riskLevel) * 10} className="h-2" />
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg bg-secondary/30 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Percent className="h-4 w-4 text-primary" />
                      <span className="text-sm text-muted-foreground">
                        Premium Ratio
                      </span>
                    </div>
                    <p className="text-2xl font-bold">
                      {pool.tvl > 0 ? ((pool.premiumIncome / pool.tvl) * 100).toFixed(1) : '0'}%
                    </p>
                  </div>

                  <div className="rounded-lg bg-secondary/30 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <span className="text-sm text-muted-foreground">Claims Ratio</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {pool.premiumIncome > 0 ? ((pool.claimsPaid / pool.premiumIncome) * 100).toFixed(1) : '0'}%
                    </p>
                  </div>

                  <div className="rounded-lg bg-secondary/30 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-accent" />
                      <span className="text-sm text-muted-foreground">Net Profit</span>
                    </div>
                    <p className="text-2xl font-bold text-accent">
                      ${((pool.premiumIncome - pool.claimsPaid) / 1000).toFixed(0)}K
                    </p>
                  </div>
                </div>
              </Card>

              {/* Charts */}
              <PerformanceChart data={historicalTVL} title="TVL Growth" />

              <PerformanceChart
                data={premiumsHistory}
                title="Premium Income Trend"
              />

              <PerformanceChart
                data={delayHistory}
                title="Delay Rate History"
                valuePrefix=""
              />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <DepositWithdrawForm
                poolName={`${pool.airline} Pool`}
                poolAddress={pool.address!}
                poolType="airline"
              />

              {/* Live Flight Stats */}
              <Card className="glass-card p-6 border-green-500/20 bg-green-500/5">
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <h3 className="text-lg font-semibold text-green-400">Live Flight Data</h3>
                </div>
                <LiveAirlineStats airlineCode={pool.code} airlineName={pool.airline} />
                <div className="mt-4 pt-4 border-t border-green-500/10">
                  <p className="text-xs text-slate-400">
                    Real-time data from FlightAPI • Updates every 5 minutes
                  </p>
                </div>
              </Card>

              {/* Risk Profile */}
              <Card className="glass-card p-6">
                <h3 className="mb-4 text-lg font-semibold">Risk Assessment</h3>
                <div className="space-y-4">
                  <RiskScoreBadge score={getRiskScore(pool.riskLevel)} />

                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      This pool focuses exclusively on {pool.airline} flights,
                      offering {pool.riskLevel} risk exposure.
                    </p>
                    <ul className="ml-4 space-y-1 list-disc text-muted-foreground">
                      <li>{pool.onTime}% historical on-time performance</li>
                      <li>{pool.delayRate}% average delay rate</li>
                      <li>{pool.cancellationRate}% cancellation rate</li>
                      <li>
                        {pool.riskLevel === 'low' && 'Conservative strategy'}
                        {pool.riskLevel === 'medium' && 'Balanced approach'}
                        {pool.riskLevel === 'high' && 'Aggressive returns'}
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>

              {/* Pool Details */}
              <Card className="glass-card p-6">
                <h3 className="mb-4 text-lg font-semibold">Pool Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contract</span>
                    <span className="font-mono text-xs">
                      {pool.address?.slice(0, 6)}...{pool.address?.slice(-4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lock Period</span>
                    <span className="font-medium">None</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Withdrawal Fee</span>
                    <span className="font-medium">0.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Performance Fee</span>
                    <span className="font-medium">10%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Min. Deposit</span>
                    <span className="font-medium">$500</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
