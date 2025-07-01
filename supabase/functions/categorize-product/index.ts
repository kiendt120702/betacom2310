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

    // Fetch categories dynamically from the database
    const { data: categoryData, error: fetchError } = await supabase
      .from('product_categories')
      .select('name, category_id');

    if (fetchError) {
      console.error('Error fetching product categories:', fetchError);
      throw new Error('Could not load product categories from database.');
    }

    const categoryListString = categoryData.map(c => `- ${c.name} (ma_nganh_hang: ${c.category_id})`).join('\n');

    const prompt = `Bạn là một AI phân loại sản phẩm cho nền tảng thương mại điện tử Việt Nam. Nhiệm vụ của bạn là phân tích tên sản phẩm và trả về mã ngành hàng (\`ma_nganh_hang\`) chính xác nhất từ danh sách được cung cấp. Hãy tuân thủ nghiêm ngặt quy trình sau:

**QUY TRÌNH PHÂN TÍCH TÊN SẢN PHẨM**

**1. Làm sạch và chuẩn hóa tên sản phẩm:**
   - Loại bỏ các từ hoặc cụm từ không liên quan đến ngành hàng, chẳng hạn như:
     - Tên thương hiệu (ví dụ: "Little Lion", "HIBENA").
     - Tính từ mô tả (ví dụ: "bền đẹp", "giá rẻ", "chất lượng cao").
     - Mã sản phẩm hoặc số lượng (ví dụ: "Q06", "Thùng 30").
   - Ví dụ: "Thùng 30 Ô Tô Đồ Chơi Little Lion Xe Ô Tô Đồ Chơi Cho Bé Trai Ô tô Con Hợp Kim Chạy Đà Bền Đẹp Giá Rẻ" → "ô tô đồ chơi cho bé trai hợp kim chạy đà".

**2. Trích xuất từ khóa chính:**
   - Xác định các yếu tố cốt lõi trong tên sản phẩm đã làm sạch dựa trên:
     - Loại sản phẩm: Ví dụ: "ô tô", "quần", "áo", "kem".
     - Đối tượng sử dụng: Ví dụ: "nam", "nữ", "bé trai", "bé gái", "thú cưng".
     - Chất liệu hoặc tính năng: Ví dụ: "hợp kim", "chạy đà", "jogger".
   - Ví dụ: Từ "ô tô đồ chơi cho bé trai hợp kim chạy đà", trích xuất: "đồ chơi", "ô tô", "bé trai".

**3. So sánh với danh sách ngành hàng:**
   - Dựa vào từ khóa chính, so sánh với danh sách ngành hàng để tìm danh mục cụ thể nhất.
   - Ví dụ: Với từ khóa "đồ chơi", "ô tô", "bé trai", hãy tìm danh mục "Mẹ & Bé/Đồ chơi/Xe đồ chơi" thay vì chỉ "Mẹ & Bé".
   - Nếu không khớp chính xác, chọn danh mục gần nhất dựa trên từ khóa chính.

**4. Xác định mã ngành hàng:**
   - Sau khi chọn được ngành hàng, chỉ trả về mã ngành hàng (\`ma_nganh_hang\`) tương ứng.
   - Nếu không tìm thấy danh mục phù hợp, trả về chuỗi rỗng ("").

**VÍ DỤ THỰC TẾ:**

**Ví dụ 1:**
- **Tên sản phẩm:** "Thùng 30 Ô Tô Đồ Chơi Little Lion Xe Ô Tô Đồ Chơi Cho Bé Trai Ô tô Con Hợp Kim Chạy Đà Bền Đẹp Giá Rẻ"
- **Phân tích:** Từ khóa chính là "ô tô", "đồ chơi", "bé trai". So sánh với danh sách, "Mẹ & Bé/Đồ chơi/Xe đồ chơi" là phù hợp nhất.
- **Kết quả trả về:** 101010

**Ví dụ 2:**
- **Tên sản phẩm:** "Quần Gió Nhăn Cạp Chun HIBENA Quần Ống Rộng Nữ Thời Trang Có Dây Rút Gấu Có Thể Mặc Như Quần Jogger Q06"
- **Phân tích:** Từ khóa chính là "quần", "nữ", "jogger". So sánh với danh sách, "Thời Trang Nữ/Quần dài/Quần jogger" là phù hợp nhất.
- **Kết quả trả về:** 100239

---

**BẮT ĐẦU PHÂN TÍCH:**

**Danh sách ngành hàng (Tên ngành hàng (ma_nganh_hang)):**
${categoryListString}

**Tên sản phẩm:**
${productName}

**Đầu ra (CHỈ MÃ SỐ, KHÔNG GIẢI THÍCH):**`;

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