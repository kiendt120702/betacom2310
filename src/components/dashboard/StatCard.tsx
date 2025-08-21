import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    label: string;
  };
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  formatValue?: (value: number) => string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = React.memo(({
  title,
  value,
  change,
  icon: Icon,
  trend = "neutral",
  formatValue,
  className,
}) => {
  const formattedValue = typeof value === "number" && formatValue ? formatValue(value) : value;

  const trendColors = {
    up: "text-green-600",
    down: "text-red-600",
    neutral: "text-gray-600",
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formattedValue}</div>
        {change && (
          <p className={cn("text-xs mt-1", trendColors[trend])}>
            {change.value > 0 ? "+" : ""}{change.value}% {change.label}
          </p>
        )}
      </CardContent>
    </Card>
  );
});

StatCard.displayName = 'StatCard';

export default StatCard;