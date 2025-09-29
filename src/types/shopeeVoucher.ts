export interface Order {
  orderId: string;
  status: string;
  orderType: string;
  totalAmount: number;
  shopeeVoucher: number;
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

export interface AnalysisResult {
  summary: Summary;
  costs: Costs;
  voucherDistribution: VoucherDistribution;
  recommendations: string[];
}

export type AppState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: AnalysisResult }
  | { status: 'error'; error: string };