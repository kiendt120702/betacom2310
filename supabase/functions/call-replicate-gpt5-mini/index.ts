import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore - esm.sh is a valid source for Deno
import Replicate from "https://esm.sh/replicate@0.29.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Get the REPLICATE_API_TOKEN from the environment variables
    // @ts-ignore - Deno.env is available in Supabase Edge Functions
    const replicateApiToken = Deno.env.get("REPLICATE_API_TOKEN");
    if (!replicateApiToken) {
      console.error("REPLICATE_API_TOKEN is not set in Supabase secrets.");
      return new Response(
        JSON.stringify({ error: "Replicate API token is not configured." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Get the prompt from the request body
    const { prompt, system_prompt, reasoning_effort } = await req.json();
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Initialize the Replicate client
    const replicate = new Replicate({
      auth: replicateApiToken,
    });

    // 4. Call the Replicate API
    console.log("Calling Replicate API with prompt:", prompt);
    const output = await replicate.run(
      "openai/gpt-5-mini",
      {
        input: {
          prompt,
          system_prompt: system_prompt || "You are a helpful assistant.", // Default system prompt
          reasoning_effort: reasoning_effort || "minimal", // Default effort
        },
      }
    );
    console.log("Received output from Replicate:", output);

    // The output is an array of strings. We'll join them.
    const result = (output as string[]).join("");

    // 5. Return the response
    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error calling Replicate:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});