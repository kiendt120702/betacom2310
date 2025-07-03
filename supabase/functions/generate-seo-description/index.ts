import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    const { productName, productCode, categoryName } = await req.json();

    if (!productName) {
      throw new Error('productName is required');
    }

    const systemPrompt = `Bạn là một chuyên gia SEO và copywriter cho Shopee. Nhiệm vụ của bạn là viết một mô tả sản phẩm chi tiết, hấp dẫn và chuẩn SEO dựa trên thông tin được cung cấp.

**THÔNG TIN SẢN PHẨM:**
- **Tên sản phẩm:** ${productName}
- **Mã sản phẩm:** ${productCode || 'Chưa có'}
- **Ngành hàng:** ${categoryName || 'Chưa có'}

**YÊU CẦU BẮT BUỘC:**
1.  **Cấu trúc mô tả:** Tuân thủ nghiêm ngặt cấu trúc sau:
    *   Copy lại chính xác **Tên sản phẩm** ở dòng đầu tiên.
    *   **Mô tả chi tiết sản phẩm:** (Khoảng 2-3 đoạn văn) Giới thiệu về sản phẩm, nhấn mạnh vào lợi ích, công dụng, điểm nổi bật, chất liệu, thiết kế, và đối tượng sử dụng.
    *   **Thông số kỹ thuật:** (Dạng gạch đầu dòng) Liệt kê chi tiết các thông số như kích thước, trọng lượng, chất liệu, màu sắc, v.v.
    *   **Cam kết của shop:** (Dạng gạch đầu dòng) Nêu các cam kết về chất lượng, bảo hành, đổi trả.
    *   **Hashtag:** (Cuối cùng) 5-8 hashtag liên quan, không dấu, viết liền. Ví dụ: #quanjean #quanjeannam #quanbonam

2.  **Tối ưu SEO:**
    *   Lặp lại các từ khóa chính từ tên sản phẩm một cách tự nhiên trong phần mô tả (2-3 lần).
    *   Sử dụng các từ khóa phụ, từ khóa dài (long-tail keywords) liên quan.
    *   Độ dài toàn bộ mô tả khoảng 2000-2500 ký tự.

3.  **Nội dung:**
    *   Văn phong chuyên nghiệp, thuyết phục, khơi gợi nhu cầu mua hàng.
    *   Thông tin phải chính xác, trung thực.
    *   KHÔNG chứa thông tin liên lạc (SĐT, Zalo, website) hoặc kêu gọi giao dịch ngoài sàn.
    *   KHÔNG sử dụng emoji hoặc các ký tự đặc biệt không cần thiết.
    *   KHÔNG sử dụng markdown (**, ###).

**VÍ DỤ CẤU TRÚC:**

[Tên sản phẩm đầy đủ]

🌟 [Tên sản phẩm] là sự lựa chọn hoàn hảo cho [đối tượng khách hàng] đang tìm kiếm [lợi ích chính]. Với thiết kế [đặc điểm thiết kế] và chất liệu [chất liệu], sản phẩm không chỉ mang lại [lợi ích] mà còn [lợi ích khác].
[Đoạn văn mô tả thêm về công dụng, điểm khác biệt so với sản phẩm khác...]

📝 **THÔNG SỐ KỸ THUẬT:**
- Chất liệu:
- Màu sắc:
- Kích thước:
- Xuất xứ:

✅ **CAM KẾT CỦA SHOP:**
- Sản phẩm đúng như mô tả.
- Hỗ trợ đổi trả theo quy định của Shopee.
- Tư vấn nhiệt tình, chu đáo.

#hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5

**Bây giờ, hãy tạo mô tả sản phẩm cho thông tin đã cho.**`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: systemPrompt }],
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const responseData = await response.json();
    const rawContent = responseData.choices?.[0]?.message?.content || '';
    const seoDescription = cleanResponse(rawContent);

    return new Response(JSON.stringify({ seoDescription }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-seo-description function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});