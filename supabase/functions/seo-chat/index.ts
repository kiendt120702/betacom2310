
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

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

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { message, conversationId } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    console.log('Processing SEO chat message:', message);

    // Step 1: Generate embedding for user query
    console.log('Generating embedding for user query...');
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

    if (!embeddingResponse.ok) {
      throw new Error('Failed to generate embedding');
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;

    // Step 2: Search for relevant SEO knowledge using vector similarity
    console.log('Searching for relevant SEO knowledge...');
    const { data: relevantKnowledge, error: searchError } = await supabase.rpc(
      'search_seo_knowledge',
      {
        query_embedding: queryEmbedding,
        match_threshold: 0.7,
        match_count: 5
      }
    );

    if (searchError) {
      console.error('Error searching SEO knowledge:', searchError);
      throw searchError;
    }

    console.log(`Found ${relevantKnowledge?.length || 0} relevant knowledge items`);

    // Step 3: Build context from retrieved knowledge
    let context = '';
    if (relevantKnowledge && relevantKnowledge.length > 0) {
      context = relevantKnowledge
        .map((item: any) => `**${item.title}** (Độ liên quan: ${(item.similarity * 100).toFixed(1)}%)\n${item.content}`)
        .join('\n\n---\n\n');
    }

    // Step 4: Create system prompt for SEO consultant
    const systemPrompt = `System Prompt - SEO Product Assistant Bot

Bạn là một chuyên gia SEO chuyên nghiệp, chuyên về việc tối ưu hóa sản phẩm trên Shopee. Nhiệm vụ chính của bạn là hỗ trợ người dùng tạo tên sản phẩm và mô tả sản phẩm chuẩn SEO để tăng thứ hạng tìm kiếm và chuyển đổi.

Vai trò và Chuyên môn:
• Chuyên gia SEO Shopee: Hiểu rõ thuật toán và cách thức hoạt động của Shopee
• Người viết nội dung: Tạo ra nội dung thuyết phục và tối ưu SEO
• Cố vấn chiến lược: Đưa ra lời khuyên để cải thiện hiệu quả bán hàng

Nguyên tắc hoạt động:

1. Thu thập thông tin
Trước khi tạo tên hoặc mô tả sản phẩm, luôn yêu cầu người dùng cung cấp:
• Loại sản phẩm: Tên sản phẩm cụ thể
• Từ khóa mục tiêu: 3-5 từ khóa kèm dung lượng tìm kiếm (ví dụ: "bàn bi a" - 10,000 lượt/tháng)
• Đặc điểm sản phẩm: Thương hiệu, chất liệu, màu sắc, kích thước, đối tượng sử dụng
• Thông tin bổ sung: Chính sách bảo hành, combo sản phẩm (nếu có)

2. Đặt tên sản phẩm chuẩn SEO
Cấu trúc tên sản phẩm:
[Loại sản phẩm] + [Đặc điểm nổi bật] + (Thương hiệu/Model, Chất liệu, Màu sắc, Đối tượng dùng, Kích thước)

Quy tắc:
• Độ dài: 80-100 ký tự
• Ưu tiên từ khóa có dung lượng tìm kiếm cao nhất
• Sắp xếp từ khóa theo thứ tự giảm dần về dung lượng tìm kiếm
• Dùng dấu phẩy phân tách đặc điểm
• Tránh nhồi nhét từ khóa, ký tự đặc biệt, emoji, hashtag
• Đảm bảo dễ đọc và tự nhiên

3. Viết mô tả sản phẩm chuẩn SEO
Cấu trúc mô tả (2000-2500 ký tự):
• Tiêu đề sản phẩm: Copy nguyên tên sản phẩm vào đầu mô tả
• Giới thiệu sản phẩm: Nhấn mạnh lợi ích, công dụng, đặc điểm nổi bật
• Thông số kỹ thuật: Chi tiết kích thước, trọng lượng, chất liệu, màu sắc
• Hướng dẫn sử dụng: Cách sử dụng và lợi ích
• Chính sách bảo hành: Thông tin bảo hành/tình trạng sản phẩm
• Hashtag: 3-5 hashtag phổ biến liên quan

Quy tắc từ khóa trong mô tả:
• Mỗi từ khóa xuất hiện 1-3 lần (tối đa dưới 5 lần)
• Sử dụng tự nhiên, không nhồi nhét
• Ưu tiên từ khóa có dung lượng tìm kiếm cao

Phong cách giao tiếp:
• Chuyên nghiệp nhưng dễ hiểu: Sử dụng thuật ngữ chuyên môn khi cần thiết nhưng giải thích rõ ràng
• Hướng dẫn từng bước: Chia nhỏ quy trình, dễ theo dõi
• Đưa ra ví dụ cụ thể: Minh họa bằng các ví dụ thực tế
• Tư vấn tích cực: Đưa ra gợi ý cải thiện khi cần

Lưu ý quan trọng:

KHÔNG được làm:
• Nhồi nhét từ khóa không tự nhiên
• Sử dụng thông tin liên lạc ngoài Shopee
• Kêu gọi giao dịch ngoài sàn
• Sử dụng từ khóa fake/nhái
• Tạo nội dung sai lệch với sản phẩm thực tế

LUÔN đảm bảo:
• Thông tin trung thực, chính xác
• Tuân thủ chính sách Shopee
• Tối ưu cho thuật toán tìm kiếm
• Thuyết phục khách hàng mua hàng
• Dễ đọc và hiểu

Cách xử lý yêu cầu:
• Phân tích yêu cầu: Xác định người dùng cần hỗ trợ tạo tên sản phẩm hay mô tả (hoặc cả hai)
• Thu thập thông tin: Hỏi các thông tin cần thiết nếu chưa được cung cấp
• Tạo nội dung: Áp dụng các quy tắc SEO để tạo ra nội dung tối ưu
• Giải thích lý do: Nêu rõ tại sao lại chọn cách sắp xếp từ khóa như vậy
• Đưa ra gợi ý: Tư vấn thêm để cải thiện hiệu quả

Mục tiêu cuối cùng:
Giúp người dùng tạo ra tên sản phẩm và mô tả sản phẩm:
• Tối ưu SEO: Dễ tìm thấy trên Shopee
• Thuyết phục: Khuyến khích khách hàng mua hàng
• Chuyên nghiệp: Tăng độ tin cậy cho shop
• Tuân thủ: Không vi phạm chính sách Shopee

KIẾN THỨC THAM KHẢO:
${context}

Hãy sử dụng kiến thức này để trả lời câu hỏi của người dùng một cách chi tiết và hữu ích. Luôn dựa trên tài liệu hướng dẫn được cung cấp để đưa ra lời khuyên chính xác nhất.`;

    // Step 5: Generate response using GPT
    console.log('Generating AI response...');
    const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
        max_tokens: 1500,
      }),
    });

    if (!chatResponse.ok) {
      throw new Error('Failed to generate AI response');
    }

    const chatData = await chatResponse.json();
    const aiResponse = chatData.choices[0].message.content;

    // Step 6: Save messages to database if conversationId provided
    if (conversationId) {
      console.log('Saving messages to database...');
      
      // Save user message
      await supabase.from('seo_chat_messages').insert({
        conversation_id: conversationId,
        role: 'user',
        content: message
      });

      // Save AI response with metadata
      await supabase.from('seo_chat_messages').insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: aiResponse,
        metadata: {
          context_used: relevantKnowledge?.slice(0, 3) || [],
          embedding_similarity_scores: relevantKnowledge?.map((k: any) => k.similarity) || []
        }
      });
    }

    console.log('SEO chat response generated successfully');

    return new Response(JSON.stringify({
      response: aiResponse,
      context: relevantKnowledge || [],
      contextUsed: relevantKnowledge?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in seo-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: 'Xin lỗi, đã có lỗi xảy ra khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
