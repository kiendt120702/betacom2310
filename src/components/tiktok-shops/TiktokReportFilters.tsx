import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";

interface TiktokReportFiltersProps {
  selectedMonth: string;
  onMonthChange: (value: string) => void;
  monthOptions: { value: string; label: string }[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const TiktokReportFilters: React.FC<TiktokReportFiltersProps> = ({
  selectedMonth,
  onMonthChange,
  monthOptions,
  searchTerm,
  onSearchChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t mt-4">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <Select value={selectedMonth} onValueChange={onMonthChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Chọn tháng" />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Label htmlFor="search" className="sr-only">Tìm kiếm</Label>
        <Input
          id="search"
          placeholder="Tìm kiếm shop..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-[200px]"
        />
      </div>
    </div>
  );
};

export default TiktokReportFilters;