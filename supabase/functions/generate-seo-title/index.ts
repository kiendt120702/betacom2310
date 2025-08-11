import "xhr";
import { serve } from "std/http/server.ts";
import { createClient } from "@supabase/supabase-js";

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
};

const TIMEOUT_CONFIG = {
  embedding: 30000,
  openai: 60000,
  supabase: 15000,
};

const createTimeoutPromise = (timeoutMs: number) => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs);
  });
};

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return Promise.race([promise, createTimeoutPromise(timeoutMs)]) as Promise<T>;
};

const getRetryDelay = (attempt: number): number => {
  const delay = RETRY_CONFIG.baseDelay * Math.pow(2, attempt - 1);
  return Math.min(delay, RETRY_CONFIG.maxDelay);
};

const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = RETRY_CONFIG.maxRetries,
  operationName: string = "operation"
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`${operationName} - Attempt ${attempt}/${maxRetries}`);
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.warn(`${operationName} failed on attempt ${attempt}:`, error);
      
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('unauthorized') || 
            errorMessage.includes('forbidden') ||
            errorMessage.includes('not found') ||
            errorMessage.includes('bad request')) {
          throw error;
        }
      }
      
      if (attempt < maxRetries) {
        const delay = getRetryDelay(attempt);
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error(`${operationName} failed after ${maxRetries} attempts. Last error: ${lastError.message}`);
};

