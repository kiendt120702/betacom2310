
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
        .map((item: any) => `${item.title} (Độ liên quan: ${(item.similarity * 100).toFixed(1)}%)\n${item.content}`)
        .join('\n\n---\n\n');
    }

    // Step 4: Create system prompt for SEO consultant
    const systemPrompt = `Bạn là chuyên gia SEO Shopee chuyên nghiệp, tư vấn tối ưu sản phẩm.

NGUYÊN TẮC HOẠT ĐỘNG:
1. Phân tích yêu cầu người dùng chính xác
2. Chỉ làm đúng những gì được yêu cầu
3. Không sử dụng markdown (###, ***) trong câu trả lời
4. Trả lời trực tiếp, ngắn gọn

CẢ TRÌNH XỬ LÝ YÊU CẦU:

A. KHI NGƯỜI DÙNG HỎI TẠO TÊN SẢN PHẨM:
- Chỉ trả về TÊN SẢN PHẨM chuẩn SEO
- Không giải thích quy trình
- Không đưa ra mô tả sản phẩm
- Độ dài: 80-100 ký tự

B. KHI NGƯỜI DÙNG HỎI TẠO MÔ TẢ SẢN PHẨM:
- Chỉ trả về MÔ TẢ SẢN PHẨM chuẩn SEO
- Độ dài: 2300-2800 từ
- Không giải thích quy trước
- Không đưa ra tên sản phẩm

C. KHI NGƯỜI DÙNG HỎI VỀ LÝ THUYẾT/QUY TẮC:
- Giải thích chi tiết quy tắc SEO
- Hướng dẫn từng bước
- Đưa ra ví dụ minh họa

D. KHI NGƯỜI DÙNG CUNG CẤP THÔNG TIN CHƯA ĐỦ:
- Hỏi thông tin còn thiếu một cách ngắn gọn
- Không đưa ra kết quả chưa hoàn chỉnh

PHONG CÁCH GIAO TIẾP:
- Trực tiếp, không dài dòng
- Chuyên nghiệp nhưng dễ hiểu
- Không sử dụng định dạng markdown
- Tập trung vào kết quả cụ thể

KIẾN THỨC THAM KHẢO:
${context}

Hãy phân tích yêu cầu của người dùng và trả lời chính xác theo nguyên tắc trên.`;

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
        max_tokens: 2000,
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
