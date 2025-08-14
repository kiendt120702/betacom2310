// Test script để kiểm tra date parsing với ngày 31
const testDates = [
  "31-12-2024", // Ngày 31 tháng 12
  "31-01-2024", // Ngày 31 tháng 1
  "31-03-2024", // Ngày 31 tháng 3
  "31-05-2024", // Ngày 31 tháng 5
  "31-07-2024", // Ngày 31 tháng 7
  "31-08-2024", // Ngày 31 tháng 8
  "31-10-2024", // Ngày 31 tháng 10
  "30-11-2024", // Ngày 30 tháng 11 (tháng 11 chỉ có 30 ngày)
  "29-02-2024", // Ngày 29 tháng 2 (năm nhuận)
  45658,        // Excel date number cho 31/12/2024
];

const parseDate = (value) => {
  console.log('Parsing date value:', value, 'Type:', typeof value);
  
  if (!value) return null;
  
  if (typeof value === 'string') {
    // Handle special format like "31-12-2024" 
    const specialFormatMatch = value.match(/^(\d{1,2}-\d{1,2}-\d{4})/);
    if (specialFormatMatch) {
      const datePart = specialFormatMatch[1];
      const parts = datePart.split('-');
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // Convert to 0-based month
        const year = parseInt(parts[2]);
        if (!isNaN(day) && !isNaN(month) && !isNaN(year) && 
            day >= 1 && day <= 31 && month >= 0 && month <= 11) {
          // Use UTC to avoid timezone issues
          const date = new Date(Date.UTC(year, month, day));
          console.log('Created date from special format:', date);
          return date.toISOString().split('T')[0];
        }
      }
    }
    
    // Handle other formats like DD/MM/YYYY or DD-MM-YYYY
    const parts = value.split(/[-/]/);
    if (parts.length === 3) {
      let day, month, year;
      
      // Assume DD/MM/YYYY or DD-MM-YYYY format first
      if (parts[2].length === 4) {
        day = parseInt(parts[0]);
        month = parseInt(parts[1]) - 1; // Convert to 0-based
        year = parseInt(parts[2]);
      } else if (parts[0].length === 4) {
        // YYYY/MM/DD or YYYY-MM-DD format
        year = parseInt(parts[0]);
        month = parseInt(parts[1]) - 1; // Convert to 0-based
        day = parseInt(parts[2]);
      }
      
      if (!isNaN(day) && !isNaN(month) && !isNaN(year) && 
          day >= 1 && day <= 31 && month >= 0 && month <= 11) {
        // Use UTC to avoid timezone issues
        const date = new Date(Date.UTC(year, month, day));
        console.log('Created date from parts:', date, 'Day:', day, 'Month:', month+1, 'Year:', year);
        return date.toISOString().split('T')[0];
      }
    }
  }
  
  if (typeof value === 'number') {
    // Excel date number - be more precise with calculation
    const excelEpoch = new Date(1900, 0, 1); // Excel starts from 1900-01-01
    const date = new Date(excelEpoch.getTime() + (value - 1) * 86400000); // -1 because Excel counts from 1
    console.log('Excel date number:', value, 'Converted to:', date);
    return date.toISOString().split('T')[0];
  }
  
  if (value instanceof Date) {
    console.log('Date object:', value);
    return value.toISOString().split('T')[0];
  }
  
  console.log('Could not parse date:', value);
  return null;
};

console.log('=== Testing Date Parsing ===');
testDates.forEach(testDate => {
  console.log(`\n--- Testing: ${testDate} ---`);
  const result = parseDate(testDate);
  console.log(`Result: ${result}`);
});

// Test filtering logic
console.log('\n=== Testing Month Filtering Logic ===');
const testMonth = '2024-12';
const [year, month] = testMonth.split('-');
const yearNum = parseInt(year);
const monthNum = parseInt(month);

const startDate = `${year}-${month.padStart(2, '0')}-01`;
const lastDayOfMonth = new Date(yearNum, monthNum, 0); // Day 0 = last day of previous month
const endDate = lastDayOfMonth.toISOString().split('T')[0];

console.log('Filter for month:', testMonth);
console.log('Start date:', startDate);
console.log('End date (inclusive):', endDate);
console.log('Last day of month:', lastDayOfMonth.toDateString());

// Check if Dec 31, 2024 would be included
const dec31 = '2024-12-31';
const wouldBeIncluded = dec31 >= startDate && dec31 <= endDate;
console.log(`Would ${dec31} be included?`, wouldBeIncluded);