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

    const { prompt, system_prompt, reasoning_effort, conversation_history } = await req.json();
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const replicate = new Replicate({
      auth: replicateApiToken,
    });

    // Build context-aware prompt with conversation history
    let contextualPrompt = prompt;
    if (conversation_history && conversation_history.length > 0) {
      const historyContext = conversation_history
        .slice(-10) // Only include last 10 messages to avoid token limit
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n\n');
      
      contextualPrompt = `Previous conversation context:\n${historyContext}\n\nCurrent question: ${prompt}`;
    }

    console.log("Creating prediction with context for prompt:", prompt);
    const prediction = await replicate.predictions.create({
      model: "openai/gpt-5-mini",
      input: {
        prompt: contextualPrompt,
        system_prompt: system_prompt || "You are a helpful AI assistant. You have access to the previous conversation context. Use this context to:\n1. Remember what the user has asked before\n2. Refer to previous topics when relevant\n3. Build upon earlier discussions\n4. Provide coherent, contextual responses\n5. Respond in Vietnamese when the user writes in Vietnamese, and in English otherwise\n\nAlways be helpful, accurate, and maintain conversation continuity.",
        reasoning_effort: reasoning_effort || "medium",
      },
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