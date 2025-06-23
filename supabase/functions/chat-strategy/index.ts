
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

    console.log('Received strategy chat request:', { message, conversationId });

    let searchResults = [];
    let searchMethod = 'none';

    // BƯỚC 2: TRUY XUẤT THÔNG TIN (Retrieval)
    if (openAIApiKey) {
      try {
        // Chuyển đổi câu hỏi người dùng thành embedding vector
        console.log('Converting user question to embedding vector...');
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
          const questionEmbedding = embeddingData.data[0].embedding;

          console.log('Performing vector similarity search...');
          
          // Tìm kiếm tương tự vector trong database
          const { data: vectorResults, error: searchError } = await supabase.rpc('search_strategy_knowledge', {
            query_embedding: questionEmbedding,
            match_threshold: 0.2, // Ngưỡng tương tự thấp hơn để có nhiều kết quả hơn
            match_count: 10 // Lấy nhiều kết quả hơn
          });

          if (searchError) {
            console.error('Vector search error:', searchError);
          } else if (vectorResults && vectorResults.length > 0) {
            searchResults = vectorResults;
            searchMethod = 'vector';
            console.log(`Vector search found ${searchResults.length} relevant documents`);
          }
        }
      } catch (error) {
        console.warn('Vector search failed:', error);
      }
    }

    // Fallback: Tìm kiếm text-based nếu không có vector search hoặc không có kết quả
    if (searchResults.length === 0) {
      console.log('Falling back to text-based search...');
      
      const keywords = message.toLowerCase().match(/\b\w+\b/g) || [];
      const searchTerms = keywords.filter(word => word.length > 2).slice(0, 5);
      
      if (searchTerms.length > 0) {
        let textQuery = supabase
          .from('strategy_knowledge')
          .select('id, formula_a1, formula_a, industry_application');

        const orConditions = searchTerms.map(term => 
          `formula_a1.ilike.%${term}%,formula_a.ilike.%${term}%,industry_application.ilike.%${term}%`
        ).join(',');
        textQuery = textQuery.or(orConditions);

        const { data: textResults, error: textError } = await textQuery
          .limit(8)
          .order('created_at', { ascending: false });

        if (!textError && textResults && textResults.length > 0) {
          searchResults = textResults.map(doc => ({
            ...doc,
            similarity: 0.7
          }));
          searchMethod = 'text';
          console.log(`Text search found ${searchResults.length} documents`);
        }
      }
    }

    // BƯỚC 3: TẠO PHẢN HỒI (Generation) với context từ kết quả tìm kiếm
    const context = searchResults || [];
    const contextText = context.slice(0, 5).map((doc: any) => 
      `Công thức A1: ${doc.formula_a1}\nCông thức A: ${doc.formula_a}\nỨng dụng: ${doc.industry_application}`
    ).join('\n\n---\n\n');

    // System prompt với context được truy xuất
    const systemPrompt = `Bạn là chuyên gia tư vấn chiến lược thương mại điện tử Shopee chuyên nghiệp.

## VAI TRÒ VÀ NHIỆM VỤ
- Phân tích vấn đề kinh doanh của người dùng một cách chi tiết
- Đưa ra lời khuyên cụ thể dựa trên cơ sở kiến thức được cung cấp
- Giải thích rõ ràng lý do đằng sau mỗi khuyến nghị

${context.length > 0 ? `## KIẾN THỨC THAM KHẢO (từ cơ sở dữ liệu)\n${contextText}\n` : '## LƯU Ý\nKhông tìm thấy kiến thức liên quan trong cơ sở dữ liệu. Tôi sẽ dựa vào kinh nghiệm tổng quát.\n'}

## HƯỚNG DẪN TRẢ LỜI
- Ưu tiên sử dụng thông tin từ kiến thức tham khảo ở trên
- Đưa ra các bước cụ thể có thể thực hiện
- Giải thích rõ ràng, dễ hiểu
- Tạo động lực cho người dùng

Hãy phân tích vấn đề và đưa ra lời khuyên tốt nhất dựa trên kiến thức đã cung cấp.`;

    // Store user message
    if (conversationId) {
      await supabase.from('chat_messages').insert({
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

    console.log('Generated strategy AI response using', searchMethod, 'search method');

    // Store AI response
    if (conversationId) {
      await supabase.from('chat_messages').insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: aiResponse,
        metadata: { 
          context: context.slice(0, 3),
          search_method: searchMethod,
          results_count: searchResults.length
        }
      });
    }

    return new Response(JSON.stringify({ 
      response: aiResponse,
      context: context.slice(0, 3),
      search_method: searchMethod,
      results_found: searchResults.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in strategy chat function:', error);
    return new Response(JSON.stringify({ 
      error: 'Đã có lỗi xảy ra khi xử lý yêu cầu tư vấn của bạn. Vui lòng thử lại.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
