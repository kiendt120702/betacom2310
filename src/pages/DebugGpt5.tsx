import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const DebugGpt5 = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("Hello, can you see this message?");

  const testDebugFunction = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log("Testing debug function...");
      
      const { data, error } = await supabase.functions.invoke('debug-gpt5', {
        body: {
          prompt: prompt,
          test: true
        }
      });

      if (error) {
        console.error("Debug function error:", error);
        setResult({ error: error, type: "debug_function_error" });
      } else {
        console.log("Debug function success:", data);
        setResult({ data: data, type: "debug_function_success" });
      }
    } catch (error: any) {
      console.error("Test error:", error);
      setResult({ error: error.message || error, type: "test_error" });
    } finally {
      setLoading(false);
    }
  };

  const testMainFunction = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log("Testing main GPT5 function...");
      
      const { data, error } = await supabase.functions.invoke('call-replicate-gpt5-mini', {
        body: {
          prompt: prompt,
          system_prompt: "You are a helpful assistant",
          reasoning_effort: "medium",
          max_completion_tokens: 4096
        }
      });

      if (error) {
        console.error("Main function error:", error);
        setResult({ error: error, type: "main_function_error" });
      } else {
        console.log("Main function success:", data);
        setResult({ data: data, type: "main_function_success" });
      }
    } catch (error: any) {
      console.error("Test error:", error);
      setResult({ error: error.message || error, type: "test_error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>GPT-5 Mini Debug Tool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Test Prompt:</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter test prompt..."
              rows={3}
            />
          </div>
          
          <div className="flex gap-4">
            <Button onClick={testDebugFunction} disabled={loading}>
              {loading ? "Testing..." : "Test Debug Function"}
            </Button>
            <Button onClick={testMainFunction} disabled={loading} variant="outline">
              {loading ? "Testing..." : "Test Main Function"}
            </Button>
          </div>

          {result && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">
                  Result ({result.type})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DebugGpt5;