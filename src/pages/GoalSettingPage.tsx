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
  Plus,
  Users,
} from "lucide-react";
import { format, subMonths, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useNavigate } from "react-router-dom";
import { useShops, Shop } from "@/hooks/useShops";
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
import { useComprehensiveReportData } from "@/hooks/useComprehensiveReportData";
import { useUpdateComprehensiveReport } from "@/hooks/useComprehensiveReports";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { generateMonthOptions } from "@/utils/revenueUtils";
import ShopDialog from "@/components/admin/ShopDialog";

const GoalSettingPage: React.FC = React.memo(() => {
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), "yyyy-MM")
  );
  const [selectedLeader, setSelectedLeader] = useState("all");
  const [selectedPersonnel, setSelectedPersonnel] = useState("all");
  const monthOptions = useMemo(() => generateMonthOptions(), []);
  const [openLeaderSelector, setOpenLeaderSelector] = useState(false);
  const [openPersonnelSelector, setOpenPersonnelSelector] = useState(false);
  const [isShopDialogOpen, setIsShopDialogOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);

  const { data: currentUserProfile, isLoading: userProfileLoading } =
    useUserProfile();
  const { isAdmin, isLeader } = useUserPermissions(currentUserProfile);

  const { isLoading, monthlyShopTotals, leaders, personnelOptions } = useComprehensiveReportData({
    filters: {
      selectedMonth,
      selectedLeader,
      selectedPersonnel,
      searchTerm: "",
      selectedColorFilter: "all",
      selectedStatusFilter: [],
    },
    sortConfig: null,
  });

  const { data: allShopsData } = useShops({
    page: 1,
    pageSize: 10000,
    searchTerm: "",
    status: "all",
  });
  const allShops = allShopsData?.shops || [];

  const updateReportMutation = useUpdateComprehensiveReport();

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

    updateReportMutation.mutate(
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

  const handleAddShop = () => {
    setEditingShop(null);
    setIsShopDialogOpen(true);
  };

  const handleEditShop = (shopTotal: any) => {
    const shopToEdit = allShops.find(s => s.id === shopTotal.shop_id);
    if (shopToEdit) {
      setEditingShop(shopToEdit);
      setIsShopDialogOpen(true);
    }
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
              <Popover
                open={openPersonnelSelector}
                onOpenChange={setOpenPersonnelSelector}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openPersonnelSelector}
                    className="w-full sm:w-[240px] justify-between"
                    disabled={personnelOptions.length === 0}>
                    {personnelOptions.length === 0
                      ? "Không có nhân sự"
                      : selectedPersonnel !== "all"
                      ? personnelOptions.find((p) => p.id === selectedPersonnel)
                          ?.name
                      : "Tất cả nhân sự"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[240px] p-0">
                  <Command>
                    <CommandInput placeholder="Tìm kiếm nhân sự..." />
                    <CommandList>
                      <CommandEmpty>
                        {personnelOptions.length === 0
                          ? "Không có nhân sự."
                          : "Không tìm thấy nhân sự."}
                      </CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          onSelect={() => {
                            setSelectedPersonnel("all");
                            setOpenPersonnelSelector(false);
                          }}>
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedPersonnel === "all"
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          Tất cả nhân sự
                        </CommandItem>
                        {personnelOptions.map((personnel) => (
                          <CommandItem
                            key={personnel.id}
                            value={personnel.name}
                            onSelect={() => {
                              setSelectedPersonnel(personnel.id);
                              setOpenPersonnelSelector(false);
                            }}>
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedPersonnel === personnel.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {personnel.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            {(isAdmin || isLeader) && (
              <Button onClick={handleAddShop}>
                <Plus className="mr-2 h-4 w-4" /> Thêm Shop
              </Button>
            )}
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
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Nhân sự</TableHead>
                    <TableHead>Leader quản lý</TableHead>
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
                          <TableCell className="whitespace-nowrap">
                            <span className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium",
                              shopTotal.shop_status === 'Đang Vận Hành' 
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                                : shopTotal.shop_status === 'Shop mới'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' 
                                : shopTotal.shop_status === 'Đã Dừng'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200'
                            )}>
                              {shopTotal.shop_status || 'Chưa có'}
                            </span>
                          </TableCell>
                          <TableCell>{shopTotal.personnel_name}</TableCell>
                          <TableCell>{shopTotal.leader_name}</TableCell>
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
                                disabled={updateReportMutation.isPending}
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
                                disabled={updateReportMutation.isPending}
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
                            <div className="flex items-center justify-end gap-2">
                              {editingShopId === shopTotal.shop_id ? (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleCancelEdit(shopTotal.shop_id)
                                    }
                                    disabled={updateReportMutation.isPending}>
                                    Hủy
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleSaveGoals(shopTotal.shop_id)
                                    }
                                    disabled={updateReportMutation.isPending}>
                                    {updateReportMutation.isPending ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Lưu...
                                      </>
                                    ) : (
                                      "Lưu"
                                    )}
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditShop(shopTotal)}
                                    className="h-8 w-8 p-0"
                                    title="Sửa thông tin shop"
                                    disabled={!isAdmin && !isLeader}
                                  >
                                    <Users className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      setEditingShopId(shopTotal.shop_id)
                                    }
                                    disabled={!isAdmin && !isLeader || updateReportMutation.isPending}
                                    className="h-8 w-8 p-0"
                                    title="Sửa mục tiêu"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center h-24">
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
      <ShopDialog
        open={isShopDialogOpen}
        onOpenChange={setIsShopDialogOpen}
        shop={editingShop}
      />
    </div>
  );
});

GoalSettingPage.displayName = "GoalSettingPage";

export default GoalSettingPage;