import { AnalysisResult, Order, Costs, VoucherDistribution, Summary } from '@/types/shopeeVoucher';

export const analyzeData = (data: any[]): AnalysisResult => {
  const orders: Order[] = data.map(row => ({
    orderId: row['Mã đơn hàng'],
    status: row['Trạng Thái Đơn Hàng'],
    orderType: row['Loại đơn hàng'],
    totalAmount: parseFloat(row['Tổng số tiền thu được từ Người mua'] || 0),
    shopeeVoucher: parseFloat(row['Shopee Voucher'] || 0),
  }));

  const uniqueOrders = Array.from(new Map(orders.map(order => [order.orderId, order])).values());

  const summary: Summary = {
    totalOrders: uniqueOrders.length,
    completedOrders: { count: 0, percentage: 0 },
    cancelledOrders: { count: 0, percentage: 0 },
    returnedOrders: { count: 0, percentage: 0 },
  };

  const completedOrders: Order[] = [];

  uniqueOrders.forEach(order => {
    const status = order.status.toLowerCase();
    if (status.includes('đã hủy')) {
      summary.cancelledOrders.count++;
    } else if (status.includes('trả hàng/hoàn tiền')) {
      summary.returnedOrders.count++;
    } else if (status.includes('đã hoàn thành')) {
      summary.completedOrders.count++;
      completedOrders.push(order);
    }
  });

  if (summary.totalOrders > 0) {
    summary.completedOrders.percentage = (summary.completedOrders.count / summary.totalOrders) * 100;
    summary.cancelledOrders.percentage = (summary.cancelledOrders.count / summary.totalOrders) * 100;
    summary.returnedOrders.percentage = (summary.returnedOrders.count / summary.totalOrders) * 100;
  }

  const costs: Costs = {
    revenue: 0,
    AOV: 0,
    totalVoucherAmount: 0,
    totalVoucherPercentageOfRevenue: 0,
    voucherXtra: { cost: 0, percentageOfRevenue: 0 },
    coSponsor: { cost: 0, percentageOfRevenue: 0 },
    difference: 0,
  };

  if (completedOrders.length > 0) {
    costs.revenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    costs.AOV = costs.revenue / completedOrders.length;
    costs.totalVoucherAmount = completedOrders.reduce((sum, order) => sum + order.shopeeVoucher, 0);
    if (costs.revenue > 0) {
      costs.totalVoucherPercentageOfRevenue = (costs.totalVoucherAmount / costs.revenue) * 100;
    }
    costs.voucherXtra = {
      cost: costs.revenue * 0.03,
      percentageOfRevenue: 3,
    };
    costs.coSponsor = {
      cost: costs.totalVoucherAmount * 0.2,
      percentageOfRevenue: costs.revenue > 0 ? (costs.totalVoucherAmount * 0.2 / costs.revenue) * 100 : 0,
    };
    costs.difference = Math.abs(costs.voucherXtra.cost - costs.coSponsor.cost);
  }

  const voucherDistribution: VoucherDistribution = {
    noVoucherCount: 0,
    withVoucherCount: 0,
    noVoucherPercentage: 0,
    withVoucherPercentage: 0,
    top5: [],
    insight: '',
  };

  const voucherCounts: { [key: number]: number } = {};
  completedOrders.forEach(order => {
    if (order.shopeeVoucher > 0) {
      voucherDistribution.withVoucherCount++;
      voucherCounts[order.shopeeVoucher] = (voucherCounts[order.shopeeVoucher] || 0) + 1;
    } else {
      voucherDistribution.noVoucherCount++;
    }
  });

  if (completedOrders.length > 0) {
    voucherDistribution.noVoucherPercentage = (voucherDistribution.noVoucherCount / completedOrders.length) * 100;
    voucherDistribution.withVoucherPercentage = (voucherDistribution.withVoucherCount / completedOrders.length) * 100;
  }

  voucherDistribution.top5 = Object.entries(voucherCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([amount, count]) => ({
      amount: parseFloat(amount),
      count,
      percentage: (count / completedOrders.length) * 100,
    }));

  if (voucherDistribution.top5.length > 0) {
    const mostCommon = voucherDistribution.top5[0];
    voucherDistribution.insight = `Mức voucher phổ biến nhất là ${mostCommon.amount.toLocaleString('vi-VN')}đ, chiếm ${mostCommon.percentage.toFixed(1)}% số đơn hàng hoàn thành.`;
  }

  const recommendations: string[] = [];
  if (costs.voucherXtra.cost < costs.coSponsor.cost) {
    recommendations.push(`<b>Voucher Xtra</b> có vẻ là lựa chọn tiết kiệm hơn, giúp bạn tiết kiệm <b>${costs.difference.toLocaleString('vi-VN')}đ</b> so với Đồng tài trợ.`);
  } else {
    recommendations.push(`<b>Đồng tài trợ</b> có vẻ là lựa chọn tiết kiệm hơn, giúp bạn tiết kiệm <b>${costs.difference.toLocaleString('vi-VN')}đ</b> so với Đồng tài trợ.`);
  }
  if (voucherDistribution.noVoucherPercentage > 50) {
    recommendations.push(`Hơn một nửa số đơn hàng (${voucherDistribution.noVoucherPercentage.toFixed(1)}%) không sử dụng voucher. Cân nhắc tăng cường truyền thông về voucher để thúc đẩy doanh số.`);
  }
  if (costs.totalVoucherPercentageOfRevenue > 10) {
    recommendations.push(`Chi phí voucher chiếm ${costs.totalVoucherPercentageOfRevenue.toFixed(1)}% doanh thu. Đây là một tỷ lệ đáng kể, hãy đảm bảo rằng các chiến dịch voucher đang mang lại lợi nhuận.`);
  }

  return { summary, costs, voucherDistribution, recommendations };
};