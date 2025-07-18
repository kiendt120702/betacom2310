
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Target, Users, TrendingUp, Clock, Star } from 'lucide-react';
import { Strategy } from '@/hooks/useStrategies';

interface StrategyCardProps {
  strategy: Strategy;
  onViewDetails: (strategy: Strategy) => void;
}

export const StrategyCard: React.FC<StrategyCardProps> = ({ strategy, onViewDetails }) => {
  const getDifficultyColor = (level: number) => {
    if (level <= 2) return 'bg-green-100 text-green-800';
    if (level <= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Công thức A1': return 'bg-emerald-100 text-emerald-800';
      case 'Công thức A': return 'bg-blue-100 text-blue-800';
      case 'Ngành hàng áp dụng': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold line-clamp-2 text-gray-900">
            {strategy.title}
          </CardTitle>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-medium">{strategy.success_rate}%</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge className={getCategoryColor(strategy.category)}>
            {strategy.category}
          </Badge>
          <Badge variant="secondary">{strategy.industry}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Target className="w-4 h-4" />
          <span className="line-clamp-2">{strategy.objective}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>{strategy.target_audience}</span>
        </div>

        {strategy.estimated_time && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{strategy.estimated_time}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-gray-500" />
          <Badge className={getDifficultyColor(strategy.difficulty_level)}>
            Độ khó: {strategy.difficulty_level}/5
          </Badge>
        </div>

        <div className="text-sm text-gray-600 line-clamp-3">
          {strategy.explanation}
        </div>
      </CardContent>

      <CardFooter className="pt-3">
        <Button 
          onClick={() => onViewDetails(strategy)}
          className="w-full"
          variant="outline"
        >
          Xem Chi Tiết
        </Button>
      </CardFooter>
    </Card>
  );
};
