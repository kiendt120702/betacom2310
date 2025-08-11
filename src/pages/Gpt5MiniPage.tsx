import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, Bot } from "lucide-react";
import { useGpt5Mini } from "@/hooks/useGpt5Mini";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Gpt5MiniPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("You are a helpful assistant.");
  const [reasoningEffort, setReasoningEffort] = useState<"minimal" | "moderate" | "intense">("minimal");

  const gpt5MiniMutation = useGpt5Mini();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    gpt5MiniMutation.mutate({
      prompt,
      system_prompt: systemPrompt,
      reasoning_effort: reasoningEffort,
    });
  };

  if (!user) return null;

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
          <Bot className="h-8 w-8 text-primary" />
          GPT-5 Mini Playground
        </h1>
        <p className="text-muted-foreground mt-2">
          Tương tác với mô hình openai/gpt-5-mini thông qua Replicate.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Nhập thông tin</CardTitle>
            <CardDescription>Cung cấp prompt và các tham số cho mô hình AI.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="prompt">Prompt *</Label>
                <Textarea
                  id="prompt"
                  placeholder="Ví dụ: What is the point of life?"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[150px] resize-y"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="system_prompt">System Prompt</Label>
                <Textarea
                  id="system_prompt"
                  placeholder="Ví dụ: You are a caveman"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="min-h-[80px] resize-y"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reasoning_effort">Reasoning Effort</Label>
                <Select
                  value={reasoningEffort}
                  onValueChange={(value: "minimal" | "moderate" | "intense") => setReasoningEffort(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="intense">Intense</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                disabled={gpt5MiniMutation.isPending || !prompt.trim()}
                className="w-full h-12 text-base font-medium"
              >
                {gpt5MiniMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Gửi yêu cầu
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Output */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Kết quả từ AI</CardTitle>
            <CardDescription>Phản hồi từ mô hình sẽ được hiển thị ở đây.</CardDescription>
          </CardHeader>
          <CardContent>
            {gpt5MiniMutation.isPending && (
              <div className="flex items-center justify-center h-full min-h-[200px]">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                  <p className="mt-4 text-muted-foreground">AI đang suy nghĩ...</p>
                </div>
              </div>
            )}
            {gpt5MiniMutation.isError && (
              <div className="text-red-500 bg-red-50 p-4 rounded-md">
                <p className="font-semibold">Đã xảy ra lỗi:</p>
                <p className="text-sm">{gpt5MiniMutation.error.message}</p>
              </div>
            )}
            {gpt5MiniMutation.isSuccess && (
              <div className="prose dark:prose-invert max-w-none bg-muted/50 p-4 rounded-md whitespace-pre-wrap">
                {gpt5MiniMutation.data}
              </div>
            )}
            {!gpt5MiniMutation.isPending && !gpt5MiniMutation.isError && !gpt5MiniMutation.isSuccess && (
              <div className="flex items-center justify-center h-full min-h-[200px]">
                <div className="text-center text-muted-foreground">
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Chưa có kết quả</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Gpt5MiniPage;