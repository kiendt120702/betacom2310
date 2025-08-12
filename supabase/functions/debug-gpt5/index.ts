/// <reference types="https://esm.sh/v135/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Debug function called");
    
    // Check environment variables
    const replicateApiToken = Deno.env.get("REPLICATE_API_TOKEN");
    
    console.log("Environment check:", {
      hasReplicateToken: !!replicateApiToken,
      tokenLength: replicateApiToken ? replicateApiToken.length : 0
    });

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log("Request body parsed successfully:", {
        hasPrompt: !!requestBody.prompt,
        hasImage: !!requestBody.image_url,
        keys: Object.keys(requestBody)
      });
    } catch (error) {
      console.error("Failed to parse request body:", error);
      return new Response(
        JSON.stringify({ 
          error: "Invalid JSON in request body",
          details: error.message
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Test minimal Replicate call if token exists
    let replicateTest = null;
    if (replicateApiToken && requestBody?.prompt) {
      try {
        // Import Replicate for testing
        const Replicate = (await import("https://esm.sh/replicate@0.29.1")).default;
        const replicate = new Replicate({
          auth: replicateApiToken,
        });

        // Test with minimal input matching the schema
        const testInput = {
          prompt: requestBody.prompt,
          reasoning_effort: "minimal",
          max_completion_tokens: 100
        };

        console.log("Testing Replicate with input:", testInput);
        
        const prediction = await replicate.predictions.create({
          model: "openai/gpt-5-mini",
          input: testInput,
          stream: false, // Non-streaming for debug
        });

        replicateTest = {
          success: true,
          predictionId: prediction.id,
          status: prediction.status
        };
      } catch (error: any) {
        replicateTest = {
          success: false,
          error: error.message,
          details: error
        };
      }
    }

    // Return debug information
    return new Response(
      JSON.stringify({
        success: true,
        environment: {
          hasReplicateToken: !!replicateApiToken,
          tokenPrefix: replicateApiToken ? replicateApiToken.substring(0, 8) + "..." : null
        },
        request: {
          method: req.method,
          hasBody: !!requestBody,
          bodyKeys: requestBody ? Object.keys(requestBody) : []
        },
        replicateTest: replicateTest,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("Debug function error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Debug function failed",
        message: error.message,
        stack: error.stack
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});