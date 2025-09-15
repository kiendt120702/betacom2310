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
  Store,
  Users,
  Target,
  AlertTriangle,
  Award,
  CheckCircle,
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
import { useTiktokComprehensiveReportData } from "@/hooks/useTiktokComprehensiveReportData";
import { useUpdateTiktokGoals } from "@/hooks/useTiktokComprehensiveReports";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
import StatCard from "@/components/dashboard/StatCard";
import UnderperformingShopsDialog from "@/components/dashboard/UnderperformingShopsDialog";

const TiktokGoalSettingPage: React.FC = React.memo(() => {
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), "yyyy-MM")
  );
  const [selectedLeader, setSelectedLeader] = useState("all");
  const monthOptions = useMemo(() => generateMonthOptions(), []);
  const [openLeaderSelector, setOpenLeaderSelector] = useState(false);
  const [isUnderperformingDialogOpen, setIsUnderperformingDialogOpen] =
    useState(false);

  const { data: currentUserProfile, isLoading: userProfileLoading } =
    useUserProfile();

  const { isLoading, monthlyShopTotals, leaders } = useTiktokComprehensiveReportData({
    selectedMonth,
    selectedLeader,
    selectedPersonnel: "all",
    debouncedSearchTerm: "",
    sortConfig: null,
  });

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

  const getShopColorCategory = (shopData: any) => {
    const projectedRevenue = shopData.projected_revenue || 0;
    const feasibleGoal = shopData.feasible_goal;
    const breakthroughGoal = shopData.breakthrough_goal;

    if (projectedRevenue <= 0) {
      return "no-color";
    }

    if (feasibleGoal == null && breakthroughGoal == null) {
      return "no-color";
    }

    if (feasibleGoal === 0) {
      return "no-color";
    }

    if (breakthroughGoal != null && projectedRevenue > breakthroughGoal) {
      return "green";
    } else if (
      feasibleGoal != null &&
      feasibleGoal > 0 &&
      projectedRevenue >= feasibleGoal
    ) {
      return "yellow";
    } else if (
      feasibleGoal != null &&
      feasibleGoal > 0 &&
      projectedRevenue >= feasibleGoal * 0.8 &&
      projectedRevenue < feasibleGoal
    ) {
      return "red";
    } else {
      return "purple";
    }
  };

  const performanceData = useMemo(() => {
    const total = monthlyShopTotals.length;
    const colorCounts = {
      green: 0,
      yellow: 0,
      red: 0,
      purple: 0,
      noColor: 0,
    };
    const underperformingShops: any[] = [];
    const personnelIds = new Set();

    monthlyShopTotals.forEach((shop) => {
      const personnelKey = shop.personnel_id || shop.personnel_name;
      if (personnelKey) {
        personnelIds.add(personnelKey);
      }

      const category = getShopColorCategory(shop);
      switch (category) {
        case "green":
          colorCounts.green++;
          break;
        case "yellow":
          colorCounts.yellow++;
          break;
        case "red":
          colorCounts.red++;
          break;
        case "purple":
          colorCounts.purple++;
          if (shop.feasible_goal && shop.feasible_goal > 0) {
            underperformingShops.push({
              shop_name: shop.shop_name,
              total_revenue: shop.total_revenue,
              projected_revenue: shop.projected_revenue,
              feasible_goal: shop.feasible_goal,
              breakthrough_goal: shop.breakthrough_goal,
              deficit: Math.max(
                0,
                (shop.feasible_goal || 0) - shop.projected_revenue
              ),
            });
          }
          break;
        case "no-color":
          colorCounts.noColor++;
          break;
      }
    });

    return {
      totalShops: total,
      totalEmployees: personnelIds.size,
      breakthroughMet: colorCounts.green,
      feasibleOnlyMet: colorCounts.yellow,
      almostMet: colorCounts.red,
      notMet80Percent: colorCounts.purple,
      underperformingShops,
    };
  }, [monthlyShopTotals]);

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
      {isLoading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <StatCard
            title="Tổng số shop vận hành"
            value={performanceData.totalShops}
            icon={Store}
          />
          <StatCard
            title="Shop đạt đột phá"
            value={performanceData.breakthroughMet}
            icon={Award}
            className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
          />
          <StatCard
            title="Shop đạt khả thi"
            value={performanceData.breakthroughMet + performanceData.feasibleOnlyMet}
            icon={CheckCircle}
            className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
          />
          <StatCard
            title="Khả thi gần đạt (80-99%)"
            value={performanceData.almostMet}
            icon={Target}
            className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
          />
          <Card
            className="cursor-pointer hover:bg-muted/50 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
            onClick={() => setIsUnderperformingDialogOpen(true)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Shop khả thi chưa đạt 80%
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {performanceData.notMet80Percent}
              </div>
            </CardContent>
          </Card>
          <StatCard
            title="Nhân viên vận hành"
            value={performanceData.totalEmployees}
            icon={Users}
          />
        </div>
      )}
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
      <UnderperformingShopsDialog
        isOpen={isUnderperformingDialogOpen}
        onOpenChange={setIsUnderperformingDialogOpen}
        shops={performanceData.underperformingShops}
      />
    </div>
  );
});

TiktokGoalSettingPage.displayName = "TiktokGoalSettingPage";

export default TiktokGoalSettingPage;