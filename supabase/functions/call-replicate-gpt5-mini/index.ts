
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

  try {
    const replicateApiToken = Deno.env.get("REPLICATE_API_TOKEN");
    if (!replicateApiToken) {
      console.error("REPLICATE_API_TOKEN is not set in Supabase secrets.");
      return new Response(
        JSON.stringify({ error: "Replicate API token is not configured." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { prompt, system_prompt, reasoning_effort, conversation_history, image_url } = await req.json();
    if (!prompt && !image_url) {
      return new Response(
        JSON.stringify({ error: "Prompt or image is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const replicate = new Replicate({
      auth: replicateApiToken,
    });

    // Build context-aware prompt with conversation history
    let contextualPrompt = prompt || "Phân tích hình ảnh này";
    if (conversation_history && conversation_history.length > 0) {
      const historyContext = conversation_history
        .slice(-10) // Only include last 10 messages to avoid token limit
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n\n');
      
      contextualPrompt = `Previous conversation context:\n${historyContext}\n\nCurrent question: ${contextualPrompt}`;
    }

    // Prepare input object for GPT-5 Mini
    const input: any = {
      prompt: contextualPrompt,
      system_prompt: system_prompt || "You are a helpful AI assistant with vision capabilities. You can analyze images and maintain conversation context. Use the previous conversation context to:\n1. Remember what the user has asked before\n2. Refer to previous topics when relevant\n3. Build upon earlier discussions\n4. Provide coherent, contextual responses\n5. When analyzing images, be detailed and helpful\n6. Respond in Vietnamese when the user writes in Vietnamese, and in English otherwise\n\nAlways be helpful, accurate, and maintain conversation continuity.",
      reasoning_effort: reasoning_effort || "medium",
    };

    // Add image to input if provided
    if (image_url) {
      input.image = image_url;
      console.log("Including image in GPT-5 request:", image_url);
    }

    console.log("Creating prediction with context for prompt:", prompt, "with image:", !!image_url);
    const prediction = await replicate.predictions.create({
      model: "openai/gpt-5-mini",
      input: input,
      stream: true, // Enable streaming
    });
    console.log("Created prediction:", prediction.id);

    // Return the entire prediction object, which includes the stream URL
    return new Response(JSON.stringify(prediction), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating Replicate prediction:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
