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
    if (!gpt5MiniMutation.isPending && !isStreaming) {
      setDisplayMessages(dbMessages);
    }
  }, [dbMessages, gpt5MiniMutation.isPending, isStreaming]);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
    setSearchParams({ id });
  };

  const handleNewChat = () => {
    setSelectedConversationId(null);
    setSearchParams({});
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
    await addMessageMutation.mutateAsync({
      conversation_id: conversationId,
      role: "user",
      content: prompt,
    });

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
          if (prediction.urls && prediction.urls.stream) {
            const source = new EventSource(prediction.urls.stream);
            eventSourceRef.current = source;

            source.addEventListener("output", (e) => {
              streamingResponseRef.current += e.data;
              setDisplayMessages(prev => prev.map(msg => 
                msg.id === assistantMessagePlaceholder.id 
                  ? { ...msg, content: streamingResponseRef.current }
                  : msg
              ));
            });

            source.addEventListener("done", () => {
              source.close();
              eventSourceRef.current = null;
              setIsStreaming(false);
              
              addMessageMutation.mutate({
                conversation_id: conversationId!,
                role: "assistant",
                content: streamingResponseRef.current,
              }, {
                onSuccess: () => {
                  refetchMessages();
                }
              });
            });

            source.onerror = (e) => {
              console.error("EventSource error:", e);
              source.close();
              eventSourceRef.current = null;
              setIsStreaming(false);
              toast.error("Lỗi streaming", { description: "Mất kết nối với AI." });
              setDisplayMessages(prev => prev.filter(msg => msg.id !== assistantMessagePlaceholder.id));
            };
          }
        },
        onError: () => {
          setIsStreaming(false);
          setDisplayMessages(prev => prev.filter(msg => msg.id !== assistantMessagePlaceholder.id));
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