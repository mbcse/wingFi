import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

interface RiskScoreBadgeProps {
  score: number;
  showLabel?: boolean;
}

export function RiskScoreBadge({ score, showLabel = true }: RiskScoreBadgeProps) {
  const getRiskLevel = (score: number) => {
    if (score <= 3) return { label: 'Low Risk', color: 'text-accent' };
    if (score <= 6) return { label: 'Medium Risk', color: 'text-chart-5' };
    return { label: 'High Risk', color: 'text-destructive' };
  };

  const risk = getRiskLevel(score);

  return (
    <div className="flex items-center gap-2">
      {showLabel && (
        <span className={cn('text-sm font-medium', risk.color)}>{risk.label}</span>
      )}
      <div className="flex items-center gap-1">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-2 w-2 rounded-full',
              i < score ? risk.color.replace('text-', 'bg-') : 'bg-muted'
            )}
          />
        ))}
      </div>
      <span className="text-sm font-mono">{score}/10</span>
    </div>
  );
}
