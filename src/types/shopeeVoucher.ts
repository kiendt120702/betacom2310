export interface Order {
  orderId: string;
  orderTotal: number;
  shopeeVoucher: number;
  shopVoucher: number;
  orderStatus: string;
  returnStatus: string | null;
  productName: string;
  orderPlacedAt: string;
}

export interface Summary {
  totalOrders: number;
  completedOrders: { count: number; percentage: number };
  cancelledOrders: { count: number; percentage: number };
  returnedOrders: { count: number; percentage: number };
}

export interface Costs {
  revenue: number;
  AOV: number;
  totalVoucherAmount: number;
  totalVoucherPercentageOfRevenue: number;
  voucherXtra: { cost: number; percentageOfRevenue: number };
  coSponsor: { cost: number; percentageOfRevenue: number };
  difference: number;
}

export interface VoucherDistribution {
  noVoucherCount: number;
  withVoucherCount: number;
  noVoucherPercentage: number;
  withVoucherPercentage: number;
  top5: { amount: number; count: number; percentage: number }[];
  insight: string;
}

export interface HourlyBucket {
  hour: number;
  count: number;
  percentage: number;
}

export interface HourlyDistribution {
  totalOrdersWithTime: number;
  buckets: HourlyBucket[];
}

export interface ProductHourlyDistribution {
  productName: string;
  totalOrdersWithTime: number;
  buckets: HourlyBucket[];
}

export interface AnalysisResult {
  summary: Summary;
  costs: Costs;
  voucherDistribution: VoucherDistribution;
  hourlyDistribution: HourlyDistribution;
  productHourlyDistributions: ProductHourlyDistribution[];
  recommendations: string[];
}

export type AppState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: AnalysisResult }
  | { status: 'error'; error: string };
