import Link from 'next/link';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { type LPPosition } from '@/lib/mock-data';
import { TrendingUp, DollarSign, Percent } from 'lucide-react';

interface PositionCardProps {
  position: LPPosition;
}

export function PositionCard({ position }: PositionCardProps) {
  const profitLoss = position.currentValue - position.amountDeposited;
  const profitLossPercentage = (profitLoss / position.amountDeposited) * 100;
  const isProfit = profitLoss >= 0;

  const getPoolLink = () => {
    if (position.poolType === 'global') return '/global-pool';
    if (position.poolType === 'airline') {
      // Extract airline name from pool name (e.g., "Emirates Pool" -> "emirates")
      const airlineId = position.poolName.toLowerCase().split(' ')[0];
      return `/airline-pools/${airlineId}`;
    }
    // For crowd-fill, return to marketplace
    return '/crowd-fill';
  };

  const getPoolTypeBadge = () => {
    switch (position.poolType) {
      case 'global':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'airline':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'crowd-fill':
        return 'bg-chart-3/10 text-chart-3 border-chart-3/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  return (
    <Card className="glass-card p-6">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold">{position.poolName}</h3>
          <Badge variant="outline" className={getPoolTypeBadge()}>
            {position.poolType}
          </Badge>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">{position.apy}%</p>
          <p className="text-sm text-muted-foreground">APY</p>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-secondary/30 p-3">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Deposited</span>
          </div>
          <p className="text-lg font-semibold">
            ${position.amountDeposited.toLocaleString()}
          </p>
        </div>

        <div className="rounded-lg bg-secondary/30 p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Current Value</span>
          </div>
          <p className="text-lg font-semibold">
            ${position.currentValue.toLocaleString()}
          </p>
        </div>

        <div className="rounded-lg bg-secondary/30 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Percent className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Premiums Earned</span>
          </div>
          <p className="text-lg font-semibold">
            ${position.premiumsEarned.toLocaleString()}
          </p>
        </div>

        <div className="rounded-lg bg-secondary/30 p-3">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Pending Rewards</span>
          </div>
          <p className="text-lg font-semibold">
            ${position.pendingRewards.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mb-4 rounded-lg bg-primary/10 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Profit/Loss</span>
          <div className="text-right">
            <p
              className={`text-lg font-bold ${
                isProfit ? 'text-accent' : 'text-destructive'
              }`}
            >
              {isProfit ? '+' : ''}${profitLoss.toLocaleString()}
            </p>
            <p
              className={`text-sm ${
                isProfit ? 'text-accent' : 'text-destructive'
              }`}
            >
              {isProfit ? '+' : ''}
              {profitLossPercentage.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      <Link href={getPoolLink()}>
        <Button variant="outline" className="w-full">
          Manage Position
        </Button>
      </Link>
    </Card>
  );
}
