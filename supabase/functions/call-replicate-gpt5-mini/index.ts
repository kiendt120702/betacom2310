// @ts-expect-error Deno types are not available in this environment
/// <reference lib="deno.ns" />
// @ts-expect-error Deno standard library import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore - esm.sh is a valid source for Deno
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
    // @ts-ignore - Deno.env is available in Supabase Edge Functions
    const replicateApiToken = Deno.env.get("REPLICATE_API_TOKEN");
    if (!replicateApiToken) {
      console.error("REPLICATE_API_TOKEN is not set in Supabase secrets.");
      return new Response(
        JSON.stringify({ error: "Replicate API token is not configured." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { prompt, system_prompt, reasoning_effort } = await req.json();
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const replicate = new Replicate({
      auth: replicateApiToken,
    });

    console.log("Creating prediction with stream for prompt:", prompt);
    const prediction = await replicate.predictions.create({
      model: "openai/gpt-5-mini",
      input: {
        prompt,
        system_prompt: system_prompt || "You are a helpful assistant.",
        reasoning_effort: reasoning_effort || "minimal",
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