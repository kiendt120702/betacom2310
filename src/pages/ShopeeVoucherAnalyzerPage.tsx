import React, { useState, useCallback } from 'react';
import { AppState } from '../types/shopeeVoucher';
import { analyzeData } from '../services/analyzer';
import { StatCard } from '../components/shopee-voucher-analyzer/StatCard';
import { AnalysisCard } from '../components/shopee-voucher-analyzer/AnalysisCard';
import {
  InfoIcon,
  CheckCircleIcon,
  SparklesIcon,
  DownloadIcon,
  RefreshIcon,
  XCircleIcon,
  UploadCloudIcon,
  LoaderIcon,
  UsersIcon
} from '../components/shopee-voucher-analyzer/icons';
import { formatCurrency, formatPercentage, formatNumber } from '../utils/formatters';
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TicketPercent } from 'lucide-react';

const ShopeeVoucherAnalyzerPage: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({ status: 'idle' });
  const { toast } = useToast();

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setAppState({ status: 'loading' });

    const readFile = (file: File): Promise<any[]> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = e.target?.result;
            if (!data) {
              return reject(new Error(`Failed to read file: ${file.name}`));
            }
            const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            if (!worksheet) {
              return reject(new Error(`No data found in the first sheet of ${file.name}.`));
            }
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });
            resolve(jsonData);
          } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown parsing error";
            reject(new Error(`Error processing ${file.name}: ${message}`));
          }
        };
        reader.onerror = () => {
          reject(new Error(`Error reading the file ${file.name}.`));
        };
        reader.readAsBinaryString(file);
      });

    try {
      const allJsonDataArrays = await Promise.all(Array.from(files).map(file => readFile(file)));
      const combinedData = allJsonDataArrays.flat();

      if (combinedData.length === 0) {
        throw new Error("The uploaded file(s) are empty or in an unsupported format.");
      }

      const result = analyzeData(combinedData);
      setAppState({ status: 'success', data: result });
      toast({ title: "Analysis Complete", description: "Your voucher data has been successfully analyzed." });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setAppState({ status: 'error', error: errorMessage });
      toast({ title: "Analysis Failed", description: errorMessage, variant: "destructive" });
    } finally {
      // Reset file input value to allow re-uploading the same file(s)
      if (event.target) {
        event.target.value = '';
      }
    }
  }, [toast]);


  const resetState = () => setAppState({ status: 'idle' });

  const renderContent = () => {
    switch (appState.status) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center text-center p-8">
            <LoaderIcon className="w-12 h-12 animate-spin text-gray-500" />
            <p className="mt-4 text-lg font-medium text-gray-700">Analyzing your data...</p>
            <p className="text-gray-500">This may take a moment.</p>
          </div>
        );
      case 'error':
        return (
          <div className="flex flex-col items-center justify-center text-center p-8 bg-red-50 rounded-lg border border-red-200">
            <XCircleIcon className="w-12 h-12 text-red-500" />
            <p className="mt-4 text-lg font-bold text-red-700">Analysis Failed</p>
            <p className="text-red-600 mt-1">{appState.error}</p>
            <Button
              onClick={resetState}
              variant="destructive"
              className="mt-6"
            >
              Try Again
            </Button>
          </div>
        );
      case 'success':
        const { data } = appState;
        const { summary, costs, voucherDistribution, recommendations } = data;
        const cheaperOption = costs.voucherXtra.cost < costs.coSponsor.cost ? 'Voucher Xtra' : 'Đồng tài trợ';

        return (
          <div className="space-y-6">
            <AnalysisCard title="Tổng quan đơn hàng" icon={<InfoIcon />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Tổng số đơn (unique)" value={formatNumber(summary.totalOrders)} color="gray" />
                <StatCard label="Đơn hoàn thành" value={formatNumber(summary.completedOrders.count)} percentage={summary.completedOrders.percentage} color="green" />
                <StatCard label="Đơn đã hủy" value={formatNumber(summary.cancelledOrders.count)} percentage={summary.cancelledOrders.percentage} color="red" />
                <StatCard label="Đơn trả hàng/hoàn tiền" value={formatNumber(summary.returnedOrders.count)} percentage={summary.returnedOrders.percentage} color="yellow" />
              </div>
            </AnalysisCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnalysisCard title="Doanh thu & So sánh chi phí (Đơn hoàn thành)" icon={<InfoIcon />}>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium text-gray-700">Doanh thu</span>
                    <span className="font-bold text-gray-900 text-base">{formatCurrency(costs.revenue)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium text-gray-700">AOV (Giá trị đơn hàng TB)</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(costs.AOV)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium text-gray-700">Tổng Voucher Shopee Tài Trợ</span>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(costs.totalVoucherAmount)}</p>
                      <p className="text-xs text-gray-500 -mt-1">{formatPercentage(costs.totalVoucherPercentageOfRevenue)}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-teal-50 text-teal-800 p-3 rounded-lg">
                    <span className="font-medium">Cost Voucher Xtra (3%)</span>
                    <div className="text-right">
                      <p className="font-semibold text-teal-900">{formatCurrency(costs.voucherXtra.cost)}</p>
                      <p className="text-xs text-teal-700">{formatPercentage(costs.voucherXtra.percentageOfRevenue)}</p>
                    </div>
                  </div>
                   <div className="flex justify-between items-center bg-orange-50 text-orange-800 p-3 rounded-lg">
                    <span className="font-medium">Cost Đồng tài trợ (20%)</span>
                    <div className="text-right">
                      <p className="font-semibold text-orange-900">{formatCurrency(costs.coSponsor.cost)}</p>
                      <p className="text-xs text-orange-700">{formatPercentage(costs.coSponsor.percentageOfRevenue)}</p>
                    </div>
                  </div>
                  <div className="bg-blue-50 text-blue-800 p-3 rounded-lg flex items-center gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <p className="font-semibold">Rẻ hơn: {cheaperOption} (chênh lệch {formatCurrency(costs.difference)})</p>
                  </div>
                </div>
              </AnalysisCard>
              
              <AnalysisCard title="Phân bố mức voucher (Đơn hoàn thành)" icon={<InfoIcon />} bgColor="bg-slate-50">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Không dùng mã</span>
                    <div className="text-right">
                      <span className="font-bold text-gray-800">{formatNumber(voucherDistribution.noVoucherCount)} đơn</span>
                      <span className="text-xs text-gray-500 ml-2">{formatPercentage(voucherDistribution.noVoucherPercentage)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Có dùng mã</span>
                    <div className="text-right">
                      <span className="font-bold text-gray-800">{formatNumber(voucherDistribution.withVoucherCount)} đơn</span>
                      <span className="text-xs text-gray-500 ml-2">{formatPercentage(voucherDistribution.withVoucherPercentage)}</span>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-700 pt-2">Top 5 mức voucher:</p>
                  {voucherDistribution.top5.map((v, i) => (
                    <div key={i} className="flex justify-between items-center py-1">
                      <span className="text-gray-600">{formatCurrency(v.amount)}</span>
                      <div className="text-right">
                        <span className="font-bold text-gray-800">{formatNumber(v.count)} đơn</span>
                        <span className="text-xs text-gray-500 ml-2">{formatPercentage(v.percentage)}</span>
                      </div>
                    </div>
                  ))}
                  {voucherDistribution.insight && (
                    <div className="bg-gray-100 p-3 rounded-lg text-gray-600 text-xs italic mt-2">
                      "{voucherDistribution.insight}"
                    </div>
                  )}
                </div>
              </AnalysisCard>
            </div>

            <AnalysisCard title="Đề xuất hành động" icon={<SparklesIcon />}>
              <ul className="space-y-3">
                {recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700 text-sm" dangerouslySetInnerHTML={{ __html: rec }} />
                  </li>
                ))}
              </ul>
            </AnalysisCard>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 flex-wrap">
                <Button className="w-full sm:w-auto">
                  <DownloadIcon className="w-5 h-5 mr-2" /> Tải Summary (CSV)
                </Button>
                <Button className="w-full sm:w-auto" variant="secondary">
                  <DownloadIcon className="w-5 h-5 mr-2" /> Tải Phân bố (CSV)
                </Button>
                <Button onClick={resetState} className="w-full sm:w-auto" variant="outline">
                  <RefreshIcon className="w-5 h-5 mr-2" /> Phân tích file khác
                </Button>
                <a 
                  href="https://zalo.me/g/cflpav484"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button className="w-full">
                    <UsersIcon className="w-5 h-5 mr-2" /> Tham gia cộng đồng AI TMĐT
                  </Button>
                </a>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen -m-4 sm:-m-6 p-4 sm:p-6">
      <main className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <p className="mt-2 text-lg text-gray-500">
            Tải lên file đơn hàng (XLSX/CSV) để so sánh chi phí và phân tích hiệu quả voucher.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 min-h-[200px] flex justify-center items-center">
          {appState.status === 'idle' && (
             <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-gray-300 rounded-lg p-10 sm:p-12 hover:bg-gray-50 transition-colors">
                <UploadCloudIcon className="w-12 h-12 text-gray-400" />
                <p className="mt-4 text-lg font-semibold text-gray-700 text-center">Click to upload or drag and drop file(s)</p>
                <p className="text-sm text-gray-500">XLSX or CSV files</p>
                <Input id="file-upload" type="file" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileChange} multiple />
            </label>
          )}
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default ShopeeVoucherAnalyzerPage;
