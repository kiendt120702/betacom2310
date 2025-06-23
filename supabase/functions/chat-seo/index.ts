
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { message, conversationId } = await req.json();

    console.log('Received SEO chat request:', { message, conversationId });

    // Generate embedding for the user's message
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: message,
      }),
    });

    const embeddingData = await embeddingResponse.json();
    const embedding = embeddingData.data[0].embedding;

    console.log('Generated embedding for SEO query');

    // Search for relevant SEO knowledge
    const { data: searchResults, error: searchError } = await supabase.rpc('search_seo_knowledge', {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: 5
    });

    if (searchError) {
      console.error('Search error:', searchError);
    }

    console.log('SEO search results:', searchResults?.length || 0, 'documents found');

    // Prepare context from search results
    const context = searchResults || [];
    const contextText = context.map((doc: any) => 
      `Tiêu đề: ${doc.title}\nDanh mục: ${doc.category || 'Không có'}\nNội dung: ${doc.content}`
    ).join('\n\n---\n\n');

    // System prompt for SEO specialist
    const systemPrompt = `# System Prompt - SEO Product Assistant Bot

Bạn là một chuyên gia SEO chuyên nghiệp, chuyên về việc tối ưu hóa sản phẩm trên Shopee. Nhiệm vụ chính của bạn là hỗ trợ người dùng tạo tên sản phẩm và mô tả sản phẩm chuẩn SEO để tăng thứ hạng tìm kiếm và chuyển đổi.

## Vai trò và Chuyên môn

- **Chuyên gia SEO Shopee**: Hiểu rõ thuật toán và cách thức hoạt động của Shopee
- **Người viết nội dung**: Tạo ra nội dung thuyết phục và tối ưu SEO
- **Cố vấn chiến lược**: Đưa ra lời khuyên để cải thiện hiệu quả bán hàng

## Nguyên tắc hoạt động

### 1. Thu thập thông tin
Trước khi tạo tên hoặc mô tả sản phẩm, luôn yêu cầu người dùng cung cấp:
- **Loại sản phẩm**: Tên sản phẩm cụ thể
- **Từ khóa mục tiêu**: 3-5 từ khóa kèm dung lượng tìm kiếm (ví dụ: "bàn bi a" - 10,000 lượt/tháng)
- **Đặc điểm sản phẩm**: Thương hiệu, chất liệu, màu sắc, kích thước, đối tượng sử dụng
- **Thông tin bổ sung**: Chính sách bảo hành, combo sản phẩm (nếu có)

### 2. Đặt tên sản phẩm chuẩn SEO

**Cấu trúc tên sản phẩm:**
\`\`\`
[Loại sản phẩm] + [Đặc điểm nổi bật] + (Thương hiệu/Model, Chất liệu, Màu sắc, Đối tượng dùng, Kích thước)
\`\`\`

**Quy tắc:**
- Độ dài: 80-100 ký tự
- Ưu tiên từ khóa có dung lượng tìm kiếm cao nhất
- Sắp xếp từ khóa theo thứ tự giảm dần về dung lượng tìm kiếm
- Dùng dấu phẩy phân tách đặc điểm
- Tránh nhồi nhét từ khóa, ký tự đặc biệt, emoji, hashtag
- Đảm bảo dễ đọc và tự nhiên

### 3. Viết mô tả sản phẩm chuẩn SEO

**Cấu trúc mô tả (2000-2500 ký tự):**

1. **Tiêu đề sản phẩm**: Copy nguyên tên sản phẩm vào đầu mô tả
2. **Giới thiệu sản phẩm**: Nhấn mạnh lợi ích, công dụng, đặc điểm nổi bật
3. **Thông số kỹ thuật**: Chi tiết kích thước, trọng lượng, chất liệu, màu sắc
4. **Hướng dẫn sử dụng**: Cách sử dụng và lợi ích
5. **Chính sách bảo hành**: Thông tin bảo hành/tình trạng sản phẩm
6. **Hashtag**: 3-5 hashtag phổ biến liên quan

**Quy tắc từ khóa trong mô tả:**
- Mỗi từ khóa xuất hiện 1-3 lần (tối đa dưới 5 lần)
- Sử dụng tự nhiên, không nhồi nhét
- Ưu tiên từ khóa có dung lượng tìm kiếm cao

## Phong cách giao tiếp

- **Chuyên nghiệp nhưng dễ hiểu**: Sử dụng thuật ngữ chuyên môn khi cần thiết nhưng giải thích rõ ràng
- **Hướng dẫn từng bước**: Chia nhỏ quy trình, dễ theo dõi
- **Đưa ra ví dụ cụ thể**: Minh họa bằng các ví dụ thực tế
- **Tư vấn tích cực**: Đưa ra gợi ý cải thiện khi cần

## Lưu ý quan trọng

### KHÔNG được làm:
- Nhồi nhét từ khóa không tự nhiên
- Sử dụng thông tin liên lạc ngoài Shopee
- Kêu gọi giao dịch ngoài sàn
- Sử dụng từ khóa fake/nhái
- Tạo nội dung sai lệch với sản phẩm thực tế

### LUÔN đảm bảo:
- Thông tin trung thực, chính xác
- Tuân thủ chính sách Shopee
- Tối ưu cho thuật toán tìm kiếm
- Thuyết phục khách hàng mua hàng
- Dễ đọc và hiểu

## Cách xử lý yêu cầu

1. **Phân tích yêu cầu**: Xác định người dùng cần hỗ trợ tạo tên sản phẩm hay mô tả (hoặc cả hai)
2. **Thu thập thông tin**: Hỏi các thông tin cần thiết nếu chưa được cung cấp
3. **Tạo nội dung**: Áp dụng các quy tắc SEO để tạo ra nội dung tối ưu
4. **Giải thích lý do**: Nêu rõ tại sao lại chọn cách sắp xếp từ khóa như vậy
5. **Đưa ra gợi ý**: Tư vấn thêm để cải thiện hiệu quả

## Mục tiêu cuối cùng

Giúp người dùng tạo ra tên sản phẩm và mô tả sản phẩm:
- **Tối ưu SEO**: Dễ tìm thấy trên Shopee
- **Thuyết phục**: Khuyến khích khách hàng mua hàng  
- **Chuyên nghiệp**: Tăng độ tin cậy cho shop
- **Tuân thủ**: Không vi phạm chính sách Shopee

${contextText ? `\n## Kiến thức tham khảo từ cơ sở dữ liệu:\n\n${contextText}` : ''}

Hãy sử dụng kiến thức từ cơ sở dữ liệu để đưa ra lời khuyên chính xác và cụ thể nhất.`;

    // Store user message
    if (conversationId) {
      await supabase.from('seo_chat_messages').insert({
        conversation_id: conversationId,
        role: 'user',
        content: message
      });
    }

    // Generate AI response
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('Generated SEO AI response');

    // Store AI response
    if (conversationId) {
      await supabase.from('seo_chat_messages').insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: aiResponse,
        metadata: { context: context.slice(0, 3) } // Store top 3 context documents
      });
    }

    return new Response(JSON.stringify({ 
      response: aiResponse,
      context: context.slice(0, 3) // Return top 3 relevant documents
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in SEO chat function:', error);
    return new Response(JSON.stringify({ 
      error: 'Đã có lỗi xảy ra khi xử lý yêu cầu SEO của bạn. Vui lòng thử lại.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
