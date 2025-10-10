import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Calendar, ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGoalSettingContext } from '@/contexts/GoalSettingContext';

const GoalSettingFilters: React.FC = () => {
  const {
    filters,
    updateFilter,
    leaders,
    personnelOptions,
    monthOptions,
    openStates,
    setOpenLeaderSelector,
    setOpenPersonnelSelector,
  } = useGoalSettingContext();

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <Select value={filters.selectedMonth} onValueChange={(value) => updateFilter('selectedMonth', value)}>
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
      <Popover open={openStates.openLeaderSelector} onOpenChange={setOpenLeaderSelector}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={openStates.openLeaderSelector}
            className="w-full sm:w-[240px] justify-between"
            disabled={leaders.length === 0}
          >
            {leaders.length === 0
              ? "Không có Leader"
              : filters.selectedLeader !== "all"
              ? leaders.find((leader) => leader.id === filters.selectedLeader)?.name
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
                <CommandItem onSelect={() => { updateFilter('selectedLeader', 'all'); setOpenLeaderSelector(false); }}>
                  <Check className={cn("mr-2 h-4 w-4", filters.selectedLeader === "all" ? "opacity-100" : "opacity-0")} />
                  Tất cả Leader
                </CommandItem>
                {leaders.map((leader) => (
                  <CommandItem key={leader.id} value={leader.name} onSelect={() => { updateFilter('selectedLeader', leader.id); setOpenLeaderSelector(false); }}>
                    <Check className={cn("mr-2 h-4 w-4", filters.selectedLeader === leader.id ? "opacity-100" : "opacity-0")} />
                    {leader.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Popover open={openStates.openPersonnelSelector} onOpenChange={setOpenPersonnelSelector}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={openStates.openPersonnelSelector}
            className="w-full sm:w-[240px] justify-between"
            disabled={personnelOptions.length === 0}
          >
            {personnelOptions.length === 0
              ? "Không có nhân sự"
              : filters.selectedPersonnel !== "all"
              ? personnelOptions.find((p) => p.id === filters.selectedPersonnel)?.name
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
                <CommandItem onSelect={() => { updateFilter('selectedPersonnel', 'all'); setOpenPersonnelSelector(false); }}>
                  <Check className={cn("mr-2 h-4 w-4", filters.selectedPersonnel === "all" ? "opacity-100" : "opacity-0")} />
                  Tất cả nhân sự
                </CommandItem>
                {personnelOptions.map((personnel) => (
                  <CommandItem key={personnel.id} value={personnel.name} onSelect={() => { updateFilter('selectedPersonnel', personnel.id); setOpenPersonnelSelector(false); }}>
                    <Check className={cn("mr-2 h-4 w-4", filters.selectedPersonnel === personnel.id ? "opacity-100" : "opacity-0")} />
                    {personnel.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default GoalSettingFilters;