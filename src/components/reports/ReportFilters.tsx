import React, { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Calendar, ChevronsUpDown, Check, Search, RotateCcw, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Employee {
  id: string;
  name: string;
}

interface ReportFiltersCompatibleProps {
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
  selectedColorFilter?: string;
  onColorFilterChange?: (value: string) => void;
  selectedStatusFilter?: string[];
  onStatusFilterChange?: (value: string[]) => void;
  isLoading: boolean;
  onClearFilters: () => void;
}

/**
 * Compatible version của ReportFilters cho trang cũ
 * Sử dụng props thay vì Context để tương thích ngược
 */
const ReportFiltersCompatible: React.FC<ReportFiltersCompatibleProps> = React.memo(({
  selectedMonth, onMonthChange, monthOptions,
  selectedLeader, onLeaderChange, leaders, isLeaderSelectorOpen, onLeaderSelectorOpenChange,
  selectedPersonnel, onPersonnelChange, personnelOptions, isPersonnelSelectorOpen, onPersonnelSelectorOpenChange,
  searchTerm, onSearchTermChange, selectedColorFilter, onColorFilterChange, selectedStatusFilter, onStatusFilterChange, isLoading, onClearFilters
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedLeader !== 'all') count++;
    if (selectedPersonnel !== 'all') count++;
    if (selectedColorFilter !== 'all') count++;
    if (selectedStatusFilter && selectedStatusFilter.length > 0) count++;
    if (searchTerm.trim()) count++;
    return count;
  }, [selectedLeader, selectedPersonnel, selectedColorFilter, selectedStatusFilter, searchTerm]);

  return (
    <div className="space-y-4">
      {/* Main row - Always visible */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Tìm kiếm shop..."
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              className="pl-10 w-full sm:w-64"
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
        </div>

        {/* Advanced filters toggle button */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Bộ lọc nâng cao
            {activeFiltersCount > 0 && (
              <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] h-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
            {showAdvancedFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" onClick={onClearFilters} className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </div>

      {/* Advanced filters - Collapsible */}
      <div className={cn(
        "overflow-hidden transition-all duration-300 ease-in-out",
        showAdvancedFilters ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="flex flex-col sm:flex-row gap-2 w-full flex-wrap pt-2 border-t">
          {/* Leader selector */}
          <Popover open={isLeaderSelectorOpen} onOpenChange={onLeaderSelectorOpenChange}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={isLeaderSelectorOpen}
                className="w-full sm:w-[240px] justify-between"
                disabled={isLoading}
              >
                <span translate="no">
                  {selectedLeader !== 'all'
                    ? leaders.find((leader) => leader.id === selectedLeader)?.name
                    : "Tất cả Leader"}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[240px] p-0">
              <Command>
                <CommandInput placeholder="Tìm kiếm leader..." />
                <CommandList>
                  <CommandEmpty>Không tìm thấy leader.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem onSelect={() => { 
                      onLeaderChange("all"); 
                      onLeaderSelectorOpenChange(false); 
                    }}>
                      <Check className={cn("mr-2 h-4 w-4", selectedLeader === "all" ? "opacity-100" : "opacity-0")} />
                      Tất cả Leader
                    </CommandItem>
                    {leaders.map((leader) => (
                      <CommandItem 
                        key={leader.id} 
                        value={leader.id} 
                        onSelect={() => { 
                          onLeaderChange(leader.id); 
                          onLeaderSelectorOpenChange(false); 
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", selectedLeader === leader.id ? "opacity-100" : "opacity-0")} />
                        <span translate="no">{leader.name}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Personnel selector */}
          <Popover open={isPersonnelSelectorOpen} onOpenChange={onPersonnelSelectorOpenChange}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={isPersonnelSelectorOpen}
                className="w-full sm:w-[240px] justify-between"
                disabled={isLoading}
              >
                <span translate="no">
                  {selectedPersonnel !== 'all'
                    ? personnelOptions.find((p) => p.id === selectedPersonnel)?.name
                    : "Tất cả nhân sự"}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[240px] p-0">
              <Command>
                <CommandInput placeholder="Tìm kiếm nhân sự..." />
                <CommandList>
                  <CommandEmpty>Không tìm thấy nhân sự.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem onSelect={() => { 
                      onPersonnelChange("all"); 
                      onPersonnelSelectorOpenChange(false); 
                    }}>
                      <Check className={cn("mr-2 h-4 w-4", selectedPersonnel === "all" ? "opacity-100" : "opacity-0")} />
                      Tất cả nhân sự
                    </CommandItem>
                    {personnelOptions.map((personnel) => (
                      <CommandItem 
                        key={personnel.id} 
                        value={personnel.id} 
                        onSelect={() => { 
                          onPersonnelChange(personnel.id); 
                          onPersonnelSelectorOpenChange(false); 
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", selectedPersonnel === personnel.id ? "opacity-100" : "opacity-0")} />
                        <span translate="no">{personnel.name}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Color filter */}
          {selectedColorFilter !== undefined && onColorFilterChange && (
            <Select value={selectedColorFilter} onValueChange={onColorFilterChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Trạng thái mục tiêu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Trạng thái mục tiêu</SelectItem>
                <SelectItem value="green">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    Xanh lá
                  </div>
                </SelectItem>
                <SelectItem value="yellow">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    Vàng
                  </div>
                </SelectItem>
                <SelectItem value="red">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    Đỏ
                  </div>
                </SelectItem>
                <SelectItem value="purple">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    Tím
                  </div>
                </SelectItem>
                <SelectItem value="no-color">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-300 border border-gray-400"></div>
                    Không màu
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* Status filter - Multi-select */}
          {selectedStatusFilter !== undefined && onStatusFilterChange && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full sm:w-[220px] justify-between"
                >
                  <span className="truncate">
                    {selectedStatusFilter.length === 0 
                      ? "Trạng thái shop" 
                      : selectedStatusFilter.length === 1 
                      ? selectedStatusFilter[0]
                      : `${selectedStatusFilter.length} trạng thái`
                    }
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[220px] p-0">
                <div className="p-2">
                  <div className="space-y-2">
                    {[
                      { value: "Đang Vận Hành", color: "bg-blue-500", label: "Đang Vận Hành" },
                      { value: "Shop mới", color: "bg-green-500", label: "Shop mới" },
                      { value: "Đã Dừng", color: "bg-red-500", label: "Đã Dừng" },
                    ].map((status) => (
                      <div key={status.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={status.value}
                          checked={selectedStatusFilter.includes(status.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              onStatusFilterChange([...selectedStatusFilter, status.value]);
                            } else {
                              onStatusFilterChange(selectedStatusFilter.filter(s => s !== status.value));
                            }
                          }}
                          className="rounded"
                        />
                        <label
                          htmlFor={status.value}
                          className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                        >
                          <div className={cn("w-3 h-3 rounded-full", status.color)}></div>
                          {status.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    </div>
  );
});

ReportFiltersCompatible.displayName = 'ReportFilters';

export default ReportFiltersCompatible;