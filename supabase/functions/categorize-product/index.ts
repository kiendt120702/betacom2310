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

    const prompt = `Bạn là một AI phân loại sản phẩm cho nền tảng thương mại điện tử Việt Nam. Nhiệm vụ duy nhất của bạn là phân tích tên sản phẩm và trả về mã ngành hàng (\`ma_nganh_hang\`) chính xác nhất từ danh sách ngành hàng trong Quản lý ngành hàng.

**HƯỚNG DẪN QUAN TRỌNG:**
1. **Phân tích tên sản phẩm**: 
   - Trích xuất các từ khóa chính liên quan đến loại sản phẩm (ví dụ: quần, áo, đồ chơi, ô tô), đối tượng sử dụng (nam, nữ, bé trai, bé gái, thú cưng), và chức năng (ví dụ: jogger, chạy đà, hợp kim).
   - Bỏ qua các từ không liên quan như tên thương hiệu (ví dụ: Little Lion, HIBENA), tính từ mô tả (bền, đẹp, giá rẻ), hoặc mã sản phẩm (Q06), trừ khi chúng xác định rõ ngành hàng.
2. **So sánh với Quản lý ngành hàng**: 
   - So sánh từ khóa trích xuất với danh sách ngành hàng để tìm danh mục cụ thể nhất. Ví dụ: với "Thùng 30 Ô Tô Đồ Chơi Little Lion Xe Ô Tô Đồ Chơi Cho Bé Trai", chọn "Mẹ & Bé/Đồ chơi/Xe đồ chơi" thay vì "Mẹ & Bé".
   - Nếu không tìm thấy danh mục chính xác, chọn danh mục gần nhất dựa trên từ khóa chính.
3. **Định dạng đầu ra**: 
   - Chỉ trả về **mã ngành hàng (\`ma_nganh_hang\`)** dưới dạng số, không bao gồm tên ngành hàng, lời giải thích, hoặc bất kỳ văn bản nào khác.
   - Nếu không tìm thấy danh mục phù hợp, trả về chuỗi rỗng ("").
4. **Kiểm tra tính hợp lệ**: 
   - Đảm bảo mã ngành hàng trả về có trong danh sách ngành hàng cung cấp.

**Danh sách ngành hàng (Tên ngành hàng (ma_nganh_hang)):**
${categoryListString}

**Tên sản phẩm:**
${productName}

**Đầu ra (CHỈ MÃ SỐ):**`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
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