
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, apiKey, conversationId } = await req.json();
    
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get JWT from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      supabase.auth.setAuth(authHeader.replace('Bearer ', ''));
    }

    // Step 1: Generate embedding for user query
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
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

    // Step 2: Search for similar knowledge using vector similarity
    const { data: similarKnowledge, error: searchError } = await supabase
      .rpc('search_strategy_knowledge', {
        query_embedding: queryEmbedding,
        match_threshold: 0.7,
        match_count: 5
      });

    if (searchError) {
      console.error('Search error:', searchError);
      // Continue without context if search fails
    }

    // Step 3: Construct RAG prompt
    const contextString = similarKnowledge && similarKnowledge.length > 0
      ? similarKnowledge.map((item: any) => `
- Chiến lược: ${item.formula_a1}
- Lợi ích: ${item.formula_a}
- Ngành hàng: ${item.industry_application}
- Độ liên quan: ${(item.similarity * 100).toFixed(1)}%
`).join('\n')
      : 'Không tìm thấy kiến thức liên quan trong cơ sở dữ liệu.';

    const systemPrompt = `
CONTEXT: Bạn là chuyên gia tư vấn chiến lược marketing thông minh. Dựa trên knowledge base dưới đây, hãy trả lời câu hỏi của người dùng một cách chi tiết và hữu ích.

KNOWLEDGE BASE:
${contextString}

HƯỚNG DẪN TRẢ LỜI:
1. Phân tích tình huống của người dùng
2. Đưa ra 2-3 chiến lược phù hợp nhất dựa trên knowledge base
3. Hướng dẫn triển khai cụ thể từng bước
4. Đề xuất metrics để đo lường hiệu quả
5. Lưu ý và rủi ro cần chú ý

QUY TẮC:
- Trả lời bằng tiếng Việt tự nhiên
- Cung cấp ví dụ cụ thể và thực tế
- Chỉ tham khảo thông tin từ knowledge base được cung cấp
- Nếu không có thông tin liên quan, hãy thành thật thông báo
- Sử dụng format markdown để format câu trả lời
- Luôn kết thúc bằng câu hỏi gợi ý để tiếp tục cuộc trò chuyện
`;

    // Step 4: Generate response using LLM
    const completion = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
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

    if (!completion.ok) {
      throw new Error('Failed to generate response');
    }

    const completionData = await completion.json();
    const response = completionData.choices[0].message.content;

    // Step 5: Save conversation to database (if conversationId provided)
    if (conversationId) {
      // Save user message
      await supabase.from('chat_messages').insert({
        conversation_id: conversationId,
        role: 'user',
        content: message,
        metadata: {
          retrieved_knowledge: similarKnowledge || [],
          embedding_similarity_scores: similarKnowledge?.map((k: any) => k.similarity) || []
        }
      });

      // Save assistant response
      await supabase.from('chat_messages').insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: response,
        metadata: {
          context_used: contextString,
          model_used: 'gpt-4o-mini'
        }
      });
    }

    return new Response(JSON.stringify({ 
      response,
      context: similarKnowledge || [],
      conversationId 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chat-strategy function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
