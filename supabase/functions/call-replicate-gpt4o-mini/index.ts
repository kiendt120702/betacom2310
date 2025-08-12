/// <reference types="https://esm.sh/v135/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Replicate from "https://esm.sh/replicate@0.29.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  console.log("GPT-4o Mini function called with method:", req.method);

  try {
    const replicateApiToken = Deno.env.get("REPLICATE_API_TOKEN");
    if (!replicateApiToken) {
      console.error("REPLICATE_API_TOKEN is not set in Supabase secrets.");
      return new Response(
        JSON.stringify({ 
          error: "Replicate API token is not configured. Please set REPLICATE_API_TOKEN in Supabase secrets.",
          hint: "supabase secrets set REPLICATE_API_TOKEN=your_token"
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let requestBody;
    try {
      requestBody = await req.json();
      console.log("Request body parsed:", { 
        hasPrompt: !!requestBody.prompt, 
        hasImage: !!requestBody.image_url,
        keys: Object.keys(requestBody)
      });
    } catch (parseError) {
      console.error("Failed to parse request JSON:", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { prompt, system_prompt, temperature, top_p, presence_penalty, frequency_penalty, max_completion_tokens, conversation_history, image_url } = requestBody;
    
    let finalPrompt = prompt;

    // If an image is provided without a text prompt, use a default prompt.
    if (image_url && (!prompt || prompt.trim() === "")) {
      finalPrompt = "Mô tả chi tiết hình ảnh này.";
      console.log("Image provided without a prompt. Using default prompt:", finalPrompt);
    }

    // The model always requires a prompt, even with an image.
    if (!finalPrompt || finalPrompt.trim() === "") {
      return new Response(
        JSON.stringify({ error: "Prompt is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const replicate = new Replicate({
      auth: replicateApiToken,
    });

    let contextualPrompt = finalPrompt;
    if (conversation_history && conversation_history.length > 0) {
      const historyContext = conversation_history
        .slice(-10)
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n\n');
      
      contextualPrompt = `Previous conversation context:\n${historyContext}\n\nCurrent question: ${finalPrompt}`;
    }

    const input: {
      prompt: string;
      system_prompt?: string;
      temperature?: number;
      top_p?: number;
      presence_penalty?: number;
      frequency_penalty?: number;
      max_completion_tokens?: number;
      image_input?: string[];
    } = {
      prompt: contextualPrompt,
      temperature: temperature || 1,
      top_p: top_p || 1,
      presence_penalty: presence_penalty || 0,
      frequency_penalty: frequency_penalty || 0,
      max_completion_tokens: max_completion_tokens || 4096,
    };

    if (system_prompt) {
      input.system_prompt = system_prompt;
    } else {
      input.system_prompt = "You are a helpful AI assistant named Betacom Assistant, powered by OpenAI's GPT-4o Mini model. You have access to the previous conversation context. Use this context to:\n1. Remember what the user has asked before\n2. Refer to previous topics when relevant\n3. Build upon earlier discussions\n4. Provide coherent, contextual responses\n5. Respond in Vietnamese when the user writes in Vietnamese, and in English otherwise\n\nAlways be helpful, accurate, and maintain conversation continuity.";
    }

    if (image_url) {
      input.image_input = [image_url];
    }

    console.log("Creating prediction with final input:", JSON.stringify(input, null, 2));
    
    try {
      const prediction = await replicate.predictions.create({
        model: "openai/gpt-4o-mini",
        input: input,
        stream: true,
      });
      
      console.log("Created prediction successfully:", {
        id: prediction.id,
        status: prediction.status,
        urls: prediction.urls
      });
      
      return new Response(JSON.stringify(prediction), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (replicateError: unknown) {
      console.error("Replicate API error:", replicateError);
      
      const errorDetails = {
        message: replicateError instanceof Error ? replicateError.message : String(replicateError),
        status: (replicateError as any)?.status,
        statusText: (replicateError as any)?.statusText,
        response: (replicateError as any)?.response ? await (replicateError as any).response.text().catch(() => 'Unable to read response') : null,
        stack: replicateError instanceof Error ? replicateError.stack : undefined,
        input: { hasPrompt: !!prompt, hasImage: !!image_url, imageUrl: image_url }
      };
      
      console.error("Detailed error:", JSON.stringify(errorDetails, null, 2));
      
      return new Response(
        JSON.stringify({ 
          error: `Replicate API error: ${replicateError instanceof Error ? replicateError.message : "Unknown error"}`,
          details: errorDetails
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error creating Replicate prediction:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});