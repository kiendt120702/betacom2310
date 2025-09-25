import React from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  percentage?: number;
  color: 'gray' | 'green' | 'red' | 'yellow';
}

const colorClasses = {
  gray: 'bg-gray-100 text-gray-800',
  green: 'bg-green-100 text-green-800',
  red: 'bg-red-100 text-red-800',
  yellow: 'bg-yellow-100 text-yellow-800',
};

export const StatCard: React.FC<StatCardProps> = ({ label, value, percentage, color }) => {
  return (
    <div className={cn('p-4 rounded-lg', colorClasses[color])}>
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <div className="flex items-baseline gap-2 mt-1">
        <p className="text-2xl font-bold">{value}</p>
        {percentage !== undefined && (
          <p className="text-sm font-semibold">{`(${percentage.toFixed(1)}%)`}</p>
        )}
      </div>
    </div>
  );
};