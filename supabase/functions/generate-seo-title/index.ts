
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { keyword, productInfo, brand = '' } = await req.json()

    if (!keyword || !productInfo) {
      return new Response(
        JSON.stringify({ error: 'Thiếu từ khóa hoặc thông tin sản phẩm' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key không được cấu hình' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Tạo prompt cho việc sinh tên sản phẩm SEO
    const systemPrompt = `Bạn là chuyên gia SEO cho sàn thương mại điện tử Shopee. Nhiệm vụ của bạn là tạo ra các tên sản phẩm tối ưu SEO.

Quy tắc tạo tên sản phẩm SEO Shopee:
1. Độ dài: 120-150 ký tự (tối đa 150)
2. Bắt đầu bằng từ khóa chính
3. Bao gồm các thông tin quan trọng: thương hiệu, đặc điểm nổi bật, ưu đái
4. Sử dụng từ khóa phụ liên quan
5. Thêm call-to-action như "Giá rẻ", "Chất lượng cao", "Freeship"
6. Tránh lặp từ khóa quá nhiều
7. Viết hoa chữ cái đầu mỗi từ quan trọng
8. Sử dụng dấu phẩy, gạch ngang để phân cách

Hãy tạo 3 tên sản phẩm khác nhau, mỗi tên tập trung vào một góc độ khác nhau:
- Tên 1: Tập trung vào từ khóa chính và tính năng
- Tên 2: Tập trung vào giá trị và ưu đãi  
- Tên 3: Tập trung vào chất lượng và thương hiệu`

    const userPrompt = `Từ khóa chính: ${keyword}
Thông tin sản phẩm: ${productInfo}
${brand ? `Thương hiệu: ${brand}` : ''}

Hãy tạo 3 tên sản phẩm SEO theo quy tắc đã nêu.`

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
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('OpenAI API error:', error)
      return new Response(
        JSON.stringify({ error: 'Lỗi khi gọi OpenAI API' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await response.json()
    const aiResponse = data.choices[0]?.message?.content

    if (!aiResponse) {
      return new Response(
        JSON.stringify({ error: 'Không nhận được phản hồi từ AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse response để trích xuất 3 tên sản phẩm
    const lines = aiResponse.split('\n').filter(line => line.trim())
    const titles = []
    
    for (const line of lines) {
      // Tìm các dòng có định dạng "Tên 1:", "1.", hoặc "-"
      if (line.match(/^(Tên\s*\d+|Tiêu đề\s*\d+|\d+\.|-)/) || 
          (line.length > 50 && line.length <= 150 && !line.includes(':'))) {
        let title = line.replace(/^(Tên\s*\d+[:\.]|Tiêu đề\s*\d+[:\.]|\d+\.|-)/, '').trim()
        if (title && title.length >= 50 && title.length <= 150) {
          titles.push(title)
        }
      }
    }

    // Nếu không parse được, thử cách khác
    if (titles.length === 0) {
      const sentences = aiResponse.split(/[.\n]/).filter(s => s.trim().length > 50)
      for (let i = 0; i < Math.min(3, sentences.length); i++) {
        const title = sentences[i].trim()
        if (title.length <= 150) {
          titles.push(title)
        }
      }
    }

    // Đảm bảo có ít nhất 1 title
    if (titles.length === 0) {
      titles.push(aiResponse.substring(0, 150).trim())
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
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Lỗi server nội bộ' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
