import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

const TacticChatbotPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl text-center shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary flex items-center justify-center gap-3">
            <MessageSquare className="w-8 h-8" />
            Hỏi đáp chiến thuật
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8">
          <p className="text-xl text-muted-foreground mb-4">
            Tính năng này sẽ sớm ra mắt!
          </p>
          <p className="text-sm text-gray-500">
            Chúng tôi đang nỗ lực để mang đến cho bạn công cụ hỏi đáp chiến thuật mạnh mẽ.
            Vui lòng quay lại sau nhé!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TacticChatbotPage;