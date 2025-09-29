import { AnalysisResult } from '@/types/shopeeVoucher';

type OrderData = {
  orderId: string;
  orderTotal: number;
  shopeeVoucher: number;
  shopVoucher: number;
  orderStatus: string;
  returnStatus: string;
  productName: string;
  orderPlacedAt: string;
};

type HeaderMap = Record<keyof OrderData, string>;

type ColumnMappings = Record<keyof OrderData, string[]>;

const COLUMN_MAPPINGS: ColumnMappings = {
  orderId: ['mã đơn hàng', 'order id', 'order no', 'mã vận đơn'],
  orderTotal: ['tổng giá trị đơn hàng (vnd)', 'order amount', 'order total'],
  shopeeVoucher: ['mã giảm giá của shopee', 'voucher shopee'],
  shopVoucher: ['mã giảm giá của shop', 'voucher shop', 'shop voucher'],
  orderStatus: ['trạng thái đơn hàng', 'order status'],
  returnStatus: ['trạng thái trả hàng/hoàn tiền', 'return/refund status'],
  productName: ['tên sản phẩm', 'product name', 'item name'],
  orderPlacedAt: ['ngày đặt hàng', 'order created time', 'order created at', 'order date'],
};

const normalizeHeader = (value: unknown): string => String(value ?? '').toLowerCase().trim();

const findHeader = (headers: string[], candidates: string[]): string | null => {
  const normalizedHeaders = headers.map(normalizeHeader);
  for (const candidate of candidates) {
    const idx = normalizedHeaders.findIndex(header => header === candidate.toLowerCase());
    if (idx !== -1) {
      return headers[idx];
    }
  }
  return null;
};

const sanitizeNumber = (value: unknown): number => {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  const numeric = Number(String(value).replace(/[^0-9.-]+/g, ''));
  return Number.isNaN(numeric) ? 0 : numeric;
};

const cleanRow = (rawRow: Record<string, any>, headerMap: HeaderMap): OrderData => {
  const getValue = (field: keyof OrderData): unknown => {
    const header = headerMap[field];
    if (!header || header === 'N/A') {
      return undefined;
    }
    return rawRow[header];
  };

  return {
    orderId: String(getValue('orderId') ?? '').trim(),
    orderTotal: sanitizeNumber(getValue('orderTotal')),
    shopeeVoucher: sanitizeNumber(getValue('shopeeVoucher')),
    shopVoucher: sanitizeNumber(getValue('shopVoucher')),
    orderStatus: normalizeHeader(getValue('orderStatus')),
    returnStatus: String(getValue('returnStatus') ?? '').trim(),
    productName: String(getValue('productName') ?? '').trim(),
    orderPlacedAt: String(getValue('orderPlacedAt') ?? '').trim(),
  };
};

const extractHour = (value: string): number | null => {
  if (!value) {
    return null;
  }
  const hourMatch = value.match(/(\d{1,2}):(\d{2})/);
  if (hourMatch) {
    const hour = Number(hourMatch[1]);
    if (!Number.isNaN(hour) && hour >= 0 && hour <= 23) {
      return hour;
    }
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.getHours();
  }

  return null;
};

