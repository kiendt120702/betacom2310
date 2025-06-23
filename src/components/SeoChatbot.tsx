
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Loader2, Lightbulb, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  context?: any[];
}

interface SeoChatbotProps {
  className?: string;
}

const SeoChatbot: React.FC<SeoChatbotProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Xin chào! Tôi là chuyên gia tư vấn SEO cho sản phẩm Shopee. Tôi có thể giúp bạn:\n\n• Tối ưu tên sản phẩm theo chuẩn SEO\n• Viết mô tả sản phẩm hiệu quả\n• Cấu trúc từ khóa phù hợp\n• Tuân thủ quy định của Shopee\n\nHãy mô tả sản phẩm của bạn hoặc đặt câu hỏi về SEO để tôi tư vấn chi tiết!',
      timestamp: new Date()
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Create conversation when component mounts
  useEffect(() => {
    const createConversation = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('seo_chat_conversations')
          .insert({
            user_id: user.id,
            title: 'Tư vấn SEO Shopee'
          })
          .select()
          .single();
        
        if (error) throw error;
        setConversationId(data.id);
      } catch (error) {
        console.error('Error creating SEO conversation:', error);
      }
    };

    createConversation();
  }, [user]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

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
      const { data, error } = await supabase.functions.invoke('seo-chat', {
        body: {
          message: userMessage.content,
          conversationId: conversationId
        }
      });

      if (error) throw error;

      setMessages(prev => prev.filter(msg => msg.id !== loadingMessage.id));
      
      const responseMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'bot',
        content: data.response,
        timestamp: new Date(),
        context: data.context
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
      console.error('SEO Chatbot error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedQuestions = [
    "Làm thế nào để đặt tên sản phẩm áo thun nam theo chuẩn SEO?",
    "Viết mô tả cho sản phẩm giày sneaker nữ như thế nào?",
    "Cách sắp xếp từ khóa trong tên sản phẩm điện thoại?",
    "Quy định của Shopee về tên sản phẩm là gì?",
  ];

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Chat Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="w-5 h-5 text-green-600" />
            Chuyên gia tư vấn SEO Shopee (AI)
          </CardTitle>
          <p className="text-sm text-gray-600">
            Hệ thống AI tư vấn tối ưu tên sản phẩm và mô tả theo chuẩn SEO Shopee
          </p>
        </CardHeader>
      </Card>

      {/* Suggested Questions */}
      {messages.length <= 1 && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              Gợi ý câu hỏi:
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInputMessage(question)}
                  className="text-left text-sm p-2 rounded border hover:bg-gray-50 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
                    <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    {message.isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang phân tích và tìm kiếm thông tin SEO phù hợp...</span>
                      </div>
                    ) : (
                      <>
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        {message.context && message.context.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-300">
                            <div className="text-xs text-gray-600 mb-2">
                              📚 Kiến thức tham khảo ({message.context.length} tài liệu):
                            </div>
                            <div className="text-xs space-y-1">
                              {message.context.slice(0, 3).map((item: any, index: number) => (
                                <div key={index} className="bg-gray-50 p-2 rounded text-gray-700">
                                  <strong>{item.title}</strong> - Độ liên quan: {(item.similarity * 100).toFixed(1)}%
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    <div className={`text-xs mt-2 ${
                      message.type === 'user' ? 'text-green-100' : 'text-gray-500'
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
              placeholder="Hỏi về SEO tên sản phẩm, mô tả, từ khóa... Ví dụ: 'Cách đặt tên sản phẩm áo thun nam?'"
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            ✅ Hệ thống RAG sẵn sàng - Tìm kiếm kiến thức + Phân tích ngữ cảnh + Tư vấn chuyên sâu
          </p>
        </div>
      </Card>
    </div>
  );
};

export default SeoChatbot;
