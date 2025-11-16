'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { SidebarNav } from '@/components/sidebar-nav';
import { Topbar } from '@/components/topbar';
import { FlightTicker } from '@/components/flight-ticker';
import { crowdFillPolicies } from '@/lib/mock-data';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useWallet } from '@/lib/wallet-context';
import { Plane, Clock, DollarSign, Users, MapPin, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CrowdFillDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { isConnected } = useWallet();
  const [fundAmount, setFundAmount] = useState('');

  const policy = crowdFillPolicies.find((p) => p.id === params.id);

  if (!policy) {
    notFound();
  }

  const fillPercentage = (policy.coverageFilled / policy.coverageRequired) * 100;
  const remainingCoverage = policy.coverageRequired - policy.coverageFilled;
  const expectedReturn = ((policy.premium / policy.coverageRequired) * 100).toFixed(2);
  const userReturn = fundAmount
    ? ((parseFloat(fundAmount) / policy.coverageRequired) * policy.premium).toFixed(2)
    : '0';

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

  const handleFund = () => {
    if (fundAmount && isConnected) {
      console.log('[v0] Funding policy', policy.id, 'with', fundAmount);
      // Mock funding action
      router.push('/portfolio');
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
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-2">
              <Plane className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">{policy.flight}</h1>
              <Badge variant="outline" className={getRiskColor(policy.riskLevel)}>
                {policy.riskLevel} risk
              </Badge>
            </div>
            <p className="text-lg text-muted-foreground">{policy.route}</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Flight Details */}
              <Card className="glass-card p-6">
                <h2 className="mb-6 text-xl font-bold">Flight Details</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Route</p>
                      <p className="font-semibold">{policy.route}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Departure Time</p>
                      <p className="font-semibold">{policy.departure}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Plane className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Flight Number</p>
                      <p className="font-semibold">{policy.flight}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="mt-1 h-5 w-5 text-chart-5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Time Remaining</p>
                      <p className="font-semibold">{policy.timeLeft}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Coverage Progress */}
              <Card className="glass-card p-6">
                <h2 className="mb-6 text-xl font-bold">Coverage Status</h2>
                <div className="mb-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Funding Progress
                    </span>
                    <span className="text-2xl font-bold">
                      {fillPercentage.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={fillPercentage} className="h-4" />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg bg-secondary/30 p-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      Required Coverage
                    </p>
                    <p className="text-2xl font-bold">
                      ${policy.coverageRequired.toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-lg bg-secondary/30 p-4">
                    <p className="text-sm text-muted-foreground mb-2">Currently Funded</p>
                    <p className="text-2xl font-bold text-accent">
                      ${policy.coverageFilled.toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-lg bg-secondary/30 p-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      Still Needed
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      ${remainingCoverage.toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Contributors */}
              <Card className="glass-card p-6">
                <h2 className="mb-6 text-xl font-bold">
                  Current Contributors ({policy.contributors.length})
                </h2>
                <div className="space-y-3">
                  {policy.contributors.map((contributor, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg bg-secondary/30 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-mono text-sm font-semibold">
                            {contributor.address}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {((contributor.amount / policy.coverageRequired) * 100).toFixed(1)}% of coverage
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${contributor.amount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          Earns ${((contributor.amount / policy.coverageRequired) * policy.premium).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Fund Form */}
              <Card className="glass-card p-6">
                <h3 className="mb-4 text-lg font-semibold">Fund This Policy</h3>

                {!isConnected ? (
                  <div className="rounded-lg bg-secondary/30 p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Please connect your wallet to fund this policy
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <Label htmlFor="fund-amount">Amount (USDC)</Label>
                      <Input
                        id="fund-amount"
                        type="number"
                        placeholder="0.00"
                        value={fundAmount}
                        onChange={(e) => setFundAmount(e.target.value)}
                        className="mt-2"
                        max={remainingCoverage}
                      />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Max: ${remainingCoverage.toLocaleString()}
                      </p>
                    </div>

                    <div className="mb-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setFundAmount((remainingCoverage * 0.25).toString())
                        }
                      >
                        25%
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setFundAmount((remainingCoverage * 0.5).toString())
                        }
                      >
                        50%
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setFundAmount((remainingCoverage * 0.75).toString())
                        }
                      >
                        75%
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFundAmount(remainingCoverage.toString())}
                      >
                        MAX
                      </Button>
                    </div>

                    <Button
                      className="w-full mb-4"
                      onClick={handleFund}
                      disabled={!fundAmount || parseFloat(fundAmount) <= 0}
                    >
                      Fund ${fundAmount || '0'}
                    </Button>

                    {fundAmount && parseFloat(fundAmount) > 0 && (
                      <div className="rounded-lg bg-primary/10 p-4">
                        <h4 className="mb-2 text-sm font-semibold">
                          Your Potential Earnings
                        </h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Your contribution
                            </span>
                            <span className="font-medium">${fundAmount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Expected premium
                            </span>
                            <span className="font-medium text-accent">
                              ${userReturn}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">ROI</span>
                            <span className="font-medium text-primary">
                              {expectedReturn}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </Card>

              {/* Return Info */}
              <Card className="glass-card p-6">
                <h3 className="mb-4 text-lg font-semibold">Expected Returns</h3>
                <div className="space-y-4">
                  <div className="rounded-lg bg-primary/10 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        Premium Return
                      </span>
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-3xl font-bold text-primary">{expectedReturn}%</p>
                  </div>

                  <div className="rounded-lg bg-secondary/30 p-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      Total Premium Pool
                    </p>
                    <p className="text-2xl font-bold">${policy.premium}</p>
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>
                      If no claim is filed, you'll receive your portion of the ${policy.premium} premium proportional to your contribution.
                    </p>
                    <p>
                      If a claim occurs, your contributed capital will be used to pay
                      the insured party.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Risk Info */}
              <Card className="glass-card p-6">
                <h3 className="mb-4 text-lg font-semibold">Risk Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <Badge variant="outline" className={getRiskColor(policy.riskLevel)}>
                      {policy.riskLevel.toUpperCase()} RISK
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>
                      This policy is classified as {policy.riskLevel} risk based on:
                    </p>
                    <ul className="ml-4 space-y-1 list-disc">
                      <li>Historical airline performance</li>
                      <li>Route conditions and weather</li>
                      <li>Time of year and traffic</li>
                      <li>Aircraft type and age</li>
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
