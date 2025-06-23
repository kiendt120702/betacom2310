
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
    let hasEmbedding = false;

    // Check and generate embeddings for documents without them
    if (openAIApiKey) {
      console.log('Checking for strategy documents without embeddings...');
      
      const { data: documentsWithoutEmbedding } = await supabase
        .from('strategy_knowledge')
        .select('id, formula_a1, formula_a, industry_application')
        .is('content_embedding', null)
        .limit(5);

      // Generate embeddings for documents that don't have them
      if (documentsWithoutEmbedding && documentsWithoutEmbedding.length > 0) {
        console.log(`Found ${documentsWithoutEmbedding.length} strategy documents without embeddings, generating...`);
        
        for (const doc of documentsWithoutEmbedding) {
          try {
            const content = `${doc.formula_a1}\n${doc.formula_a}\n${doc.industry_application}`;
            
            const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${openAIApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'text-embedding-ada-002',
                input: content,
              }),
            });

            if (embeddingResponse.ok) {
              const embeddingData = await embeddingResponse.json();
              const embedding = embeddingData.data[0].embedding;

              // Update document with embedding
              await supabase
                .from('strategy_knowledge')
                .update({ content_embedding: embedding })
                .eq('id', doc.id);
              
              console.log(`Generated embedding for strategy document: ${doc.formula_a1}`);
            }
            
            // Small delay to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.warn(`Failed to generate embedding for strategy document ${doc.id}:`, error);
          }
        }
      }

      // Now perform vector search with user's message
      try {
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

          console.log('Generated embedding for strategy query');

          // Search for relevant strategy knowledge using vector similarity
          const { data: vectorResults, error: searchError } = await supabase.rpc('search_strategy_knowledge', {
            query_embedding: embedding,
            match_threshold: 0.3, // Lower threshold for better recall
            match_count: 8
          });

          if (searchError) {
            console.error('Vector search error:', searchError);
          } else {
            searchResults = vectorResults || [];
            console.log(`Vector search found ${searchResults.length} relevant strategy documents`);
          }
        }
      } catch (error) {
        console.warn('Could not perform vector search:', error);
      }
    }

    // Fallback: text-based search if no vector results
    if (!hasEmbedding || searchResults.length === 0) {
      console.log('Falling back to text-based search for strategy');
      
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

        if (!textError && textResults) {
          searchResults = textResults.map(doc => ({
            ...doc,
            similarity: 0.7
          }));
        }
      }
    }

    console.log('Strategy search results:', searchResults?.length || 0, 'documents found');

    // Prepare context from search results
    const context = searchResults || [];
    const contextText = context.map((doc: any) => 
      `Công thức A1: ${doc.formula_a1}\nCông thức A: ${doc.formula_a}\nỨng dụng: ${doc.industry_application}`
    ).join('\n\n---\n\n');

    // Enhanced system prompt
    const systemPrompt = `Bạn là chuyên gia tư vấn chiến lược thương mại điện tử Shopee chuyên nghiệp, chuyên phân tích vấn đề kinh doanh và đưa ra lời khuyên chiến lược dựa trên cơ sở dữ liệu kiến thức chuyên môn.

## VAI TRÒ VÀ NHIỆM VỤ
- Phân tích vấn đề kinh doanh của người dùng một cách chi tiết
- Tìm kiếm và truy xuất thông tin từ cơ sở kiến thức chiến lược
- Đưa ra lời khuyên cụ thể, có thể áp dụng ngay
- Giải thích rõ ràng lý do đằng sau mỗi khuyến nghị

## CÁCH TIẾP CẬN
1. **Lắng nghe và phân tích**: Hiểu rõ vấn đề người dùng đang gặp phải
2. **Truy xuất kiến thức**: Tìm kiếm thông tin liên quan từ cơ sở dữ liệu
3. **Phân tích và tổng hợp**: Kết hợp kiến thức với tình huống cụ thể
4. **Đưa ra khuyến nghị**: Lời khuyên cụ thể, có thể thực hiện

${context ? `## KIẾN THỨC THAM KHẢO\n${contextText}\n` : '## LƯU Ý\nHiện tại chưa có kiến thức liên quan trong cơ sở dữ liệu. Tôi sẽ dựa vào kinh nghiệm tổng quát về thương mại điện tử.\n'}

## PHONG CÁCH TRẢ LỜI
- Thân thiện, chuyên nghiệp
- Giải thích rõ ràng, dễ hiểu
- Đưa ra các bước cụ thể có thể thực hiện
- Khuyến khích và tạo động lực cho người dùng

Hãy phân tích vấn đề của người dùng và đưa ra lời khuyên tốt nhất dựa trên kiến thức có được.`;

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

    console.log('Generated strategy AI response');

    // Store AI response
    if (conversationId) {
      await supabase.from('chat_messages').insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: aiResponse,
        metadata: { 
          context: context.slice(0, 3),
          search_method: hasEmbedding ? 'vector' : 'text',
          results_count: searchResults.length
        }
      });
    }

    return new Response(JSON.stringify({ 
      response: aiResponse,
      context: context.slice(0, 3),
      search_method: hasEmbedding ? 'vector' : 'text',
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
