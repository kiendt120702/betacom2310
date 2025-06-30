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

// Function to strip common markdown formatting
const stripMarkdown = (text: string) => {
  let cleanedText = text;
  // Remove bold/italic markers
  cleanedText = cleanedText.replace(/\*\*(.*?)\*\*/g, '$1'); // **bold** -> bold
  cleanedText = cleanedText.replace(/\*(.*?)\*/g, '$1');   // *italic* -> italic

  // Remove common list markers and extra spaces at the beginning of lines
  cleanedText = cleanedText.replace(/^- /gm, ''); // - item -> item
  cleanedText = cleanedText.replace(/^\d+\. /gm, ''); // 1. item -> item

  // Remove heading markers
  cleanedText = cleanedText.replace(/^#+\s*/gm, ''); // ### Heading -> Heading

  // Replace multiple newlines with single newlines for paragraphs, then trim
  cleanedText = cleanedText.replace(/\n\s*\n/g, '\n\n');
  
  return cleanedText.trim();
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      throw new Error('OpenAI API key not configured');
    }

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase configuration missing');
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { message, conversationId } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    console.log('Processing strategy chat message:', message);

    // Step 1: Get conversation history within the same conversationId
    let conversationHistory: any[] = [];
    if (conversationId) {
      try {
        const { data: historyData, error: historyError } = await supabase
          .from('chat_messages')
          .select('role, content')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true })
          .limit(10); // Limit to recent messages within the same conversation

        if (historyError) {
          console.error('Error fetching conversation history:', historyError);
        } else if (historyData) {
          conversationHistory = historyData;
        }
      } catch (error) {
        console.error('Exception fetching conversation history:', error);
      }
    }

    // Step 2: Generate embedding for user query
    console.log('Generating embedding for user query...');
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

      if (!embeddingResponse.ok) {
        const errorText = await embeddingResponse.text();
        console.error('OpenAI embedding error:', errorText);
        throw new Error(`Failed to generate embedding: ${embeddingResponse.status}`);
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
          match_count: 8
        }
      );

      if (searchError) {
        console.error('Error searching strategy knowledge:', searchError);
        // Continue without relevant knowledge if search fails
      }

      console.log(`Found ${relevantKnowledge?.length || 0} relevant strategy items`);

      // Step 4: Build context from retrieved knowledge
      let context = '';
      if (relevantKnowledge && relevantKnowledge.length > 0) {
        context = relevantKnowledge
          .map((item: any) => `CHIẾN LƯỢC: Mục đích: ${item.formula_a}. Cách thực hiện: ${item.formula_a1}`)
          .join('\n\n---\n\n');
      }

      // Step 5: Build conversation context within the same conversation
      let conversationContext = '';
      if (conversationHistory.length > 0) {
        conversationContext = conversationHistory
          .map((msg: any) => `${msg.role === 'user' ? 'Người dùng' : 'Chuyên gia'}: ${msg.content}`)
          .join('\n\n');
      }

      // Step 6: Create system prompt for strategy consultant
      const systemPrompt = `Bạn là chuyên gia tư vấn chiến lược Shopee chuyên nghiệp của công ty, CHỈ tập trung vào các chiến lược nội bộ của công ty.

NGUYÊN TẮC HOẠT ĐỘNG:
1. CHỈ sử dụng kiến thức chiến lược có sẵn trong hệ thống công ty
2. KHÔNG đưa ra kiến thức bên ngoài hoặc tự sáng tạo chiến lược mới
3. Phân tích vấn đề shop/sản phẩm từ thông tin người dùng cung cấp
4. Chẩn đoán tình trạng shop đang gặp phải
5. Đưa ra chiến lược phù hợp từ cơ sở kiến thức có sẵn
6. Tham khảo ngữ cảnh cuộc hội thoại trong cùng conversation để trả lời chính xác
7. KHÔNG sử dụng markdown (**, ###) trong câu trả lời

QUY TRÌNH TƯ VẤN:

A. KHI NGƯỜI DÙNG MÔ TẢ VẤN ĐỀ SHOP/SẢN PHẨM:
1. Phân tích và chẩn đoán:
   - "Dựa trên thông tin bạn cung cấp, tôi phân tích tình trạng shop như sau:"
   - Xác định vấn đề cụ thể dựa trên mô tả
   - Đánh giá mức độ nghiêm trọng và nguyên nhân gốc rễ

2. Đưa ra chiến lược từ cơ sở kiến thức:
   - "Để giải quyết vấn đề này, dựa vào kiến thức chiến lược của công ty, tôi đề xuất áp dụng chiến lược sau:"
   - Trích xuất chiến lược phù hợp từ cơ sở kiến thức
   - Trình bày đầy đủ MỤC ĐÍCH và CÁCH THỰC HIỆN
   - Kết thúc: "Bạn có muốn tôi giải thích chi tiết cách triển khai chiến lược này không?"

B. KHI NGƯỜI DÙNG YÊU CẦU GIẢI THÍCH CHI TIẾT:
- Tham khảo cuộc hội thoại trước trong cùng conversation để biết chiến lược nào được đề xuất
- "Tôi sẽ hướng dẫn chi tiết cách triển khai chiến lược này dựa trên kiến thức của công ty:"
- Chia nhỏ từng bước cụ thể từ CÁCH THỰC HIỆN
- Đưa ra timeline và thứ tự ưu tiên
- Kết thúc: "Bạn có thắc mắc gì về các bước triển khai không?"

C. KHI NGƯỜI DÙNG HỎI VỀ CHIẾN LƯỢC CỤ THỂ:
- Tìm kiếm trong cơ sở kiến thức về chiến lược được hỏi
- Giải thích MỤC ĐÍCH và CÁCH THỰC HIỆN từ kiến thức có sẵn
- Hướng dẫn từng bước thực hiện
- Kết thúc: "Chiến lược này dựa trên kinh nghiệm thành công của công ty. Bạn muốn biết thêm điều gì?"

D. KHI NGƯỜI DÙNG CẦN GIẢI THÍCH KỸ HƠN:
- Tham khảo toàn bộ ngữ cảnh cuộc hội thoại trước trong cùng conversation
- Làm rõ phần người dùng chưa hiểu dựa trên thông tin đã trao đổi trong conversation này
- Kết hợp thông tin từ cuộc hội thoại và cơ sở kiến thức
- Kết thúc: "Như vậy đã rõ chưa? Tôi có thể giải thích thêm phần nào khác."

PHONG CÁCH GIAO TIẾP:
- Chuyên nghiệp, tự tin nhưng thân thiện
- Trực tiếp, tập trung vào giải pháp từ kiến thức công ty
- Luôn có câu mở đầu và kết thúc
- Không sử dụng định dạng markdown
- Nhớ và liên kết với thông tin từ cuộc hội thoại trước trong cùng conversation
- Chỉ sử dụng chiến lược có trong cơ sở kiến thức

${conversationContext ? `\nNGỮ CẢNH CUỘC HỘI THOẠI TRƯỚC ĐÓ (trong cùng conversation):\n${conversationContext}\n` : ''}

CƠ SỞ KIẾN THỨC CHIẾN LƯỢC CÔNG TY:
${context || 'Không tìm thấy chiến lược phù hợp trong cơ sở kiến thức.'}

Hãy phân tích yêu cầu của người dùng dựa trên ngữ cảnh cuộc hội thoại trong conversation này và cơ sở kiến thức có sẵn để đưa ra tư vấn chuyên nghiệp.`;

      // Step 7: Generate response using GPT
      console.log('Generating AI response...');
      
      // Build messages array with conversation history from the same conversation
      const messages = [
        { role: 'system', content: systemPrompt }
      ];
      
      // Add conversation history from the same conversation
      conversationHistory.forEach(msg => {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      });
      
      // Add current user message
      messages.push({ role: 'user', content: message });

      const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: messages,
          temperature: 0.7,
          max_tokens: 3000,
        }),
      });

      if (!chatResponse.ok) {
        const errorText = await chatResponse.text();
        console.error('OpenAI chat error:', errorText);
        throw new Error(`Failed to generate AI response: ${chatResponse.status}`);
      }

      const chatData = await chatResponse.json();
      const aiResponse = chatData.choices[0].message.content;
      const cleanedAiResponse = stripMarkdown(aiResponse); // Apply stripping here

      // Step 8: Save messages to database if conversationId provided
      if (conversationId) {
        console.log('Saving messages to database...');
        
        try {
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
            content: cleanedAiResponse, // Use cleaned response
            metadata: {
              context_used: relevantKnowledge?.slice(0, 3) || [],
              embedding_similarity_scores: relevantKnowledge?.map((k: any) => k.similarity) || [],
              conversation_history_length: conversationHistory.length
            }
          });
        } catch (dbError) {
          console.error('Error saving messages to database:', dbError);
          // Continue even if saving fails
        }
      }

      console.log('Strategy chat response generated successfully');

      return new Response(JSON.stringify({
        response: cleanedAiResponse, // Send cleaned response
        context: relevantKnowledge || [],
        contextUsed: relevantKnowledge?.length || 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (embeddingError) {
      console.error('Error in embedding/search process:', embeddingError);
      
      // Fallback response when embedding fails
      const fallbackResponse = 'Xin lỗi, hiện tại hệ thống đang gặp sự cố kỹ thuật trong việc tìm kiếm chiến lược phù hợp. Tôi vẫn có thể tư vấn dựa trên kinh nghiệm chung, nhưng để có được lời khuyên chính xác nhất từ cơ sở kiến thức của công ty, vui lòng thử lại sau ít phút.';
      
      return new Response(JSON.stringify({
        response: fallbackResponse,
        context: [],
        contextUsed: 0,
        error: 'embedding_search_failed'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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