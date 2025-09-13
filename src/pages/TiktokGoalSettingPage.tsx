import React, { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  ChevronsUpDown,
  Check,
  Loader2,
  Edit,
} from "lucide-react";
import { format, subMonths, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { formatCurrency, parseCurrency } from "@/lib/numberUtils";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { generateMonthOptions } from "@/utils/revenueUtils";
import { useTiktokGoalSettingData } from "@/hooks/useTiktokComprehensiveReportData";
import { useUpdateTiktokGoals } from "@/hooks/useTiktokComprehensiveReports";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";

const TiktokGoalSettingPage: React.FC = React.memo(() => {
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), "yyyy-MM")
  );
  const [selectedLeader, setSelectedLeader] = useState("all");
  const monthOptions = useMemo(() => generateMonthOptions(), []);
  const [openLeaderSelector, setOpenLeaderSelector] = useState(false);

  const { data: currentUserProfile, isLoading: userProfileLoading } =
    useUserProfile();

  const { isLoading, monthlyShopTotals: allShopTotals, leaders } = useTiktokGoalSettingData(selectedMonth);

  // Filter shops based on selected leader
  const monthlyShopTotals = useMemo(() => {
    if (selectedLeader === "all") return allShopTotals;
    
    return allShopTotals.filter(shop => 
      shop.leader_name.includes(leaders.find(l => l.id === selectedLeader)?.name || "")
    );
  }, [allShopTotals, selectedLeader, leaders]);

  const updateGoalsMutation = useUpdateTiktokGoals();

  const [editableGoals, setEditableGoals] = useState<
    Map<
      string,
      { feasible_goal: string | null; breakthrough_goal: string | null }
    >
  >(new Map());
  const [editingShopId, setEditingShopId] = useState<string | null>(null);

  useEffect(() => {
    const initialGoals = new Map<
      string,
      { feasible_goal: string | null; breakthrough_goal: string | null }
    >();
    monthlyShopTotals.forEach((shop) => {
      initialGoals.set(shop.shop_id, {
        feasible_goal:
          shop.feasible_goal != null
            ? formatCurrency(shop.feasible_goal)
            : null,
        breakthrough_goal:
          shop.breakthrough_goal != null
            ? formatCurrency(shop.breakthrough_goal)
            : null,
      });
    });
    setEditableGoals(initialGoals);
    setEditingShopId(null);
  }, [monthlyShopTotals]);

  const handleLocalGoalInputChange = (
    shopId: string,
    field: "feasible_goal" | "breakthrough_goal",
    value: string
  ) => {
    const numericString = value.replace(/\D/g, "");
    const numberValue = numericString ? parseInt(numericString, 10) : null;
    const formattedValue =
      numberValue !== null ? formatCurrency(numberValue) : "";

    setEditableGoals((prev) => {
      const newMap = new Map(prev);
      const currentShopGoals = newMap.get(shopId) || {
        feasible_goal: null,
        breakthrough_goal: null,
      };
      newMap.set(shopId, { ...currentShopGoals, [field]: formattedValue });
      return newMap;
    });
  };

  const handleSaveGoals = (shopId: string) => {
    const currentEditable = editableGoals.get(shopId);
    if (!currentEditable) return;

    const feasibleGoalValue = parseCurrency(currentEditable.feasible_goal);
    const breakthroughGoalValue = parseCurrency(
      currentEditable.breakthrough_goal
    );

    setEditingShopId(null);

    updateGoalsMutation.mutate(
      {
        shopId: shopId,
        month: selectedMonth,
        feasible_goal: feasibleGoalValue,
        breakthrough_goal: breakthroughGoalValue,
      },
      {
        onError: () => {
          setEditingShopId(shopId);
        },
      }
    );
  };

  const handleCancelEdit = (shopId: string) => {
    const originalShopData = monthlyShopTotals.find(
      (s) => s.shop_id === shopId
    );
    if (originalShopData) {
      setEditableGoals((prev) => {
        const newMap = new Map(prev);
        newMap.set(shopId, {
          feasible_goal: formatCurrency(originalShopData.feasible_goal),
          breakthrough_goal: formatCurrency(originalShopData.breakthrough_goal),
        });
        return newMap;
      });
    }
    setEditingShopId(null);
  };

  const getDisplayValue = (
    shopId: string,
    field: "feasible_goal" | "breakthrough_goal"
  ): string => {
    const editableValue = editableGoals.get(shopId)?.[field];
    if (editableValue === null || editableValue === undefined) return "";
    return editableValue;
  };

  if (userProfileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-xl font-semibold">
                Mục Tiêu Tháng Shop
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground ml-4" />
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
              <Popover
                open={openLeaderSelector}
                onOpenChange={setOpenLeaderSelector}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openLeaderSelector}
                    className="w-full sm:w-[240px] justify-between"
                    disabled={leaders.length === 0}>
                    {leaders.length === 0
                      ? "Không có Leader"
                      : selectedLeader !== "all"
                      ? leaders.find((leader) => leader.id === selectedLeader)
                          ?.name
                      : "Tất cả Leader"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[240px] p-0">
                  <Command>
                    <CommandInput placeholder="Tìm kiếm leader..." />
                    <CommandList>
                      <CommandEmpty>
                        {leaders.length === 0
                          ? "Không có leader nào."
                          : "Không tìm thấy leader."}
                      </CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          onSelect={() => {
                            setSelectedLeader("all");
                            setOpenLeaderSelector(false);
                          }}>
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedLeader === "all"
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          Tất cả Leader
                        </CommandItem>
                        {leaders.map((leader) => (
                          <CommandItem
                            key={leader.id}
                            value={leader.name}
                            onSelect={() => {
                              setSelectedLeader(leader.id);
                              setOpenLeaderSelector(false);
                            }}>
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedLeader === leader.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {leader.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Đang tải...</p>
          ) : (
            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>STT</TableHead>
                    <TableHead>Tên Shop</TableHead>
                    <TableHead>Nhân sự</TableHead>
                    <TableHead className="text-right">
                      Mục tiêu khả thi
                    </TableHead>
                    <TableHead className="text-right">
                      Mục tiêu đột phá
                    </TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyShopTotals.length > 0 ? (
                    <>
                      {monthlyShopTotals.map((shopTotal, index) => (
                        <TableRow key={shopTotal.shop_id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{shopTotal.shop_name}</TableCell>
                          <TableCell>{shopTotal.personnel_name}</TableCell>
                          <TableCell className="whitespace-nowrap text-right">
                            {editingShopId === shopTotal.shop_id ? (
                              <Input
                                type="text"
                                inputMode="numeric"
                                value={getDisplayValue(
                                  shopTotal.shop_id,
                                  "feasible_goal"
                                )}
                                onChange={(e) =>
                                  handleLocalGoalInputChange(
                                    shopTotal.shop_id,
                                    "feasible_goal",
                                    e.target.value
                                  )
                                }
                                className="w-28 text-right h-8 px-2 py-1"
                                disabled={updateGoalsMutation.isPending}
                                placeholder="0"
                              />
                            ) : shopTotal.feasible_goal != null ? (
                              <span>
                                {formatCurrency(shopTotal.feasible_goal)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground italic">
                                Chưa điền
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-right">
                            {editingShopId === shopTotal.shop_id ? (
                              <Input
                                type="text"
                                inputMode="numeric"
                                value={getDisplayValue(
                                  shopTotal.shop_id,
                                  "breakthrough_goal"
                                )}
                                onChange={(e) =>
                                  handleLocalGoalInputChange(
                                    shopTotal.shop_id,
                                    "breakthrough_goal",
                                    e.target.value
                                  )
                                }
                                className="w-28 text-right h-8 px-2 py-1"
                                disabled={updateGoalsMutation.isPending}
                                placeholder="0"
                              />
                            ) : shopTotal.breakthrough_goal != null ? (
                              <span>
                                {formatCurrency(shopTotal.breakthrough_goal)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground italic">
                                Chưa điền
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <>
                              {editingShopId === shopTotal.shop_id ? (
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleCancelEdit(shopTotal.shop_id)
                                    }
                                    disabled={updateGoalsMutation.isPending}>
                                    Hủy
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleSaveGoals(shopTotal.shop_id)
                                    }
                                    disabled={updateGoalsMutation.isPending}>
                                    {updateGoalsMutation.isPending ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Lưu...
                                      </>
                                    ) : (
                                      "Lưu"
                                    )}
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    setEditingShopId(shopTotal.shop_id)
                                  }
                                  disabled={updateGoalsMutation.isPending}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                            </>
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24">
                        Không có dữ liệu cho tháng đã chọn.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

TiktokGoalSettingPage.displayName = "TiktokGoalSettingPage";

export default TiktokGoalSettingPage;