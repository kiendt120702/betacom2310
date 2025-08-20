import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Calendar, ChevronsUpDown, Check, Search, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Employee } from "@/hooks/useEmployees";
import { CardTitle } from "@/components/ui/card";

interface ReportFiltersProps {
  selectedMonth: string;
  onMonthChange: (value: string) => void;
  monthOptions: { value: string; label: string }[];
  selectedLeader: string;
  onLeaderChange: (value: string) => void;
  leaders: Employee[];
  isLeaderSelectorOpen: boolean;
  onLeaderSelectorOpenChange: (open: boolean) => void;
  selectedPersonnel: string;
  onPersonnelChange: (value: string) => void;
  personnelOptions: Employee[];
  isPersonnelSelectorOpen: boolean;
  onPersonnelSelectorOpenChange: (open: boolean) => void;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  isLoading: boolean;
}

const ReportFilters: React.FC<ReportFiltersProps> = ({
  selectedMonth, onMonthChange, monthOptions,
  selectedLeader, onLeaderChange, leaders, isLeaderSelectorOpen, onLeaderSelectorOpenChange,
  selectedPersonnel, onPersonnelChange, personnelOptions, isPersonnelSelectorOpen, onPersonnelSelectorOpenChange,
  searchTerm, onSearchTermChange, isLoading
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-2 flex-wrap">
        <BarChart3 className="h-5 w-5" />
        <CardTitle className="text-xl font-semibold">
          Báo cáo Doanh số
        </CardTitle>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto flex-wrap">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Tìm kiếm shop..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="pl-10 w-full sm:w-48"
          />
        </div>
        <Select value={selectedMonth} onValueChange={onMonthChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Chọn tháng" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Popover open={isLeaderSelectorOpen} onOpenChange={onLeaderSelectorOpenChange}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isLeaderSelectorOpen}
              className="w-full sm:w-[240px] justify-between"
              disabled={isLoading}
            >
              {selectedLeader !== 'all'
                ? leaders.find((leader) => leader.id === selectedLeader)?.name
                : "Tất cả Leader"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[240px] p-0">
            <Command>
              <CommandInput placeholder="Tìm kiếm leader..." />
              <CommandList>
                <CommandEmpty>Không tìm thấy leader.</CommandEmpty>
                <CommandGroup>
                  <CommandItem onSelect={() => { onLeaderChange("all"); onLeaderSelectorOpenChange(false); }}>
                    <Check className={cn("mr-2 h-4 w-4", selectedLeader === "all" ? "opacity-100" : "opacity-0")} />
                    Tất cả Leader
                  </CommandItem>
                  {leaders.map((leader) => (
                    <CommandItem key={leader.id} value={leader.name} onSelect={() => { onLeaderChange(leader.id); onLeaderSelectorOpenChange(false); }}>
                      <Check className={cn("mr-2 h-4 w-4", selectedLeader === leader.id ? "opacity-100" : "opacity-0")} />
                      {leader.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Popover open={isPersonnelSelectorOpen} onOpenChange={onPersonnelSelectorOpenChange}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isPersonnelSelectorOpen}
              className="w-full sm:w-[240px] justify-between"
              disabled={isLoading}
            >
              {selectedPersonnel !== 'all'
                ? personnelOptions.find((p) => p.id === selectedPersonnel)?.name
                : "Tất cả nhân sự"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[240px] p-0">
            <Command>
              <CommandInput placeholder="Tìm kiếm nhân sự..." />
              <CommandList>
                <CommandEmpty>Không tìm thấy nhân sự.</CommandEmpty>
                <CommandGroup>
                  <CommandItem onSelect={() => { onPersonnelChange("all"); onPersonnelSelectorOpenChange(false); }}>
                    <Check className={cn("mr-2 h-4 w-4", selectedPersonnel === "all" ? "opacity-100" : "opacity-0")} />
                    Tất cả nhân sự
                  </CommandItem>
                  {personnelOptions.map((personnel) => (
                    <CommandItem key={personnel.id} value={personnel.name} onSelect={() => { onPersonnelChange(personnel.id); onPersonnelSelectorOpenChange(false); }}>
                      <Check className={cn("mr-2 h-4 w-4", selectedPersonnel === personnel.id ? "opacity-100" : "opacity-0")} />
                      {personnel.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default ReportFilters;