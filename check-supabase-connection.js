/**
 * Script kiểm tra kết nối Supabase
 * Chạy script này để xác minh dự án đã kết nối thành công với Supabase
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Kiểm tra các biến môi trường cần thiết
 */
function checkEnvironmentVariables() {
  console.log('🔍 Kiểm tra biến môi trường...');
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl) {
    console.error('❌ VITE_SUPABASE_URL không được thiết lập');
    return false;
  }
  
  if (!supabaseKey) {
    console.error('❌ VITE_SUPABASE_ANON_KEY không được thiết lập');
    return false;
  }
  
  console.log('✅ Các biến môi trường đã được thiết lập');
  console.log(`   - SUPABASE_URL: ${supabaseUrl}`);
  console.log(`   - SUPABASE_KEY: ${supabaseKey.substring(0, 20)}...`);
  
  return { supabaseUrl, supabaseKey };
}

/**
 * Kiểm tra kết nối cơ bản với Supabase
 */
async function testBasicConnection(supabaseUrl, supabaseKey) {
  console.log('\n🔗 Kiểm tra kết nối cơ bản...');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test basic connection by getting session
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Lỗi khi kết nối:', error.message);
      return false;
    }
    
    console.log('✅ Kết nối cơ bản thành công');
    return supabase;
  } catch (error) {
    console.error('❌ Lỗi kết nối:', error.message);
    return false;
  }
}

/**
 * Kiểm tra quyền truy cập database
 */
async function testDatabaseAccess(supabase) {
  console.log('\n📊 Kiểm tra quyền truy cập database...');
  
  try {
    // Test reading from profiles table (common table in the project)
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Lỗi truy cập database:', error.message);
      return false;
    }
    
    console.log('✅ Có thể truy cập database');
    return true;
  } catch (error) {
    console.error('❌ Lỗi truy cập database:', error.message);
    return false;
  }
}

/**
 * Kiểm tra các bảng chính trong database
 */
async function checkMainTables(supabase) {
  console.log('\n📋 Kiểm tra các bảng chính...');
  
  const tables = [
    'profiles',
    'shopee_shops', 
    'comprehensive_reports',
    'thumbnails',
    'edu_exercises'
  ];
  
  const results = {};
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
      
      if (error) {
        console.log(`   ❌ ${table}: ${error.message}`);
        results[table] = false;
      } else {
        console.log(`   ✅ ${table}: Có thể truy cập`);
        results[table] = true;
      }
    } catch (error) {
      console.log(`   ❌ ${table}: ${error.message}`);
      results[table] = false;
    }
  }
  
  return results;
}

/**
 * Kiểm tra Edge Functions
 */
async function checkEdgeFunctions(supabase) {
  console.log('\n⚡ Kiểm tra Edge Functions...');
  
  try {
    // Test create-user function (without actually creating a user)
    const { data, error } = await supabase.functions.invoke('create-user', {
      body: { test: true }
    });
    
    // We expect an error here since we're not sending valid data
    // But if the function exists, we should get a response
    if (error && error.message.includes('FunctionsRelayError')) {
      console.log('❌ Edge Functions không khả dụng hoặc chưa được deploy');
      return false;
    }
    
    console.log('✅ Edge Functions có thể truy cập');
    return true;
  } catch (error) {
    console.log('❌ Edge Functions không khả dụng:', error.message);
    return false;
  }
}

/**
 * Hàm chính để chạy tất cả các kiểm tra
 */
async function main() {
  console.log('🚀 Bắt đầu kiểm tra kết nối Supabase\n');
  
  // 1. Kiểm tra biến môi trường
  const envCheck = checkEnvironmentVariables();
  if (!envCheck) {
    console.log('\n❌ Kiểm tra thất bại: Thiếu biến môi trường');
    process.exit(1);
  }
  
  // 2. Kiểm tra kết nối cơ bản
  const supabase = await testBasicConnection(envCheck.supabaseUrl, envCheck.supabaseKey);
  if (!supabase) {
    console.log('\n❌ Kiểm tra thất bại: Không thể kết nối với Supabase');
    process.exit(1);
  }
  
  // 3. Kiểm tra quyền truy cập database
  const dbAccess = await testDatabaseAccess(supabase);
  
  // 4. Kiểm tra các bảng chính
  const tableResults = await checkMainTables(supabase);
  
  // 5. Kiểm tra Edge Functions
  const functionsAccess = await checkEdgeFunctions(supabase);
  
  // Tổng kết
  console.log('\n📊 KẾT QUẢ KIỂM TRA:');
  console.log('='.repeat(50));
  console.log(`✅ Biến môi trường: OK`);
  console.log(`✅ Kết nối cơ bản: OK`);
  console.log(`${dbAccess ? '✅' : '❌'} Truy cập database: ${dbAccess ? 'OK' : 'FAILED'}`);
  
  const successfulTables = Object.values(tableResults).filter(Boolean).length;
  const totalTables = Object.keys(tableResults).length;
  console.log(`${successfulTables === totalTables ? '✅' : '⚠️'} Bảng database: ${successfulTables}/${totalTables} OK`);
  
  console.log(`${functionsAccess ? '✅' : '⚠️'} Edge Functions: ${functionsAccess ? 'OK' : 'NOT AVAILABLE'}`);
  
  if (dbAccess && successfulTables > 0) {
    console.log('\n🎉 KẾT NỐI SUPABASE THÀNH CÔNG!');
    console.log('Dự án của bạn đã được cấu hình đúng và có thể kết nối với Supabase.');
  } else {
    console.log('\n⚠️ CÓ VẤN ĐỀ VỚI KẾT NỐI');
    console.log('Vui lòng kiểm tra lại cấu hình và quyền truy cập.');
  }
}

// Chạy script
main().catch(console.error);