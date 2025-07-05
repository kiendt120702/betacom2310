import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to strip markdown and quotes
const cleanResponse = (text: string) => {
  return text.replace(/["`]/g, '').trim();
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { productInfo } = await req.json();

    if (!productInfo) {
      throw new Error('productInfo is required');
    }

    const systemPrompt = `Bạn là một chuyên gia SEO Shopee, chuyên tạo tên sản phẩm chuẩn SEO.
NGUYÊN TẮC:
1. Chỉ trả về TÊN SẢN PHẨM, không có lời giải thích hay định dạng markdown.
2. Phân tích thông tin sản phẩm được cung cấp.
3. Áp dụng cấu trúc: [Loại sản phẩm] + [Đặc điểm nổi bật] + (Thương hiệu/Model, Chất liệu, Màu sắc, Đối tượng dùng, Kích thước).
4. Độ dài lý tưởng: 80-100 ký tự.
5. Sử dụng các từ khóa quan trọng nhất.

THÔNG TIN SẢN PHẨM:
${productInfo}

YÊU CẦU:
Chỉ trả về duy nhất một tên sản phẩm chuẩn SEO.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: systemPrompt }],
        temperature: 0.7,
        max_tokens: 150, // A product title won't be very long
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const responseData = await response.json();
    const rawContent = responseData.choices?.[0]?.message?.content || '';
    const seoTitle = cleanResponse(rawContent);

    return new Response(JSON.stringify({ seoTitle }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-seo-title function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});