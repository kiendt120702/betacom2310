import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useGpt5Mini } from "@/hooks/useGpt5Mini";
import {
  useConversations,
  useMessages,
  useCreateConversation,
  useAddMessage,
  Message,
} from "@/hooks/useGpt5Chat";
import ChatSidebar from "@/components/gpt5/ChatSidebar";
import ChatArea from "@/components/gpt5/ChatArea";
import { toast } from "sonner";

const Gpt5MiniPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    searchParams.get("id")
  );
  
  const [displayMessages, setDisplayMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const streamingResponseRef = useRef<string>("");

  const { data: conversations, isLoading: conversationsLoading } = useConversations();
  const { data: dbMessages = [], refetch: refetchMessages } = useMessages(selectedConversationId);

  const createConversationMutation = useCreateConversation();
  const addMessageMutation = useAddMessage();
  const gpt5MiniMutation = useGpt5Mini();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  useEffect(() => {
    // Only sync with database when not actively chatting and no temporary messages
    if (!gpt5MiniMutation.isPending && !isStreaming) {
      // Filter out temporary messages before syncing
      const hasTemporaryMessages = displayMessages.some(msg => 
        msg.id.startsWith('temp-') || msg.id.startsWith('error-')
      );
      
      if (!hasTemporaryMessages) {
        setDisplayMessages(dbMessages);
      }
    }
  }, [dbMessages, gpt5MiniMutation.isPending, isStreaming, displayMessages]);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const handleSelectConversation = (id: string) => {
    // Clear any streaming states when switching conversations
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsStreaming(false);
    streamingResponseRef.current = "";
    
    setSelectedConversationId(id);
    setSearchParams({ id });
  };

  const handleNewChat = () => {
    // Clear any streaming states when creating new chat
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsStreaming(false);
    streamingResponseRef.current = "";
    
    setSelectedConversationId(null);
    setSearchParams({});
    setDisplayMessages([]); // Clear display messages for new chat
  };

  const handleSendMessage = async (prompt: string) => {
    let conversationId = selectedConversationId;

    if (!conversationId) {
      try {
        const newConversation = await createConversationMutation.mutateAsync(
          prompt.substring(0, 50)
        );
        conversationId = newConversation.id;
        setSelectedConversationId(conversationId);
        setSearchParams({ id: conversationId });
      } catch (error) {
        toast.error("Lỗi tạo cuộc trò chuyện", {
          description: "Không thể tạo cuộc trò chuyện mới. Vui lòng thử lại."
        });
        return;
      }
    }

    if (!conversationId) return;

    const userMessage: Message = {
      id: `temp-user-${Date.now()}`,
      conversation_id: conversationId,
      role: "user",
      content: prompt,
      created_at: new Date().toISOString(),
    };
    setDisplayMessages(prev => [...prev, userMessage]);
    
    // Save user message to database
    try {
      await addMessageMutation.mutateAsync({
        conversation_id: conversationId,
        role: "user",
        content: prompt,
      });
      
      // Update the temporary message with a proper ID
      setDisplayMessages(prev => prev.map(msg => 
        msg.id === userMessage.id 
          ? { ...msg, id: `user-${Date.now()}` }
          : msg
      ));
    } catch (error) {
      console.error('Error saving user message:', error);
    }

    streamingResponseRef.current = "";
    const assistantMessagePlaceholder: Message = {
      id: `temp-assistant-${Date.now()}`,
      conversation_id: conversationId,
      role: "assistant",
      content: "",
      created_at: new Date().toISOString(),
    };
    setDisplayMessages(prev => [...prev, assistantMessagePlaceholder]);
    setIsStreaming(true);

    gpt5MiniMutation.mutate(
      { prompt },
      {
        onSuccess: (prediction) => {
          console.log("GPT-5 Mini success, prediction:", prediction);
          
          if (prediction.urls && prediction.urls.stream) {
            console.log("Starting EventSource with URL:", prediction.urls.stream);
            
            const source = new EventSource(prediction.urls.stream);
            eventSourceRef.current = source;

            source.addEventListener("output", (e) => {
              console.log("EventSource output event:", e.data);
              try {
                // Parse the data if it's JSON
                let outputData = e.data;
                try {
                  const parsed = JSON.parse(e.data);
                  outputData = parsed.data || parsed.output || parsed;
                } catch {
                  // If not JSON, use as is
                  outputData = e.data;
                }
                
                streamingResponseRef.current += outputData;
                setDisplayMessages(prev => prev.map(msg => 
                  msg.id === assistantMessagePlaceholder.id 
                    ? { ...msg, content: streamingResponseRef.current }
                    : msg
                ));
              } catch (error) {
                console.error("Error processing stream data:", error);
              }
            });

            source.addEventListener("done", () => {
              console.log("EventSource done event, final content:", streamingResponseRef.current);
              source.close();
              eventSourceRef.current = null;
              setIsStreaming(false);
              
              if (streamingResponseRef.current.trim()) {
                addMessageMutation.mutate({
                  conversation_id: conversationId!,
                  role: "assistant",
                  content: streamingResponseRef.current,
                }, {
                  onSuccess: () => {
                    // Replace temporary message with final message instead of refetching
                    setDisplayMessages(prev => prev.map(msg => 
                      msg.id === assistantMessagePlaceholder.id 
                        ? { 
                            ...msg, 
                            id: `msg-${Date.now()}`, // Give it a proper ID
                            content: streamingResponseRef.current 
                          }
                        : msg
                    ));
                    
                    // Delay refetch to avoid conflicts
                    setTimeout(() => {
                      refetchMessages();
                    }, 1000);
                  }
                });
              } else {
                console.warn("No content received from stream");
                // Add error message for empty response
                const errorMessage: Message = {
                  id: `error-${Date.now()}`,
                  conversation_id: conversationId!,
                  role: "assistant",
                  content: "⚠️ Không nhận được phản hồi từ AI. Vui lòng thử lại.",
                  created_at: new Date().toISOString(),
                };
                
                setDisplayMessages(prev => prev.map(msg => 
                  msg.id === assistantMessagePlaceholder.id ? errorMessage : msg
                ));
              }
            });

            source.addEventListener("error", (e) => {
              console.error("EventSource error event:", e);
            });

            source.onerror = (e) => {
              console.error("EventSource onerror:", e);
              source.close();
              eventSourceRef.current = null;
              setIsStreaming(false);
              
              // Add error message to chat instead of removing placeholder
              const errorMessage: Message = {
                id: `error-${Date.now()}`,
                conversation_id: conversationId!,
                role: "assistant",
                content: "⚠️ Lỗi kết nối streaming. Vui lòng thử lại.",
                created_at: new Date().toISOString(),
              };
              
              setDisplayMessages(prev => prev.map(msg => 
                msg.id === assistantMessagePlaceholder.id ? errorMessage : msg
              ));
              
              toast.error("Lỗi streaming", { 
                description: "Mất kết nối với AI. Tin nhắn lỗi đã được thêm vào cuộc trò chuyện." 
              });
            };
          } else {
            console.error("No stream URL in prediction response:", prediction);
            setIsStreaming(false);
            
            const errorMessage: Message = {
              id: `error-${Date.now()}`,
              conversation_id: conversationId!,
              role: "assistant",
              content: "❌ Phản hồi API không hợp lệ - thiếu URL stream",
              created_at: new Date().toISOString(),
            };
            
            setDisplayMessages(prev => prev.map(msg => 
              msg.id === assistantMessagePlaceholder.id ? errorMessage : msg
            ));
          }
        },
        onError: (error) => {
          console.error("GPT-5 Mini mutation error:", error);
          setIsStreaming(false);
          
          // Add error message to chat instead of removing placeholder
          const errorMessage: Message = {
            id: `error-${Date.now()}`,
            conversation_id: conversationId!,
            role: "assistant",
            content: `❌ Lỗi API: ${error.message || "Không thể tạo yêu cầu AI."}`,
            created_at: new Date().toISOString(),
          };
          
          setDisplayMessages(prev => prev.map(msg => 
            msg.id === assistantMessagePlaceholder.id ? errorMessage : msg
          ));
          
          toast.error("Lỗi khi gửi yêu cầu", {
            description: error.message || "Không thể tạo yêu cầu AI."
          });
        },
      }
    );
  };

  return (
    <div className="h-screen flex">
      <div className="w-80 flex-shrink-0">
        <ChatSidebar
          conversations={conversations}
          isLoading={conversationsLoading}
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
        />
      </div>
      <div className="flex-1">
        <ChatArea
          messages={displayMessages}
          isLoading={gpt5MiniMutation.isPending || isStreaming}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default Gpt5MiniPage;