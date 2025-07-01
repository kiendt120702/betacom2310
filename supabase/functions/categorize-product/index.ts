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

    const categoryListString = categoryData.map(c => `- ${c.name} (mã: ${c.category_id})`).join('\n');

    const prompt = `Bạn là một AI phân loại sản phẩm chuyên nghiệp cho nền tảng thương mại điện tử Việt Nam. Nhiệm vụ của bạn là phân tích tên sản phẩm và trả về mã ngành hàng chính xác nhất từ danh sách được cung cấp.

**QUY TRÌNH PHÂN TÍCH 4 BƯỚC**

**BƯỚC 1: LÀM SẠCH TÊN SẢN PHẨM**
Loại bỏ các thành phần không liên quan:
- Tên thương hiệu: "Little Lion", "HIBENA", "Nike", "Adidas", "MANDO KOREA"
- Tính từ marketing: "bền đẹp", "giá rẻ", "chất lượng cao", "hot trend", "phong cách"
- Mã sản phẩm/số lượng: "Q06", "Thùng 30", "Set 5", "Combo 3", "SHT032"
- Từ ngữ marketing: "siêu sale", "freeship", "hàng loại 1", "oversized", "menswear"

**BƯỚC 2: XÁC ĐỊNH ĐỐI TƯỢNG SỬ DỤNG (QUAN TRỌNG NHẤT)**
Phân tích cẩn thận để xác định đối tượng:

**A. Sản phẩm dành cho TRẺ EM/TRẺ SƠ SINH:**
- Có từ khóa rõ ràng: "bé", "trẻ em", "baby", "kid", "cho bé trai", "cho bé gái"
- Kích thước nhỏ đặc biệt cho trẻ em
- Thiết kế an toàn cho trẻ em

**B. Sản phẩm dành cho NGƯỜI LỚN:**
- KHÔNG có từ khóa trẻ em
- Kích thước/thiết kế dành cho người lớn
- Phân biệt nam/nữ dựa trên từ khóa: "nam", "nữ", "men", "women", "menswear"

**BƯỚC 3: XÁC ĐỊNH LOẠI SẢN PHẨM CHÍNH XÁC**
**ĐẶC BIỆT CHÚ Ý CÁC LOẠI ÁO:**
- **"Áo Sơ Mi"** hoặc **"Sơ Mi"** → PHẢI chọn ngành "Áo sơ mi" KHÔNG PHẢI "Áo thun"
- **"Áo Thun"** hoặc **"T-shirt"** → chọn ngành "Áo thun"
- **"Áo Khoác"** → chọn ngành "Áo khoác"
- **"Áo Polo"** → chọn ngành "Áo polo"
- **QUY TẮC BẤT BIẾN: Nếu tên sản phẩm chứa "Áo Sơ Mi" hoặc "Sơ Mi", tuyệt đối KHÔNG được chọn ngành "Áo thun". Phải tìm ngành "Áo sơ mi".**

Trích xuất từ khóa chính:
- Loại sản phẩm: "sơ mi", "áo thun", "quần", "vòng tay", "ô tô"
- Đối tượng sử dụng: "nam", "nữ", "bé trai", "bé gái"
- Chất liệu: "đá", "obsidian", "hợp kim", "cotton", "kim loại"
- Tính năng: "chạy đà", "jogger", "wireless", "giấu cúc"

**BƯỚC 4: CHỌN NGÀNH HÀNG CHÍNH XÁC**
Nguyên tắc ưu tiên:
1. **ĐỐI TƯỢNG là yếu tố QUY ĐỊNH chính**
2. **LOẠI SẢN PHẨM phải khớp chính xác** (đặc biệt với áo sơ mi vs áo thun)
3. **Chọn ngành hàng CỤ THỂ NHẤT** (cấp 3) trước
4. **Nếu không có ngành cụ thể**, chọn cấp 2 hoặc cấp 1

**VÍ DỤ THỰC TẾ:**

**Ví dụ 1: "Áo Sơ Mi Metal-Shirt Giấu Cúc Tag Logo Kim Loại Oversized MANDO KOREA Phong Cách Hàn Quốc Menswear"**
- Bước 1: Làm sạch → "áo sơ mi giấu cúc tag logo kim loại"
- Bước 2: Đối tượng → NAM NGƯỜI LỚN (có từ "menswear")
- Bước 3: Loại sản phẩm → **"ÁO SƠ MI"** (từ khóa chính)
- Bước 4: Chọn ngành → "Thời Trang Nam/Áo/Áo sơ mi" (KHÔNG PHẢI áo thun)

**Ví dụ 2: "Vòng Tay Đá Hắc Diện Obsidian Mộc Gems"**
- Bước 1: Làm sạch → "vòng tay đá hắc diện obsidian"
- Bước 2: Đối tượng → NGƯỜI LỚN (không có từ "bé/trẻ em")
- Bước 3: Loại sản phẩm → "vòng tay", chất liệu "đá"
- Bước 4: Chọn ngành → "Phụ Kiện & Trang Sức Nữ/Vòng tay & Lắc tay" (người lớn)

**Ví dụ 3: "Quần Jogger Nữ HIBENA Ống Rộng"**
- Bước 1: Làm sạch → "quần jogger nữ ống rộng"
- Bước 2: Đối tượng → NỮ NGƯỜI LỚN
- Bước 3: Loại sản phẩm → "quần jogger"
- Bước 4: Chọn ngành → "Thời Trang Nữ/Quần dài/Quần jogger"

**Ví dụ 4: "Ô Tô Đồ Chơi Cho Bé Trai"**
- Bước 1: Làm sạch → "ô tô đồ chơi cho bé trai"
- Bước 2: Đối tượng → TRẺ EM (có từ "bé trai")
- Bước 3: Loại sản phẩm → "đồ chơi ô tô"
- Bước 4: Chọn ngành → "Thời trang trẻ em & trẻ sơ sinh/.../Đồ chơi"

**LƯU Ý QUAN TRỌNG:**
- **"Sơ mi" LUÔN LUÔN → ngành "Áo sơ mi", KHÔNG BAO GIỜ là "Áo thun"**
- Vòng tay/nhẫn/dây chuyền KHÔNG CÓ từ "bé/trẻ em" → dành cho NGƯỜI LỚN
- Chỉ chọn ngành "Thời trang trẻ em" khi có từ khóa rõ ràng về trẻ em
- Ưu tiên ngành cụ thể nhất có chứa từ khóa chính

**DANH SÁCH NGÀNH HÀNG:**
${categoryListString}

**TÊN SẢN PHẨM CẦN PHÂN LOẠI:**
${productName}

**YÊU CẦU:** Chỉ trả về MÃ SỐ ngành hàng phù hợp nhất. Nếu không tìm thấy, trả về chuỗi rỗng.`;

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