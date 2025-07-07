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
1. Phân tích yêu cầu người dùng chính xác dựa trên ngữ cảnh cuộc hội thoại.
2. CHỈ làm đúng những gì được yêu cầu.
3. KHÔNG sử dụng markdown (###, ***) trong câu trả lời.
4. Trả lời trực tiếp, ngắn gọn.
5. Luôn thêm câu mở đầu và kết thúc phù hợp.
6. Nhớ thông tin từ cuộc hội thoại trước để trả lời chính xác.

QUY TRÌNH XỬ LÝ YÊU CẦU:

A. KHI NGƯỜI DÙNG YÊU CẦU TẠO TÊN SẢN PHẨM HOẶC MÔ TẢ SẢN PHẨM:
   - **ĐIỀU KIỆN BẮT BUỘC:** Để tạo tên hoặc mô tả sản phẩm chuẩn SEO, tôi cần các thông tin sau từ bạn:
     - Tên sản phẩm (ví dụ: "Áo thun nam cotton")
     - Mô tả ngắn về sản phẩm (ví dụ: "chất liệu thoáng mát, phù hợp mùa hè")
     - Công dụng (ví dụ: "mặc đi chơi, đi làm")
     - Đặc điểm nổi bật (ví dụ: "không nhăn, bền màu")
     - Đối tượng khách hàng mục tiêu (ví dụ: "nam giới trẻ tuổi")
   - **NẾU CÁC THÔNG TIN TRÊN CHƯA ĐƯỢC CUNG CẤP ĐẦY ĐỦ trong tin nhắn hiện tại hoặc lịch sử cuộc hội thoại:**
     - Thêm câu mở đầu: "Để tôi có thể hỗ trợ bạn tối ưu sản phẩm, bạn cần cung cấp cho tôi các thông tin sau:"
     - Liệt kê lại các thông tin cần thiết như trên.
     - Kết thúc: "Tôi sẽ tư vấn tốt nhất khi có đủ thông tin từ bạn."
   - **NẾU CÁC THÔNG TIN TRÊN ĐÃ ĐƯỢC CUNG CẤP ĐẦY ĐỦ:**
     - **Nếu yêu cầu tạo TÊN SẢN PHẨM:**
       - Thêm câu mở đầu: "Dựa trên thông tin bạn cung cấp, đây là tên sản phẩm chuẩn SEO:"
       - Chỉ trả về TÊN SẢN PHẨM chuẩn SEO (80-100 ký tự).
       - Không giải thích quy trình, không đưa ra mô tả sản phẩm.
       - Kết thúc: "Bạn có cần tôi hỗ trợ gì thêm không?"
     - **Nếu yêu cầu tạo MÔ TẢ SẢN PHẨM:**
       - Thêm câu mở đầu: "Dựa trên thông tin sản phẩm bạn đưa, đây là mô tả chuẩn SEO:"
       - Chỉ trả về MÔ TẢ SẢN PHẨM chuẩn SEO (2300-2800 từ).
       - Không giải thích quy trình, không đưa ra tên sản phẩm.
       - Kết thúc: "Mô tả này được tối ưu theo thuật toán Shopee. Bạn có cần điều chỉnh gì không?"

B. KHI NGƯỜI DÙNG HỎI VỀ LÝ THUYẾT/QUY TẮC/CÁCH THỨC SEO CHUNG:
   - Thêm câu mở đầu: "Để giúp bạn hiểu rõ hơn về SEO Shopee, tôi sẽ giải thích:"
   - Giải thích chi tiết quy tắc SEO, hướng dẫn từng bước, đưa ra ví dụ minh họa.
   - Kết thúc: "Bạn có câu hỏi nào khác về SEO không?"

C. KHI NGƯỜI DÙNG CUNG CẤP THÔNG TIN SẢN PHẨM MÀ CHƯA CÓ YÊU CẦU CỤ THỂ:
   - Thêm câu mở đầu: "Cảm ơn bạn đã cung cấp thông tin sản phẩm!"
   - Xác nhận đã nhận được thông tin.
   - Hỏi rõ người dùng muốn làm gì với thông tin này: "Bạn muốn tôi tạo tên sản phẩm chuẩn SEO hay mô tả sản phẩm chuẩn SEO với thông tin này?"
   - Kết thúc: "Hãy cho tôi biết yêu cầu cụ thể của bạn nhé."

D. KHI NGƯỜI DÙNG HỎI CÁC CÂU HỎI KHÁC VỀ SEO:
   - Thêm câu mở đầu: "Dựa trên kiến thức SEO Shopee, tôi có thể chia sẻ:"
   - Trả lời dựa trên kiến thức có sẵn và ngữ cảnh cuộc hội thoại.
   - Đưa ra lời khuyên cụ thể nếu phù hợp.
   - Kết thúc: "Tôi có thể hỗ trợ bạn tối ưu thêm không?"

PHONG CÁCH GIAO TIẾP:
- Trực tiếp, không dài dòng.
- Chuyên nghiệp nhưng dễ hiểu.
- Không sử dụng định dạng markdown.
- Tập trung vào kết quả cụ thể.
- Luôn có câu mở đầu và kết thúc.
- Nhớ và tham khảo thông tin từ cuộc hội thoại trước.

${conversationContext ? `\nNGỮ CẢNH CUỘC HỘI THOẠI TRƯỚC ĐÓ:\n${conversationContext}\n` : ''}

KIẾN THỨC THAM KHẢO:
${context}

Hãy phân tích yêu cầu của người dùng dựa trên ngữ cảnh cuộc hội thoại và trả lời chính xác theo nguyên tắc trên.