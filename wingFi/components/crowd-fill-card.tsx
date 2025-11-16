import Link from 'next/link';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { type CrowdFillData } from '@/lib/mock-data';
import { Plane, Clock, DollarSign, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CrowdFillCardProps {
  policy: CrowdFillData;
}

export function CrowdFillCard({ policy }: CrowdFillCardProps) {
  const fillPercentage = (policy.coverageFilled / policy.coverageRequired) * 100;
  const remainingCoverage = policy.coverageRequired - policy.coverageFilled;

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
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Plane className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-bold">{policy.flight}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{policy.route}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Departure: {policy.departure}
            </p>
          </div>
          <Badge variant="outline" className={getRiskColor(policy.riskLevel)}>
            {policy.riskLevel} risk
          </Badge>
        </div>

        {/* Coverage Progress */}
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Coverage Progress</span>
            <span className="font-semibold">{fillPercentage.toFixed(0)}%</span>
          </div>
          <Progress value={fillPercentage} className="h-3" />
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              ${policy.coverageFilled.toLocaleString()} funded
            </span>
            <span className="text-muted-foreground">
              ${policy.coverageRequired.toLocaleString()} needed
            </span>
          </div>
        </div>

        {/* Key Info Grid */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-secondary/30 p-3">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-accent" />
              <span className="text-xs text-muted-foreground">Premium Offered</span>
            </div>
            <p className="text-lg font-bold">${policy.premium}</p>
          </div>

          <div className="rounded-lg bg-secondary/30 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-chart-5" />
              <span className="text-xs text-muted-foreground">Time Left</span>
            </div>
            <p className="text-lg font-bold">{policy.timeLeft}</p>
          </div>

          <div className="rounded-lg bg-secondary/30 p-3">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Remaining</span>
            </div>
            <p className="text-lg font-bold">${remainingCoverage.toLocaleString()}</p>
          </div>

          <div className="rounded-lg bg-secondary/30 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-accent" />
              <span className="text-xs text-muted-foreground">Contributors</span>
            </div>
            <p className="text-lg font-bold">{policy.contributors.length}</p>
          </div>
        </div>

        {/* Expected Return */}
        <div className="mb-4 rounded-lg bg-primary/10 p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Expected Return</span>
            <span className="text-lg font-bold text-primary">
              {((policy.premium / policy.coverageRequired) * 100).toFixed(2)}%
            </span>
          </div>
        </div>

        <Link href={`/crowd-fill/${policy.id}`}>
          <Button className="w-full">Fund This Policy</Button>
        </Link>
      </div>
    </Card>
  );
}
