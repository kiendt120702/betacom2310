
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, MessageSquare } from 'lucide-react';
import { Strategy } from '@/hooks/useStrategies';

interface StrategyCardProps {
  strategy: Strategy;
  onViewDetails: (strategy: Strategy) => void;
}

export const StrategyCard: React.FC<StrategyCardProps> = ({ strategy, onViewDetails }) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Công thức A1': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Công thức A': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Ngành hàng áp dụng': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getIndustryColor = (industry: string) => {
    const colors = [
      'bg-orange-100 text-orange-800',
      'bg-emerald-100 text-emerald-800',
      'bg-violet-100 text-violet-800',
      'bg-rose-100 text-rose-800',
      'bg-cyan-100 text-cyan-800'
    ];
    const index = industry.length % colors.length;
    return colors[index];
  };

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-200 border-l-4 border-l-orange-500 bg-white">
      <CardContent className="p-6">
        {/* Header with badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge className={getCategoryColor(strategy.category)}>
            {strategy.category}
          </Badge>
          <Badge className={getIndustryColor(strategy.industry)}>
            {strategy.industry}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">
          {strategy.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
          {strategy.explanation}
        </p>

        {/* Action Button */}
        <Button 
          onClick={() => onViewDetails(strategy)}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Giải thích chi tiết
        </Button>

        {/* View icon in corner */}
        <div className="absolute top-4 right-4 opacity-50">
          <Eye className="w-4 h-4 text-gray-400" />
        </div>
      </CardContent>
    </Card>
  );
};
