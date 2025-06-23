
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
    const systemPrompt = `Bạn là chuyên gia tư vấn SEO cho sản phẩm trên Shopee với nhiều năm kinh nghiệm. Nhiệm vụ của bạn là:

1. Phân tích câu hỏi của khách hàng về SEO tên sản phẩm và mô tả sản phẩm trên Shopee
2. Đưa ra lời khuyên cụ thể, chi tiết dựa trên kiến thức chuyên môn
3. Luôn giải thích lý do tại sao nên làm theo cách đó
4. Đưa ra ví dụ minh họa cụ thể khi có thể

Quy tắc trả lời:
- Trả lời bằng tiếng Việt, văn phong chuyên nghiệp nhưng thân thiện
- Sử dụng kiến thức từ tài liệu được cung cấp làm cơ sở chính
- Nếu không có thông tin trong tài liệu, hãy dựa vào kiến thức chung về SEO Shopee
- Đưa ra lời khuyên thực tế, có thể áp dụng ngay
- Cấu trúc câu trả lời rõ ràng với các bullet points khi cần thiết

KIẾN THỨC THAM KHẢO:
${context}

Hãy trả lời câu hỏi dựa trên kiến thức trên một cách chi tiết và hữu ích.`;

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
