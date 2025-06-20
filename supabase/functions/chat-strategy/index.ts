
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationId } = await req.json();
    
    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')!;

    if (!openAIApiKey || !supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: 'Configuration missing' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get JWT from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      supabase.auth.setSession({ access_token: token, refresh_token: token });
    }

    // Step 1: Generate embedding for user query
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: message.replace(/\n/g, ' '),
      }),
    });

    if (!embeddingResponse.ok) {
      throw new Error('Failed to generate embedding');
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;

    // Step 2: Search for similar knowledge using vector similarity
    const { data: knowledgeResults, error: searchError } = await supabase
      .rpc('search_strategy_knowledge', {
        query_embedding: queryEmbedding,
        match_threshold: 0.5,
        match_count: 5
      });

    if (searchError) {
      console.error('Search error:', searchError);
    }

    // Step 3: Build context from retrieved knowledge
    let context = "";
    if (knowledgeResults && knowledgeResults.length > 0) {
      context = knowledgeResults
        .map(
          (result: any) =>
            `Chiến lược Marketing: ${result.formula_a1}\nHướng dẫn áp dụng: ${
              result.formula_a
            }\nNgành hàng áp dụng: ${
              result.industry_application
            }\nĐộ tương đồng: ${result.similarity.toFixed(2)}`
        )
        .join("\n\n");
    }

    // Step 4: Updated system prompt with enhanced analysis capabilities
    const systemPrompt = `Bạn là chuyên gia AI trong lĩnh vực thương mại điện tử Shopee, chuyên phân tích vấn đề và tư vấn chiến lược dựa trên bảng dữ liệu chiến lược được cung cấp. Bảng gồm 3 cột chính:

1. Công thức A1 (Chiến lược Marketing): Chi tiết các chiến lược marketing cụ thể, bao gồm các bước, phương pháp, ví dụ, và ý tưởng áp dụng.
2. Công thức A (Hướng dẫn áp dụng): Hướng dẫn áp dụng các chiến lược đó trong các trường hợp cụ thể hoặc tình huống thực tế.
3. Ngành hàng áp dụng: Các ngành hàng hoặc lĩnh vực mà chiến lược đó phù hợp để triển khai.

${context ? `DỮ LIỆU CHIẾN LƯỢC CỦA CÔNG TY:\n${context}\n` : ""}

NGUYÊN TẮC TƯ VẤN:
1. **PHÂN TÍCH VẤN ĐỀ CHI TIẾT**: Khi người dùng mô tả vấn đề gặp phải, bạn phải:
   - Phân tích tình huống một cách chi tiết và toàn diện
   - Xác định nguyên nhân gốc rễ của vấn đề
   - Đánh giá các yếu tố ảnh hưởng (ngành hàng, quy mô, đối tượng khách hàng)
   - Đưa ra chẩn đoán chính xác trước khi tư vấn

2. **TƯ VẤN CHIẾN LƯỢC PHẦN ĐẦU**:
   - Khi có nhiều chiến lược phù hợp, hãy liệt kê đầy đủ nội dung Công thức A1 của từng chiến lược (không rút gọn, không chỉ ghi tên)
   - Chỉ nói đây là các cách làm/chiến lược shop có thể áp dụng
   - Trình bày rõ ràng từng chiến lược như sau:
     - **Tên công thức A**
     - **Nội dung Công thức A1:** ...
   - Hỏi người dùng muốn tìm hiểu chi tiết chiến lược nào

3. **GIẢI THÍCH CHI TIẾT KHI ĐƯỢC YÊU CẦU**:
   - Khi người dùng hỏi chi tiết về 1 chiến lược cụ thể, hãy bám sát 100% vào Công thức A1
   - Sử dụng kiến thức về Shopee để phân tích từng ý trong Công thức A1: mục tiêu, lợi ích, tình huống nên dùng
   - Đưa ra các chỉ số KPI và metrics liên quan: lượt click, tỷ lệ chuyển đổi, lượt thêm giỏ hàng, đơn hàng tăng thêm, v.v.
   - Hướng dẫn từng bước thực hiện trên nền tảng Shopee

4. **QUY TẮC NGHIÊM NGẶT**:
   - CHỈ sử dụng các chiến lược có trong dữ liệu được cung cấp
   - Không được tạo ra hoặc bịa đặt chiến lược mới
   - Khi không có dữ liệu phù hợp: "Dựa trên hệ thống chiến lược hiện tại của công ty, tôi khuyến nghị tập trung vào các phương pháp đã được kiểm chứng. Điều này sẽ đảm bảo hiệu quả và tính nhất quán trong chiến lược của bạn."

QUY TẮC TRẢ LỜI:
- Luôn bắt đầu bằng phân tích vấn đề: "Dựa trên tình huống bạn mô tả, tôi nhận thấy..."
- Sau đó đưa ra chẩn đoán: "Vấn đề chính ở đây là..."
- Tiếp theo tư vấn chiến lược: "Để giải quyết vấn đề này, shop có thể áp dụng các chiến lược sau:"
- Liệt kê tên các chiến lược phù hợp (không chi tiết)
- Hỏi người dùng muốn tìm hiểu chi tiết chiến lược nào
- Khi được hỏi chi tiết, ghi đầy đủ nội dung Công thức A1, không được rút gọn
- Sử dụng tiếng Việt chuẩn, thân thiện và chuyên nghiệp`;

    // Step 5: Generate response using LLM
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
        max_tokens: 1500,
        temperature: 0.2,
      }),
    });

    if (!chatResponse.ok) {
      throw new Error('Failed to generate response');
    }

    const chatData = await chatResponse.json();
    const aiResponse = chatData.choices[0].message.content;

    // Step 6: Save conversation to database (if conversationId provided)
    if (conversationId) {
      // Save user message
      await supabase.from('chat_messages').insert({
        conversation_id: conversationId,
        role: 'user',
        content: message,
        metadata: {
          retrieved_knowledge: knowledgeResults || [],
          embedding_similarity_scores: knowledgeResults?.map((k: any) => k.similarity) || []
        }
      });

      // Save assistant response
      await supabase.from('chat_messages').insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: aiResponse,
        metadata: {
          context_used: context,
          context_length: context.length,
          model_used: 'gpt-4o-mini'
        }
      });
    }

    return new Response(JSON.stringify({ 
      response: aiResponse,
      context: knowledgeResults || [],
      contextUsed: context.length > 0,
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
