import "xhr";
import { serve } from "std/http/server.ts";
// import { createClient } from "@supabase/supabase-js"; // Not needed without RAG

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
// const supabaseUrl = Deno.env.get("SUPABASE_URL")!; // Not needed without RAG
// const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!; // Not needed without RAG

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
    const { product_name, keywords, product_description_raw } =
      await req.json();

    if (!keywords || !product_description_raw) {
      return new Response(
        JSON.stringify({ error: "Từ khóa và mô tả sản phẩm là bắt buộc" }),
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

    // const supabase = createClient(supabaseUrl, supabaseServiceKey); // Not needed without RAG

    // Sanitize inputs
    const cleanedKeywords = keywords.replace(/\s+/g, " ").trim();
    const cleanedProductDescription = product_description_raw
      .replace(/\s+/g, " ")
      .trim();
    const cleanedProductName = product_name
      ? product_name.replace(/\s+/g, " ").trim()
      : "";

    console.log(
      "Processing SEO description generation for:",
      cleanedProductName || "Unnamed Product",
    );

    // --- RAG related steps removed ---
    // Step 1: Tạo query string để tìm kiếm kiến thức liên quan
    // Step 2: Tạo embedding cho query
    // Step 3: Tìm kiếm kiến thức liên quan từ seo_knowledge
    // Step 4: Xây dựng context từ kiến thức được truy xuất
    // let knowledgeContext = "";
    // if (relevantKnowledge && relevantKnowledge.length > 0) {
    //   knowledgeContext = relevantKnowledge
    //     .map(
    //       (item: any) =>
    //         `${item.content} (Độ liên quan: ${(item.similarity * 100).toFixed(
    //           1
    //         )}%)`
    //     )
    //     .join("\n\n---\n\n");
    // }
    // --- End RAG related steps removed ---

    // Step 5: System prompt được tinh chỉnh cho việc tích hợp từ khóa SEO
    const systemPrompt = `# SHOPEE SEO DESCRIPTION OPTIMIZER - TÍCH HỢP TỪ KHÓA THÔNG MINH

Bạn là AI chuyên gia tối ưu SEO Shopee. Nhiệm vụ CHÍNH của bạn là **NÂNG CAO mô tả sản phẩm có sẵn** bằng cách tích hợp khéo léo các từ khóa được cung cấp để tăng điểm SEO, giữ nguyên thông tin gốc nhưng cải thiện khả năng tìm kiếm.

## PHƯƯƠNG PHÁP TÍCH HỢP TỪ KHÓA

### 🎯 QUY TRÌNH TỐI ƯU HOÁ:
1. **PHÂN TÍCH mô tả gốc:** Hiểu rõ sản phẩm, tính năng, lợi ích từ mô tả có sẵn
2. **XỬ LÝ từ khóa:** Chia nhỏ danh sách từ khóa thành nhóm (chính/phụ/long-tail)
3. **TÍCH HỢP tự nhiên:** Lồng ghép từ khóa vào các câu có sẵn mà không làm thay đổi ý nghĩa
4. **BỔ SUNG thông tin:** Thêm câu/cụm từ chứa từ khóa quan trọng chưa xuất hiện
5. **TỐI ƯU cấu trúc:** Sắp xếp lại để từ khóa chính xuất hiện ở vị trí quan trọng

### 📍 VỊ TRÍ ĐẶT TỪ KHÓA ƯU TIÊN:
- **Câu đầu tiên:** Từ khóa chính phải xuất hiện trong 50 ký tự đầu
- **Tiêu đề phần:** Tích hợp từ khóa vào các tiêu đề phụ (✨, ⚙️, 💡)
- **Bullet points:** Mỗi điểm nổi bật nên chứa 1-2 từ khóa phụ
- **Kết thúc:** Nhắc lại từ khóa chính trong kêu gọi hành động

### 🔧 KỸ THUẬT TÍCH HỢP:

**✅ ĐÚNG CÁCH:**
- "Áo thun nam cao cấp với chất liệu cotton 100%" (tự nhiên)
- "Thiết kế áo phông trẻ trung, phù hợp cho nam giới mọi lứa tuổi" (mở rộng ngữ cảnh)
- "Áo cổ tròn basic dễ phối đồ, thích hợp mặc hàng ngày" (long-tail keyword)

**❌ SAI CÁCH:**
- "Áo thun nam áo phông nam áo cotton nam" (nhồi nhét)
- "Sản phẩm áo thun nam chất lượng áo thun nam giá rẻ" (lặp từ khóa)

## CẤU TRÚC OUTPUT TỐI ƯU:

🎯 **[TÊN SẢN PHẨM CÓ TỪ KHÓA CHÍNH]**

📝 **Mô tả tổng quan**
[Câu mở đầu hấp dẫn có chứa từ khóa chính + 2-3 từ khóa phụ được tích hợp tự nhiên. Giải thích lợi ích cốt lõi.]

✨ **Đặc điểm nổi bật** 
• [Đặc điểm 1 + từ khóa]: [Mô tả chi tiết tích hợp từ khóa liên quan]
• [Đặc điểm 2 + từ khóa]: [Mô tả chi tiết tích hợp từ khóa liên quan]  
• [Đặc điểm 3 + từ khóa]: [Mô tả chi tiết tích hợp từ khóa liên quan]
• [Bổ sung thêm đặc điểm nếu cần để cover đủ từ khóa]

⚙️ **Thông số & Chất lượng**
[Thông tin kỹ thuật từ mô tả gốc + tích hợp từ khóa về chất liệu, kích thước, màu sắc...]

💡 **Hướng dẫn & Sử dụng**  
[Cách sử dụng/bảo quản + tích hợp từ khóa về công dụng, cách dùng]

🎁 **Cam kết & Ưu đãi**
[Chính sách của shop + từ khóa về dịch vụ, chất lượng]

## QUY TẮC BẮT BUỘC:

### 🎯 MỤC TIÊU SEO:
- **Mật độ từ khóa:** 2-4% (tự nhiên, không cưỡng ép)
- **Từ khóa chính:** Xuất hiện 3-5 lần trong toàn bộ mô tả
- **Từ khóa phụ:** Mỗi từ xuất hiện 1-2 lần
- **Biến thể từ khóa:** Sử dụng đồng nghĩa, viết tắt, số ít/nhiều

### ⚖️ CÂN BẰNG:
- **70% nội dung gốc:** Giữ nguyên thông tin, tính năng từ mô tả có sẵn
- **30% tối ưu SEO:** Thêm từ khóa, cải thiện cấu trúc, bổ sung thông tin

### 🚫 TUYỆT ĐỐI TRÁNH:
- Thay đổi hoàn toàn ý nghĩa mô tả gốc
- Nhồi nhét từ khóa làm mất tự nhiên
- Thêm thông tin sai lệch không có trong mô tả gốc
- Sử dụng từ khóa không liên quan đến sản phẩm

### ✅ LUÔN ĐẢM BẢO:
- Mô tả sau khi tối ưu phải tự nhiên, dễ đọc
- Giữ nguyên tất cả thông tin quan trọng từ mô tả gốc  
- Tích hợp từ khóa một cách logic, có ý nghĩa
- Tăng giá trị thông tin cho khách hàng

**Nhiệm vụ của bạn: Nâng cấp mô tả có sẵn thành phiên bản SEO-optimized mạnh mẽ hơn!**`;

    // Step 6: Tạo user prompt
    const userPrompt = `Tên sản phẩm (nếu có): ${cleanedProductName}
Từ khóa mục tiêu: ${cleanedKeywords}
Mô tả sản phẩm thô: ${cleanedProductDescription}

Hãy tạo mô tả sản phẩm SEO cho Shopee theo đúng cấu trúc đã định, tích hợp khéo léo các từ khóa đã cho vào mô tả sản phẩm thô.`;

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
        },
      );
    }

    console.log("Successfully generated SEO description.");

    return new Response(
      JSON.stringify({
        description: aiResponse,
        // knowledge_used: relevantKnowledge?.length || 0, // Removed as RAG is no longer used
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (err) {
    console.error(
      "Unexpected error in generate-seo-description function:",
      err,
    );
    return new Response(
      JSON.stringify({ error: err.message || "Lỗi server nội bộ" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});