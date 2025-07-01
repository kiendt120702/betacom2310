
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

    const prompt = `Bạn là một AI phân loại sản phẩm chuyên nghiệp cho nền tảng thương mại điện tử Việt Nam. Nhiệm vụ của bạn là phân tích tên sản phẩm và trả về mã ngành hàng (\`ma_nganh_hang\`) chính xác nhất từ danh sách được cung cấp.

**QUY TRÌNH PHÂN TÍCH TÊN SẢN PHẨM (4 BƯỚC)**

**BƯỚC 1: LÀM SẠCH VÀ CHUẨN HÓA TÊN SẢN PHẨM**
Loại bỏ các thành phần không liên quan đến ngành hàng:
- Tên thương hiệu: "Little Lion", "HIBENA", "Nike", "Adidas"
- Tính từ mô tả chung: "bền đẹp", "giá rẻ", "chất lượng cao", "hot trend"
- Mã sản phẩm/số lượng: "Q06", "Thùng 30", "Set 5", "Combo 3"
- Từ ngữ marketing: "siêu sale", "freeship", "hàng loại 1"

**VÍ DỤ LÀM SẠCH:**
- "Thùng 30 Ô Tô Đồ Chơi Little Lion Xe Ô Tô Đồ Chơi Cho Bé Trai Ô tô Con Hợp Kim Chạy Đà Bền Đẹp Giá Rẻ" 
→ "ô tô đồ chơi cho bé trai hợp kim chạy đà"

- "Vòng Tay Đá Hắc Diện Obsidian Móc Gems Giúp Bảo Vệ Tâm Trí Và Chú Số Hữu"
→ "vòng tay đá hắc diện obsidian"

**BƯỚC 2: TRÍCH XUẤT TỪ KHÓA CHÍNH**
Xác định các yếu tố cốt lõi theo thứ tự ưu tiên:

1. **Loại sản phẩm chính** (quan trọng nhất): "vòng tay", "quần", "áo", "ô tô", "kem"
2. **Đối tượng sử dụng**: "nam", "nữ", "bé trai", "bé gái", "trẻ em"
3. **Chất liệu/đặc điểm**: "đá hắc diện", "obsidian", "hợp kim", "jogger"
4. **Chức năng/mục đích**: "đồ chơi", "trang điểm", "bảo vệ"

**VÍ DỤ TRÍCH XUẤT:**
- Từ "vòng tay đá hắc diện obsidian": 
  + Loại sản phẩm: "vòng tay"
  + Chất liệu: "đá hắc diện", "obsidian"
  + Đối tượng: không rõ ràng → có thể nam/nữ

**BƯỚC 3: SO SÁNH VỚI DANH SÁCH NGÀNH HÀNG**
Ngành hàng có cấu trúc 3 cấp: **Cấp 1/Cấp 2/Cấp 3**

**Nguyên tắc chọn ngành hàng:**
1. **Ưu tiên ngành hàng cụ thể nhất** (cấp 3) trước
2. **Khớp với loại sản phẩm chính** là yếu tố quyết định
3. **Xem xét đối tượng sử dụng** để phân biệt nam/nữ
4. **Chất liệu/đặc điểm** chỉ là yếu tố bổ trợ

**VÍ DỤ PHÂN TÍCH:**
- Với "vòng tay đá hắc diện obsidian":
  + Loại sản phẩm: "vòng tay" → tìm các ngành có "vòng tay"
  + Kiểm tra: "Phụ Kiện & Trang Sức Nữ/Vòng tay & Lắc tay"
  + Xác nhận: Đây là ngành phù hợp nhất cho vòng tay

**BƯỚC 4: XÁC ĐỊNH MÃ NGÀNH HÀNG**
- Sau khi chọn được ngành hàng chính xác, trả về mã ngành hàng tương ứng
- **CHỈ TRẢ VỀ MÃ SỐ, KHÔNG GIẢI THÍCH**
- Nếu không tìm thấy ngành phù hợp, trả về chuỗi rỗng ("")

**VÍ DỤ HOÀN CHỈNH:**

**Ví dụ 1:**
- **Tên gốc:** "Vòng Tay Đá Hắc Diện Obsidian Móc Gems Giúp Bảo Vệ Tâm Trí Và Chú Số Hữu"
- **Làm sạch:** "vòng tay đá hắc diện obsidian"
- **Từ khóa:** "vòng tay" (chính), "đá hắc diện", "obsidian"
- **Ngành hàng:** "Phụ Kiện & Trang Sức Nữ/Vòng tay & Lắc tay"
- **Kết quả:** Mã tương ứng

**Ví dụ 2:**
- **Tên gốc:** "Thùng 30 Ô Tô Đồ Chơi Little Lion Xe Ô Tô Đồ Chơi Cho Bé Trai"
- **Làm sạch:** "ô tô đồ chơi cho bé trai"
- **Từ khóa:** "đồ chơi" (chính), "ô tô", "bé trai"
- **Ngành hàng:** "Mẹ & Bé/Đồ chơi/Xe đồ chơi"
- **Kết quả:** Mã tương ứng

**Ví dụ 3:**
- **Tên gốc:** "Quần Gió Nhăn Cạp Chun HIBENA Quần Ống Rộng Nữ Thời Trang Có Dây Rút Gấu Có Thể Mặc Như Quần Jogger Q06"
- **Làm sạch:** "quần gió nhăn ống rộng nữ jogger"
- **Từ khóa:** "quần" (chính), "nữ", "jogger"
- **Ngành hàng:** "Thời Trang Nữ/Quần dài/Quần jogger"
- **Kết quả:** Mã tương ứng

---

**DANH SÁCH NGÀNH HÀNG HIỆN TẠI:**
${categoryListString}

**TÊN SẢN PHẨM CẦN PHÂN LOẠI:**
${productName}

**KẾT QUẢ (CHỈ MÃ SỐ):**`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 50,
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

    console.log('Product name:', productName);
    console.log('AI response:', rawContent);
    console.log('Extracted category ID:', categoryId);
    console.log('Is valid ID:', isValidId);

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
