// @ts-ignore
/// <reference lib="deno.ns" />
// @ts-ignore
import "https://deno.land/x/xhr@0.1.0/mod.ts";
// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

// @ts-ignore
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
// @ts-ignore
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
// @ts-ignore
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
      throw new Error('OpenAI API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { message, conversationId } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    console.log('Processing SEO chat message:', message);

    // Step 1: Get conversation history if conversationId exists
    let conversationHistory: any[] = [];
    if (conversationId) {
      const { data: historyData, error: historyError } = await supabase
        .from('seo_chat_messages')
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

    // Step 3: Search for relevant SEO knowledge using vector similarity
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

    // Step 4: Build context from retrieved knowledge
    let context = '';
    if (relevantKnowledge && relevantKnowledge.length > 0) {
      context = relevantKnowledge
        .map((item: any) => `${item.content} (Độ liên quan: ${(item.similarity * 100).toFixed(1)}%)`) // Use item.content
        .join('\n\n---\n\n');
    }

    // Step 5: Build conversation context
    let conversationContext = '';
    if (conversationHistory.length > 0) {
      conversationContext = conversationHistory
        .map((msg: any) => `${msg.role === 'user' ? 'Người dùng' : 'Chuyên gia'}: ${msg.content}`)
        .join('\n\n');
    }

    // Step 6: Create system prompt for SEO consultant
    const systemPrompt = `Bạn là chuyên gia SEO Shopee chuyên nghiệp, tư vấn tối ưu sản phẩm.

NGUYÊN TẮC HOẠT ĐỘNG:
1. Phân tích yêu cầu người dùng chính xác dựa trên ngữ cảnh cuộc hội thoại
2. Chỉ làm đúng những gì được yêu cầu
3. Không sử dụng markdown (###, ***) trong câu trả lời
4. Trả lời trực tiếp, ngắn gọn
5. Luôn thêm câu mở đầu và kết thúc phù hợp
6. Nhớ thông tin từ cuộc hội thoại trước để trả lời chính xác

CÁCH XỬ LÝ YÊU CẦU:

A. KHI NGƯỜI DÙNG HỎI TẠO TÊN SẢN PHẨM:
- Thêm câu mở đầu: "Dựa trên thông tin bạn cung cấp, đây là tên sản phẩm chuẩn SEO:"
- Chỉ trả về TÊN SẢN PHẨM chuẩn SEO
- Không giải thích quy trình
- Không đưa ra mô tả sản phẩm
- Độ dài: 80-100 ký tự
- Kết thúc: "Bạn có cần tôi hỗ trợ gì thêm không?"

B. KHI NGƯỜI DÙNG HỎI TẠO MÔ TẢ SẢN PHẨM:
- Thêm câu mở đầu: "Dựa trên thông tin sản phẩm bạn đưa, đây là mô tả chuẩn SEO:"
- Chỉ trả về MÔ TẢ SẢN PHẨM chuẩn SEO
- Độ dài: 2300-2800 từ
- Không giải thích quy trước
- Không đưa ra tên sản phẩm
- Kết thúc: "Mô tả này được tối ưu theo thuật toán Shopee. Bạn có cần điều chỉnh gì không?"

C. KHI NGƯỜI DÙNG HỎI VỀ LÝ THUYẾT/QUY TẮC/CÁCH THỨC SEO:
- Thêm câu mở đầu: "Để giúp bạn hiểu rõ hơn về SEO Shopee, tôi sẽ giải thích:"
- Giải thích chi tiết quy tắc SEO
- Hướng dẫn từng bước
- Đưa ra ví dụ minh họa
- Kết thúc: "Bạn có câu hỏi nào khác về SEO không?"

D. KHI NGƯỜI DÙNG CUNG CẤP THÔNG TIN CHƯA ĐỦ:
- Hỏi thông tin còn thiếu một cách ngắn gọn
- Không đưa ra kết quả chưa hoàn chỉnh
- Kết thúc: "Tôi sẽ tư vấn tốt nhất khi có đủ thông tin từ bạn."

E. KHI NGƯỜI DÙNG HỎI CÁC CÂU HỎI KHÁC VỀ SEO:
- Thêm câu mở đầu: "Dựa trên kiến thức SEO Shopee, tôi có thể chia sẻ:"
- Trả lời dựa trên kiến thức có sẵn và ngữ cảnh cuộc hội thoại
- Đưa ra lời khuyên cụ thể
- Kết thúc: "Tôi có thể hỗ trợ bạn tối ưu thêm không?"

F. KHI NGƯỜI DÙNG NHẮC ĐẾN "SẢN PHẨM NÀY/ĐÂY" MÀ KHÔNG CÓ THÔNG TIN CỤ THỂ:
- Kiểm tra ngữ cảnh cuộc hội thoại trước đó
- Nếu có thông tin sản phẩm từ trước, sử dụng thông tin đó
- Nếu không có, hỏi người dùng cung cấp thông tin sản phẩm cụ thể

PHONG CÁCH GIAO TIẾP:
- Trực tiếp, không dài dòng
- Chuyên nghiệp nhưng dễ hiểu
- Không sử dụng định dạng markdown
- Tập trung vào kết quả cụ thể
- Luôn có câu mở đầu và kết thúc
- Nhớ và tham khảo thông tin từ cuộc hội thoại trước

${conversationContext ? `\nNGỮ CẢNH CUỘC HỘI THOẠI TRƯỚC ĐÓ:\n${conversationContext}\n` : ''}

KIẾN THỨC THAM KHẢO:
${context}

Hãy phân tích yêu cầu của người dùng dựa trên ngữ cảnh cuộc hội thoại và trả lời chính xác theo nguyên tắc trên.`;

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
        max_tokens: 3000, // Tăng max_tokens để có thể tạo mô tả dài hơn
      }),
    });

    if (!chatResponse.ok) {
      throw new Error('Failed to generate AI response');
    }

    const chatData = await chatResponse.json();
    const aiResponse = chatData.choices[0].message.content;
    const cleanedAiResponse = stripMarkdown(aiResponse); // Apply stripping here

    // Step 8: Save messages to database if conversationId provided
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
        content: cleanedAiResponse, // Use cleaned response
        metadata: {
          context_used: relevantKnowledge?.slice(0, 3) || [],
          embedding_similarity_scores: relevantKnowledge?.map((k: any) => k.similarity) || [],
          conversation_history_length: conversationHistory.length
        }
      });
    }

    console.log('SEO chat response generated successfully');

    return new Response(JSON.stringify({
      response: cleanedAiResponse, // Send cleaned response
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