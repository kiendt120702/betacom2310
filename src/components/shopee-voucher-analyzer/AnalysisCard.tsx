import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AnalysisCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  bgColor?: string;
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({ title, icon, children, bgColor = 'bg-white' }) => {
  return (
    <Card className={cn('shadow-lg rounded-xl', bgColor)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};