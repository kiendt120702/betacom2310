/**
 * Script to check and apply TikTok migration for missing columns
 * This script will help identify if the migration needs to be applied
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables manually
function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        // Remove quotes from value if present
        const cleanValue = value.trim().replace(/^["']|["']$/g, '');
        envVars[key.trim()] = cleanValue;
      }
    });
    
    return envVars;
  } catch (error) {
    console.error('❌ Could not load .env.local file:', error.message);
    return {};
  }
}

const envVars = loadEnvFile();

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMissingColumns() {
  console.log('🔍 Checking TikTok comprehensive reports table structure...');
  
  try {
    // Try to query for the missing columns
    const { data, error } = await supabase
      .from('tiktok_comprehensive_reports')
      .select('platform_subsidized_revenue, items_sold, total_buyers, total_visits, store_visits, sku_orders')
      .limit(1);
    
    if (error) {
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        console.log('❌ Missing columns detected in tiktok_comprehensive_reports table');
        console.log('📋 Error details:', error.message);
        return false;
      }
      throw error;
    }
    
    console.log('✅ All required columns exist in the database');
    return true;
  } catch (err) {
    console.error('❌ Error checking table structure:', err.message);
    return false;
  }
}

async function showMigrationInstructions() {
  console.log('\n📝 MIGRATION REQUIRED');
  console.log('=' .repeat(50));
  
  // Read the migration file
  const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20250116000000_add_tiktok_specific_columns.sql');
  
  if (fs.existsSync(migrationPath)) {
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('\n🔧 Please apply this migration in your Supabase Dashboard:');
    console.log('\n1. Go to: https://agshelsxkotwfvkzlwtn.supabase.co/project/_/sql');
    console.log('2. Copy and paste the following SQL:');
    console.log('\n' + '='.repeat(60));
    console.log(migrationSQL);
    console.log('='.repeat(60));
    console.log('\n3. Click "Run" to execute the migration');
    console.log('4. Refresh your TikTok Goal Setting page to test');
  } else {
    console.log('❌ Migration file not found at:', migrationPath);
    console.log('\n🔧 Manual SQL to run in Supabase Dashboard:');
    console.log('\n' + '='.repeat(60));
    console.log(`
-- Add missing TikTok-specific columns
ALTER TABLE tiktok_comprehensive_reports 
ADD COLUMN IF NOT EXISTS platform_subsidized_revenue DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS items_sold INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_buyers INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_visits INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS store_visits INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sku_orders INTEGER DEFAULT 0;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tiktok_reports_platform_subsidized_revenue ON tiktok_comprehensive_reports(platform_subsidized_revenue);
CREATE INDEX IF NOT EXISTS idx_tiktok_reports_items_sold ON tiktok_comprehensive_reports(items_sold);
CREATE INDEX IF NOT EXISTS idx_tiktok_reports_total_buyers ON tiktok_comprehensive_reports(total_buyers);
CREATE INDEX IF NOT EXISTS idx_tiktok_reports_total_visits ON tiktok_comprehensive_reports(total_visits);
CREATE INDEX IF NOT EXISTS idx_tiktok_reports_store_visits ON tiktok_comprehensive_reports(store_visits);
CREATE INDEX IF NOT EXISTS idx_tiktok_reports_sku_orders ON tiktok_comprehensive_reports(sku_orders);

-- Add comments for documentation
COMMENT ON COLUMN tiktok_comprehensive_reports.platform_subsidized_revenue IS 'Doanh thu có trợ cấp từ nền tảng TikTok';
COMMENT ON COLUMN tiktok_comprehensive_reports.items_sold IS 'Số món hàng đã bán';
COMMENT ON COLUMN tiktok_comprehensive_reports.total_buyers IS 'Tổng số khách hàng';
COMMENT ON COLUMN tiktok_comprehensive_reports.total_visits IS 'Tổng lượt xem trang';
COMMENT ON COLUMN tiktok_comprehensive_reports.store_visits IS 'Lượt truy cập trang cửa hàng';
COMMENT ON COLUMN tiktok_comprehensive_reports.sku_orders IS 'Số đơn hàng SKU';
`);
    console.log('='.repeat(60));
  }
}

async function main() {
  console.log('🚀 TikTok Goal Setting Migration Checker');
  console.log('=' .repeat(50));
  
  const hasAllColumns = await checkMissingColumns();
  
  if (!hasAllColumns) {
    await showMigrationInstructions();
    console.log('\n⚠️  After applying the migration, run this script again to verify.');
  } else {
    console.log('\n✅ Database is ready! TikTok goal setting should work properly.');
    console.log('\n🔄 If you\'re still experiencing issues:');
    console.log('1. Clear your browser cache');
    console.log('2. Refresh the TikTok Goal Setting page');
    console.log('3. Try setting goals again');
  }
}

main().catch(console.error);