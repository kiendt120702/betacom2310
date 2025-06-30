import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
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
    if (!perplexityApiKey) {
      console.error('Perplexity API key not configured');
      throw new Error('Perplexity API key not configured');
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

    console.log('Processing general chat message:', message);

    // Step 1: Get conversation history if conversationId exists
    let conversationHistory: any[] = [];
    if (conversationId) {
      try {
        const { data: historyData, error: historyError } = await supabase
          .from('general_chat_messages') // Use new table
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

    // Step 2: Create system prompt for general Q&A bot
    const systemPrompt = `Bạn là một trợ lý AI hữu ích, có khả năng trả lời mọi câu hỏi và cung cấp thông tin về nhiều chủ đề khác nhau. Hãy trả lời một cách chi tiết, chính xác và thân thiện.
    
    NGUYÊN TẮC HOẠT ĐỘNG:
    1. Trả lời trực tiếp, ngắn gọn, không sử dụng markdown (**, ###) trong câu trả lời.
    2. Luôn thêm câu mở đầu và kết thúc phù hợp.
    3. Nhớ thông tin từ cuộc hội thoại trước để trả lời chính xác.
    4. Nếu không biết câu trả lời, hãy nói rằng bạn không có thông tin về chủ đề đó.
    
    PHONG CÁCH GIAO TIẾP:
    - Chuyên nghiệp, tự tin nhưng thân thiện.
    - Trực tiếp, tập trung vào giải pháp.
    - Luôn có câu mở đầu và kết thúc.
    - Nhớ và liên kết với thông tin từ cuộc hội thoại trước trong cùng conversation.`;

    // Step 3: Build messages array with conversation history
    const messagesForPerplexity = [
      { role: 'system', content: systemPrompt }
    ];
    
    conversationHistory.forEach(msg => {
      messagesForPerplexity.push({
        role: msg.role,
        content: msg.content
      });
    });
    
    messagesForPerplexity.push({ role: 'user', content: message });

    // Step 4: Generate response using Perplexity API
    console.log('Generating AI response using Perplexity...');
    const chatResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3-sonar-large-32k-online', // Using a powerful online model for general Q&A
        messages: messagesForPerplexity,
        temperature: 0.7,
        max_tokens: 2000, 
      }),
    });

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text();
      console.error('Perplexity API error:', errorText);
      throw new Error(`Failed to generate AI response from Perplexity: ${chatResponse.status} - ${errorText}`);
    }

    const chatData = await chatResponse.json();
    const aiResponse = chatData.choices[0].message.content;
    const cleanedAiResponse = stripMarkdown(aiResponse); // Apply stripping here

    // Step 5: Save messages to database if conversationId provided
    if (conversationId) {
      console.log('Saving messages to database...');
      
      try {
        // Save user message
        await supabase.from('general_chat_messages').insert({ // Use new table
          conversation_id: conversationId,
          role: 'user',
          content: message
        });

        // Save AI response
        await supabase.from('general_chat_messages').insert({ // Use new table
          conversation_id: conversationId,
          role: 'assistant',
          content: cleanedAiResponse, // Use cleaned response
          metadata: {
            // No specific context from knowledge base for general chat, but can add other metadata if needed
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