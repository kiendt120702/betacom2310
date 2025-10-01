import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Calendar, ChevronsUpDown, Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface GoalSettingFiltersProps {
  selectedMonth: string;
  onMonthChange: (value: string) => void;
  monthOptions: { value: string; label: string }[];
  selectedLeader: string;
  onLeaderChange: (value: string) => void;
  leaders: { id: string; name: string }[];
  openLeaderSelector: boolean;
  setOpenLeaderSelector: (open: boolean) => void;
  selectedPersonnel: string;
  onPersonnelChange: (value: string) => void;
  personnelOptions: { id: string; name: string }[];
  openPersonnelSelector: boolean;
  setOpenPersonnelSelector: (open: boolean) => void;
  onAddShop: () => void;
  isLoading: boolean;
}

const GoalSettingFilters: React.FC<GoalSettingFiltersProps> = ({
  selectedMonth,
  onMonthChange,
  monthOptions,
  selectedLeader,
  onLeaderChange,
  leaders,
  openLeaderSelector,
  setOpenLeaderSelector,
  selectedPersonnel,
  onPersonnelChange,
  personnelOptions,
  openPersonnelSelector,
  setOpenPersonnelSelector,
  onAddShop,
  isLoading,
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Calendar className="h-4 w-4 text-muted-foreground ml-4" />
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
        <Popover open={openLeaderSelector} onOpenChange={setOpenLeaderSelector}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openLeaderSelector}
              className="w-full sm:w-[240px] justify-between"
              disabled={isLoading || leaders.length === 0}
            >
              {leaders.length === 0
                ? "Không có Leader"
                : selectedLeader !== "all"
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
                  <CommandItem onSelect={() => { onLeaderChange("all"); setOpenLeaderSelector(false); }}>
                    <Check className={cn("mr-2 h-4 w-4", selectedLeader === "all" ? "opacity-100" : "opacity-0")} />
                    Tất cả Leader
                  </CommandItem>
                  {leaders.map((leader) => (
                    <CommandItem key={leader.id} value={leader.name} onSelect={() => { onLeaderChange(leader.id); setOpenLeaderSelector(false); }}>
                      <Check className={cn("mr-2 h-4 w-4", selectedLeader === leader.id ? "opacity-100" : "opacity-0")} />
                      {leader.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Popover open={openPersonnelSelector} onOpenChange={setOpenPersonnelSelector}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openPersonnelSelector}
              className="w-full sm:w-[240px] justify-between"
              disabled={isLoading || personnelOptions.length === 0}
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
                  <CommandItem onSelect={() => { onPersonnelChange("all"); setOpenPersonnelSelector(false); }}>
                    <Check className={cn("mr-2 h-4 w-4", selectedPersonnel === "all" ? "opacity-100" : "opacity-0")} />
                    Tất cả nhân sự
                  </CommandItem>
                  {personnelOptions.map((personnel) => (
                    <CommandItem key={personnel.id} value={personnel.name} onSelect={() => { onPersonnelChange(personnel.id); setOpenPersonnelSelector(false); }}>
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
      <Button onClick={onAddShop}>
        <Plus className="mr-2 h-4 w-4" /> Thêm Shop
      </Button>
    </div>
  );
};

export default GoalSettingFilters;