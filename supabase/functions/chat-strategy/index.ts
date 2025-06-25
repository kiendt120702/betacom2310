
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

    console.log('Processing strategy chat message:', message);

    // Step 1: Get conversation history if conversationId exists
    let conversationHistory: any[] = [];
    if (conversationId) {
      const { data: historyData, error: historyError } = await supabase
        .from('chat_messages')
        .select('role, content')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(10); // Lấy 10 tin nhắn gần nhất để tránh context quá dài

      if (historyError) {
        console.error('Error fetching conversation history:', historyError);
      } else if (historyData) {
        conversationHistory = historyData;
      }
    }

    // Step 2: Generate embedding for user query
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

    // Step 3: Search for relevant strategy knowledge using vector similarity
    console.log('Searching for relevant strategy knowledge...');
    const { data: relevantKnowledge, error: searchError } = await supabase.rpc(
      'search_strategy_knowledge',
      {
        query_embedding: queryEmbedding,
        match_threshold: 0.7,
        match_count: 5
      }
    );

    if (searchError) {
      console.error('Error searching strategy knowledge:', searchError);
      throw searchError;
    }

    console.log(`Found ${relevantKnowledge?.length || 0} relevant strategy items`);

    // Step 4: Build context from retrieved knowledge
    let context = '';
    if (relevantKnowledge && relevantKnowledge.length > 0) {
      context = relevantKnowledge
        .map((item: any) => `NGÀNH HÀNG: ${item.industry_application}\nCHIẾN LƯỢC A1: ${item.formula_a1}\nCÔNG THỨC A: ${item.formula_a}`)
        .join('\n\n---\n\n');
    }

    // Step 5: Build conversation context
    let conversationContext = '';
    if (conversationHistory.length > 0) {
      conversationContext = conversationHistory
        .map((msg: any) => `${msg.role === 'user' ? 'Người dùng' : 'Chuyên gia'}: ${msg.content}`)
        .join('\n\n');
    }

    // Step 6: Create system prompt for strategy consultant
    const systemPrompt = `Bạn là chuyên gia tư vấn chiến lược Shopee chuyên nghiệp với kinh nghiệm phân tích và giải quyết vấn đề shop.

NGUYÊN TẮC HOẠT ĐỘNG:
1. Phân tích kỹ lưỡng vấn đề shop/sản phẩm từ thông tin người dùng cung cấp
2. Chẩn đoán tình trạng shop đang gặp phải
3. Đưa ra chiến lược phù hợp kèm Công thức A1 và Công thức A
4. Giải thích chi tiết khi được yêu cầu
5. Tham khảo ngữ cảnh cuộc hội thoại trước để trả lời chính xác
6. KHÔNG SỬ DỤNG markdown (**, ###) trong câu trả lời

QUY TRÌNH Tƣ VẤN:

A. KHI NGƯỜI DÙNG MÔ TẢ VẤN ĐỀ SHOP/SẢN PHẨM:
1. Phân tích và chẩn đoán:
   - "Dựa trên thông tin bạn cung cấp, tôi phân tích tình trạng shop như sau:"
   - Xác định vấn đề cụ thể (traffic thấp, tỷ lệ chuyển đổi kém, cạnh tranh gay gắt, v.v.)
   - Đánh giá mức độ nghiêm trọng và nguyên nhân gốc rễ

2. Đưa ra chiến lược:
   - "Để giải quyết vấn đề này, tôi đề xuất áp dụng chiến lược sau:"
   - Nêu tên chiến lược phù hợp
   - Trình bày CÔNG THỨC A1 (chi tiết chiến lược)
   - Trình bày CÔNG THỨC A (hướng dẫn áp dụng cụ thể)
   - Kết thúc: "Bạn có muốn tôi giải thích chi tiết cách triển khai chiến lược này không?"

B. KHI NGƯỜI DÙNG YÊU CẦU GIẢI THÍCH CHI TIẾT CHIẾN LƯỢC:
- "Tôi sẽ hướng dẫn chi tiết cách triển khai chiến lược này:"
- Chia nhỏ từng bước cụ thể
- Đưa ra timeline và thứ tự ưu tiên
- Lưu ý những điểm cần chú ý
- Kết thúc: "Bạn có thắc mắc gì về các bước triển khai không?"

C. KHI NGƯỜI DÙNG HỎI VỀ CHIẾN LƯỢC KHÁC:
- "Về chiến lược [tên chiến lược], đây là cách triển khai:"
- Giải thích logic và mục tiêu của chiến lược
- Hướng dẫn từng bước thực hiện
- Đưa ra ví dụ minh họa nếu cần
- Kết thúc: "Chiến lược này phù hợp với tình hình shop của bạn. Bạn muốn biết thêm điều gì?"

D. KHI NGƯỜI DÙNG CẦN GIẢI THÍCH KỸ HƠN:
- Tham khảo ngữ cảnh cuộc hội thoại trước
- Làm rõ phần người dùng chưa hiểu
- Đưa ra ví dụ cụ thể và dễ hiểu
- So sánh với các trường hợp tương tự
- Kết thúc: "Như vậy đã rõ chưa? Tôi có thể giải thích thêm phần nào khác."

PHONG CÁCH GIAO TIẾP:
- Chuyên nghiệp, tự tin nhưng thân thiện
- Trực tiếp, tập trung vào giải pháp
- Sử dụng thuật ngữ chuyên môn phù hợp
- Luôn có câu mở đầu và kết thúc
- Không sử dụng định dạng markdown
- Nhớ và liên kết với thông tin từ cuộc hội thoại trước

${conversationContext ? `\nNGỮ CẢNH CUỘC HỘI THOẠI TRƯỚC ĐÓ:\n${conversationContext}\n` : ''}

KIẾN THỨC CHIẾN LƯỢC THAM KHẢO:
${context}

Hãy phân tích yêu cầu của người dùng dựa trên ngữ cảnh và đưa ra tư vấn chuyên nghiệp theo quy trình trên.`;

    // Step 7: Generate response using GPT
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
        max_tokens: 3000,
      }),
    });

    if (!chatResponse.ok) {
      throw new Error('Failed to generate AI response');
    }

    const chatData = await chatResponse.json();
    const aiResponse = chatData.choices[0].message.content;

    // Step 8: Save messages to database if conversationId provided
    if (conversationId) {
      console.log('Saving messages to database...');
      
      // Save user message
      await supabase.from('chat_messages').insert({
        conversation_id: conversationId,
        role: 'user',
        content: message
      });

      // Save AI response with metadata
      await supabase.from('chat_messages').insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: aiResponse,
        metadata: {
          context_used: relevantKnowledge?.slice(0, 3) || [],
          embedding_similarity_scores: relevantKnowledge?.map((k: any) => k.similarity) || [],
          conversation_history_length: conversationHistory.length
        }
      });
    }

    console.log('Strategy chat response generated successfully');

    return new Response(JSON.stringify({
      response: aiResponse,
      context: relevantKnowledge || [],
      contextUsed: relevantKnowledge?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chat-strategy function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: 'Xin lỗi, đã có lỗi xảy ra khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
