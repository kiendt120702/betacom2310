
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Loader2, MessageCircle, Settings, Key } from 'lucide-react';
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

interface ChatbotProps {
  className?: string;
}

const Chatbot: React.FC<ChatbotProps> = ({ className = '' }) => {
  const { user } = useAuth();
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
          .from('chat_conversations')
          .insert({
            user_id: user.id,
            bot_type: 'strategy',
            title: 'Tư vấn chiến lược'
          })
          .select()
          .single();
        
        if (error) throw error;
        setConversationId(data.id);
      } catch (error) {
        console.error('Error creating conversation:', error);
      }
    };

    createConversation();
  }, [user]);

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
      const { data, error } = await supabase.functions.invoke('chat-strategy', {
        body: {
          message: userMessage.content,
          apiKey: apiKey,
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
        content: 'Xin lỗi, đã có lỗi xảy ra khi xử lý câu hỏi của bạn. Vui lòng kiểm tra API key và thử lại.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Lỗi",
        description: "Không thể kết nối đến dịch vụ AI. Vui lòng thử lại.",
        variant: "destructive",
      });
      console.error('Chatbot error:', error);
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
      {/* API Key Input */}
      {showApiInput && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Key className="w-4 h-4" />
              Cấu hình API OpenAI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="Nhập OpenAI API Key..."
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
            <p className="text-xs text-gray-500 mt-2">
              API key sẽ được sử dụng để truy cập OpenAI GPT-4 và tạo embeddings
            </p>
          </CardContent>
        </Card>
      )}

      {/* Chat Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            Tư vấn chiến lược thông minh (RAG System)
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowApiInput(!showApiInput)}
              className="ml-auto"
            >
              <Settings className="w-4 h-4" />
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
                        <span>Đang phân tích và tìm kiếm chiến lược phù hợp...</span>
                      </div>
                    ) : (
                      <>
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        {message.context && message.context.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-300">
                            <div className="text-xs text-gray-600 mb-2">
                              📚 Kiến thức tham khảo ({message.context.length} chiến lược):
                            </div>
                            <div className="text-xs space-y-1">
                              {message.context.slice(0, 3).map((item: any, index: number) => (
                                <div key={index} className="bg-gray-50 p-2 rounded text-gray-700">
                                  <strong>{item.industry_application}</strong> - Độ liên quan: {(item.similarity * 100).toFixed(1)}%
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
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
              placeholder="Mô tả vấn đề bạn đang gặp phải hoặc hỏi về chiến lược marketing..."
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
          {apiKey && (
            <p className="text-xs text-gray-500 mt-2">
              ✅ Hệ thống RAG đã sẵn sàng - Tìm kiếm vector similarity + GPT-4
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Chatbot;
