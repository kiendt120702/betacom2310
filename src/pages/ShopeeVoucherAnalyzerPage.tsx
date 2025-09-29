import React, { useState, useCallback, useEffect } from "react";
import { AppState } from "../types/shopeeVoucher";
import { analyzeData } from "../services/analyzer";
import { StatCard } from "../components/shopee-voucher-analyzer/StatCard";
import { AnalysisCard } from "../components/shopee-voucher-analyzer/AnalysisCard";
import {
  InfoIcon,
  CheckCircleIcon,
  DownloadIcon,
  RefreshIcon,
  XCircleIcon,
  UploadCloudIcon,
  LoaderIcon,
} from "../components/shopee-voucher-analyzer/icons";
import {
  formatCurrency,
  formatPercentage,
  formatNumber,
} from "../utils/formatters";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AnimatedPage from "@/components/layouts/AnimatedPage";
import { TicketPercent } from "lucide-react";

const ShopeeVoucherAnalyzerPage: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({ status: "idle" });
  const [selectedProduct, setSelectedProduct] = useState<string | undefined>();
  const { toast } = useToast();

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      setAppState({ status: "loading" });

      const readFile = (file: File): Promise<any[]> =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const data = e.target?.result;
              if (!data) {
                return reject(new Error(`Failed to read file: ${file.name}`));
              }
              const workbook = XLSX.read(data, {
                type: "binary",
                cellDates: true,
              });
              const sheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[sheetName];
              if (!worksheet) {
                return reject(
                  new Error(`No data found in the first sheet of ${file.name}.`)
                );
              }
              const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                raw: false,
              });
              resolve(jsonData);
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : "Unknown parsing error";
              reject(new Error(`Error processing ${file.name}: ${message}`));
            }
          };
          reader.onerror = () => {
            reject(new Error(`Error reading the file ${file.name}.`));
          };
          reader.readAsBinaryString(file);
        });

      try {
        const allJsonDataArrays = await Promise.all(
          Array.from(files).map((file) => readFile(file))
        );
        const combinedData = allJsonDataArrays.flat();

        if (combinedData.length === 0) {
          throw new Error(
            "The uploaded file(s) are empty or in an unsupported format."
          );
        }

        const result = analyzeData(combinedData);
        setAppState({ status: "success", data: result });
        toast({
          title: "Analysis Complete",
          description: "Your voucher data has been successfully analyzed.",
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred.";
        setAppState({ status: "error", error: errorMessage });
        toast({
          title: "Analysis Failed",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        // Reset file input value to allow re-uploading the same file(s)
        if (event.target) {
          event.target.value = "";
        }
      }
    },
    [toast]
  );

  useEffect(() => {
    if (appState.status === "success") {
      const products = appState.data.productHourlyDistributions;
      if (products.length === 0) {
        setSelectedProduct(undefined);
        return;
      }

      if (
        !selectedProduct ||
        !products.some((product) => product.productName === selectedProduct)
      ) {
        setSelectedProduct(products[0].productName);
      }
    } else {
      setSelectedProduct(undefined);
    }
  }, [appState, selectedProduct]);

  const resetState = () => {
    setAppState({ status: "idle" });
    setSelectedProduct(undefined);
  };

  const renderSuccessView = () => {
    if (appState.status !== "success") return null;

    const {
      summary,
      costs,
      voucherDistribution,
      hourlyDistribution,
      productHourlyDistributions,
    } = appState.data;

    const cheaperOption =
      costs.voucherXtra.cost < costs.coSponsor.cost
        ? "Voucher Xtra"
        : "Đồng tài trợ";

    const selectedProductDistribution = selectedProduct
      ? productHourlyDistributions.find(
          (item) => item.productName === selectedProduct
        )
      : undefined;

    return (
      <div className="space-y-6">
        <AnalysisCard title="Tổng quan đơn hàng" icon={<InfoIcon />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Tổng số đơn (unique)"
              value={formatNumber(summary.totalOrders)}
              color="gray"
            />
            <StatCard
              label="Đơn hoàn thành"
              value={formatNumber(summary.completedOrders.count)}
              percentage={summary.completedOrders.percentage}
              color="green"
            />
            <StatCard
              label="Đơn đã hủy"
              value={formatNumber(summary.cancelledOrders.count)}
              percentage={summary.cancelledOrders.percentage}
              color="red"
            />
            <StatCard
              label="Đơn trả hàng/hoàn tiền"
              value={formatNumber(summary.returnedOrders.count)}
              percentage={summary.returnedOrders.percentage}
              color="yellow"
            />
          </div>
        </AnalysisCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnalysisCard
            title="Doanh thu & So sánh chi phí (Đơn hoàn thành)"
            icon={<InfoIcon />}>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium text-gray-700">Doanh thu</span>
                <span className="font-bold text-gray-900 text-base">
                  {formatCurrency(costs.revenue)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium text-gray-700">
                  AOV (Giá trị đơn hàng TB)
                </span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(costs.AOV)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium text-gray-700">
                  Tổng Voucher Shopee Tài Trợ
                </span>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(costs.totalVoucherAmount)}
                  </p>
                  <p className="text-xs text-gray-500 -mt-1">
                    {formatPercentage(costs.totalVoucherPercentageOfRevenue)}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center bg-teal-50 text-teal-800 p-3 rounded-lg">
                <span className="font-medium">Cost Voucher Xtra (3%)</span>
                <div className="text-right">
                  <p className="font-semibold text-teal-900">
                    {formatCurrency(costs.voucherXtra.cost)}
                  </p>
                  <p className="text-xs text-teal-700">
                    {formatPercentage(costs.voucherXtra.percentageOfRevenue)}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center bg-orange-50 text-orange-800 p-3 rounded-lg">
                <span className="font-medium">Cost Đồng tài trợ (20%)</span>
                <div className="text-right">
                  <p className="font-semibold text-orange-900">
                    {formatCurrency(costs.coSponsor.cost)}
                  </p>
                  <p className="text-xs text-orange-700">
                    {formatPercentage(costs.coSponsor.percentageOfRevenue)}
                  </p>
                </div>
              </div>
              <div className="bg-blue-50 text-blue-800 p-3 rounded-lg flex items-center gap-3">
                <CheckCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <p className="font-semibold">
                  Nên chọn: {cheaperOption} (rẻ hơn{" "}
                  {formatCurrency(costs.difference)})
                </p>
              </div>
            </div>
          </AnalysisCard>

          <AnalysisCard
            title="Phân bố mã giảm giá shop (Đơn hoàn thành)"
            icon={<InfoIcon />}
            bgColor="bg-slate-50">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Không dùng mã</span>
                <div className="text-right">
                  <span className="font-bold text-gray-800">
                    {formatNumber(voucherDistribution.noVoucherCount)} đơn
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    {formatPercentage(voucherDistribution.noVoucherPercentage)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Có dùng mã</span>
                <div className="text-right">
                  <span className="font-bold text-gray-800">
                    {formatNumber(voucherDistribution.withVoucherCount)} đơn
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    {formatPercentage(
                      voucherDistribution.withVoucherPercentage
                    )}
                  </span>
                </div>
              </div>
            </div>
          </AnalysisCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnalysisCard
            title="Thống kê đơn hàng theo khung giờ"
            icon={<InfoIcon />}>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600 border-b">
                    <th className="py-2 pr-4 font-medium">Khung giờ</th>
                    <th className="py-2 pr-4 font-medium">Số lượng đơn hàng</th>
                    <th className="py-2 font-medium">Tỷ lệ %</th>
                  </tr>
                </thead>
                <tbody>
                  {hourlyDistribution.buckets.map((bucket) => {
                    const endHour = bucket.hour === 23 ? 24 : bucket.hour + 1;
                    return (
                      <tr key={bucket.hour} className="border-b last:border-0">
                        <td className="py-2 pr-4 text-gray-700">
                          {`${bucket.hour}h-${endHour}h`}
                        </td>
                        <td className="py-2 pr-4 font-semibold text-gray-900">
                          {formatNumber(bucket.count)}
                        </td>
                        <td className="py-2 text-gray-700">
                          {bucket.percentage.toFixed(2)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="pt-3 pr-4 font-semibold text-gray-700">
                      Tổng số đơn có dữ liệu giờ
                    </td>
                    <td className="pt-3 pr-4 font-semibold text-gray-900">
                      {formatNumber(hourlyDistribution.totalOrdersWithTime)}
                    </td>
                    <td className="pt-3 text-gray-700">
                      {hourlyDistribution.totalOrdersWithTime ? "100%" : "0%"}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </AnalysisCard>

          <AnalysisCard
            title="Thống kê đơn hàng sản phẩm theo khung giờ"
            icon={<InfoIcon />}>
            {productHourlyDistributions.length === 0 ? (
              <p className="text-sm text-gray-500">
                Không tìm thấy dữ liệu sản phẩm để thống kê.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
                  <Select
                    value={selectedProduct}
                    onValueChange={setSelectedProduct}>
                    <SelectTrigger className="w-full sm:w-72">
                      <SelectValue placeholder="Chọn sản phẩm" />
                    </SelectTrigger>
                    <SelectContent>
                      {productHourlyDistributions.map((product) => (
                        <SelectItem
                          key={product.productName}
                          value={product.productName}>
                          {product.productName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedProductDistribution ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-600 border-b">
                          <th className="py-2 pr-4 font-medium">Khung giờ</th>
                          <th className="py-2 pr-4 font-medium">
                            Số lượng đơn hàng
                          </th>
                          <th className="py-2 font-medium">Tỷ lệ %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedProductDistribution.buckets.map((bucket) => {
                          const endHour =
                            bucket.hour === 23 ? 24 : bucket.hour + 1;
                          return (
                            <tr
                              key={bucket.hour}
                              className="border-b last:border-0">
                              <td className="py-2 pr-4 text-gray-700">
                                {`${bucket.hour}h-${endHour}h`}
                              </td>
                              <td className="py-2 pr-4 font-semibold text-gray-900">
                                {formatNumber(bucket.count)}
                              </td>
                              <td className="py-2 text-gray-700">
                                {bucket.percentage.toFixed(2)}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td className="pt-3 pr-4 font-semibold text-gray-700">
                            Tổng số đơn (
                            {selectedProductDistribution.productName})
                          </td>
                          <td className="pt-3 pr-4 font-semibold text-gray-900">
                            {formatNumber(
                              selectedProductDistribution.totalOrdersWithTime
                            )}
                          </td>
                          <td className="pt-3 text-gray-700">
                            {selectedProductDistribution.totalOrdersWithTime
                              ? "100%"
                              : "0%"}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Vui lòng chọn sản phẩm để xem thống kê.
                  </p>
                )}
              </div>
            )}
          </AnalysisCard>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 flex-wrap">
          <Button className="w-full sm:w-auto">
            <DownloadIcon className="w-5 h-5 mr-2" /> Tải Summary (CSV)
          </Button>
          <Button className="w-full sm:w-auto" variant="secondary">
            <DownloadIcon className="w-5 h-5 mr-2" /> Tải Phân bố (CSV)
          </Button>
          <Button
            onClick={resetState}
            className="w-full sm:w-auto"
            variant="outline">
            <RefreshIcon className="w-5 h-5 mr-2" /> Phân tích file khác
          </Button>
        </div>
      </div>
    );
  };

  const renderStateView = () => {
    switch (appState.status) {
      case "loading":
        return (
          <Card className="shadow-sm">
            <CardContent className="py-16 flex flex-col items-center justify-center text-center gap-3">
              <LoaderIcon className="w-12 h-12 animate-spin text-gray-500" />
              <div>
                <p className="text-lg font-medium text-gray-700">
                  Đang phân tích dữ liệu...
                </p>
                <p className="text-sm text-gray-500">
                  Vui lòng đợi trong giây lát.
                </p>
              </div>
            </CardContent>
          </Card>
        );
      case "error":
        return (
          <Card className="shadow-sm border-destructive/40">
            <CardContent className="py-16 flex flex-col items-center text-center gap-4">
              <XCircleIcon className="w-12 h-12 text-destructive" />
              <div>
                <p className="text-lg font-semibold text-destructive">
                  Không thể phân tích dữ liệu
                </p>
                <p className="text-sm text-muted-foreground max-w-md">
                  {appState.error}
                </p>
              </div>
              <Button onClick={resetState} variant="destructive">
                Thử lại
              </Button>
            </CardContent>
          </Card>
        );
      case "success":
        return renderSuccessView();
      case "idle":
      default:
        return (
          <Card className="shadow-sm">
            <CardContent className="p-8 sm:p-12">
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-10 sm:p-12 hover:bg-gray-50 transition-colors">
                <UploadCloudIcon className="w-12 h-12 text-gray-400" />
                <p className="mt-4 text-lg font-semibold text-gray-700 text-center">
                  Click để tải lên hoặc kéo thả file vào đây
                </p>
                <p className="text-sm text-gray-500">
                  Hỗ trợ định dạng XLSX, XLS, CSV
                </p>
                <Input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  multiple
                />
              </label>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <AnimatedPage>
      <div className="max-w-7xl mx-auto space-y-6">{renderStateView()}</div>
    </AnimatedPage>
  );
};

export default ShopeeVoucherAnalyzerPage;
