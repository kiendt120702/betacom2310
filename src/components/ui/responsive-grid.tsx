import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: number;
}

export const ResponsiveGrid = React.memo<ResponsiveGridProps>(({
  children,
  className,
  cols = {
    default: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5,
  },
  gap = 4,
}) => {
  const gridClasses = cn(
    'grid',
    `gap-${gap}`,
    cols.default && `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    cols['2xl'] && `2xl:grid-cols-${cols['2xl']}`,
    className
  );

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
});

ResponsiveGrid.displayName = "ResponsiveGrid";

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  padding?: boolean;
}

export const ResponsiveContainer = React.memo<ResponsiveContainerProps>(({
  children,
  className,
  maxWidth = '7xl',
  padding = true,
}) => {
  const containerClasses = cn(
    'mx-auto',
    maxWidth !== 'full' && `max-w-${maxWidth}`,
    padding && 'px-4 sm:px-6 lg:px-8',
    className
  );

  return (
    <div className={containerClasses}>
      {children}
    </div>
  );
});

ResponsiveContainer.displayName = "ResponsiveContainer";