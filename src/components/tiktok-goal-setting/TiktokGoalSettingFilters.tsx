import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Calendar, ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTiktokGoalSettingContext } from '@/contexts/TiktokGoalSettingContext';

const TiktokGoalSettingFilters: React.FC = () => {
  const {
    selectedMonth,
    setSelectedMonth,
    monthOptions,
    selectedPersonnel,
    setSelectedPersonnel,
    personnelOptions,
    openPersonnelSelector,
    setOpenPersonnelSelector,
  } = useTiktokGoalSettingContext();

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <Select value={selectedMonth} onValueChange={setSelectedMonth}>
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
      <Popover open={openPersonnelSelector} onOpenChange={setOpenPersonnelSelector}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={openPersonnelSelector}
            className="w-full sm:w-[240px] justify-between"
            disabled={personnelOptions.length === 0}
          >
            {personnelOptions.length === 0
              ? "Không có nhân sự"
              : selectedPersonnel !== "all"
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
                <CommandItem onSelect={() => { setSelectedPersonnel("all"); setOpenPersonnelSelector(false); }}>
                  <Check className={cn("mr-2 h-4 w-4", selectedPersonnel === "all" ? "opacity-100" : "opacity-0")} />
                  Tất cả nhân sự
                </CommandItem>
                {personnelOptions.map((personnel) => (
                  <CommandItem key={personnel.id} value={personnel.name} onSelect={() => { setSelectedPersonnel(personnel.id); setOpenPersonnelSelector(false); }}>
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
  );
};

export default TiktokGoalSettingFilters;