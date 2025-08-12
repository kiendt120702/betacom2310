// Test the exact one-liner format from your instructions
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || "r8_BON**********************************", // Replace with your token
});

const input = {
  prompt: "đây là file gì á, bạn đọc được file này không",
  image_input: [],
  system_prompt: "You are a caveman",
  reasoning_effort: "minimal",
  max_completion_tokens: 4096
};

console.log("Testing GPT-5 Mini with input:", input);

try {
  for await (const event of replicate.stream("openai/gpt-5-mini", { input })) {
    process.stdout.write(event.toString());
  }
} catch (error) {
  console.error("Error:", error);
}