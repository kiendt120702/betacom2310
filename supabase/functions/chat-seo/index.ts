
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

    // Check and generate embeddings for documents without them
    if (openAIApiKey) {
      console.log('Checking for documents without embeddings...');
      
      const { data: documentsWithoutEmbedding } = await supabase
        .from('seo_knowledge')
        .select('id, title, content')
        .is('embedding', null)
        .limit(5);

      // Generate embeddings for documents that don't have them
      if (documentsWithoutEmbedding && documentsWithoutEmbedding.length > 0) {
        console.log(`Found ${documentsWithoutEmbedding.length} documents without embeddings, generating...`);
        
        for (const doc of documentsWithoutEmbedding) {
          try {
            // Split long content into chunks for better embedding
            const contentChunks = splitIntoChunks(doc.content, 3000);
            let avgEmbedding = null;

            if (contentChunks.length === 1) {
              // Single chunk - generate embedding directly
              const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${openAIApiKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  model: 'text-embedding-ada-002',
                  input: `${doc.title}\n\n${contentChunks[0]}`,
                }),
              });

              if (embeddingResponse.ok) {
                const embeddingData = await embeddingResponse.json();
                avgEmbedding = embeddingData.data[0].embedding;
              }
            } else {
              // Multiple chunks - generate embeddings and average them
              const embeddings = [];
              
              for (const chunk of contentChunks) {
                const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${openAIApiKey}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    model: 'text-embedding-ada-002',
                    input: `${doc.title}\n\n${chunk}`,
                  }),
                });

                if (embeddingResponse.ok) {
                  const embeddingData = await embeddingResponse.json();
                  embeddings.push(embeddingData.data[0].embedding);
                }
                
                // Small delay to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 100));
              }

              // Average the embeddings
              if (embeddings.length > 0) {
                avgEmbedding = averageEmbeddings(embeddings);
              }
            }

            // Update document with embedding
            if (avgEmbedding) {
              await supabase
                .from('seo_knowledge')
                .update({ embedding: avgEmbedding })
                .eq('id', doc.id);
              
              console.log(`Generated embedding for document: ${doc.title}`);
            }
          } catch (error) {
            console.warn(`Failed to generate embedding for document ${doc.id}:`, error);
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

          console.log('Generated embedding for SEO query');

          // Search for relevant SEO knowledge using vector similarity
          const { data: vectorResults, error: searchError } = await supabase.rpc('search_seo_knowledge', {
            query_embedding: embedding,
            match_threshold: 0.3, // Lower threshold for better recall
            match_count: 8
          });

          if (searchError) {
            console.error('Vector search error:', searchError);
          } else {
            searchResults = vectorResults || [];
            console.log(`Vector search found ${searchResults.length} relevant documents`);
          }
        }
      } catch (error) {
        console.warn('Could not perform vector search:', error);
      }
    }

    // Fallback: text-based search if no vector results
    if (!hasEmbedding || searchResults.length === 0) {
      console.log('Falling back to text-based search');
      
      const keywords = message.toLowerCase().match(/\b\w+\b/g) || [];
      const searchTerms = keywords.filter(word => word.length > 2).slice(0, 5);
      
      if (searchTerms.length > 0) {
        let textQuery = supabase
          .from('seo_knowledge')
          .select('id, title, content, category, tags');

        const orConditions = searchTerms.map(term => 
          `title.ilike.%${term}%,content.ilike.%${term}%,category.ilike.%${term}%`
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

    console.log('SEO search results:', searchResults?.length || 0, 'documents found');

    // Prepare context from search results
    const context = searchResults || [];
    const contextText = context.map((doc: any) => 
      `Tiêu đề: ${doc.title}\nDanh mục: ${doc.category || 'SEO Shopee'}\nNội dung: ${truncateContent(doc.content, 800)}`
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

### BƯỚC 3-6: [Giữ nguyên hướng dẫn tạo tiêu đề, mô tả, định dạng và kiểm tra]

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
    console.error('Error in SEO chat function:', error);
    return new Response(JSON.stringify({ 
      error: 'Đã có lỗi xảy ra khi xử lý yêu cầu SEO của bạn. Vui lòng thử lại.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper function to split content into chunks
function splitIntoChunks(text: string, maxChunkSize: number): string[] {
  if (text.length <= maxChunkSize) {
    return [text];
  }

  const chunks = [];
  let currentPos = 0;

  while (currentPos < text.length) {
    let endPos = currentPos + maxChunkSize;
    
    // Try to break at a sentence or paragraph boundary
    if (endPos < text.length) {
      const lastPeriod = text.lastIndexOf('.', endPos);
      const lastNewline = text.lastIndexOf('\n', endPos);
      const breakPoint = Math.max(lastPeriod, lastNewline);
      
      if (breakPoint > currentPos + maxChunkSize * 0.5) {
        endPos = breakPoint + 1;
      }
    }

    chunks.push(text.slice(currentPos, endPos).trim());
    currentPos = endPos;
  }

  return chunks.filter(chunk => chunk.length > 0);
}

// Helper function to average embeddings
function averageEmbeddings(embeddings: number[][]): number[] {
  const dimensions = embeddings[0].length;
  const averaged = new Array(dimensions).fill(0);

  for (const embedding of embeddings) {
    for (let i = 0; i < dimensions; i++) {
      averaged[i] += embedding[i];
    }
  }

  for (let i = 0; i < dimensions; i++) {
    averaged[i] /= embeddings.length;
  }

  return averaged;
}

// Helper function to truncate content
function truncateContent(content: string, maxLength: number): string {
  if (content.length <= maxLength) {
    return content;
  }
  return content.slice(0, maxLength) + '...';
}
