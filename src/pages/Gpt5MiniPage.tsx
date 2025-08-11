import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useGpt5Mini } from "@/hooks/useGpt5Mini";
import {
  useConversations,
  useMessages,
  useCreateConversation,
  useAddMessage,
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
  const [isStreaming, setIsStreaming] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const { data: conversations, isLoading: conversationsLoading } = useConversations();
  const { data: messages = [], refetch: refetchMessages } = useMessages(selectedConversationId);

  const createConversationMutation = useCreateConversation();
  const addMessageMutation = useAddMessage();
  const gpt5MiniMutation = useGpt5Mini();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

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

    // Create a new conversation if one isn't selected
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

    // Add user message to the database
    await addMessageMutation.mutateAsync({
      conversation_id: conversationId,
      role: "user",
      content: prompt,
    });

    // Start the AI response stream
    setIsStreaming(true);
    let fullResponse = "";

    gpt5MiniMutation.mutate(
      { prompt },
      {
        onSuccess: (prediction) => {
          if (prediction.urls && prediction.urls.stream) {
            const source = new EventSource(prediction.urls.stream);
            eventSourceRef.current = source;

            source.onmessage = (e) => {
              if (e.data === "[DONE]") {
                source.close();
                eventSourceRef.current = null;
                setIsStreaming(false);
                addMessageMutation.mutate({
                  conversation_id: conversationId!,
                  role: "assistant",
                  content: fullResponse,
                });
              } else {
                fullResponse += JSON.parse(e.data);
                refetchMessages(); // This is a simple way to show streaming
              }
            };

            source.onerror = (e) => {
              console.error("EventSource error:", e);
              source.close();
              eventSourceRef.current = null;
              setIsStreaming(false);
              toast.error("Lỗi streaming", { description: "Mất kết nối với AI." });
            };
          }
        },
        onError: () => {
          setIsStreaming(false);
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
          messages={messages}
          isLoading={isStreaming || gpt5MiniMutation.isPending}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default Gpt5MiniPage;