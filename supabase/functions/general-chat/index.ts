import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
    if (!perplexityApiKey) {
      console.error('Perplexity API key not configured');
      throw new Error('Perplexity API key not configured');
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase configuration missing');
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { message, conversationId } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    console.log('Processing general chat message:', message);

    // Step 1: Get conversation history within the same conversationId
    let conversationHistory: any[] = [];
    if (conversationId) {
      try {
        const { data: historyData, error: historyError } = await supabase
          .from('general_chat_messages')
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

    // Step 2: Create system prompt for general chatbot
    const systemPrompt = `Bạn là một trợ lý AI hữu ích, thân thiện và sáng tạo. Bạn có thể trả lời các câu hỏi về mọi chủ đề, cung cấp thông tin, giải thích khái niệm, và hỗ trợ người dùng trong nhiều lĩnh vực.
    
    NGUYÊN TẮC HOẠT ĐỘNG:
    1. Trả lời trực tiếp, rõ ràng và dễ hiểu.
    2. Cung cấp thông tin chính xác và khách quan.
    3. Luôn giữ thái độ tích cực và sẵn lòng giúp đỡ.
    4. Không sử dụng markdown (**, ###) trong câu trả lời.
    5. Nhớ thông tin từ cuộc hội thoại trước để trả lời chính xác và mạch lạc.
    6. Luôn có câu mở đầu và kết thúc phù hợp.

    CÁCH XỬ LÝ YÊU CẦU:

    A. KHI NGƯỜI DÙNG HỎI CÂU HỎI CHUNG:
    - Thêm câu mở đầu: "Chào bạn! Tôi có thể giúp gì cho bạn hôm nay?" hoặc "Chào bạn! Dưới đây là thông tin tôi tìm được:"
    - Trả lời trực tiếp câu hỏi của người dùng.
    - Kết thúc: "Bạn có muốn tìm hiểu thêm về chủ đề này không?" hoặc "Bạn có câu hỏi nào khác không?"

    B. KHI NGƯỜI DÙNG CẦN GIẢI THÍCH KHÁI NIỆM:
    - Thêm câu mở đầu: "Để giúp bạn hiểu rõ hơn, tôi sẽ giải thích về [khái niệm]:"
    - Giải thích khái niệm một cách chi tiết, dễ hiểu, có thể kèm ví dụ.
    - Kết thúc: "Bạn có muốn tôi làm rõ thêm phần nào không?"

    C. KHI NGƯỜI DÙNG CUNG CẤP THÔNG TIN CHƯA ĐỦ:
    - Hỏi thông tin còn thiếu một cách ngắn gọn và lịch sự.
    - Không đưa ra kết quả chưa hoàn chỉnh.
    - Kết thúc: "Để tôi có thể hỗ trợ tốt nhất, bạn vui lòng cung cấp thêm thông tin nhé."

    D. KHI NGƯỜI DÙNG HỎI CÁC CÂU HỎI KHÁC:
    - Thêm câu mở đầu: "Tôi có thể chia sẻ với bạn rằng:"
    - Trả lời dựa trên kiến thức có sẵn và ngữ cảnh cuộc hội thoại.
    - Đưa ra lời khuyên cụ thể nếu phù hợp.
    - Kết thúc: "Tôi có thể hỗ trợ bạn thêm điều gì nữa không?"

    PHONG CÁCH GIAO TIẾP:
    - Chuyên nghiệp, tự tin nhưng thân thiện.
    - Trực tiếp, không dài dòng.
    - Luôn có câu mở đầu và kết thúc.
    - Không sử dụng định dạng markdown.
    - Nhớ và liên kết với thông tin từ cuộc hội thoại trước trong cùng conversation.

    ${conversationHistory.length > 0 ? `\nNGỮ CẢNH CUỘC HỘI THOẠI TRƯỚC ĐÓ (trong cùng conversation):\n${conversationHistory.map((msg: any) => `${msg.role === 'user' ? 'Người dùng' : 'Trợ lý'}: ${msg.content}`).join('\n\n')}\n` : ''}

    Hãy phân tích yêu cầu của người dùng dựa trên ngữ cảnh cuộc hội thoại trong conversation này và đưa ra tư vấn chuyên nghiệp.`;

    // Step 3: Build messages array for Perplexity API
    const messages = [
      { role: 'system', content: systemPrompt }
    ];
    
    // Add conversation history
    conversationHistory.forEach((msg: any) => {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant', // Perplexity expects 'user' or 'assistant'
        content: msg.content
      });
    });
    
    // Add current user message
    messages.push({ role: 'user', content: message });

    // Step 4: Generate response using Perplexity API
    console.log('Generating AI response with Perplexity...');
    
    const chatResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3-sonar-small-32k-online', // Using a general-purpose model
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000, // Adjust as needed for general answers
      }),
    });

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text();
      console.error('Perplexity API error:', errorText);
      throw new Error(`Failed to generate AI response from Perplexity: ${chatResponse.status}`);
    }

    const chatData = await chatResponse.json();
    const aiResponse = chatData.choices[0].message.content;
    const cleanedAiResponse = stripMarkdown(aiResponse); // Apply stripping here

    // Step 5: Save messages to database if conversationId provided
    if (conversationId) {
      console.log('Saving messages to database...');
      
      try {
        // Save user message
        await supabase.from('general_chat_messages').insert({
          conversation_id: conversationId,
          role: 'user',
          content: message
        });

        // Save AI response
        await supabase.from('general_chat_messages').insert({
          conversation_id: conversationId,
          role: 'assistant',
          content: cleanedAiResponse, // Use cleaned response
          metadata: {
            model: 'llama-3-sonar-small-32k-online',
            conversation_history_length: conversationHistory.length
          }
        });
      } catch (dbError) {
        console.error('Error saving messages to database:', dbError);
        // Continue even if saving fails
      }
    }

    console.log('General chat response generated successfully');

    return new Response(JSON.stringify({
      response: cleanedAiResponse, // Send cleaned response
      context: [], // No external context for general chat
      contextUsed: 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in general-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: 'Xin lỗi, đã có lỗi xảy ra khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});