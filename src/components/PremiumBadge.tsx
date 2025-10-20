import { Coins, Lock } from 'lucide-react';
import { Badge } from './ui/badge';

interface PremiumBadgeProps {
  tokenCost: number;
  purchased?: boolean;
  compact?: boolean;
}

export const PremiumBadge = ({ tokenCost, purchased, compact }: PremiumBadgeProps) => {
  if (tokenCost === 0) return null;

  if (purchased) {
    return (
      <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
        <Lock className="h-3 w-3 mr-1" />
        Owned
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
      <Coins className="h-3 w-3 mr-1" />
      {compact ? tokenCost : `${tokenCost} tokens`}
    </Badge>
  );
};
