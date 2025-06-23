
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

    let searchResults = [];
    let hasEmbedding = false;

    // Try to generate embedding and search with vector similarity if OpenAI key is available
    if (openAIApiKey) {
      try {
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

        if (embeddingResponse.ok) {
          const embeddingData = await embeddingResponse.json();
          const embedding = embeddingData.data[0].embedding;
          hasEmbedding = true;

          console.log('Generated embedding for SEO query');

          // Search for relevant SEO knowledge using vector similarity
          const { data: vectorResults, error: searchError } = await supabase.rpc('search_seo_knowledge', {
            query_embedding: embedding,
            match_threshold: 0.5,
            match_count: 10
          });

          if (searchError) {
            console.error('Vector search error:', searchError);
          } else {
            searchResults = vectorResults || [];
          }
        }
      } catch (error) {
        console.warn('Could not perform vector search:', error);
      }
    }

    // Fallback: If no vector search results or no embedding, do text-based search
    if (!hasEmbedding || searchResults.length === 0) {
      console.log('Falling back to text-based search');
      
      // Extract keywords from user message for text search
      const keywords = message.toLowerCase().match(/\b\w+\b/g) || [];
      const searchTerms = keywords.filter(word => word.length > 2).slice(0, 5);
      
      let textQuery = supabase
        .from('seo_knowledge')
        .select('id, title, content, category, tags');

      // Add text search conditions
      if (searchTerms.length > 0) {
        const orConditions = searchTerms.map(term => 
          `title.ilike.%${term}%,content.ilike.%${term}%,category.ilike.%${term}%`
        ).join(',');
        textQuery = textQuery.or(orConditions);
      }

      const { data: textResults, error: textError } = await textQuery
        .limit(10)
        .order('created_at', { ascending: false });

      if (textError) {
        console.error('Text search error:', textError);
      } else {
        // Add similarity score for consistency (0.7 for text matches)
        searchResults = (textResults || []).map(doc => ({
          ...doc,
          similarity: 0.7
        }));
      }
    }

    console.log('SEO search results:', searchResults?.length || 0, 'documents found');

    // Prepare context from search results
    const context = searchResults || [];
    const contextText = context.map((doc: any) => 
      `Tiêu đề: ${doc.title}\nDanh mục: ${doc.category || 'Không có'}\nNội dung: ${doc.content}`
    ).join('\n\n---\n\n');

    // Enhanced system prompt following the 6-step process
    const systemPrompt = `# Chuyên gia SEO Shopee - Hệ thống RAG 6 bước

Bạn là chuyên gia SEO Shopee chuyên nghiệp, tuân thủ quy trình 6 bước để tạo tiêu đề và mô tả sản phẩm chuẩn SEO.

## QUY TRÌNH XỬ LÝ 6 BƯỚC

### BƯỚC 1: NHẬN VÀ PHÂN TÍCH YÊU CẦU NGƯỜI DÙNG

**Đầu vào cần thiết:**
- 3-5 từ khóa kèm dung lượng tìm kiếm (VD: "bàn bi a" - 10,000 lượt/tháng)
- Thông tin sản phẩm: loại sản phẩm, đặc điểm nổi bật, thương hiệu/model, chất liệu, màu sắc, đối tượng dùng, kích thước, bảo hành
- Yêu cầu cụ thể: tạo tiêu đề, mô tả, hoặc cả hai

**Xử lý:**
- Nếu thiếu thông tin, hỏi lại người dùng
- Nếu không có dung lượng tìm kiếm, giả định từ khóa đầu tiên có lượng tìm kiếm cao nhất, giảm dần
- Sắp xếp từ khóa theo dung lượng tìm kiếm giảm dần

### BƯỚC 2: TRUY XUẤT THÔNG TIN TỪ TÀI LIỆU RAG

Sử dụng tài liệu "Hướng dẫn tối ưu SEO sản phẩm trên Shopee" để:
- Truy xuất mục 1 (Đặt tên sản phẩm): cấu trúc tiêu đề, độ dài, cách sắp xếp từ khóa
- Truy xuất mục 2 (Mô tả sản phẩm): bố cục mô tả, lặp từ khóa, hashtag
- Áp dụng các ví dụ minh họa trong tài liệu

${context ? `**KIẾN THỨC ĐƯỢC TRUY XUẤT:**\n${contextText}\n` : '**LƯU Ý:** Hiện tại chưa có tài liệu SEO trong cơ sở dữ liệu. Tôi sẽ áp dụng các nguyên tắc SEO Shopee chuẩn.\n'}

### BƯỚC 3: TẠO TIÊU ĐỀ SẢN PHẨM CHUẨN SEO

**Tuân thủ hướng dẫn từ tài liệu:**
- Cấu trúc: [Loại sản phẩm] + [Đặc điểm nổi bật] + (Thương hiệu/Model, Chất liệu, Màu sắc, Đối tượng dùng, Kích thước)
- Độ dài: 80-100 ký tự
- Sắp xếp từ khóa theo dung lượng tìm kiếm giảm dần
- Hạn chế lặp từ khóa, dùng dấu phẩy phân tách
- Tránh ký tự đặc biệt/emoji/hashtag

### BƯỚC 4: TẠO MÔ TẢ SẢN PHẨM CHUẨN SEO

**Bố cục mô tả (2000-2500 ký tự):**
1. **Tiêu đề sản phẩm**: Copy tiêu đề từ Bước 3
2. **Giới thiệu sản phẩm**: Nhấn mạnh lợi ích, công dụng, đặc điểm nổi bật
3. **Thông số kỹ thuật**: Chi tiết kích thước, trọng lượng, chất liệu, màu sắc
4. **Hướng dẫn sử dụng**: Cách dùng sản phẩm, lợi ích
5. **Chính sách bảo hành**: Thông tin bảo hành/tình trạng sản phẩm
6. **Hashtag**: 3-5 hashtag phù hợp

**Quy tắc từ khóa:**
- Mỗi từ khóa xuất hiện 1-3 lần, tối đa dưới 5 lần
- Sử dụng tự nhiên, không nhồi nhét
- Không chứa thông tin liên lạc ngoài Shopee

### BƯỚC 5: ĐỊNH DẠNG VÀ TRẢ LỜI NGƯỜI DÙNG

**Định dạng kết quả:**
- **Tiêu đề**: Đặt trong dấu ngoặc kép, ghi độ dài ký tự
- **Mô tả**: Chia thành các mục rõ ràng, ghi tổng ký tự

**Phong cách trả lời:**
- Giọng điệu thân thiện, dễ hiểu
- Phù hợp với người bán hàng mới
- Đề xuất cải thiện khi cần thiết

### BƯỚC 6: KIỂM TRA VÀ LƯU Ý

**Kiểm tra cuối cùng:**
- Tuân thủ quy định Shopee (trung thực, không chứa thông tin ngoài sàn)
- Từ khóa lặp đúng yêu cầu (1-3 lần, dưới 5 lần)
- Hashtag phù hợp, tránh từ fake/nhái

**Gợi ý bổ sung:**
- Sử dụng Shopee Analytics để kiểm tra hiệu quả
- Cập nhật theo thuật toán Shopee mới nhất

## CÁCH XỬ LÝ CÁC TÌNH HUỐNG

### Khi thiếu thông tin:
"Để tạo tiêu đề/mô tả SEO tối ưu, tôi cần thêm thông tin:
- Các từ khóa chính và dung lượng tìm kiếm
- Đặc điểm sản phẩm (chất liệu, màu sắc, kích thước...)
- Bạn muốn tạo tiêu đề, mô tả hay cả hai?"

### Khi có đủ thông tin:
Áp dụng đúng 6 bước, trả về kết quả theo định dạng:

**TIÊU ĐỀ SEO:**
"[Tiêu đề chuẩn SEO]" (XX ký tự)

**MÔ TẢ SEO:**
[Tiêu đề sản phẩm]

**Giới thiệu sản phẩm:**
[Nội dung giới thiệu với từ khóa tự nhiên]

**Thông số kỹ thuật:**
[Chi tiết sản phẩm]

**Hướng dẫn sử dụng:**
[Cách sử dụng và lợi ích]

**Chính sách bảo hành:**
[Thông tin bảo hành]

**Hashtag:** #Tag1 #Tag2 #Tag3

(Tổng: XXX ký tự)

**LƯU Ý QUAN TRỌNG:**
- Luôn áp dụng đúng 6 bước quy trình
- Ưu tiên truy xuất thông tin từ tài liệu RAG
- Đảm bảo tuân thủ chính sách Shopee
- Tạo nội dung tự nhiên, thuyết phục khách hàng`;

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
        max_tokens: 2500,
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
        metadata: { 
          context: context.slice(0, 5),
          search_method: hasEmbedding ? 'vector' : 'text',
          results_count: searchResults.length
        }
      });
    }

    return new Response(JSON.stringify({ 
      response: aiResponse,
      context: context.slice(0, 5),
      search_method: hasEmbedding ? 'vector' : 'text',
      results_found: searchResults.length
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
