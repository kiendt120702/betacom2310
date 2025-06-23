
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Loader2, Search } from 'lucide-react';
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
      content: 'Xin chào! Tôi là chuyên gia SEO Shopee, chuyên hỗ trợ tạo tên sản phẩm và mô tả sản phẩm chuẩn SEO để tăng thứ hạng tìm kiếm và chuyển đổi.\n\nTôi có thể giúp bạn:\n\n🔍 **Tạo tên sản phẩm chuẩn SEO** (80-100 ký tự)\n📝 **Viết mô tả sản phẩm tối ưu** (2000-2500 ký tự)\n📊 **Tư vấn từ khóa và cách sắp xếp**\n✅ **Kiểm tra và cải thiện nội dung sản phẩm**\n\nHãy cho tôi biết loại sản phẩm bạn muốn tối ưu SEO, hoặc nếu bạn có câu hỏi cụ thể về SEO Shopee!',
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
            bot_type: 'seo',
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
      const { data, error } = await supabase.functions.invoke('chat-seo', {
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
        content: 'Xin lỗi, đã có lỗi xảy ra khi xử lý câu hỏi SEO của bạn. Vui lòng thử lại sau.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Lỗi",
        description: "Không thể kết nối đến dịch vụ AI SEO. Vui lòng thử lại.",
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

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Chat Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="w-5 h-5 text-green-600" />
            Chuyên gia SEO Shopee (AI)
          </CardTitle>
          <p className="text-sm text-gray-600">
            Tối ưu hóa tên sản phẩm và mô tả chuẩn SEO để tăng thứ hạng tìm kiếm và doanh số
          </p>
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
                        <span>Đang phân tích và tìm kiếm tài liệu SEO...</span>
                      </div>
                    ) : (
                      <>
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        {message.context && message.context.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-300">
                            <div className="text-xs text-gray-600 mb-2">
                              📚 Tài liệu tham khảo ({message.context.length} tài liệu SEO):
                            </div>
                            <div className="text-xs space-y-1">
                              {message.context.slice(0, 3).map((item: any, index: number) => (
                                <div key={index} className="bg-gray-50 p-2 rounded text-gray-700">
                                  <strong>{item.title}</strong>
                                  {item.category && <span className="text-gray-500"> - {item.category}</span>}
                                  <br />
                                  <span className="text-gray-600">Độ liên quan: {(item.similarity * 100).toFixed(1)}%</span>
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
              placeholder="Hỏi về tên sản phẩm, mô tả SEO, từ khóa, hoặc bất kỳ câu hỏi SEO Shopee nào..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            🎯 Chuyên gia SEO Shopee sẵn sàng - Tối ưu tên sản phẩm + Viết mô tả chuẩn SEO + Tư vấn từ khóa
          </p>
        </div>
      </Card>
    </div>
  );
};

export default SeoChatbot;
