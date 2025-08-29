import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShopPerformanceData {
  shop_name: string;
  personnel_name: string;
  leader_name: string;
  total_revenue: number;
  projected_revenue: number;
  feasible_goal: number | null;
  breakthrough_goal: number | null;
}

interface PerformanceDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryName: string | null;
  shops: ShopPerformanceData[];
}

const PerformanceDetailsDialog: React.FC<PerformanceDetailsDialogProps> = ({
  open,
  onOpenChange,
  categoryName,
  shops,
}) => {
  const [selectedLeader, setSelectedLeader] = useState('all');
  const [selectedPersonnel, setSelectedPersonnel] = useState('all');
  const [isLeaderPopoverOpen, setIsLeaderPopoverOpen] = useState(false);
  const [isPersonnelPopoverOpen, setIsPersonnelPopoverOpen] = useState(false);

  const leaders = useMemo(() => {
    const leaderSet = new Set<string>();
    shops.forEach(shop => {
      if (shop.leader_name && shop.leader_name !== 'N/A') {
        leaderSet.add(shop.leader_name);
      }
    });
    return Array.from(leaderSet).sort((a, b) => a.localeCompare(b));
  }, [shops]);

  const personnel = useMemo(() => {
    const personnelSet = new Set<string>();
    shops.forEach(shop => {
      if (shop.personnel_name && shop.personnel_name !== 'N/A') {
        personnelSet.add(shop.personnel_name);
      }
    });
    return Array.from(personnelSet).sort((a, b) => a.localeCompare(b));
  }, [shops]);

  const filteredShops = useMemo(() => {
    return shops.filter(shop => {
      const leaderMatch = selectedLeader === 'all' || shop.leader_name === selectedLeader;
      const personnelMatch = selectedPersonnel === 'all' || shop.personnel_name === selectedPersonnel;
      return leaderMatch && personnelMatch;
    });
  }, [shops, selectedLeader, selectedPersonnel]);

  const formatCurrency = (value: number | null | undefined) => {
    if (value == null) return "N/A";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Danh sách Shop: {categoryName} ({filteredShops.length})
          </DialogTitle>
          <DialogDescription>
            Chi tiết các shop thuộc hạng mục "{categoryName}".
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col sm:flex-row gap-4 py-4">
          <Popover open={isLeaderPopoverOpen} onOpenChange={setIsLeaderPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={isLeaderPopoverOpen}
                className="w-full sm:w-[200px] justify-between"
              >
                {selectedLeader === 'all' ? 'Tất cả Leader' : selectedLeader}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Tìm kiếm leader..." />
                <CommandList>
                  <CommandEmpty>Không tìm thấy leader.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        setSelectedLeader('all');
                        setIsLeaderPopoverOpen(false);
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", selectedLeader === 'all' ? "opacity-100" : "opacity-0")} />
                      Tất cả Leader
                    </CommandItem>
                    {leaders.map(leader => (
                      <CommandItem
                        key={leader}
                        value={leader}
                        onSelect={() => {
                          setSelectedLeader(leader);
                          setIsLeaderPopoverOpen(false);
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", selectedLeader === leader ? "opacity-100" : "opacity-0")} />
                        {leader}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <Popover open={isPersonnelPopoverOpen} onOpenChange={setIsPersonnelPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={isPersonnelPopoverOpen}
                className="w-full sm:w-[200px] justify-between"
              >
                {selectedPersonnel === 'all' ? 'Tất cả Nhân sự' : selectedPersonnel}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Tìm kiếm nhân sự..." />
                <CommandList>
                  <CommandEmpty>Không tìm thấy nhân sự.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        setSelectedPersonnel('all');
                        setIsPersonnelPopoverOpen(false);
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", selectedPersonnel === 'all' ? "opacity-100" : "opacity-0")} />
                      Tất cả Nhân sự
                    </CommandItem>
                    {personnel.map(p => (
                      <CommandItem
                        key={p}
                        value={p}
                        onSelect={() => {
                          setSelectedPersonnel(p);
                          setIsPersonnelPopoverOpen(false);
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", selectedPersonnel === p ? "opacity-100" : "opacity-0")} />
                        {p}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>STT</TableHead>
                    <TableHead>Tên Shop</TableHead>
                    <TableHead>Nhân sự</TableHead>
                    <TableHead>Leader</TableHead>
                    <TableHead className="text-right">Doanh số</TableHead>
                    <TableHead className="text-right">Dự kiến</TableHead>
                    <TableHead className="text-right">Mục tiêu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShops.map((shop, index) => (
                    <TableRow key={shop.shop_name}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{shop.shop_name}</TableCell>
                      <TableCell>{shop.personnel_name}</TableCell>
                      <TableCell>{shop.leader_name}</TableCell>
                      <TableCell className="text-right">{formatCurrency(shop.total_revenue)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(shop.projected_revenue)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(shop.feasible_goal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PerformanceDetailsDialog;