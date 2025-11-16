'use client';

import { SidebarNav } from '@/components/sidebar-nav';
import { Topbar } from '@/components/topbar';
import { FlightTicker } from '@/components/flight-ticker';
import { StatCard } from '@/components/stat-card';
import { PositionCard } from '@/components/position-card';
import { lpPositions } from '@/lib/mock-data';
import { Card } from '@/components/ui/card';
import { useWallet } from '@/lib/wallet-context';
import { DollarSign, TrendingUp, Wallet, Activity, PieChart } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function PortfolioPage() {
  const { isConnected } = useWallet();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <SidebarNav />
        <Topbar />
        <FlightTicker />

        <main className="ml-64 pt-28">
          <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-8">
            <Card className="glass-card max-w-md p-8 text-center">
              <Wallet className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
              <h2 className="mb-2 text-2xl font-bold">Connect Your Wallet</h2>
              <p className="text-muted-foreground">
                Please connect your wallet to view your LP portfolio and positions
              </p>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Calculate totals
  const totalDeposited = lpPositions.reduce(
    (sum, pos) => sum + pos.amountDeposited,
    0
  );
  const totalCurrentValue = lpPositions.reduce(
    (sum, pos) => sum + pos.currentValue,
    0
  );
  const totalPremiumsEarned = lpPositions.reduce(
    (sum, pos) => sum + pos.premiumsEarned,
    0
  );
  const totalPendingRewards = lpPositions.reduce(
    (sum, pos) => sum + pos.pendingRewards,
    0
  );
  const totalProfitLoss = totalCurrentValue - totalDeposited;
  const totalProfitLossPercentage = (totalProfitLoss / totalDeposited) * 100;
  const weightedAPY =
    lpPositions.reduce((sum, pos) => sum + pos.apy * pos.currentValue, 0) /
    totalCurrentValue;

  // Calculate exposure by pool type
  const globalExposure =
    (lpPositions
      .filter((p) => p.poolType === 'global')
      .reduce((sum, p) => sum + p.currentValue, 0) /
      totalCurrentValue) *
    100;
  const airlineExposure =
    (lpPositions
      .filter((p) => p.poolType === 'airline')
      .reduce((sum, p) => sum + p.currentValue, 0) /
      totalCurrentValue) *
    100;
  const crowdFillExposure =
    (lpPositions
      .filter((p) => p.poolType === 'crowd-fill')
      .reduce((sum, p) => sum + p.currentValue, 0) /
      totalCurrentValue) *
    100;

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <Topbar />
      <FlightTicker />

      <main className="ml-64 pt-28">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-balance">My Portfolio</h1>
            <p className="mt-2 text-muted-foreground">
              Track your LP positions and earnings across all pools
            </p>
          </div>

          {/* Stats Grid */}
          <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Deposited"
              value={`$${totalDeposited.toLocaleString()}`}
              icon={DollarSign}
            />
            <StatCard
              title="Current Value"
              value={`$${totalCurrentValue.toLocaleString()}`}
              change={`${totalProfitLossPercentage >= 0 ? '+' : ''}${totalProfitLossPercentage.toFixed(2)}%`}
              changeType={totalProfitLossPercentage >= 0 ? 'positive' : 'negative'}
              icon={TrendingUp}
            />
            <StatCard
              title="Total Premiums Earned"
              value={`$${totalPremiumsEarned.toLocaleString()}`}
              icon={Wallet}
            />
            <StatCard
              title="Weighted Avg APY"
              value={`${weightedAPY.toFixed(2)}%`}
              icon={Activity}
            />
          </div>

          <div className="mb-8 grid gap-6 lg:grid-cols-3">
            {/* Portfolio Summary */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profit/Loss Summary */}
              <Card className="glass-card p-6">
                <h2 className="mb-6 text-xl font-bold">Performance Summary</h2>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="rounded-lg bg-secondary/30 p-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      Total Profit/Loss
                    </p>
                    <p
                      className={`text-3xl font-bold ${
                        totalProfitLoss >= 0 ? 'text-accent' : 'text-destructive'
                      }`}
                    >
                      {totalProfitLoss >= 0 ? '+' : ''}$
                      {totalProfitLoss.toLocaleString()}
                    </p>
                    <p
                      className={`text-sm ${
                        totalProfitLoss >= 0 ? 'text-accent' : 'text-destructive'
                      }`}
                    >
                      {totalProfitLoss >= 0 ? '+' : ''}
                      {totalProfitLossPercentage.toFixed(2)}%
                    </p>
                  </div>

                  <div className="rounded-lg bg-secondary/30 p-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      Pending Rewards
                    </p>
                    <p className="text-3xl font-bold text-primary">
                      ${totalPendingRewards.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Ready to claim</p>
                  </div>

                  <div className="rounded-lg bg-secondary/30 p-4">
                    <p className="text-sm text-muted-foreground mb-2">Active Positions</p>
                    <p className="text-3xl font-bold">{lpPositions.length}</p>
                    <p className="text-sm text-muted-foreground">
                      Across {new Set(lpPositions.map((p) => p.poolType)).size} pool types
                    </p>
                  </div>
                </div>
              </Card>

              {/* Positions */}
              <div>
                <h2 className="mb-4 text-xl font-bold">Active Positions</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {lpPositions.map((position, index) => (
                    <PositionCard key={index} position={position} />
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Exposure Breakdown */}
              <Card className="glass-card p-6">
                <div className="mb-4 flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Exposure Breakdown</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Global Pool
                      </span>
                      <span className="font-semibold">
                        {globalExposure.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={globalExposure} className="h-2" />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Airline Pools
                      </span>
                      <span className="font-semibold">
                        {airlineExposure.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={airlineExposure} className="h-2" />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Crowd-Fill
                      </span>
                      <span className="font-semibold">
                        {crowdFillExposure.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={crowdFillExposure} className="h-2" />
                  </div>
                </div>
              </Card>

              {/* Earnings Breakdown */}
              <Card className="glass-card p-6">
                <h3 className="mb-4 text-lg font-semibold">Earnings Breakdown</h3>
                <div className="space-y-3">
                  {lpPositions.map((position, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg bg-secondary/30 p-3"
                    >
                      <div>
                        <p className="font-medium">{position.poolName}</p>
                        <p className="text-xs text-muted-foreground">
                          {position.apy}% APY
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-accent">
                          ${position.premiumsEarned.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">Earned</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Risk Profile */}
              <Card className="glass-card p-6">
                <h3 className="mb-4 text-lg font-semibold">Portfolio Risk</h3>
                <div className="space-y-4">
                  <div className="rounded-lg bg-secondary/30 p-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      Overall Risk Level
                    </p>
                    <p className="text-2xl font-bold">Medium</p>
                    <Progress value={60} className="mt-3 h-2" />
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>Your portfolio is well-diversified across:</p>
                    <ul className="ml-4 space-y-1 list-disc">
                      <li>{globalExposure.toFixed(0)}% in stable global pool</li>
                      <li>{airlineExposure.toFixed(0)}% in airline-specific pools</li>
                      <li>{crowdFillExposure.toFixed(0)}% in high-return crowd-fill</li>
                    </ul>
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
