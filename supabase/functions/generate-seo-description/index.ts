import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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
    const { product_name, keywords, product_description_raw } = await req.json();

    if (!keywords || !product_description_raw) {
      return new Response(
        JSON.stringify({ error: "Từ khóa và mô tả sản phẩm là bắt buộc" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key không được cấu hình" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Sanitize inputs
    const cleanedKeywords = keywords.replace(/\s+/g, " ").trim();
    const cleanedProductDescription = product_description_raw.replace(/\s+/g, " ").trim();
    const cleanedProductName = product_name ? product_name.replace(/\s+/g, " ").trim() : '';

    console.log("Processing SEO description generation for:", cleanedProductName || 'Unnamed Product');

    // Step 1: Tạo query string để tìm kiếm kiến thức liên quan
    const searchQuery =
      `tối ưu mô tả sản phẩm Shopee với từ khóa: ${cleanedKeywords} và thông tin: ${cleanedProductDescription} ${cleanedProductName}`.trim();

    // Step 2: Tạo embedding cho query
    console.log("Generating embedding for search query...");
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
          input: searchQuery,
        }),
      }
    );

    if (!embeddingResponse.ok) {
      throw new Error("Failed to generate embedding for search query");
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;

    // Step 3: Tìm kiếm kiến thức liên quan từ seo_knowledge
    console.log("Searching for relevant SEO knowledge...");
    const { data: relevantKnowledge, error: searchError } = await supabase.rpc(
      "search_seo_knowledge",
      {
        query_embedding: queryEmbedding,
        match_threshold: 0.7,
        match_count: 5,
      }
    );

    if (searchError) {
      console.error("Error searching SEO knowledge:", searchError);
      throw searchError;
    }

    console.log(
      `Found ${relevantKnowledge?.length || 0} relevant knowledge items`
    );

    // Step 4: Xây dựng context từ kiến thức được truy xuất
    let knowledgeContext = "";
    if (relevantKnowledge && relevantKnowledge.length > 0) {
      knowledgeContext = relevantKnowledge
        .map(
          (item: any) =>
            `${item.content} (Độ liên quan: ${(item.similarity * 100).toFixed(
              1
            )}%)`
        )
        .join("\n\n---\n\n");
    }

    // Step 5: System prompt được tinh chỉnh với RAG
    const systemPrompt = `# SHOPEE SEO PRODUCT DESCRIPTION GENERATOR

Bạn là AI chuyên gia SEO mô tả sản phẩm Shopee. Nhiệm vụ của bạn là tạo ra mô tả sản phẩm chuẩn SEO dựa trên thông tin người dùng cung cấp và KIẾN THỨC CHUYÊN MÔN được truy xuất từ cơ sở dữ liệu nội bộ.

## NGUYÊN TẮC CỐT LÕI
- **TÍCH HỢP TỪ KHÓA TỰ NHIÊN:** Các từ khóa chính và phụ phải được lồng ghép một cách khéo léo, tự nhiên vào mô tả, tránh nhồi nhét.
- **NHẤN MẠNH LỢI ÍCH VÀ ĐẶC ĐIỂM:** Tập trung vào lợi ích sản phẩm mang lại cho khách hàng và các đặc điểm nổi bật.
- **CẤU TRÚC RÕ RÀNG:** Sử dụng gạch đầu dòng, số thứ tự, và các đoạn văn ngắn để mô tả dễ đọc.
- **ĐỘ DÀI TỐI ƯU:** Mô tả nên đủ dài để cung cấp thông tin đầy đủ (khoảng 1500-2500 ký tự) nhưng không quá dài gây nhàm chán.
- **KÊU GỌI HÀNH ĐỘNG (CTA):** Khuyến khích khách hàng mua hàng hoặc tìm hiểu thêm.
- **TUÂN THỦ CHÍNH SÁCH SHOPEE:** Tuyệt đối không chứa thông tin liên hệ ngoài Shopee (số điện thoại, Zalo, website) hoặc kêu gọi giao dịch ngoài sàn.

## KIẾN THỨC CHUYÊN MÔN ĐƯỢC TRUY XUẤT
${knowledgeContext || 'Không tìm thấy kiến thức liên quan cụ thể. Sử dụng nguyên tắc SEO mô tả sản phẩm cơ bản.'}

## CẤU TRÚC MÔ TẢ SẢN PHẨM ĐỀ XUẤT

🎯 **Tên sản phẩm (Đã tối ưu từ tên sản phẩm)**
[Tên sản phẩm đã được tối ưu SEO]

📝 **Giới thiệu sản phẩm**
[Đoạn văn ngắn giới thiệu tổng quan về sản phẩm, nhấn mạnh lợi ích chính và giải quyết vấn đề của khách hàng. Tích hợp từ khóa chính ở đầu.]

✨ **Đặc điểm nổi bật**
[Sử dụng gạch đầu dòng để liệt kê các đặc điểm độc đáo, tính năng vượt trội của sản phẩm. Mỗi đặc điểm nên có một từ khóa liên quan.]
- [Đặc điểm 1]: [Mô tả chi tiết đặc điểm, tích hợp từ khóa]
- [Đặc điểm 2]: [Mô tả chi tiết đặc điểm, tích hợp từ khóa]
- ...

⚙️ **Thông số kỹ thuật**
[Liệt kê các thông số kỹ thuật quan trọng (kích thước, trọng lượng, chất liệu, màu sắc, dung tích, v.v.).]
- Kích thước: ...
- Chất liệu: ...
- Màu sắc: ...
- ...

💡 **Hướng dẫn sử dụng/Bảo quản**
[Cung cấp hướng dẫn chi tiết để khách hàng sử dụng sản phẩm hiệu quả và bền lâu.]

🛡️ **Chính sách bảo hành/Đổi trả**
[Thông tin về chính sách bảo hành, đổi trả, cam kết từ shop để tăng độ tin cậy.]

#️⃣ **Hashtag liên quan**
[Gợi ý 3-5 hashtag phổ biến và liên quan nhất để tăng khả năng hiển thị.]
#hashtag1 #hashtag2 #hashtag3

## HẠN CHẾ VÀ LƯU Ý

### TUYỆT ĐỐI KHÔNG được:
- Nhồi nhét từ khóa không tự nhiên, làm giảm trải nghiệm đọc.
- Sử dụng thông tin liên lạc ngoài Shopee (số điện thoại, Zalo, website).
- Kêu gọi giao dịch ngoài sàn.
- Sử dụng từ khóa fake/nhái, hoặc nội dung sai lệch.
- Vi phạm bất kỳ chính sách nào của Shopee.

### LUÔN đảm bảo:
- **Tích hợp từ khóa tự nhiên:** Từ khóa phải hòa quyện vào văn phong, không gây khó chịu.
- **Thông tin trung thực, chính xác:** Tất cả thông tin về sản phẩm phải đúng sự thật.
- **Tối ưu cho người đọc và thuật toán:** Mô tả phải dễ hiểu cho khách hàng và được Shopee đánh giá cao.
- **Thuyết phục khách hàng:** Nội dung phải tạo động lực mua hàng.
- **Cung cấp đầy đủ thông tin:** Trả lời các câu hỏi tiềm năng của khách hàng.

Hãy tuân thủ CHÍNH XÁC cấu trúc response trên và ưu tiên sử dụng KIẾN THỨC CHUYÊN MÔN ĐƯỢC TRUY XUẤT để tạo ra mô tả sản phẩm chất lượng cao nhất.`;

    // Step 6: Tạo user prompt
    const userPrompt = `Tên sản phẩm (nếu có): ${cleanedProductName}
Từ khóa mục tiêu: ${cleanedKeywords}
Mô tả sản phẩm thô: ${cleanedProductDescription}

Hãy tạo mô tả sản phẩm SEO cho Shopee theo đúng cấu trúc đã định, tích hợp khéo léo các từ khóa và tận dụng kiến thức chuyên môn được truy xuất.`;

    // Step 7: Gọi OpenAI API
    console.log("Calling OpenAI API for description generation...");
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4", // Or gpt-3.5-turbo depending on desired quality/cost
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000, // Allow for longer descriptions
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI API error:", error);
      return new Response(JSON.stringify({ error: "Lỗi khi gọi OpenAI API" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      return new Response(
        JSON.stringify({ error: "Không nhận được phản hồi từ AI" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Successfully generated SEO description.");

    return new Response(
      JSON.stringify({
        description: aiResponse,
        knowledge_used: relevantKnowledge?.length || 0,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err) {
    console.error("Unexpected error in generate-seo-description function:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Lỗi server nội bộ" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});