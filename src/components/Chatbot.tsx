
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Loader2, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface ChatbotProps {
  className?: string;
}

const Chatbot: React.FC<ChatbotProps> = ({ className = '' }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Xin chào! Tôi là trợ lý tư vấn chiến lược thông minh. Tôi có thể giúp bạn tìm kiếm các chiến lược marketing phù hợp với ngành hàng và tình huống cụ thể của bạn. Hãy mô tả vấn đề bạn đang gặp phải!',
      timestamp: new Date()
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiInput, setShowApiInput] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    if (!apiKey.trim()) {
      toast({
        title: "Thiếu API Key",
        description: "Vui lòng nhập API Key để sử dụng chatbot",
        variant: "destructive",
      });
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Add loading message
    const loadingMessage: ChatMessage = {
      id: `loading_${Date.now()}`,
      type: 'bot',
      content: '',
      timestamp: new Date(),
      isLoading: true
    };
    
    setMessages(prev => [...prev, loadingMessage]);

    try {
      // TODO: Implement RAG system
      // 1. Vector search for relevant knowledge
      // 2. Construct prompt with context
      // 3. Call LLM API (GPT/Claude)
      // 4. Parse and format response
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const botResponse = await generateResponse(userMessage.content, apiKey);
      
      setMessages(prev => prev.filter(msg => msg.id !== loadingMessage.id));
      
      const responseMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'bot',
        content: botResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, responseMessage]);
      
    } catch (error) {
      setMessages(prev => prev.filter(msg => msg.id !== loadingMessage.id));
      
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'bot',
        content: 'Xin lỗi, đã có lỗi xảy ra khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Lỗi",
        description: "Không thể kết nối đến dịch vụ AI. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateResponse = async (userQuery: string, apiKey: string): Promise<string> => {
    // TODO: Implement actual RAG system
    // This is a placeholder that simulates the RAG workflow
    
    // 1. Vector search simulation
    const relevantKnowledge = await searchKnowledge(userQuery);
    
    // 2. Construct prompt
    const prompt = constructRAGPrompt(userQuery, relevantKnowledge);
    
    // 3. Call LLM API (placeholder)
    const response = await callLLMAPI(prompt, apiKey);
    
    return response;
  };

  const searchKnowledge = async (query: string) => {
    // TODO: Implement vector similarity search
    // For now, return mock relevant knowledge
    return [
      {
        cong_thuc_a1: "Sử dụng chiến lược content marketing với video ngắn trên TikTok và Instagram Reels",
        cong_thuc_a: "Tăng độ nhận diện thương hiệu, thu hút Gen Z, tăng tương tác 300%",
        nganh_hang: "Thời trang, F&B"
      },
      {
        cong_thuc_a1: "Triển khai chương trình loyalty program với rewards points",
        cong_thuc_a: "Tăng customer retention, lifetime value, tần suất mua hàng",
        nganh_hang: "Bán lẻ, E-commerce"
      }
    ];
  };

  const constructRAGPrompt = (userQuery: string, knowledge: any[]) => {
    return `
CONTEXT: Bạn là chuyên gia tư vấn chiến lược marketing thông minh. Dựa trên knowledge base dưới đây, hãy trả lời câu hỏi của người dùng một cách chi tiết và hữu ích.

KNOWLEDGE BASE:
${knowledge.map(item => `
- Chiến lược: ${item.cong_thuc_a1}
- Lợi ích: ${item.cong_thuc_a}
- Ngành hàng: ${item.nganh_hang}
`).join('\n')}

USER QUERY: ${userQuery}

Hãy trả lời theo cấu trúc:
1. Phân tích tình huống
2. Chiến lược phù hợp (2-3 chiến lược tốt nhất)
3. Hướng dẫn triển khai cụ thể
4. Metrics đo lường hiệu quả
5. Lưu ý và rủi ro

Trả lời bằng tiếng Việt, cung cấp ví dụ cụ thể và tham khảo chính xác từ knowledge base.
`;
  };

  const callLLMAPI = async (prompt: string, apiKey: string): Promise<string> => {
    // TODO: Implement actual LLM API call (OpenAI GPT, Anthropic Claude, etc.)
    // This is a placeholder response
    return `## Phân tích tình huống
Dựa trên câu hỏi của bạn, tôi hiểu bạn đang tìm kiếm giải pháp để cải thiện hiệu quả marketing cho doanh nghiệp.

## Chiến lược phù hợp
**1. Content Marketing với Video ngắn**
- Tận dụng TikTok và Instagram Reels để tạo nội dung viral
- Phù hợp với ngành thời trang và F&B
- Có thể tăng tương tác lên đến 300%

**2. Chương trình Loyalty Program**
- Xây dựng hệ thống điểm thưởng để giữ chân khách hàng
- Hiệu quả cho bán lẻ và e-commerce
- Tăng lifetime value của khách hàng

## Hướng dẫn triển khai
1. **Giai đoạn 1**: Nghiên cứu đối tượng mục tiêu
2. **Giai đoạn 2**: Xây dựng content calendar
3. **Giai đoạn 3**: Triển khai pilot campaign
4. **Giai đoạn 4**: Đo lường và tối ưu hóa

## Metrics đo lường
- Engagement rate: >5%
- Brand awareness: Tăng 50% trong 3 tháng
- Customer retention: Tăng 25%
- ROI: >300%

## Lưu ý và rủi ro
⚠️ **Cần chú ý**: Đầu tư thời gian để tạo content chất lượng
⚠️ **Rủi ro**: Trends thay đổi nhanh trên social media

Bạn có muốn tôi đi sâu vào chiến lược nào cụ thể không?`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* API Key Input */}
      {showApiInput && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-sm">Cấu hình API</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="Nhập API Key (OpenAI/Claude)..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={() => setShowApiInput(false)}
                disabled={!apiKey.trim()}
              >
                Lưu
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chat Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            Tư vấn chiến lược thông minh
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowApiInput(!showApiInput)}
              className="ml-auto"
            >
              Cài đặt API
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Messages */}
      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.type === 'bot' && (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    {message.isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang suy nghĩ...</span>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    )}
                    <div className={`text-xs mt-2 ${
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  
                  {message.type === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>
        </CardContent>
        
        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập câu hỏi về chiến lược marketing..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim() || !apiKey.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Chatbot;
