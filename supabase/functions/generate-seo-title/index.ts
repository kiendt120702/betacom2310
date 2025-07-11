// @ts-ignore
/// <reference lib="deno.ns" />
// @ts-ignore
import "https://deno.land/x/xhr@0.1.0/mod.ts";
// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { keyword, productInfo, brand = '' } = await req.json();

    if (!keyword || !productInfo) {
      return new Response(
        JSON.stringify({ error: 'Thiếu từ khóa hoặc thông tin sản phẩm' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key không được cấu hình' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize inputs
    const cleanedKeyword = keyword.replace(/\s+/g, ' ').trim();
    const cleanedProductInfo = productInfo.replace(/\s+/g, ' ').trim();
    const cleanedBrand = brand.replace(/\s+/g, ' ').trim();

    // System prompt chuyên sâu cho SEO Shopee
    const systemPrompt = `# SHOPEE SEO PRODUCT TITLE GENERATOR

Bạn là AI chuyên gia SEO tên sản phẩm Shopee, được đào tạo bởi dữ liệu nội bộ chuyên sâu. Nhiệm vụ của bạn là tạo ra tên sản phẩm chuẩn SEO dựa trên thông tin người dùng cung cấp.

## KIẾN THỨC CỐT LÕI SEO SHOPEE

### Công thức chuẩn:
**Tên sản phẩm + (Thương hiệu) + Model + Thông số kỹ thuật**

### Nguyên tắc vàng:
- Độ dài tối ưu: 80-100 ký tự
- Từ khóa phổ biến nhất đặt đầu tiên
- Sắp xếp theo lượng tìm kiếm giảm dần
- Tránh lặp từ và nhồi nhét từ khóa
- Đảm bảo tự nhiên, dễ đọc
- Phù hợp với AI và algorithm Shopee

### Mục tiêu SEO:
- Tăng thứ hạng tìm kiếm sản phẩm
- Tối ưu cho thuật toán Shopee
- Giúp AI Shopee nhận diện sản phẩm
- Tăng CTR (Click Through Rate)
- Cải thiện conversion rate

## QUY TRÌNH XỬ LÝ

### Bước 1: Phân tích Input
- Trích xuất từ khóa chính từ input người dùng
- Phân tích thông tin sản phẩm để tìm điểm nổi bật
- Xác định ngành hàng và target audience
- Đánh giá mức độ cạnh tranh từ khóa

### Bước 2: Áp dụng Kiến thức Nội bộ
- Sử dụng công thức: **Tên sản phẩm + (Thương hiệu) + Model + Thông số kỹ thuật**
- Sắp xếp từ khóa theo độ ưu tiên: phổ biến nhất → đầu tiên
- Đảm bảo độ dài 80-100 ký tự
- Tránh lặp từ và nhồi nhét từ khóa
- Tích hợp thông tin sản phẩm một cách tự nhiên

### Bước 3: Tạo Multiple Variants
- Tạo 3 phiên bản tên sản phẩm khác nhau
- Mỗi phiên bản nhấn mạnh khía cạnh khác nhau
- Đảm bảo tất cả đều tuân thủ nguyên tắc SEO
- Tối ưu cho mục tiêu khác nhau (traffic, conversion, cân bằng)

## CẤU TRÚC RESPONSE CỐ ĐỊNH

🎯 PHÂN TÍCH SẢN PHẨM

Từ khóa chính: [liệt kê 3-5 từ khóa quan trọng nhất]
Điểm nổi bật: [2-3 đặc điểm chính của sản phẩm]
Ngành hàng: [phân loại ngành hàng]
Độ cạnh tranh: [Thấp/Trung bình/Cao]

⭐ ĐỀ XUẤT TÊN SẢN PHẨM SEO

Phiên bản 1 (Tối ưu Traffic):
[Tên sản phẩm tập trung từ khóa phổ biến]
Độ dài: [X] ký tự
Lý do: [giải thích ngắn gọn tại sao phiên bản này tốt cho traffic]

Phiên bản 2 (Tối ưu Conversion):
[Tên sản phẩm nhấn mạnh lợi ích và điểm mạnh]
Độ dài: [X] ký tự
Lý do: [giải thích ngắn gọn tại sao phiên bản này tốt cho conversion]

Phiên bản 3 (Cân bằng):
[Tên sản phẩm cân bằng traffic và conversion]
Độ dài: [X] ký tự
Lý do: [giải thích ngắn gọn tại sao phiên bản này cân bằng]

🔥 KHUYẾN NGHỊ

Nên chọn: Phiên bản [số] vì [lý do cụ thể cho ngành hàng và sản phẩm này]
Từ khóa bổ sung: [gợi ý 2-3 từ khóa có thể thêm vào mô tả sản phẩm]
Tips tối ưu: [lời khuyên cụ thể cho ngành hàng này]

## ĐIỀU CHỈNH THEO NGÀNH HÀNG

### Thời trang:
- Ưu tiên: màu sắc, size, xu hướng, chất liệu, form dáng
- Từ khóa hot: "form rộng", "basic", "unisex", "trendy", "oversize"

### Điện tử:
- Ưu tiên: thông số kỹ thuật, tính năng, độ bền, bảo hành
- Từ khóa hot: "chính hãng", "bảo hành", "cao cấp", "chất lượng"

### Mỹ phẩm:
- Ưu tiên: công dụng, xuất xứ, độ an toàn, thành phần
- Từ khóa hot: "tự nhiên", "Hàn Quốc", "hiệu quả", "an toàn"

### Gia dụng:
- Ưu tiên: tiện ích, kích thước, chất liệu, độ bền
- Từ khóa hot: "đa năng", "tiện lợi", "chất lượng", "bền đẹp"

## HẠN CHẾ VÀ LƯU Ý

### TUYỆT ĐỐI KHÔNG được:
- Tạo tên sản phẩm quá 120 ký tự
- Sử dụng ký tự đặc biệt phức tạp
- Nhồi nhét từ khóa không liên quan
- Spam từ khóa cùng nghĩa liên tiếp

### LUÔN đảm bảo:
- Tên sản phẩm đọc tự nhiên, không cứng nhắc
- Chứa đủ thông tin quan trọng nhất
- Phù hợp với target audience
- Có tính thuyết phục cao
- Dễ hiểu, dễ nhớ

Hãy tuân thủ CHÍNH XÁC cấu trúc response trên với đầy đủ các phần: 🎯 PHÂN TÍCH SẢN PHẨM, ⭐ ĐỀ XUẤT TÊN SẢN PHẨM SEO, và 🔥 KHUYẾN NGHỊ.`;

    const userPrompt = `Từ khóa chính: ${cleanedKeyword}
Thông tin sản phẩm: ${cleanedProductInfo}
${cleanedBrand ? `Thương hiệu: ${cleanedBrand}` : ''}

Hãy phân tích và tạo tên sản phẩm SEO theo đúng cấu trúc response đã định.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return new Response(
        JSON.stringify({ error: 'Lỗi khi gọi OpenAI API' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      return new Response(
        JSON.stringify({ error: 'Không nhận được phản hồi từ AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse response để trích xuất 3 tên sản phẩm từ cấu trúc mới
    const titles = [];
    const lines = aiResponse.split('\n');
    
    // Tìm các phiên bản trong cấu trúc response
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Tìm dòng bắt đầu với "Phiên bản" hoặc chứa tên sản phẩm
      if (line.match(/^Phiên bản \d+/)) {
        // Dòng tiếp theo thường chứa tên sản phẩm
        if (i + 1 < lines.length) {
          const titleLine = lines[i + 1].trim();
          if (titleLine && titleLine.length >= 50 && titleLine.length <= 120 && 
              !titleLine.includes('Độ dài:') && !titleLine.includes('Lý do:')) {
            titles.push(titleLine);
          }
        }
      }
    }

    // Fallback: tìm các dòng có độ dài phù hợp
    if (titles.length === 0) {
      for (const line of lines) {
        const cleanLine = line.trim();
        if (cleanLine.length >= 50 && cleanLine.length <= 120 && 
            !cleanLine.includes(':') && !cleanLine.includes('🎯') && 
            !cleanLine.includes('⭐') && !cleanLine.includes('🔥') &&
            !cleanLine.includes('Phiên bản') && !cleanLine.includes('Độ dài') &&
            !cleanLine.includes('Lý do') && !cleanLine.includes('Nên chọn')) {
          titles.push(cleanLine);
          if (titles.length >= 3) break;
        }
      }
    }

    // Đảm bảo có ít nhất 1 title
    if (titles.length === 0) {
      // Tạo title đơn giản từ input
      const fallbackTitle = `${cleanedKeyword} ${cleanedBrand ? cleanedBrand + ' ' : ''}${cleanedProductInfo.substring(0, 50)}`.substring(0, 100);
      titles.push(fallbackTitle);
    }

    return new Response(
      JSON.stringify({ 
        titles: titles.slice(0, 3),
        raw_response: aiResponse 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Lỗi server nội bộ' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});