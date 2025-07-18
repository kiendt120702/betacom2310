
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Target, 
  TrendingUp, 
  Users, 
  BarChart3,
  Award,
  Clock
} from 'lucide-react';
import { Strategy, StrategyCategory, StrategyIndustry } from '@/hooks/useStrategies';

interface StrategyDashboardProps {
  strategies: Strategy[];
  categories: StrategyCategory[];
  industries: StrategyIndustry[];
}

export const StrategyDashboard: React.FC<StrategyDashboardProps> = ({
  strategies,
  categories,
  industries
}) => {
  const totalStrategies = strategies.length;
  const avgSuccessRate = strategies.length > 0 
    ? Math.round(strategies.reduce((sum, s) => sum + s.success_rate, 0) / strategies.length)
    : 0;
  
  const categoryStats = categories.map(cat => ({
    name: cat.name,
    count: strategies.filter(s => s.category === cat.name).length,
    color: cat.color
  }));

  const industryStats = industries.map(ind => ({
    name: ind.name,
    count: strategies.filter(s => s.industry === ind.name).length
  })).sort((a, b) => b.count - a.count).slice(0, 5);

  const difficultyStats = [1, 2, 3, 4, 5].map(level => ({
    level,
    count: strategies.filter(s => s.difficulty_level === level).length
  }));

  const topStrategies = strategies
    .sort((a, b) => b.success_rate - a.success_rate)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Chiến Lược</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalStrategies}</div>
            <p className="text-xs text-gray-600">Chiến lược có sẵn</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ Lệ Thành Công</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{avgSuccessRate}%</div>
            <p className="text-xs text-gray-600">Trung bình</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Danh Mục</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{categories.length}</div>
            <p className="text-xs text-gray-600">Loại chiến lược</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ngành Hàng</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{industries.length}</div>
            <p className="text-xs text-gray-600">Lĩnh vực áp dụng</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Phân bố theo danh mục */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              Phân Bố Theo Danh Mục
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {categoryStats.map((cat, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-sm font-medium">{cat.name}</span>
                </div>
                <span className="text-sm text-gray-600">{cat.count} chiến lược</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top ngành hàng */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-600" />
              Top Ngành Hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {industryStats.map((industry, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium">{industry.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-500 rounded-full"
                      style={{ 
                        width: `${totalStrategies > 0 ? (industry.count / totalStrategies) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">{industry.count}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Độ khó */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Phân Bố Độ Khó
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {difficultyStats.map((diff, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium">Cấp độ {diff.level}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        diff.level <= 2 ? 'bg-green-500' : 
                        diff.level <= 3 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ 
                        width: `${totalStrategies > 0 ? (diff.count / totalStrategies) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">{diff.count}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top chiến lược */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-600" />
              Top Chiến Lược Hiệu Quả
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topStrategies.map((strategy, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex-1">
                  <p className="text-sm font-medium line-clamp-1">{strategy.title}</p>
                  <p className="text-xs text-gray-600">{strategy.category}</p>
                </div>
                <div className="flex items-center gap-1 text-amber-600">
                  <Award className="w-4 h-4" />
                  <span className="text-sm font-medium">{strategy.success_rate}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
