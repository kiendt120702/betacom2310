import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Get the Gemini API key from environment variables
const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const categoryData = [
  {"ten_nganh_hang": "Áo khoác, Áo choàng & Áo vest", "ma_nganh_hang": "100012"},
  {"ten_nganh_hang": "Áo len & Áo nỉ", "ma_nganh_hang": "100013"},
  {"ten_nganh_hang": "Quần jeans", "ma_nganh_hang": "100014"},
  {"ten_nganh_hang": "Váy", "ma_nganh_hang": "100015"},
  {"ten_nganh_hang": "Váy cưới", "ma_nganh_hang": "100016"},
  {"ten_nganh_hang": "Quần", "ma_nganh_hang": "100017"},
  {"ten_nganh_hang": "Quần short", "ma_nganh_hang": "100018"},
  {"ten_nganh_hang": "Chân váy", "ma_nganh_hang": "100019"},
  {"ten_nganh_hang": "Đồ liền thân", "ma_nganh_hang": "100020"},
  {"ten_nganh_hang": "Đồ ngủ & Đồ mặc nhà", "ma_nganh_hang": "100021"},
  {"ten_nganh_hang": "Đồ đôi", "ma_nganh_hang": "100022"},
  {"ten_nganh_hang": "Trang phục truyền thống", "ma_nganh_hang": "100023"},
  {"ten_nganh_hang": "Đồ hóa trang", "ma_nganh_hang": "100024"},
  {"ten_nganh_hang": "Đồ ngủ", "ma_nganh_hang": "100025"},
  {"ten_nganh_hang": "Đồ lót", "ma_nganh_hang": "100026"},
  {"ten_nganh_hang": "Vớ & Quần tất", "ma_nganh_hang": "100027"},
  {"ten_nganh_hang": "Khác", "ma_nganh_hang": "100028"},
  {"ten_nganh_hang": "Áo", "ma_nganh_hang": "100029"},
  {"ten_nganh_hang": "Áo hoodie, Áo khoác & Áo nỉ", "ma_nganh_hang": "100031"},
  {"ten_nganh_hang": "Quần jeans", "ma_nganh_hang": "100032"},
  {"ten_nganh_hang": "Quần", "ma_nganh_hang": "100033"},
  {"ten_nganh_hang": "Quần short", "ma_nganh_hang": "100034"},
  {"ten_nganh_hang": "Đồ lót", "ma_nganh_hang": "100035"},
  {"ten_nganh_hang": "Đồ ngủ & Đồ mặc nhà", "ma_nganh_hang": "100036"},
  {"ten_nganh_hang": "Trang phục truyền thống & Đồ hóa trang", "ma_nganh_hang": "100037"},
  {"ten_nganh_hang": "Vớ", "ma_nganh_hang": "100038"},
  {"ten_nganh_hang": "Khác", "ma_nganh_hang": "100039"},
  {"ten_nganh_hang": "Điện thoại", "ma_nganh_hang": "100040"},
  {"ten_nganh_hang": "Máy tính bảng", "ma_nganh_hang": "100041"},
  {"ten_nganh_hang": "Pin sạc dự phòng", "ma_nganh_hang": "100042"},
  {"ten_nganh_hang": "Cáp và bộ sạc", "ma_nganh_hang": "100043"},
  {"ten_nganh_hang": "Ốp lưng & Bao da", "ma_nganh_hang": "100044"},
  {"ten_nganh_hang": "Miếng dán màn hình", "ma_nganh_hang": "100045"},
  {"ten_nganh_hang": "Thẻ nhớ", "ma_nganh_hang": "100046"},
  {"ten_nganh_hang": "Sim", "ma_nganh_hang": "100047"},
  {"ten_nganh_hang": "Phụ kiện khác", "ma_nganh_hang": "100048"},
  {"ten_nganh_hang": "Thiết bị đeo thông minh", "ma_nganh_hang": "100049"},
  {"ten_nganh_hang": "Tivi", "ma_nganh_hang": "100051"},
  {"ten_nganh_hang": "Android Tivi Box", "ma_nganh_hang": "100052"},
  {"ten_nganh_hang": "Phụ kiện Tivi", "ma_nganh_hang": "100053"},
  {"ten_nganh_hang": "Tai nghe", "ma_nganh_hang": "100054"},
  {"ten_nganh_hang": "Loa", "ma_nganh_hang": "100055"},
  {"ten_nganh_hang": "Máy ảnh & Máy quay phim", "ma_nganh_hang": "100056"},
  {"ten_nganh_hang": "Thẻ nhớ", "ma_nganh_hang": "100057"},
  {"ten_nganh_hang": "Phụ kiện máy ảnh", "ma_nganh_hang": "100058"},
  {"ten_nganh_hang": "Máy chơi game", "ma_nganh_hang": "100059"},
  {"ten_nganh_hang": "Phụ kiện chơi game", "ma_nganh_hang": "100060"},
  {"ten_nganh_hang": "Đĩa game", "ma_nganh_hang": "100061"},
  {"ten_nganh_hang": "Linh kiện máy tính", "ma_nganh_hang": "100062"},
  {"ten_nganh_hang": "Thiết bị lưu trữ", "ma_nganh_hang": "100063"},
  {"ten_nganh_hang": "Thiết bị mạng", "ma_nganh_hang": "100064"},
  {"ten_nganh_hang": "Máy tính & Laptop", "ma_nganh_hang": "100065"},
  {"ten_nganh_hang": "Màn hình", "ma_nganh_hang": "100066"},
  {"ten_nganh_hang": "Máy in, Máy scan & Máy chiếu", "ma_nganh_hang": "100067"},
  {"ten_nganh_hang": "Phụ kiện máy tính", "ma_nganh_hang": "100068"},
  {"ten_nganh_hang": "Thiết bị gia dụng lớn", "ma_nganh_hang": "100069"},
  {"ten_nganh_hang": "Thiết bị nhà bếp", "ma_nganh_hang": "100070"},
  {"ten_nganh_hang": "Chăm sóc cá nhân", "ma_nganh_hang": "100071"},
  {"ten_nganh_hang": "Đồng hồ", "ma_nganh_hang": "100072"},
  {"ten_nganh_hang": "Giày cao gót", "ma_nganh_hang": "100073"},
  {"ten_nganh_hang": "Giày đế bằng", "ma_nganh_hang": "100074"},
  {"ten_nganh_hang": "Bốt", "ma_nganh_hang": "100075"},
  {"ten_nganh_hang": "Sandal & Dép", "ma_nganh_hang": "100076"},
  {"ten_nganh_hang": "Giày thể thao/ Sneaker", "ma_nganh_hang": "100077"},
  {"ten_nganh_hang": "Phụ kiện giày", "ma_nganh_hang": "100078"},
  {"ten_nganh_hang": "Khác", "ma_nganh_hang": "100079"},
  {"ten_nganh_hang": "Bốt", "ma_nganh_hang": "100080"},
  {"ten_nganh_hang": "Giày thể thao/ Sneaker", "ma_nganh_hang": "100081"},
  {"ten_nganh_hang": "Giày lười", "ma_nganh_hang": "100082"},
  {"ten_nganh_hang": "Giày tây", "ma_nganh_hang": "100083"},
  {"ten_nganh_hang": "Sandal & Dép", "ma_nganh_hang": "100084"},
  {"ten_nganh_hang": "Phụ kiện giày", "ma_nganh_hang": "100085"},
  {"ten_nganh_hang": "Khác", "ma_nganh_hang": "100086"},
  {"ten_nganh_hang": "Túi đeo chéo", "ma_nganh_hang": "100087"},
  {"ten_nganh_hang": "Túi đeo vai", "ma_nganh_hang": "100088"},
  {"ten_nganh_hang": "Ví", "ma_nganh_hang": "100089"},
  {"ten_nganh_hang": "Túi tote", "ma_nganh_hang": "100090"},
  {"ten_nganh_hang": "Túi xách", "ma_nganh_hang": "100091"},
  {"ten_nganh_hang": "Balo", "ma_nganh_hang": "100092"},
  {"ten_nganh_hang": "Túi clutch", "ma_nganh_hang": "100093"},
  {"ten_nganh_hang": "Túi đeo hông & Túi đeo ngực", "ma_nganh_hang": "100094"},
  {"ten_nganh_hang": "Phụ kiện túi", "ma_nganh_hang": "100095"},
  {"ten_nganh_hang": "Khác", "ma_nganh_hang": "100096"},
  {"ten_nganh_hang": "Balo", "ma_nganh_hang": "100097"},
  {"ten_nganh_hang": "Cặp xách", "ma_nganh_hang": "100098"},
  {"ten_nganh_hang": "Túi đeo chéo", "ma_nganh_hang": "100099"},
  {"ten_nganh_hang": "Ví", "ma_nganh_hang": "100100"},
  {"ten_nganh_hang": "Túi clutch", "ma_nganh_hang": "100101"},
  {"ten_nganh_hang": "Túi đeo hông & Túi đeo ngực", "ma_nganh_hang": "100102"},
  {"ten_nganh_hang": "Khác", "ma_nganh_hang": "100103"},
  {"ten_nganh_hang": "Nhẫn", "ma_nganh_hang": "100104"},
  {"ten_nganh_hang": "Bông tai", "ma_nganh_hang": "100105"},
  {"ten_nganh_hang": "Dây chuyền", "ma_nganh_hang": "100106"},
  {"ten_nganh_hang": "Vòng tay & Lắc tay", "ma_nganh_hang": "100107"},
  {"ten_nganh_hang": "Lắc chân", "ma_nganh_hang": "100108"},
  {"ten_nganh_hang": "Bộ trang sức", "ma_nganh_hang": "100109"},
  {"ten_nganh_hang": "Trang sức khác", "ma_nganh_hang": "100110"},
  {"ten_nganh_hang": "Kính mắt", "ma_nganh_hang": "100111"},
  {"ten_nganh_hang": "Thắt lưng", "ma_nganh_hang": "100112"},
  {"ten_nganh_hang": "Khăn choàng", "ma_nganh_hang": "100113"},
  {"ten_nganh_hang": "Găng tay", "ma_nganh_hang": "100114"},
  {"ten_nganh_hang": "Phụ kiện tóc", "ma_nganh_hang": "100115"},
  {"ten_nganh_hang": "Mũ", "ma_nganh_hang": "100116"},
  {"ten_nganh_hang": "Cà vạt & Nơ cổ", "ma_nganh_hang": "100117"},
  {"ten_nganh_hang": "Kim loại quý", "ma_nganh_hang": "100118"},
  {"ten_nganh_hang": "Phụ kiện khác", "ma_nganh_hang": "100119"},
  {"ten_nganh_hang": "Chăm sóc da mặt", "ma_nganh_hang": "100120"},
  {"ten_nganh_hang": "Tắm & Chăm sóc cơ thể", "ma_nganh_hang": "100121"},
  {"ten_nganh_hang": "Trang điểm", "ma_nganh_hang": "100122"},
  {"ten_nganh_hang": "Chăm sóc tóc", "ma_nganh_hang": "100123"},
  {"ten_nganh_hang": "Chăm sóc cho nam", "ma_nganh_hang": "100124"},
  {"ten_nganh_hang": "Nước hoa", "ma_nganh_hang": "100125"},
  {"ten_nganh_hang": "Dụng cụ & Phụ kiện làm đẹp", "ma_nganh_hang": "100126"},
  {"ten_nganh_hang": "Chăm sóc răng miệng", "ma_nganh_hang": "100127"},
  {"ten_nganh_hang": "Chăm sóc phụ nữ", "ma_nganh_hang": "100128"},
  {"ten_nganh_hang": "Thực phẩm chức năng", "ma_nganh_hang": "100129"},
  {"ten_nganh_hang": "Hỗ trợ tình dục", "ma_nganh_hang": "100130"},
  {"ten_nganh_hang": "Khác", "ma_nganh_hang": "100131"},
  {"ten_nganh_hang": "Tã & bỉm", "ma_nganh_hang": "100132"},
  {"ten_nganh_hang": "Đồ dùng phòng tắm & Chăm sóc cơ thể bé", "ma_nganh_hang": "100133"},
  {"ten_nganh_hang": "Đồ dùng ăn dặm cho bé", "ma_nganh_hang": "100134"},
  {"ten_nganh_hang": "Sữa công thức & Thực phẩm cho bé", "ma_nganh_hang": "100135"},
  {"ten_nganh_hang": "Chăm sóc sức khỏe bé", "ma_nganh_hang": "100136"},
  {"ten_nganh_hang": "Đồ dùng phòng ngủ cho bé", "ma_nganh_hang": "100137"},
  {"ten_nganh_hang": "An toàn cho bé", "ma_nganh_hang": "100138"},
  {"ten_nganh_hang": "Đồ chơi & trò chơi", "ma_nganh_hang": "100139"},
  {"ten_nganh_hang": "Quà tặng & Đồ dùng tiệc cho bé", "ma_nganh_hang": "100140"},
  {"ten_nganh_hang": "Thời trang cho bé", "ma_nganh_hang": "100141"},
  {"ten_nganh_hang": "Khác", "ma_nganh_hang": "100142"},
  {"ten_nganh_hang": "Chăn, Ga, Gối & Nệm", "ma_nganh_hang": "100143"},
  {"ten_nganh_hang": "Đồ nội thất", "ma_nganh_hang": "100144"},
  {"ten_nganh_hang": "Trang trí nhà cửa", "ma_nganh_hang": "100145"},
  {"ten_nganh_hang": "Dụng cụ & Thiết bị tiện ích", "ma_nganh_hang": "100146"},
  {"ten_nganh_hang": "Đèn", "ma_nganh_hang": "100147"},
  {"ten_nganh_hang": "Ngoài trời & Sân vườn", "ma_nganh_hang": "100148"},
  {"ten_nganh_hang": "Đồ dùng nhà bếp & Phòng ăn", "ma_nganh_hang": "100149"},
  {"ten_nganh_hang": "Đồ dùng phòng tắm", "ma_nganh_hang": "100150"},
  {"ten_nganh_hang": "Sắp xếp nhà cửa", "ma_nganh_hang": "100151"},
  {"ten_nganh_hang": "Dụng cụ pha chế", "ma_nganh_hang": "100152"},
  {"ten_nganh_hang": "Đồ thờ cúng, đồ phong thủy", "ma_nganh_hang": "100153"},
  {"ten_nganh_hang": "Sách Tiếng Việt", "ma_nganh_hang": "100154"},
  {"ten_nganh_hang": "Sách ngoại văn", "ma_nganh_hang": "100155"},
  {"ten_nganh_hang": "Tạp chí & Báo", "ma_nganh_hang": "100156"},
  {"ten_nganh_hang": "Gói quà", "ma_nganh_hang": "100157"},
  {"ten_nganh_hang": "Bút & Mực", "ma_nganh_hang": "100158"},
  {"ten_nganh_hang": "Sổ & Giấy các loại", "ma_nganh_hang": "100159"},
  {"ten_nganh_hang": "Dụng cụ học sinh & văn phòng", "ma_nganh_hang": "100160"},
  {"ten_nganh_hang": "Dụng cụ vẽ", "ma_nganh_hang": "100161"},
  {"ten_nganh_hang": "Nhạc cụ", "ma_nganh_hang": "100162"},
  {"ten_nganh_hang": "Quà lưu niệm", "ma_nganh_hang": "100163"},
  {"ten_nganh_hang": "Đồ dùng cho thú cưng", "ma_nganh_hang": "100164"},
  {"ten_nganh_hang": "Phụ kiện cho thú cưng", "ma_nganh_hang": "100165"},
  {"ten_nganh_hang": "Thực phẩm cho thú cưng", "ma_nganh_hang": "100166"},
  {"ten_nganh_hang": "Chăm sóc sức khỏe & Vệ sinh cho thú cưng", "ma_nganh_hang": "100167"},
  {"ten_nganh_hang": "Khác", "ma_nganh_hang": "100168"},
  {"ten_nganh_hang": "Đồ ăn vặt", "ma_nganh_hang": "100169"},
  {"ten_nganh_hang": "Thực phẩm chế biến", "ma_nganh_hang": "100170"},
  {"ten_nganh_hang": "Nhu yếu phẩm", "ma_nganh_hang": "100171"},
  {"ten_nganh_hang": "Nguyên liệu nấu ăn", "ma_nganh_hang": "100172"},
  {"ten_nganh_hang": "Sữa & các sản phẩm từ sữa", "ma_nganh_hang": "100173"},
  {"ten_nganh_hang": "Đồ uống", "ma_nganh_hang": "100174"},
  {"ten_nganh_hang": "Đồ uống có cồn", "ma_nganh_hang": "100175"},
  {"ten_nganh_hang": "Thực phẩm tươi sống & đông lạnh", "ma_nganh_hang": "100176"},
  {"ten_nganh_hang": "Bộ quà tặng", "ma_nganh_hang": "100177"},
  {"ten_nganh_hang": "Khác", "ma_nganh_hang": "100178"},
  {"ten_nganh_hang": "Dụng cụ thể thao & dã ngoại", "ma_nganh_hang": "100179"},
  {"ten_nganh_hang": "Giày thể thao", "ma_nganh_hang": "100180"},
  {"ten_nganh_hang": "Trang phục thể thao", "ma_nganh_hang": "100181"},
  {"ten_nganh_hang": "Phụ kiện thể thao", "ma_nganh_hang": "100182"},
  {"ten_nganh_hang": "Vali & Túi du lịch", "ma_nganh_hang": "100183"},
  {"ten_nganh_hang": "Phụ kiện du lịch", "ma_nganh_hang": "100184"},
  {"ten_nganh_hang": "Khác", "ma_nganh_hang": "100185"},
  {"ten_nganh_hang": "Phụ tùng xe máy", "ma_nganh_hang": "100186"},
  {"ten_nganh_hang": "Dầu nhớt & Phụ gia", "ma_nganh_hang": "100187"},
  {"ten_nganh_hang": "Mũ bảo hiểm", "ma_nganh_hang": "100188"},
  {"ten_nganh_hang": "Phụ kiện xe máy", "ma_nganh_hang": "100189"},
  {"ten_nganh_hang": "Xe máy", "ma_nganh_hang": "100190"},
  {"ten_nganh_hang": "Chăm sóc ô tô", "ma_nganh_hang": "100191"},
  {"ten_nganh_hang": "Phụ kiện nội thất ô tô", "ma_nganh_hang": "100192"},
  {"ten_nganh_hang": "Phụ kiện ngoại thất ô tô", "ma_nganh_hang": "100193"},
  {"ten_nganh_hang": "Phụ tùng ô tô", "ma_nganh_hang": "100194"},
  {"ten_nganh_hang": "Dầu nhớt & Phụ gia", "ma_nganh_hang": "100195"},
  {"ten_nganh_hang": "Ô tô", "ma_nganh_hang": "100196"},
  {"ten_nganh_hang": "Nạp tiền điện thoại & Thẻ cào", "ma_nganh_hang": "100197"},
  {"ten_nganh_hang": "Vé xem phim", "ma_nganh_hang": "100198"},
  {"ten_nganh_hang": "Voucher & Dịch vụ", "ma_nganh_hang": "100199"}
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    const { productName } = await req.json();

    if (!productName) {
      throw new Error('productName is required');
    }

    const categoryListString = categoryData.map(c => `- ${c.ten_nganh_hang} (ma_nganh_hang: ${c.ma_nganh_hang})`).join('\n');

    const prompt = `Bạn là một chatbot chuyên phân loại ngành hàng dựa trên tên sản phẩm. Nhiệm vụ của bạn là nhận tên sản phẩm từ người dùng và xác định ngành hàng cùng mã ngành hàng tương ứng dựa trên danh sách ngành hàng được cung cấp.

Hãy thực hiện các bước sau:
1. Phân tích tên sản phẩm để xác định đặc điểm chính (ví dụ: loại sản phẩm, đối tượng sử dụng, chức năng).
2. So sánh với danh sách ngành hàng để tìm ngành hàng phù hợp nhất và cụ thể nhất.
3. Trả về kết quả CHỈ BAO GỒM mã ngành hàng (ma_nganh_hang).

Lưu ý:
- Chỉ trả lời dựa trên danh sách ngành hàng được cung cấp, không tự tạo ngành hàng mới.
- Nếu không thể xác định, trả về một chuỗi rỗng.
- KHÔNG giải thích, KHÔNG thêm bất kỳ văn bản nào khác ngoài mã ngành hàng.

**Danh sách ngành hàng:**
${categoryListString}

**Tên sản phẩm cần phân loại:**
"${productName}"`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 10,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const responseData = await response.json();
    
    // Safely access the response text
    const categoryId = responseData.candidates?.[0]?.content?.parts?.[0]?.text?.trim().replace(/"/g, '') || '';

    const isValidId = categoryData.some(c => c.ma_nganh_hang === categoryId);

    return new Response(JSON.stringify({ categoryId: isValidId ? categoryId : '' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in categorize-product function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});