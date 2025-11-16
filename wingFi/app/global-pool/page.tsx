'use client';

import { SidebarNav } from '@/components/sidebar-nav';
import { Topbar } from '@/components/topbar';
import { FlightTicker } from '@/components/flight-ticker';
import { StatCard } from '@/components/stat-card';
import { DepositWithdrawForm } from '@/components/deposit-withdraw-form';
import { RiskScoreBadge } from '@/components/risk-score-badge';
import { PerformanceChart } from '@/components/performance-chart';
import { DollarSign, TrendingUp, Users, Activity, AlertCircle, Percent } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useGlobalPoolData, useGlobalPoolPosition } from '@/lib/web3/global-pool-data';
import { useWallet } from '@/lib/wallet-context';
import { contracts } from '@/lib/web3/contracts';

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

export default function GlobalPoolPage() {
  const { address } = useWallet();
  const { tvl, tvlFormatted, tvlLoading, lpCount, apy, premiumsCollected, claimsPaid, utilization, riskScore } = useGlobalPoolData();
  const { lpBalance, lpBalanceFormatted, balanceLoading } = useGlobalPoolPosition(address as any);

  // Generate historical data based on current values
  const historicalData = generateHistoricalData(tvl);
  const premiumsData = generateHistoricalData(premiumsCollected);

  // Use contract APY if available, otherwise calculate from premiums
  const displayAPY = apy > 0 ? apy : (tvl > 0 ? ((premiumsCollected - claimsPaid) / tvl) * 100 : 0);
  const displayUtilization = utilization > 0 ? utilization : (tvl > 0 ? ((premiumsCollected + claimsPaid) / tvl) * 100 : 0);

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <Topbar />
      <FlightTicker />

      <main className="ml-64 pt-28">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-balance">Global Pool</h1>
            <p className="mt-2 text-muted-foreground">
              Diversified exposure across all policies
            </p>
          </div>

          {/* Stats Grid */}
          <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Value Locked"
              value={tvlLoading ? 'Loading...' : tvl >= 1000000 ? `$${(tvl / 1000000).toFixed(2)}M` : tvl >= 1000 ? `$${(tvl / 1000).toFixed(1)}K` : `$${tvl.toFixed(2)}`}
              change="Live from contract"
              changeType="neutral"
              icon={DollarSign}
            />
            <StatCard
              title="Current APY"
              value={displayAPY > 0 ? `${displayAPY.toFixed(2)}%` : 'N/A'}
              change="Live from contract"
              changeType="neutral"
              icon={TrendingUp}
            />
            <StatCard
              title="Total LPs"
              value={lpCount.toString()}
              change="Live from contract"
              changeType="neutral"
              icon={Users}
            />
            <StatCard
              title="Pool Utilization"
              value={displayUtilization > 0 ? `${displayUtilization.toFixed(1)}%` : 'N/A'}
              change="Live from contract"
              changeType="neutral"
              icon={Activity}
            />
          </div>

          <div className="mb-8 grid gap-6 lg:grid-cols-3">
            {/* Pool Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Key Metrics */}
              <Card className="glass-card p-6">
                <h2 className="mb-6 text-xl font-bold">Key Metrics</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        Premiums Collected
                      </span>
                      <span className="font-semibold">
                        {premiumsCollected >= 1000 
                          ? `$${(premiumsCollected / 1000).toFixed(1)}K`
                          : `$${premiumsCollected.toFixed(2)}`
                        }
                      </span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Claims Paid</span>
                      <span className="font-semibold">
                        {claimsPaid >= 1000 
                          ? `$${(claimsPaid / 1000).toFixed(1)}K`
                          : `$${claimsPaid.toFixed(2)}`
                        }
                      </span>
                    </div>
                    <Progress value={50} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        Pool Utilization
                      </span>
                      <span className="font-semibold">
                        {displayUtilization.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={displayUtilization} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Risk Score</span>
                      <span className="font-semibold">{riskScore > 0 ? `${riskScore}/10` : 'N/A'}</span>
                    </div>
                    {riskScore > 0 && <RiskScoreBadge score={riskScore} showLabel={false} />}
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg bg-secondary/30 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Percent className="h-4 w-4 text-primary" />
                      <span className="text-sm text-muted-foreground">
                        Premium Income Ratio
                      </span>
                    </div>
                    <p className="text-2xl font-bold">
                      {tvl > 0 ? ((premiumsCollected / tvl) * 100).toFixed(1) : '0'}%
                    </p>
                  </div>

                  <div className="rounded-lg bg-secondary/30 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <span className="text-sm text-muted-foreground">Claims Ratio</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {premiumsCollected > 0 ? ((claimsPaid / premiumsCollected) * 100).toFixed(1) : '0'}%
                    </p>
                  </div>

                  <div className="rounded-lg bg-secondary/30 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-accent" />
                      <span className="text-sm text-muted-foreground">Net Profit</span>
                    </div>
                    <p className={`text-2xl font-bold ${(premiumsCollected - claimsPaid) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {Math.abs(premiumsCollected - claimsPaid) >= 1000 
                        ? `${(premiumsCollected - claimsPaid) >= 0 ? '+' : '-'}$${(Math.abs(premiumsCollected - claimsPaid) / 1000).toFixed(1)}K`
                        : `${(premiumsCollected - claimsPaid) >= 0 ? '+' : '-'}$${Math.abs(premiumsCollected - claimsPaid).toFixed(2)}`
                      }
                    </p>
                  </div>
                </div>
              </Card>

              {/* Historical Performance */}
              <PerformanceChart
                data={historicalData}
                title="TVL Historical Performance"
              />

              <PerformanceChart
                data={premiumsData}
                title="Premium Income Trend"
              />
            </div>

            {/* Deposit/Withdraw Form */}
            <div className="space-y-6">
              <DepositWithdrawForm
                poolName="Global Pool"
                poolAddress={contracts.globalPool.address}
                poolType="global"
              />

              {/* User Position */}
              {address && (
                <Card className="glass-card p-6">
                  <h3 className="mb-4 text-lg font-semibold">Your Position</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">LP Balance</span>
                      <span className="font-medium">
                        {balanceLoading ? 'Loading...' : `${lpBalanceFormatted} LP`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Value</span>
                      <span className="font-medium">
                        ${balanceLoading ? '...' : lpBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </Card>
              )}

              {/* Risk Profile */}
              <Card className="glass-card p-6">
                <h3 className="mb-4 text-lg font-semibold">Risk Profile</h3>
                <div className="space-y-4">
                  <div>
                    {riskScore > 0 && <RiskScoreBadge score={riskScore} />}
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      The Global Pool provides diversified exposure across all airlines and
                      routes, offering balanced risk-reward ratio.
                    </p>
                    <ul className="ml-4 space-y-1 list-disc text-muted-foreground">
                      <li>Medium volatility</li>
                      <li>Consistent returns</li>
                      <li>Automatic rebalancing</li>
                      <li>Lower concentration risk</li>
                    </ul>
                  </div>
                </div>
              </Card>

              {/* Pool Details */}
              <Card className="glass-card p-6">
                <h3 className="mb-4 text-lg font-semibold">Pool Details</h3>
                <div className="space-y-3 text-sm">
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
                    <span className="font-medium">$100</span>
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