interface KnowledgeItem {
  content: string;
  similarity: number;
}

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

    const cleanedKeyword = keyword.replace(/\s+/g, " ").trim();
    const cleanedProductInfo = productInfo.replace(/\s+/g, " ").trim();
    const cleanedBrand = brand.replace(/\s+/g, " ").trim();

    console.log("Processing SEO title generation for:", cleanedKeyword);

    const searchQuery =
      `tạo tên sản phẩm SEO ${cleanedKeyword} ${cleanedProductInfo} ${cleanedBrand}`.trim();

    console.log("Generating embedding for search query...");
    
    const generateEmbedding = async () => {
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
        const errorText = await embeddingResponse.text();
        throw new Error(`Embedding API error (${embeddingResponse.status}): ${errorText}`);
      }

      return await embeddingResponse.json();
    };

    const embeddingData = await retryWithBackoff(
      () => withTimeout(generateEmbedding(), TIMEOUT_CONFIG.embedding),
      RETRY_CONFIG.maxRetries,
      "Generate Embedding"
    );
    
    const queryEmbedding = embeddingData.data[0].embedding;

    console.log("Searching for relevant SEO knowledge...");
    
    const searchKnowledge = async () => {
      const { data: relevantKnowledge, error: searchError } = await supabase.rpc(
        "search_seo_knowledge",
        {
          query_embedding: queryEmbedding,
          match_threshold: 0.6,
          match_count: 5,
        },
      );

      if (searchError) {
        throw new Error(`Supabase search error: ${searchError.message}`);
      }

      return relevantKnowledge;
    };

    const relevantKnowledge = await retryWithBackoff(
      () => withTimeout(searchKnowledge(), TIMEOUT_CONFIG.supabase),
      RETRY_CONFIG.maxRetries,
      "Search SEO Knowledge"
    );

    console.log(
      `Found ${relevantKnowledge?.length || 0} relevant knowledge items`,
    );

    let knowledgeContext = "";
    if (relevantKnowledge && relevantKnowledge.length > 0) {
      knowledgeContext = relevantKnowledge
        .map(
          (item: KnowledgeItem) =>
            `${item.content} (Độ liên quan: ${(item.similarity * 100).toFixed(
              1,
            )}%)`,
        )
        .join("\n\n---\n\n");
    }

    const systemPrompt = `# SHOPEE SEO PRODUCT TITLE GENERATOR - 3 CHIẾN LƯỢC KHÁC BIỆT

Bạn là AI chuyên gia SEO tên sản phẩm Shopee. Nhiệm vụ của bạn là tạo ra 3 tên sản phẩm áp dụng 3 CHIẾN LƯỢC SEO HOÀN TOÀN KHÁC NHAU, mỗi chiến lược phục vụ mục tiêu riêng biệt.

## 3 CHIẾN LƯỢC SEO CHÍNH

### 🎯 CHIẾN LƯỢC 1: BROAD MATCH SEO (Tối ưu độ phủ rộng)
**Mục tiêu:** Tối đa hóa lượng traffic tìm kiếm từ nhiều từ khóa khác nhau
**Phương pháp:**
- Sử dụng từ khóa chính + nhiều từ khóa related/synonyms
- Bao phủ các cách gọi khác nhau của sản phẩm
- Tập trung vào search volume cao
- Keyword density: 3-4 từ khóa chính trong 1 title

### 🎪 CHIẾN LƯỢC 2: EMOTIONAL & BENEFIT SEO (Tối ưu cảm xúc & lợi ích)
**Mục tiêu:** Tăng click-through rate và conversion bằng cảm xúc
**Phương pháp:**
- Từ khóa chính + power words (Sale, Hot, New, Premium, etc.)
- Highlight benefit/outcome (tiết kiệm, nhanh chóng, hiệu quả, etc.)
- Social proof words (Best seller, Top choice, etc.)
- Urgency/scarcity indicators

### 🔍 CHIẾN LƯỢC 3: LONG-TAIL NICHE SEO (Tối ưu từ khóa dài & ngách)
**Mục tiêu:** Targeting người dùng có intent cụ thể, ít cạnh tranh
**Phương pháp:**
- Từ khóa chính + specific attributes (màu sắc, size, chất liệu, etc.)
- Target search intent cụ thể (cho nam, cho nữ, cho trẻ em, etc.)
- Technical specifications
- Use case specific (đi làm, đi chơi, tập gym, etc.)

## KIẾN THỨC CHUYÊN MÔN ĐƯỢC TRUY XUẤT
${knowledgeContext || "Không tìm thấy kiến thức liên quan cụ thể. Sử dụng nguyên tắc SEO cơ bản."}

## CẤU TRÚC RESPONSE CỐ ĐỊNH

🎯 PHÂN TÍCH SẢN PHẨM

Từ khóa chính: [từ khóa chính được cung cấp]
Từ khóa related: [liệt kê 4-5 từ khóa liên quan]
Đặc điểm nổi bật: [2-3 điểm mạnh của sản phẩm]
Target audience: [đối tượng khách hàng chính]
Mức độ cạnh tranh: [Thấp/Trung bình/Cao]

⭐ 3 CHIẾN LƯỢC SEO KHÁC BIỆT

🎯 CHIẾN LƯỢC 1 - BROAD MATCH SEO:
[TỪ KHÓA CHÍNH + từ khóa synonyms + từ khóa related + mô tả chung sản phẩm]
Độ dài: [X] ký tự
Ưu điểm: Tăng khả năng hiển thị với nhiều search queries khác nhau
Phù hợp: Sản phẩm mới hoặc muốn tăng awareness

🎪 CHIẾN LƯỢC 2 - EMOTIONAL & BENEFIT SEO:
[TỪ KHÓA CHÍNH + power words + benefit statements + emotional triggers + social proof]
Độ dài: [X] ký tự
Ưu điểm: Tăng CTR và tỷ lệ chuyển đổi nhờ appeal về cảm xúc
Phù hợp: Sản phẩm lifestyle, thời trang, làm đẹp

🔍 CHIẾN LƯỢC 3 - LONG-TAIL NICHE SEO:
[TỪ KHÓA CHÍNH + specific attributes + target demographics + use case + technical specs]
Độ dài: [X] ký tự
Ưu điểm: Ít cạnh tranh, high intent users, conversion cao
Phù hợp: Sản phẩm chuyên dụng, có đặc điểm kỹ thuật rõ ràng

🔥 KHUYẾN NGHỊ CHIẾN LƯỢC

Nên ưu tiên: Chiến lược [số] vì [lý do cụ thể dựa trên sản phẩm và thị trường]
A/B Test suggestion: So sánh chiến lược [X] vs [Y] trong [thời gian]
Keywords bổ sung: [2-3 từ khóa có thể test thêm]
Monitoring metrics: [CTR, Conversion Rate, hoặc Traffic tùy chiến lược]

## QUY TẮC BẮT BUỘC

### ✅ MỖI CHIẾN LƯỢC PHẢI:
- **Bắt đầu bằng từ khóa chính** (bắt buộc)
- **Có approach hoàn toàn khác nhau** (không được giống nhau)
- **Độ dài 80-120 ký tự** (tối ưu cho Shopee)
- **Đọc tự nhiên, không cứng nhắc**
- **Phản ánh đúng chiến lược được chọn**

### 🚫 TUYỆT ĐỐI TRÁNH:
- Tạo 3 phiên bản giống nhau chỉ khác vài từ
- Nhồi nhét từ khóa không liên quan
- Sử dụng ký tự đặc biệt phức tạp
- Vượt quá 120 ký tự
- Đặt từ khóa chính không ở đầu

### 💡 LƯU Ý QUAN TRỌNG:
Mỗi chiến lược phục vụ mục đích khác nhau:
- **Broad Match** → Tăng traffic & awareness
- **Emotional** → Tăng CTR & conversion  
- **Long-tail** → Giảm cạnh tranh, tăng relevance

Hãy tạo ra 3 tên sản phẩm thể hiện rõ ràng từng chiến lược!`;

    const userPrompt = `Từ khóa chính: ${cleanedKeyword}
Thông tin sản phẩm: ${cleanedProductInfo}
${cleanedBrand ? `Thương hiệu: ${cleanedBrand}` : ""}

QUAN TRỌNG: Tôi cần 3 tên sản phẩm áp dụng 3 CHIẾN LƯỢC SEO HOÀN TOÀN KHÁC NHAU:
1. BROAD MATCH: Tập trung mở rộng từ khóa và đồng nghĩa
2. EMOTIONAL: Tập trung power words và lợi ích cảm xúc  
3. LONG-TAIL: Tập trung thuộc tính cụ thể và use case

Mỗi chiến lược phải có cách tiếp cận khác biệt rõ rệt, không được tương tự nhau. Hãy phân tích và tạo theo đúng cấu trúc đã định.`;

    console.log("Calling OpenAI API...");
    
    const callOpenAI = async () => {
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
        const errorText = await response.text();
        throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
      }

      return await response.json();
    };

    const data = await retryWithBackoff(
      () => withTimeout(callOpenAI(), TIMEOUT_CONFIG.openai),
      RETRY_CONFIG.maxRetries,
      "OpenAI API Call"
    );
    
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

    const titles = [];
    const lines = aiResponse.split("\n");

    const strategyPatterns = [
      /🎯 CHIẾN LƯỢC 1.*BROAD MATCH/i,
      /🎪 CHIẾN LƯỢC 2.*EMOTIONAL/i,
      /🔍 CHIẾN LƯỢC 3.*LONG-TAIL/i
    ];

    for (let patternIndex = 0; patternIndex < strategyPatterns.length; patternIndex++) {
      const pattern = strategyPatterns[patternIndex];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (pattern.test(line)) {
          for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
            const titleLine = lines[j].trim();
            
            if (
              titleLine &&
              titleLine.length >= 50 &&
              titleLine.length <= 150 &&
              !titleLine.includes("Độ dài:") &&
              !titleLine.includes("Ưu điểm:") &&
              !titleLine.includes("Phù hợp:") &&
              !titleLine.startsWith("🎯") &&
              !titleLine.startsWith("🎪") &&
              !titleLine.startsWith("🔍") &&
              !titleLine.startsWith("🔥") &&
              titleLine.includes(cleanedKeyword.split(" ")[0])
            ) {
              titles.push(titleLine);
              break;
            }
          }
          break;
        }
      }
    }

    if (titles.length < 3) {
      console.log("Using fallback parsing method...");
      const mainKeyword = cleanedKeyword.split(" ")[0].toLowerCase();
      
      for (const line of lines) {
        const cleanLine = line.trim();
        if (
          cleanLine.length >= 50 &&
          cleanLine.length <= 150 &&
          cleanLine.toLowerCase().includes(mainKeyword) &&
          !cleanLine.includes(":") &&
          !cleanLine.includes("🎯") &&
          !cleanLine.includes("⭐") &&
          !cleanLine.includes("🔥") &&
          !cleanLine.includes("🎪") &&
          !cleanLine.includes("🔍") &&
          !cleanLine.includes("Độ dài") &&
          !cleanLine.includes("Ưu điểm") &&
          !cleanLine.includes("Phù hợp") &&
          !cleanLine.includes("Nên chọn") &&
          !cleanLine.includes("Từ khóa") &&
          !titles.includes(cleanLine)
        ) {
          titles.push(cleanLine);
          if (titles.length >= 3) break;
        }
      }
    }

    if (titles.length === 0) {
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
    console.error("Unexpected error in generate-seo-title function:", error);
    
    let errorMessage = "Lỗi server nội bộ";
    let statusCode = 500;
    
    if (error instanceof Error) {
      const errorMsg = error.message.toLowerCase();
      
      if (errorMsg.includes('timeout')) {
        errorMessage = "Yêu cầu xử lý quá lâu, vui lòng thử lại sau";
        statusCode = 408;
      } else if (errorMsg.includes('openai api error')) {
        errorMessage = "Lỗi kết nối với dịch vụ AI, vui lòng thử lại sau";
        statusCode = 502;
      } else if (errorMsg.includes('supabase search error')) {
        errorMessage = "Lỗi tìm kiếm dữ liệu, vui lòng thử lại sau";
        statusCode = 503;
      } else if (errorMsg.includes('embedding api error')) {
        errorMessage = "Lỗi xử lý từ khóa, vui lòng thử lại sau";
        statusCode = 502;
      } else if (errorMsg.includes('failed after') && errorMsg.includes('attempts')) {
        errorMessage = "Dịch vụ tạm thời không khả dụng, vui lòng thử lại sau ít phút";
        statusCode = 503;
      }
      
      console.error("Detailed error info:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        timestamp: new Date().toISOString(),
      }),
      {
        status: statusCode,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});