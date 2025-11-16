'use client';

import { SidebarNav } from '@/components/sidebar-nav';
import { Topbar } from '@/components/topbar';
import { StatCard } from '@/components/stat-card';
import { DollarSign, TrendingUp, AlertCircle, Users, Plane, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDashboardStats, useTopAirlinePools } from '@/lib/web3/dashboard-data';
import { FlightTicker } from '@/components/flight-ticker';
import { AnalyticsChart } from '@/components/analytics-chart';

// Helper to generate simulated historical data from current value
const generateHistoricalData = (currentValue: number, months: number = 6) => {
  const now = new Date();
  const data = [];
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    // Simulate growth curve - start from lower values
    const growthFactor = (months - i) / months;
    const randomVariation = 0.85 + Math.random() * 0.15;
    const value = currentValue * growthFactor * randomVariation;
    data.push({ date: monthName, value: Math.max(0, value) });
  }
  
  return data;
};

export default function DashboardPage() {
  const stats = useDashboardStats();
  const topPools = useTopAirlinePools(3);

  // Generate chart data based on current stats
  const tvlHistory = generateHistoricalData(stats.totalTVL);
  
  // Generate premiums vs claims data
  const premiumsVsClaimsData = Array.from({ length: 6 }, (_, i) => {
    const now = new Date();
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    const growthFactor = (6 - (5 - i)) / 6;
    const premiums = stats.totalPremiums * growthFactor * (0.85 + Math.random() * 0.15);
    const claims = stats.totalClaims * growthFactor * (0.85 + Math.random() * 0.15);
    return { date: monthName, premiums, claims };
  });
  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <Topbar />
      <FlightTicker />

      <main className="ml-64 pt-28">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-balance">
              Overview Dashboard
            </h1>
            <p className="mt-2 text-muted-foreground">
              Monitor your liquidity positions and protocol performance
            </p>
          </div>

          {/* Stats Grid */}
          <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Value Locked"
              value={stats.isLoading ? 'Loading...' : stats.totalTVL >= 1000000 ? `$${(stats.totalTVL / 1000000).toFixed(2)}M` : stats.totalTVL >= 1000 ? `$${(stats.totalTVL / 1000).toFixed(1)}K` : `$${stats.totalTVL.toFixed(2)}`}
              change="Live from all pools"
              changeType="neutral"
              icon={DollarSign}
            />
            <StatCard
              title="Total Premiums Earned"
              value={stats.isLoading ? 'Loading...' : stats.totalPremiums >= 1000 ? `$${(stats.totalPremiums / 1000).toFixed(2)}K` : `$${stats.totalPremiums.toFixed(2)}`}
              change="Real-time from contracts"
              changeType="positive"
              icon={TrendingUp}
            />
            <StatCard
              title="Total Claims Paid"
              value={stats.isLoading ? 'Loading...' : stats.totalClaims >= 1000 ? `$${(stats.totalClaims / 1000).toFixed(2)}K` : `$${stats.totalClaims.toFixed(2)}`}
              change={`Claims ratio: ${stats.claimsRatio.toFixed(1)}%`}
              changeType="neutral"
              icon={AlertCircle}
            />
            <StatCard
              title="Active LPs"
              value={stats.isLoading ? '...' : stats.totalLPs.toString()}
              change="Across all pools"
              changeType="positive"
              icon={Users}
            />
          </div>

          {/* APY Cards */}
          <div className="mb-8 grid gap-6 md:grid-cols-3">
            <Card className="glass-card p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Global Pool APY</p>
                  <p className="text-2xl font-bold text-primary">
                    {stats.isLoading ? '...' : stats.globalAPY.toFixed(2)}%
                  </p>
                </div>
              </div>
            </Card>
            <Card className="glass-card p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-accent/10 p-3">
                  <Plane className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Airline Pools Avg APY
                  </p>
                  <p className="text-2xl font-bold text-accent">
                    {stats.isLoading ? '...' : stats.airlineAvgAPY.toFixed(2)}%
                  </p>
                </div>
              </div>
            </Card>
            <Card className="glass-card p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-chart-3/10 p-3">
                  <Users className="h-6 w-6 text-chart-3" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Crowd-Fill Avg APY
                  </p>
                  <p className="text-2xl font-bold text-chart-3">
                    {stats.crowdFillAvgAPY.toFixed(2)}%
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            <AnalyticsChart
              data={premiumsVsClaimsData}
              title="Premiums vs Claims"
              type="bar"
              dataKeys={[
                { key: 'premiums', color: 'hsl(var(--chart-1))', name: 'Premiums' },
                { key: 'claims', color: 'hsl(var(--chart-2))', name: 'Claims' },
              ]}
              valuePrefix="$"
            />

            <AnalyticsChart
              data={tvlHistory}
              title="Total Value Locked Trend"
              type="line"
              dataKeys={[
                { key: 'value', color: 'hsl(var(--primary))', name: 'TVL' },
              ]}
              valuePrefix="$"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Insurance Stats */}
            <Card className="glass-card p-6">
              <h2 className="mb-6 text-xl font-bold">Insurance Product Stats</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Policies</span>
                  <span className="text-lg font-semibold">
                    {stats.isLoading ? '...' : stats.totalPolicies}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Delay Rate</span>
                  <span className="text-lg font-semibold">
                    {stats.isLoading ? '...' : stats.delayPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Cancellation Rate</span>
                  <span className="text-lg font-semibold">
                    {stats.isLoading ? '...' : stats.cancellationPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Claims Ratio
                  </span>
                  <span className="text-lg font-semibold">
                    {stats.isLoading ? '...' : stats.claimsRatio.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                  Top Performing Airline Pools
                </h3>
                <div className="space-y-2">
                  {topPools.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      Loading pools...
                    </p>
                  ) : (
                    topPools.map((pool: any) => (
                      <div
                        key={pool.airlineCode}
                        className="flex items-center justify-between rounded-lg bg-secondary/30 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">
                            {pool.airlineCode.substring(0, 2)}
                          </div>
                          <span className="font-medium">{pool.airlineName}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-primary">{pool.calculatedAPY.toFixed(2)}%</p>
                          <p className="text-xs text-muted-foreground">APY</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>

            {/* Protocol Overview */}
            <Card className="glass-card p-6">
              <h2 className="mb-6 text-xl font-bold">Protocol Overview</h2>
              <div className="space-y-6">
                {/* Total Value Metrics */}
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Total Value Locked</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    {stats.isLoading ? '$...' : stats.totalTVL >= 1000000 ? `$${(stats.totalTVL / 1000000).toFixed(2)}M` : stats.totalTVL >= 1000 ? `$${(stats.totalTVL / 1000).toFixed(1)}K` : `$${stats.totalTVL.toFixed(2)}`}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Across all insurance pools
                  </p>
                </div>

                {/* Premiums */}
                <div className="rounded-lg bg-accent/5 border border-accent/20 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-5 w-5 text-accent" />
                    <span className="font-semibold">Total Premiums Collected</span>
                  </div>
                  <p className="text-3xl font-bold text-accent">
                    {stats.isLoading ? '$...' : stats.totalPremiums >= 1000 ? `$${(stats.totalPremiums / 1000).toFixed(2)}K` : `$${stats.totalPremiums.toFixed(2)}`}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    From {stats.totalPolicies} policies sold
                  </p>
                </div>

                {/* Claims */}
                <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <span className="font-semibold">Total Claims Paid</span>
                  </div>
                  <p className="text-3xl font-bold text-destructive">
                    {stats.isLoading ? '$...' : stats.totalClaims >= 1000 ? `$${(stats.totalClaims / 1000).toFixed(2)}K` : `$${stats.totalClaims.toFixed(2)}`}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {stats.claimsRatio.toFixed(1)}% claims ratio
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
