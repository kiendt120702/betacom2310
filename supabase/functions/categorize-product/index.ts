import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration is missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { productName } = await req.json();

    if (!productName) {
      throw new Error('productName is required');
    }

    // Clean the product name before sending to AI
    const cleanedProductName = productName.replace(/\[.*?\]|\(.*\)/g, '').trim();

    // Fetch categories dynamically from the database
    const { data: categoryData, error: fetchError } = await supabase
      .from('product_categories')
      .select('name, category_id');

    if (fetchError) {
      console.error('Error fetching product categories:', fetchError);
      throw new Error('Could not load product categories from database.');
    }

    const categoryListString = categoryData.map(c => `- ${c.name} (ma_nganh_hang: ${c.category_id})`).join('\n');

    const prompt = `Bạn là một AI phân loại sản phẩm cho nền tảng thương mại điện tử Việt Nam. Nhiệm vụ duy nhất của bạn là phân tích tên sản phẩm và trả về mã ngành hàng (\`ma_nganh_hang\`) chính xác nhất từ danh sách ngành hàng trong Quản lý ngành hàng.

**HƯỚNG DẪN QUAN TRỌNG:**
1. **Phân tích tên sản phẩm**: 
   - **Tập trung vào các từ khóa ở đầu tên sản phẩm.**
   - **Bỏ qua hoàn toàn các thông tin trong dấu ngoặc vuông \`[]\` hoặc ngoặc tròn \`()\`**, vì đây là thông tin khuyến mãi, không phải đặc tính sản phẩm.
   - Trích xuất các từ khóa chính liên quan đến loại sản phẩm, đối tượng sử dụng, và chức năng.
   - Bỏ qua các từ không liên quan như tên thương hiệu, tính từ mô tả, hoặc mã sản phẩm.
2. **So sánh với Quản lý ngành hàng**: 
   - So sánh từ khóa trích xuất với danh sách ngành hàng để tìm danh mục cụ thể nhất.
   - Ưu tiên danh mục có cấp độ sâu nhất (ví dụ: "A/B/C" tốt hơn "A/B").
3. **Định dạng đầu ra**: 
   - Chỉ trả về **mã ngành hàng (\`ma_nganh_hang\`)** dưới dạng số.
   - Nếu không tìm thấy, trả về chuỗi rỗng ("").
4. **Kiểm tra tính hợp lệ**: 
   - Đảm bảo mã ngành hàng trả về có trong danh sách.

**QUY TRÌNH SUY LUẬN MẪU:**
- **Tên sản phẩm:** "[LOẠI 1] Quần Gió Nhăn Cạp Chun HIBENA Quần Ống Rộng Nữ Thời Trang Có Dây Rút Gấu Có Thể Mặc Như Quần Jogger Q06"
- **Bước 1: Làm sạch tên:** "Quần Gió Nhăn Cạp Chun Quần Ống Rộng Nữ Thời Trang Có Dây Rút Gấu Có Thể Mặc Như Quần Jogger"
- **Bước 2: Trích xuất từ khóa chính:** "Quần", "Nữ", "Quần Gió", "Quần Ống Rộng", "Quần Jogger".
- **Bước 3: Phân tích phân cấp:**
    - Từ khóa "Nữ" -> Hướng đến ngành hàng "Thời Trang Nữ".
    - Từ khóa "Quần" -> Hướng đến cấp 2 là "Quần".
    - Từ khóa "Quần Gió", "Quần Ống Rộng" -> Hướng đến cấp 3 là "Quần dài".
- **Bước 4: Kết hợp và tìm kiếm:** Tìm trong danh sách ngành hàng mục "Thời Trang Nữ/Quần/Quần dài".
- **Bước 5: Trả về mã ngành hàng** tương ứng.

**Danh sách ngành hàng (Tên ngành hàng (ma_nganh_hang)):**
${categoryListString}

**Tên sản phẩm:**
${cleanedProductName}

**Đầu ra (CHỈ MÃ SỐ):**`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
        max_tokens: 15,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const responseData = await response.json();
    const rawContent = responseData.choices?.[0]?.message?.content || '';

    // Regex to find any sequence of digits in the response
    const match = rawContent.match(/\b(\d+)\b/);
    const categoryId = match ? match[1] : '';

    const isValidId = categoryData.some(c => c.category_id === categoryId);

    return new Response(JSON.stringify({ categoryId: isValidId ? categoryId : '' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in categorize-product function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});