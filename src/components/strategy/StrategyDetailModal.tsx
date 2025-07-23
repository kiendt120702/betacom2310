
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Target, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  BarChart3, 
  Clock,
  Star,
  Tag
} from 'lucide-react';
import { Strategy } from '@/hooks/useStrategies';

interface StrategyDetailModalProps {
  strategy: Strategy | null;
  isOpen: boolean;
  onClose: () => void;
}

export const StrategyDetailModal: React.FC<StrategyDetailModalProps> = ({
  strategy,
  isOpen,
  onClose
}) => {
  if (!strategy) return null;

  const getDifficultyColor = (level: number) => {
    if (level <= 2) return 'text-green-600 bg-green-50';
    if (level <= 3) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'A1': return 'bg-emerald-100 text-emerald-800';
      case 'A': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 pr-8">
            {strategy.title}
          </DialogTitle>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge className={getCategoryColor(strategy.category)}>
              Công thức {strategy.category}
            </Badge>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-500 fill-current" />
              <span className="text-sm font-medium">{strategy.success_rate}% thành công</span>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Thông tin cơ bản */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Target className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Mục tiêu</p>
                  <p className="text-sm text-blue-700">{strategy.objective}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-purple-900">Ngành hàng áp dụng</p>
                  <p className="text-sm text-purple-700">{strategy.target_audience}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Giải thích chi tiết */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Giải Thích Chi Tiết
              </h3>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed">{strategy.explanation}</p>
              </div>
            </div>

            <Separator />

            {/* Các bước thực hiện */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Các Bước Thực Hiện
              </h3>
              <div className="space-y-3">
                {strategy.strategy_steps.map((step, index) => (
                  <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <p className="text-gray-700">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Lợi ích */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Lợi Ích Mang Lại
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {strategy.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-2 p-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* KPIs */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Chỉ Số Đo Lường (KPIs)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {strategy.kpis.map((kpi, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-purple-50 rounded">
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-purple-700 font-medium">{kpi}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            {strategy.tags.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-gray-600" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {strategy.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Context info */}
            {strategy.context_info && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-3">Thông Tin Bổ Sung</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{strategy.context_info}</p>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
