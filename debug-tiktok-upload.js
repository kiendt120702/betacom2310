// Script để test TikTok upload parsing logic
// Chạy với: node debug-tiktok-upload.js

const parseNumber = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;
  return parseFloat(value.replace(/,/g, ''));
};

const parsePercentage = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;
  return parseFloat(String(value).replace('%', ''));
};

// Test data giống như trong Excel
const testRowObject = {
  "Ngày": "1/9/2025",
  "Tổng giá trị hàng hóa (₫)": "1,500,000",
  "Hoàn tiền (₫)": "50,000",
  "Phân tích tổng doanh thu có trợ cấp của nền tảng cho sản phẩm": "200,000",
  "Số món bán ra": "100",
  "Khách hàng": "50",
  "Lượt xem trang": "1,000",
  "Lượt truy cập trang Cửa hàng": "800",
  "Đơn hàng SKU": "75",
  "Đơn hàng": "60",
  "Tỷ lệ chuyển đổi": "6%"
};

console.log('=== TESTING TikTok Upload Parse Logic ===');
console.log('📊 Row Object Keys:', Object.keys(testRowObject));
console.log('🔍 Raw Row Data:', testRowObject);

const report = {
  total_revenue: parseNumber(testRowObject["Tổng giá trị hàng hóa (₫)"]) || 0,
  returned_revenue: parseNumber(testRowObject["Hoàn tiền (₫)"]) || 0,
  platform_subsidized_revenue: parseNumber(testRowObject["Phân tích tổng doanh thu có trợ cấp của nền tảng cho sản phẩm"]) || 0,
  items_sold: parseInt(String(testRowObject["Số món bán ra"]), 10) || 0,
  total_buyers: parseInt(String(testRowObject["Khách hàng"]), 10) || 0,
  total_visits: parseInt(String(testRowObject["Lượt xem trang"]), 10) || 0,
  store_visits: parseInt(String(testRowObject["Lượt truy cập trang Cửa hàng"]), 10) || 0,
  sku_orders: parseInt(String(testRowObject["Đơn hàng SKU"]), 10) || 0,
  total_orders: parseInt(String(testRowObject["Đơn hàng"]), 10) || 0,
  conversion_rate: parsePercentage(testRowObject["Tỷ lệ chuyển đổi"]) || 0,
};

console.log('💰 Parsed Values:', report);
console.log('================');