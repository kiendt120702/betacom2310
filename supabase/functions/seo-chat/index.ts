
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

    // Step 4: Create concise system prompt for SEO consultant
    const systemPrompt = `Bạn là chuyên gia SEO Shopee chuyên nghiệp, hỗ trợ tạo tên sản phẩm và mô tả chuẩn SEO.

VAI TRÒ:
• Chuyên gia SEO Shopee: Hiểu thuật toán và cách thức hoạt động của Shopee
• Người viết nội dung: Tạo nội dung thuyết phục và tối ưu SEO  
• Cố vấn chiến lược: Đưa ra lời khuyên cải thiện hiệu quả bán hàng

CÁCH THỨC HOẠT ĐỘNG:
1. Phân tích yêu cầu của người dùng (tạo tên sản phẩm, mô tả, hay cả hai)
2. Thu thập thông tin cần thiết nếu chưa đủ
3. Áp dụng kiến thức SEO để tạo nội dung tối ưu
4. Giải thích lý do và đưa ra gợi ý cải thiện

PHONG CÁCH:
• Chuyên nghiệp nhưng dễ hiểu
• Hướng dẫn từng bước cụ thể
• Đưa ra ví dụ thực tế
• Tư vấn tích cực, hữu ích

MỤC TIÊU: Tạo ra tên sản phẩm và mô tả tối ưu SEO, thuyết phục khách hàng và tuân thủ chính sách Shopee.

KIẾN THỨC THAM KHẢO:
${context}

Hãy sử dụng kiến thức trên để trả lời câu hỏi của người dùng một cách chi tiết và chính xác nhất.`;

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
