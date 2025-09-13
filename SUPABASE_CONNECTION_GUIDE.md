# Hướng Dẫn Kiểm Tra Kết Nối Supabase

## 🎯 Tổng Quan

Hướng dẫn này sẽ giúp bạn kiểm tra xem dự án **Slide Show Nexus Admin** đã kết nối thành công với Supabase hay chưa.

## ✅ Các Cách Kiểm Tra Kết Nối

### 1. Kiểm tra Nhanh với Script Tự Động

**Chạy script kiểm tra:**
```bash
node test-supabase.mjs
```

**Kết quả mong đợi:**
- ✅ Biến môi trường đã được thiết lập
- ✅ Kết nối auth thành công  
- ✅ Supabase client đã được khởi tạo thành công

### 2. Kiểm tra Thông Qua Ứng Dụng Web

**Bước 1: Khởi động ứng dụng**
```bash
npm run dev
```

**Bước 2: Mở trình duyệt**
- Truy cập: `http://localhost:8081/`
- Nếu trang web tải thành công → Kết nối Supabase OK

**Bước 3: Kiểm tra Console**
- Mở Developer Tools (F12)
- Kiểm tra tab Console
- Không có lỗi Supabase → Kết nối thành công

### 3. Kiểm tra Cấu Hình Môi Trường

**Kiểm tra file .env:**
```bash
cat .env
```

**Cần có các biến sau:**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

### 4. Kiểm tra Trong Code

**File cấu hình chính:** `src/integrations/supabase/client.ts`

```typescript
// Kiểm tra client được khởi tạo đúng
import { supabase } from '@/integrations/supabase/client';

// Test kết nối
const testConnection = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Lỗi kết nối:', error);
  } else {
    console.log('Kết nối thành công!');
  }
};
```

## 🔍 Các Dấu Hiệu Kết Nối Thành Công

### ✅ Dấu hiệu tích cực:
- Ứng dụng khởi động không lỗi
- Trang web tải được
- Không có lỗi Supabase trong console
- Script test-supabase.mjs chạy thành công
- Có thể truy cập trang đăng nhập

### ❌ Dấu hiệu có vấn đề:
- Lỗi "Missing SUPABASE_URL" hoặc "Missing SUPABASE_PUBLISHABLE_KEY"
- Lỗi network khi tải trang
- Console hiển thị lỗi kết nối Supabase
- Không thể truy cập các tính năng auth

## 🛠️ Khắc Phục Sự Cố

### Vấn đề 1: Thiếu biến môi trường
```bash
# Tạo file .env từ template
cp .env.example .env

# Chỉnh sửa file .env với thông tin thực
nano .env
```

### Vấn đề 2: URL hoặc Key không đúng
- Kiểm tra lại thông tin từ Supabase Dashboard
- Đảm bảo URL có format: `https://xxx.supabase.co`
- Đảm bảo sử dụng **anon key**, không phải service key

### Vấn đề 3: Lỗi CORS
- Kiểm tra cấu hình CORS trong Supabase Dashboard
- Thêm `http://localhost:8081` vào allowed origins

### Vấn đề 4: Lỗi "infinite recursion detected in policy"
- Đây là lỗi RLS (Row Level Security) policy
- Không ảnh hưởng đến kết nối cơ bản
- Cần review lại database policies

## 📊 Kiểm Tra Chi Tiết

### Kiểm tra Database Tables
```javascript
// Trong browser console
const testTables = async () => {
  const tables = ['profiles', 'shopee_shops', 'comprehensive_reports'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('count').limit(1);
      console.log(`${table}:`, error ? 'Error' : 'OK');
    } catch (e) {
      console.log(`${table}: Error`);
    }
  }
};

testTables();
```

### Kiểm tra Authentication
```javascript
// Test auth functions
const testAuth = async () => {
  // Kiểm tra session hiện tại
  const { data: session } = await supabase.auth.getSession();
  console.log('Current session:', session);
  
  // Kiểm tra user hiện tại
  const { data: user } = await supabase.auth.getUser();
  console.log('Current user:', user);
};

testAuth();
```

## 🎯 Kết Luận

**Dự án đã kết nối thành công với Supabase nếu:**
1. ✅ Script `test-supabase.mjs` chạy thành công
2. ✅ Ứng dụng khởi động được (`npm run dev`)
3. ✅ Trang web tải được tại `http://localhost:8081/`
4. ✅ Không có lỗi Supabase trong console

**Các tính năng đã được cấu hình:**
- 🔐 Authentication system
- 📊 Database access với RLS
- ⚡ Edge Functions
- 🔄 Real-time subscriptions
- 📁 File storage (nếu được sử dụng)

---

**💡 Lưu ý:** Một số cảnh báo về RLS policies là bình thường và không ảnh hưởng đến chức năng cơ bản của ứng dụng.