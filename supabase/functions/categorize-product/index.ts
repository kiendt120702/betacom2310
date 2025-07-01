import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
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
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
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

    const prompt = `Bạn là một AI chuyên gia phân loại sản phẩm. Nhiệm vụ của bạn là đọc tên sản phẩm và chọn ra mã ngành hàng chính xác nhất từ danh sách được cung cấp.

**DANH SÁCH NGÀNH HÀNG:**
${categoryListString}

**TÊN SẢN PHẨM:**
${productName}

**QUY TẮC:**
1.  Phân tích kỹ tên sản phẩm để hiểu rõ loại sản phẩm (ví dụ: "áo sơ mi", "quần jean") và đối tượng (ví dụ: "nam", "nữ", "bé trai").
2.  Chọn mã ngành hàng cụ thể và phù hợp nhất từ danh sách. Ví dụ, với "Áo Sơ Mi Nam", hãy chọn ngành có mã tương ứng với "Thời Trang Nam > Áo sơ mi" thay vì chỉ "Thời Trang Nam".
3.  Chỉ trả về MÃ SỐ của ngành hàng đó. Không thêm bất kỳ văn bản, giải thích, hay ký tự nào khác. Chỉ trả về con số.

**MÃ NGÀNH HÀNG:**`;

    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

    const response = await fetch(geminiApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 50,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const responseData = await response.json();
    const rawContent = responseData.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Regex to find any sequence of digits in the response
    const match = rawContent.match(/\b(\d+)\b/);
    const categoryId = match ? match[1] : '';

    const isValidId = categoryData.some(c => c.category_id === categoryId);

    console.log('Product name:', productName);
    console.log('Gemini response:', rawContent);
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