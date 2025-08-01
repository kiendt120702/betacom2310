// @ts-ignore
/// <reference lib="deno.ns" />
// @ts-ignore
import "https://deno.land/x/xhr@0.1.0/mod.ts";
// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

// @ts-ignore
const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
// @ts-ignore
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
// @ts-ignore
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { keyword, productInfo, brand = "" } = await req.json();

    if (!keyword || !productInfo) {
      return new Response(
        JSON.stringify({ error: "Thiếu từ khóa hoặc thông tin sản phẩm" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key không được cấu hình" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Sanitize inputs
    const cleanedKeyword = keyword.replace(/\s+/g, " ").trim();
    const cleanedProductInfo = productInfo.replace(/\s+/g, " ").trim();
    const cleanedBrand = brand.replace(/\s+/g, " ").trim();

    console.log("Processing SEO title generation for:", cleanedKeyword);

    // Step 1: Tạo query string để tìm kiếm kiến thức liên quan
    const searchQuery =
      `tạo tên sản phẩm SEO ${cleanedKeyword} ${cleanedProductInfo} ${cleanedBrand}`.trim();

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
      },
    );

    if (!embeddingResponse.ok) {
      throw new Error("Failed to generate embedding");
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
      },
    );

    if (searchError) {
      console.error("Error searching SEO knowledge:", searchError);
      throw searchError;
    }

    console.log(
      `Found ${relevantKnowledge?.length || 0} relevant knowledge items`,
    );

    // Step 4: Xây dựng context từ kiến thức được truy xuất
    let knowledgeContext = "";
    if (relevantKnowledge && relevantKnowledge.length > 0) {
      knowledgeContext = relevantKnowledge
        .map(
          (item: any) =>
            `${item.content} (Độ liên quan: ${(item.similarity * 100).toFixed(
              1,
            )}%)`,
        )
        .join("\n\n---\n\n");
    }

    // Step 5: System prompt được tinh chỉnh với RAG
    const systemPrompt = `# SHOPEE SEO PRODUCT TITLE GENERATOR

Bạn là AI chuyên gia SEO tên sản phẩm Shopee. Nhiệm vụ của bạn là tạo ra tên sản phẩm chuẩn SEO dựa trên thông tin người dùng cung cấp và KIẾN THỨC CHUYÊN MÔN được truy xuất từ cơ sở dữ liệu nội bộ.

## NGUYÊN TẮC CỐT LÕI
- **TỪ KHÓA CHÍNH LUÔN LUÔN ĐỨNG ĐẦU:** Từ khóa chính người dùng cung cấp có dung lượng tìm kiếm cao, PHẢI đặt ở vị trí đầu tiên của tên sản phẩm
- Độ dài tối ưu: 80-100 ký tự
- Sắp xếp các từ khóa phụ theo lượng tìm kiếm giảm dần
- Tránh lặp từ và nhồi nhét từ khóa
- Đảm bảo tự nhiên, dễ đọc
- Phù hợp với thuật toán Shopee
- **Đảm bảo 3 phiên bản tên sản phẩm phải khác biệt rõ ràng về chiến lược từ khóa và cách diễn đạt.**

## KIẾN THỨC CHUYÊN MÔN ĐƯỢC TRUY XUẤT
${knowledgeContext || "Không tìm thấy kiến thức liên quan cụ thể. Sử dụng nguyên tắc SEO cơ bản."}

## CẤU TRÚC RESPONSE CỐ ĐỊNH

🎯 PHÂN TÍCH SẢN PHẨM

Từ khóa chính: [liệt kê 3-5 từ khóa quan trọng nhất]
Điểm nổi bật: [2-3 đặc điểm chính của sản phẩm]
Ngành hàng: [phân loại ngành hàng]
Độ cạnh tranh: [Thấp/Trung bình/Cao]

⭐ ĐỀ XUẤT TÊN SẢN PHẨM SEO

Phiên bản 1 (Tối ưu Traffic - Tập trung từ khóa rộng, phổ biến):
[TỪ KHÓA CHÍNH + các từ khóa phụ có dung lượng tìm kiếm cao, mô tả chung về sản phẩm]
Độ dài: [X] ký tự
Lý do: [giải thích ngắn gọn tại sao phiên bản này tốt cho traffic, nhấn mạnh độ phủ từ khóa]

Phiên bản 2 (Tối ưu Conversion - Tập trung lợi ích, điểm mạnh, từ khóa ngách):
[TỪ KHÓA CHÍNH + lợi ích nổi bật, tính năng độc đáo, từ khóa ngách có tỷ lệ chuyển đổi cao]
Độ dài: [X] ký tự
Lý do: [giải thích ngắn gọn tại sao phiên bản này tốt cho conversion, nhấn mạnh sự hấp dẫn và thuyết phục]

Phiên bản 3 (Cân bằng - Kết hợp traffic và conversion):
[TỪ KHÓA CHÍNH + sự kết hợp hài hòa giữa từ khóa phổ biến và lợi ích/điểm mạnh]
Độ dài: [X] ký tự
Lý do: [giải thích ngắn gọn tại sao phiên bản này cân bằng, nhấn mạnh sự tối ưu toàn diện]

🔥 KHUYẾN NGHỊ

Nên chọn: Phiên bản [số] vì [lý do cụ thể cho ngành hàng và sản phẩm này]
Từ khóa bổ sung: [gợi ý 2-3 từ khóa có thể thêm vào mô tả sản phẩm]
Tips tối ưu: [lời khuyên cụ thể dựa trên kiến thức được truy xuất]

## HẠN CHẾ VÀ LƯU Ý

### TUYỆT ĐỐI KHÔNG được:
- Đặt từ khóa chính ở vị trí khác ngoài đầu tên sản phẩm
- Tạo tên sản phẩm quá 120 ký tự
- Sử dụng ký tự đặc biệt phức tạp
- Nhồi nhét từ khóa không liên quan
- Spam từ khóa cùng nghĩa liên tiếp

### LUÔN đảm bảo:
- **TỪ KHÓA CHÍNH ĐỨNG ĐẦU TUYỆT ĐỐI:** Bắt đầu tên sản phẩm bằng từ khóa chính người dùng cung cấp
- Tên sản phẩm đọc tự nhiên, không cứng nhắc
- Chứa đủ thông tin quan trọng nhất
- Phù hợp với target audience
- Có tính thuyết phục cao
- Dễ hiểu, dễ nhớ
- Tuân thủ CHÍNH XÁC kiến thức chuyên môn được cung cấp

**LƯU Ý QUAN TRỌNG:** Từ khóa chính người dùng cung cấp có dung lượng tìm kiếm cao, do đó PHẢI được đặt ở vị trí đầu tiên để tối ưu hóa khả năng hiển thị trên Shopee.

Hãy tuân thủ CHÍNH XÁC cấu trúc response trên và ưu tiên sử dụng KIẾN THỨC CHUYÊN MÔN ĐƯỢC TRUY XUẤT để tạo ra tên sản phẩm chất lượng cao nhất.`;

    // Step 6: Tạo user prompt
    const userPrompt = `Từ khóa chính: ${cleanedKeyword}
Thông tin sản phẩm: ${cleanedProductInfo}
${cleanedBrand ? `Thương hiệu: ${cleanedBrand}` : ""}

Hãy phân tích và tạo tên sản phẩm SEO theo đúng cấu trúc response đã định, ưu tiên sử dụng kiến thức chuyên môn được truy xuất.`;

    // Step 7: Gọi OpenAI API
    console.log("Calling OpenAI API...");
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
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
        },
      );
    }

    // Step 8: Parse response để trích xuất 3 tên sản phẩm
    const titles = [];
    const lines = aiResponse.split("\n");

    // Tìm các phiên bản trong cấu trúc response
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Tìm dòng bắt đầu với "Phiên bản" hoặc chứa tên sản phẩm
      if (line.match(/^Phiên bản \d+/)) {
        // Dòng tiếp theo thường chứa tên sản phẩm
        if (i + 1 < lines.length) {
          const titleLine = lines[i + 1].trim();
          if (
            titleLine &&
            titleLine.length >= 50 &&
            titleLine.length <= 120 &&
            !titleLine.includes("Độ dài:") &&
            !titleLine.includes("Lý do:")
          ) {
            titles.push(titleLine);
          }
        }
      }
    }

    // Fallback: tìm các dòng có độ dài phù hợp
    if (titles.length === 0) {
      for (const line of lines) {
        const cleanLine = line.trim();
        if (
          cleanLine.length >= 50 &&
          cleanLine.length <= 120 &&
          !cleanLine.includes(":") &&
          !cleanLine.includes("🎯") &&
          !cleanLine.includes("⭐") &&
          !cleanLine.includes("🔥") &&
          !cleanLine.includes("Phiên bản") &&
          !cleanLine.includes("Độ dài") &&
          !cleanLine.includes("Lý do") &&
          !cleanLine.includes("Nên chọn")
        ) {
          titles.push(cleanLine);
          if (titles.length >= 3) break;
        }
      }
    }

    // Đảm bảo có ít nhất 1 title
    if (titles.length === 0) {
      // Tạo title đơn giản từ input
      const fallbackTitle = `${cleanedKeyword} ${
        cleanedBrand ? cleanedBrand + " " : ""
      }${cleanedProductInfo.substring(0, 50)}`.substring(0, 100);
      titles.push(fallbackTitle);
    }

    console.log(`Generated ${titles.length} product titles successfully`);

    return new Response(
      JSON.stringify({
        titles: titles.slice(0, 3),
        raw_response: aiResponse,
        knowledge_used: relevantKnowledge?.length || 0,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Lỗi server nội bộ" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
