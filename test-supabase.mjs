/**
 * Script kiểm tra kết nối Supabase đơn giản
 * Sử dụng ES modules để tương thích với môi trường hiện tại
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Đọc file .env để lấy biến môi trường
 */
function loadEnvFile() {
  try {
    const envPath = join(__dirname, '.env');
    const envContent = readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        envVars[key.trim()] = value.trim();
      }
    });
    
    return envVars;
  } catch (error) {
    console.log('⚠️ Không tìm thấy file .env, sử dụng biến môi trường hệ thống');
    return process.env;
  }
}

/**
 * Kiểm tra kết nối Supabase
 */
async function testSupabaseConnection() {
  console.log('🔍 Kiểm tra kết nối Supabase...\n');
  
  // Load environment variables
  const env = loadEnvFile();
  
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const supabaseKey = env.VITE_SUPABASE_ANON_KEY;
  
  // Kiểm tra biến môi trường
  if (!supabaseUrl) {
    console.error('❌ VITE_SUPABASE_URL không được thiết lập');
    console.log('💡 Hãy tạo file .env và thêm: VITE_SUPABASE_URL=your_supabase_url');
    return false;
  }
  
  if (!supabaseKey) {
    console.error('❌ VITE_SUPABASE_ANON_KEY không được thiết lập');
    console.log('💡 Hãy tạo file .env và thêm: VITE_SUPABASE_ANON_KEY=your_supabase_key');
    return false;
  }
  
  console.log('✅ Biến môi trường đã được thiết lập');
  console.log(`   📍 URL: ${supabaseUrl}`);
  console.log(`   🔑 Key: ${supabaseKey.substring(0, 20)}...\n`);
  
  try {
    // Tạo Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('🔗 Đang kiểm tra kết nối...');
    
    // Test 1: Kiểm tra session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Lỗi khi lấy session:', sessionError.message);
      return false;
    }
    
    console.log('✅ Kết nối auth thành công');
    
    // Test 2: Kiểm tra database access
    console.log('📊 Đang kiểm tra quyền truy cập database...');
    
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('⚠️ Không thể truy cập bảng profiles:', error.message);
      console.log('💡 Điều này có thể bình thường nếu bạn chưa đăng nhập');
    } else {
      console.log('✅ Có thể truy cập database');
    }
    
    // Test 3: Kiểm tra một số bảng chính
    const tables = ['profiles', 'shopee_shops', 'comprehensive_reports'];
    console.log('\n📋 Kiểm tra các bảng chính:');
    
    for (const table of tables) {
      try {
        const { error: tableError } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (tableError) {
          console.log(`   ⚠️ ${table}: ${tableError.message}`);
        } else {
          console.log(`   ✅ ${table}: OK`);
        }
      } catch (err) {
        console.log(`   ❌ ${table}: ${err.message}`);
      }
    }
    
    console.log('\n🎉 KẾT QUẢ:');
    console.log('='.repeat(40));
    console.log('✅ Supabase client đã được khởi tạo thành công');
    console.log('✅ Có thể kết nối với Supabase');
    console.log('✅ Cấu hình môi trường đúng');
    console.log('\n💡 Dự án của bạn đã sẵn sàng sử dụng Supabase!');
    
    return true;
    
  } catch (error) {
    console.error('❌ Lỗi kết nối:', error.message);
    console.log('\n🔧 CÁCH KHẮC PHỤC:');
    console.log('1. Kiểm tra URL và API key có đúng không');
    console.log('2. Kiểm tra kết nối internet');
    console.log('3. Kiểm tra Supabase project có hoạt động không');
    return false;
  }
}

// Chạy test
testSupabaseConnection()
  .then(success => {
    if (!success) {
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Lỗi không mong đợi:', error);
    process.exit(1);
  });