export const analyzeData = (rawData: any[]): AnalysisResult => {
  if (!rawData || rawData.length === 0) {
    throw new Error('No data to analyze.');
  }

  const headers = Object.keys(rawData[0] ?? {});
  const headerMap = Object.keys(COLUMN_MAPPINGS).reduce<HeaderMap>((acc, key) => {
    acc[key as keyof OrderData] = '';
    return acc;
  }, {} as HeaderMap);

  (Object.keys(COLUMN_MAPPINGS) as Array<keyof OrderData>).forEach(key => {
    const found = findHeader(headers, COLUMN_MAPPINGS[key]);
    if (!found) {
      if (key === 'returnStatus' || key === 'shopVoucher') {
        headerMap[key] = 'N/A';
        return;
      }
      throw new Error(`Required column not found. Please ensure your file has a column for: "${COLUMN_MAPPINGS[key][0]}".`);
    }
    headerMap[key] = found;
  });

  const cleanedRows = rawData
    .map(row => cleanRow(row, headerMap))
    .filter(row => row.orderId);

  const uniqueOrdersMap = new Map<string, OrderData>();
  cleanedRows.forEach(row => {
    if (!uniqueOrdersMap.has(row.orderId)) {
      uniqueOrdersMap.set(row.orderId, row);
    }
  });
  const uniqueOrders = Array.from(uniqueOrdersMap.values());

  const totalOrders = uniqueOrders.length;
  if (totalOrders === 0) {
    throw new Error('No unique orders found in the file.');
  }

  const completedOrders = uniqueOrders.filter(order => order.orderStatus !== 'đã hủy');
  const cancelledOrders = uniqueOrders.filter(order => order.orderStatus === 'đã hủy');
  const returnedOrders = uniqueOrders.filter(order => order.returnStatus);

  const summary = {
    totalOrders,
    completedOrders: { count: completedOrders.length, percentage: (completedOrders.length / totalOrders) * 100 },
    cancelledOrders: { count: cancelledOrders.length, percentage: (cancelledOrders.length / totalOrders) * 100 },
    returnedOrders: { count: returnedOrders.length, percentage: (returnedOrders.length / totalOrders) * 100 },
  };

  const revenue = completedOrders.reduce((sum, order) => sum + order.orderTotal, 0);
  const totalVoucherAmount = completedOrders.reduce((sum, order) => sum + order.shopeeVoucher, 0);

  const voucherXtraCost = completedOrders.reduce((sum, order) => {
    const cappedCost = Math.min(order.orderTotal * 0.03, 50000);
    return sum + cappedCost;
  }, 0);

  const coSponsorCost = completedOrders.reduce((sum, order) => {
    const cappedCost = Math.min(order.shopeeVoucher * 0.2, 50000);
    return sum + cappedCost;
  }, 0);

  const costs = {
    revenue,
    AOV: completedOrders.length ? revenue / completedOrders.length : 0,
    totalVoucherAmount,
    totalVoucherPercentageOfRevenue: revenue > 0 ? (totalVoucherAmount / revenue) * 100 : 0,
    voucherXtra: {
      cost: voucherXtraCost,
      percentageOfRevenue: revenue > 0 ? (voucherXtraCost / revenue) * 100 : 0,
    },
    coSponsor: {
      cost: coSponsorCost,
      percentageOfRevenue: revenue > 0 ? (coSponsorCost / revenue) * 100 : 0,
    },
    difference: Math.abs(voucherXtraCost - coSponsorCost),
  };

  const completedOrderIds = new Set(completedOrders.map(order => order.orderId));
  const allCompletedRows = cleanedRows.filter(row => completedOrderIds.has(row.orderId));
  const totalCompletedRows = allCompletedRows.length;

  const voucherCounts = new Map<number, number>();
  let noVoucherCount = 0;
  allCompletedRows.forEach(row => {
    const voucherValue = row.shopVoucher;
    if (voucherValue > 0) {
      const current = voucherCounts.get(voucherValue) ?? 0;
      voucherCounts.set(voucherValue, current + 1);
    } else {
      noVoucherCount += 1;
    }
  });

  const sortedVouchers = Array.from(voucherCounts.entries()).sort((a, b) => b[1] - a[1]);
  const divisor = totalCompletedRows || 1;
  const top5 = sortedVouchers.slice(0, 5).map(([amount, count]) => ({
    amount,
    count,
    percentage: (count / divisor) * 100,
  }));

  const withVoucherCount = Math.max(totalCompletedRows - noVoucherCount, 0);
  const voucherDistribution = {
    noVoucherCount,
    noVoucherPercentage: totalCompletedRows ? (noVoucherCount / totalCompletedRows) * 100 : 0,
    withVoucherCount,
    withVoucherPercentage: totalCompletedRows ? (withVoucherCount / totalCompletedRows) * 100 : 0,
    top5,
    insight: '',
  };

  let insight = 'Phân tích cho thấy người dùng có xu hướng sử dụng voucher ở nhiều mệnh giá khác nhau.';
  const highValueVoucherUsage = top5
    .filter(voucher => voucher.amount >= 30000)
    .reduce((sum, voucher) => sum + voucher.count, 0);
  if (totalCompletedRows && highValueVoucherUsage > totalCompletedRows * 0.05) {
    insight = 'Voucher mệnh giá cao (từ 30.000đ trở lên) được sử dụng nhiều, cho thấy hiệu quả trong việc thúc đẩy các đơn hàng giá trị lớn.';
  }
  voucherDistribution.insight = top5.length ? insight : '';

  const cheaperOption = costs.voucherXtra.cost < costs.coSponsor.cost ? '**Voucher Xtra**' : '**Đồng tài trợ**';
  const expensiveOption = costs.voucherXtra.cost >= costs.coSponsor.cost ? '**Voucher Xtra**' : '**Đồng tài trợ**';

  const recommendations = [
    `Dựa trên doanh thu đơn hoàn thành, phương án ${cheaperOption} đang tiết kiệm chi phí hơn. Cân nhắc tập trung ngân sách marketing vào kênh này.`,
    `Chi phí ${expensiveOption} đang cao hơn. Hãy xem xét tối ưu bằng cách tạo thêm các mã giảm giá hấp dẫn để thu hút và giữ chân khách hàng.`,
  ];

  if (summary.cancelledOrders.percentage > 10) {
    recommendations.push(`Tỷ lệ hủy đơn khá cao (${summary.cancelledOrders.percentage.toFixed(1)}%). Cần tìm hiểu nguyên nhân (VD: thời gian chờ xác nhận lâu, hết hàng, vấn đề vận chuyển) để cải thiện quy trình.`);
  } else {
    recommendations.push('Tỷ lệ hủy đơn thấp, cho thấy quy trình xử lý đơn hàng đang hoạt động tốt.');
  }

  const hourlyCounts = Array.from({ length: 24 }, () => 0);
  let totalOrdersWithTime = 0;

  uniqueOrders.forEach(order => {
    const hour = extractHour(order.orderPlacedAt);
    if (hour !== null) {
      hourlyCounts[hour] += 1;
      totalOrdersWithTime += 1;
    }
  });

  const hourlyDistribution = {
    totalOrdersWithTime,
    buckets: hourlyCounts.map((count, hour) => ({
      hour,
      count,
      percentage: totalOrdersWithTime ? (count / totalOrdersWithTime) * 100 : 0,
    })),
  };

  type ProductHourAccumulator = {
    hourOrderIds: Array<Set<string>>;
    uniqueOrderIds: Set<string>;
  };

  const productHourlyAccumulator = new Map<string, ProductHourAccumulator>();

  allCompletedRows.forEach(row => {
    if (!row.productName) {
      return;
    }
    const hour = extractHour(row.orderPlacedAt);
    if (hour === null) {
      return;
    }
    const productName = row.productName;
    if (!productHourlyAccumulator.has(productName)) {
      productHourlyAccumulator.set(productName, {
        hourOrderIds: Array.from({ length: 24 }, () => new Set<string>()),
        uniqueOrderIds: new Set<string>(),
      });
    }
    const accumulator = productHourlyAccumulator.get(productName)!;
    accumulator.hourOrderIds[hour].add(row.orderId);
    accumulator.uniqueOrderIds.add(row.orderId);
  });

  const productHourlyDistributions = Array.from(productHourlyAccumulator.entries())
    .map(([productName, { hourOrderIds, uniqueOrderIds }]) => {
      const totalOrdersForProduct = uniqueOrderIds.size;
      return {
        productName,
        totalOrdersWithTime: totalOrdersForProduct,
        buckets: hourOrderIds.map((orderIds, hour) => {
          const count = orderIds.size;
          return {
            hour,
            count,
            percentage: totalOrdersForProduct ? (count / totalOrdersForProduct) * 100 : 0,
          };
        }),
      };
    })
    .filter(entry => entry.totalOrdersWithTime > 0)
    .sort((a, b) => b.totalOrdersWithTime - a.totalOrdersWithTime);

  return {
    summary,
    costs,
    voucherDistribution,
    hourlyDistribution,
    productHourlyDistributions,
    recommendations,
  };
};
