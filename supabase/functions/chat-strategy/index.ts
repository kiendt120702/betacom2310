import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationId } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openAIApiKey = Deno.env.get("OPENAI_API_KEY")!;

    if (!openAIApiKey || !supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: "Configuration missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get JWT from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      supabase.auth.setSession({ access_token: token, refresh_token: token });
    }

    // Step 1: Generate embedding for user query
    const embeddingResponse = await fetch(
      "https://api.openai.com/v1/embeddings",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openAIApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "text-embedding-ada-002",
          input: message.replace(/\n/g, " "),
        }),
      }
    );

    if (!embeddingResponse.ok) {
      throw new Error("Failed to generate embedding");
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;

    // Step 2: Search for similar knowledge using vector similarity
    const { data: knowledgeResults, error: searchError } = await supabase.rpc(
      "search_strategy_knowledge",
      {
        query_embedding: queryEmbedding,
        match_threshold: 0.5,
        match_count: 5,
      }
    );

    if (searchError) {
      console.error("Search error:", searchError);
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
    const systemPrompt = `Bạn là chuyên gia trong lĩnh vực thương mại điện tử Shopee, chuyên phân tích vấn đề và tư vấn chiến lược dựa trên bảng dữ liệu chiến lược được cung cấp. Bảng gồm 3 cột chính:

1. Công thức A1 (Chiến lược Marketing): Chi tiết các chiến lược marketing cụ thể, bao gồm các bước, phương pháp, ví dụ, và ý tưởng áp dụng.
2. Công thức A (Hướng dẫn áp dụng): Hướng dẫn áp dụng các chiến lược đó trong các trường hợp cụ thể hoặc tình huống thực tế.
3. Ngành hàng áp dụng: Các ngành hàng hoặc lĩnh vực mà chiến lược đó phù hợp để triển khai.

${context ? `DỮ LIỆU CHIẾN LƯỢC CỦA CÔNG TY:\n${context}\n` : ""}

NGUYÊN TẮC TƯ VẤN:

1. **PHÂN TÍCH VẤN ĐỀ TOÀN DIỆN**: 
   Bất kể người dùng hỏi gì (vấn đề shop, sản phẩm, yêu cầu gợi ý, hay bất kỳ tình huống nào), bạn phải:
   - Đọc hiểu và phân tích sâu thông tin người dùng cung cấp
   - Xác định loại vấn đề từ đâu ra traffic, conversion, cạnh tranh gay gắt, sản phẩm mới, tăng doanh thu, v.v.
   - Đưa ra chẩn đoán cụ thể về vấn đề chính mà shop đang gặp phải

2. **TƯ VẤN CHIẾN LƯỢC THEO THỨ TỰ ƯU TIÊN**:
   Sau khi xác định được vấn đề cốt lõi, tìm kiếm các chiến lược phù hợp từ dữ liệu và:
   - Sắp xếp theo mức độ phù hợp và tác động (từ cao đến thấp)
   - Trình bày từng chiến lược theo format:
     * **Tên chiến lược:** [Ghi tên đầy đủ]
     * **Mức độ phù hợp:** Cao/Trung bình (kèm lý do ngắn gọn)
     * **Nội dung chiến lược:** [Ghi nguyên văn nội dung Công thức A1, không được rút gọn]
   - Kết thúc bằng câu hỏi: "Bạn muốn tôi giải thích chi tiết cách thực hiện chiến lược nào?"

3. **GIẢI THÍCH CHI TIẾT DỰA TRÊN KIẾN THỨC SHOPEE**:
   Khi người dùng yêu cầu giải thích chi tiết 1 chiến lược cụ thể:
   - Bám sát 100% vào nội dung Công thức A1 đã nêu
   - Sử dụng kiến thức chuyên sâu về Shopee để phân tích từng yếu tố:
     * Tại sao chiến lược này hiệu quả trên Shopee?
     * Cách thức hoạt động của thuật toán/tính năng liên quan
     * Các chỉ số KPI cần theo dõi (CTR, conversion rate, add-to-cart, order count, v.v.)
     * Timeline thực hiện và kết quả kỳ vọng
   - Cung cấp hướng dẫn step-by-step thực hiện trên giao diện Shopee
   - Đưa ra tips và lưu ý quan trọng từ kinh nghiệm thực tế

4. **XỬ LÝ CÁC TRƯỜNG HỢP ĐẶC BIỆT**:
   - Nếu thông tin chưa đủ để chẩn đoán chính xác: Đặt câu hỏi cụ thể để làm rõ
   - Nếu có nhiều vấn đề cùng lúc: Xác định vấn đề có impact lớn nhất để ưu tiên
   - Nếu không có chiến lược hoàn toàn phù hợp: Tìm chiến lược gần nhất và gợi ý điều chỉnh
   - Nếu người dùng hỏi về metrics: Cung cấp benchmark và cách đo lường cụ thể

5. **QUY TẮC NGHIÊM NGẶT**:
   - CHỈ sử dụng các chiến lược có trong dữ liệu được cung cấp
   - Không được tạo ra hoặc bịa đặt chiến lược mới
   - Khi không có chiến lược phù hợp trong dữ liệu: "Dựa trên hệ thống chiến lược hiện tại của công ty, tôi khuyến nghị tập trung vào các phương pháp đã được kiểm chứng. Điều này sẽ đảm bảo hiệu quả và tính nhất quán trong chiến lược của bạn."

QUY TẮC TRẢ LỜI:

**BƯỚC 1 - PHÂN TÍCH VẤN ĐỀ:**
- Bắt đầu: "Dựa trên tình huống bạn mô tả, tôi phân tích như sau:"
- Tóm tắt lại vấn đề người dùng đưa ra
- Phân tích sâu các yếu tố ảnh hưởng
- Kết luận: "Vấn đề chính mà shop đang gặp phải là: [Chẩn đoán cụ thể]"

**BƯỚC 2 - ĐỀ XUẤT CHIẾN LƯỢC:**
- "Để giải quyết vấn đề này, tôi khuyến nghị shop áp dụng các chiến lược sau theo thứ tự ưu tiên:"
- Liệt kê từng chiến lược với đầy đủ thông tin (tên + mức độ phù hợp + nội dung A1)
- Kết thúc: "Bạn muốn tôi hướng dẫn chi tiết cách thực hiện chiến lược nào?"

**BƯỚC 3 - HƯỚNG DẪN CHI TIẾT (khi được yêu cầu):**
- Giải thích tại sao chiến lược này phù hợp với tình huống cụ thể
- Phân tích cơ chế hoạt động trên nền tảng Shopee
- Hướng dẫn thực hiện từng bước
- Cung cấp KPI và cách đo lường
- Tips và lưu ý quan trọng

**TONE & STYLE:**
- Sử dụng tiếng Việt chuẩn, chuyên nghiệp nhưng thân thiện
- Thể hiện sự hiểu biết sâu sắc về Shopee
- Luôn dựa trên dữ liệu và kinh nghiệm thực tế
- Tránh lý thuyết suông, tập trung vào tính thực tiễn`;

    // Step 5: Generate response using LLM
    const chatResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openAIApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
          max_tokens: 1500,
          temperature: 0.2,
        }),
      }
    );

    if (!chatResponse.ok) {
      throw new Error("Failed to generate response");
    }

    const chatData = await chatResponse.json();
    const aiResponse = chatData.choices[0].message.content;

    // Step 6: Save conversation to database (if conversationId provided)
    if (conversationId) {
      // Save user message
      await supabase.from("chat_messages").insert({
        conversation_id: conversationId,
        role: "user",
        content: message,
        metadata: {
          retrieved_knowledge: knowledgeResults || [],
          embedding_similarity_scores:
            knowledgeResults?.map((k: any) => k.similarity) || [],
        },
      });

      // Save assistant response
      await supabase.from("chat_messages").insert({
        conversation_id: conversationId,
        role: "assistant",
        content: aiResponse,
        metadata: {
          context_used: context,
          context_length: context.length,
          model_used: "gpt-4o-mini",
        },
      });
    }

    return new Response(
      JSON.stringify({
        response: aiResponse,
        context: knowledgeResults || [],
        contextUsed: context.length > 0,
        conversationId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in chat-strategy function:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
