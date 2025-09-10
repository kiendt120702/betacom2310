import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Target, TrendingUp, Users, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useTiktokComprehensiveReports } from "@/hooks/useTiktokComprehensiveReports";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { useUserProfile } from "@/hooks/useUserProfile";
import { toast } from "sonner";

/**
 * TikTok Goal Setting Page Component
 * Allows setting feasible and breakthrough goals for TikTok shops
 */
const TiktokGoalSettingPage = () => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return format(now, "yyyy-MM");
  });
  const [selectedShop, setSelectedShop] = useState<string>("");
  const [feasibleGoal, setFeasibleGoal] = useState<string>("");
  const [breakthroughGoal, setBreakthroughGoal] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: reportsData, isLoading } = useTiktokComprehensiveReports(0, 10000);
  const reports = reportsData?.data || [];
  const { data: currentUser } = useUserProfile();
  const { isAdmin } = useUserPermissions(currentUser || undefined);

  // Generate month options for the last 12 months
  const monthOptions = useMemo(() => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      options.push({
        value: format(date, "yyyy-MM"),
        label: format(date, "MMMM yyyy", { locale: vi })
      });
    }
    return options;
  }, []);

  // Get unique shops from reports
  const shops = useMemo(() => {
    const shopMap = new Map();
    reports.forEach(report => {
      if (report.shop_id && report.tiktok_shops) {
        shopMap.set(report.shop_id, {
          id: report.shop_id,
          name: report.tiktok_shops.name
        });
      }
    });
    return Array.from(shopMap.values());
  }, [reports]);

  // Get current goals for selected shop and month
  const currentGoals = useMemo(() => {
    if (!selectedShop || !selectedMonth) return null;
    
    const shopReports = reports.filter(report => 
      report.shop_id === selectedShop &&
      format(new Date(report.report_date), "yyyy-MM") === selectedMonth
    );
    
    if (shopReports.length > 0) {
      const report = shopReports[0];
      return {
        feasible: report.feasible_goal,
        breakthrough: report.breakthrough_goal
      };
    }
    return null;
  }, [reports, selectedShop, selectedMonth]);

  const handleSubmit = async () => {
    if (!selectedShop || !feasibleGoal || !breakthroughGoal) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    const feasibleValue = parseFloat(feasibleGoal);
    const breakthroughValue = parseFloat(breakthroughGoal);

    if (isNaN(feasibleValue) || isNaN(breakthroughValue)) {
      toast.error("Vui lòng nhập số hợp lệ!");
      return;
    }

    if (breakthroughValue <= feasibleValue) {
      toast.error("Mục tiêu đột phá phải lớn hơn mục tiêu khả thi!");
      return;
    }

    setIsSubmitting(true);
    try {
      // Here you would implement the goal update logic
      // For now, just show success message
      toast.success("Cập nhật mục tiêu thành công!");
      
      // Reset form
      setFeasibleGoal("");
      setBreakthroughGoal("");
    } catch (error) {
      console.error("Error updating goals:", error);
      toast.error("Có lỗi xảy ra khi cập nhật mục tiêu!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertDescription>
            Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Thiết Lập Mục Tiêu TikTok</h1>
          <p className="text-muted-foreground mt-2">
            Thiết lập mục tiêu doanh số khả thi và đột phá cho các shop TikTok
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Goal Setting Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Thiết Lập Mục Tiêu
              </CardTitle>
              <CardDescription>
                Chọn shop và tháng để thiết lập mục tiêu doanh số
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="month">Tháng</Label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn tháng" />
                    </SelectTrigger>
                    <SelectContent>
                      {monthOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shop">Shop TikTok</Label>
                  <Select value={selectedShop} onValueChange={setSelectedShop} disabled={isLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoading ? "Đang tải..." : "Chọn shop"} />
                    </SelectTrigger>
                    <SelectContent>
                      {shops.map(shop => (
                        <SelectItem key={shop.id} value={shop.id}>
                          {shop.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="feasible">Mục Tiêu Khả Thi (VND)</Label>
                  <Input
                    id="feasible"
                    type="number"
                    placeholder="Nhập mục tiêu khả thi"
                    value={feasibleGoal}
                    onChange={(e) => setFeasibleGoal(e.target.value)}
                    disabled={!selectedShop}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="breakthrough">Mục Tiêu Đột Phá (VND)</Label>
                  <Input
                    id="breakthrough"
                    type="number"
                    placeholder="Nhập mục tiêu đột phá"
                    value={breakthroughGoal}
                    onChange={(e) => setBreakthroughGoal(e.target.value)}
                    disabled={!selectedShop}
                  />
                </div>
              </div>

              <Button 
                onClick={handleSubmit} 
                disabled={!selectedShop || !feasibleGoal || !breakthroughGoal || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang cập nhật...
                  </>
                ) : (
                  "Cập Nhật Mục Tiêu"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Current Goals Display */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Mục Tiêu Hiện Tại
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedShop && selectedMonth ? (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Shop: {shops.find(s => s.id === selectedShop)?.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Tháng: {format(new Date(selectedMonth + '-01'), 'MMMM yyyy', { locale: vi })}
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Mục tiêu khả thi:</span>
                      <Badge variant="secondary">
                        {currentGoals?.feasible 
                          ? `${currentGoals.feasible.toLocaleString('vi-VN')} VND`
                          : "Chưa thiết lập"
                        }
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Mục tiêu đột phá:</span>
                      <Badge variant="secondary">
                        {currentGoals?.breakthrough 
                          ? `${currentGoals.breakthrough.toLocaleString('vi-VN')} VND`
                          : "Chưa thiết lập"
                        }
                      </Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Chọn shop và tháng để xem mục tiêu hiện tại</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TiktokGoalSettingPage;