# GPT-5 Mini Setup Instructions

## 🔧 Fix the API Error

The error `Function returned a non-2xx status code` is most likely due to missing REPLICATE_API_TOKEN.

### Step 1: Set your Replicate API Token

```bash
# Login to Supabase (if not already logged in)
npx supabase login

# Set your Replicate API token
npx supabase secrets set REPLICATE_API_TOKEN=r8_BON**********************************
```

### Step 2: Deploy the updated functions

```bash
# Deploy both functions
npx supabase functions deploy call-replicate-gpt5-mini
npx supabase functions deploy debug-gpt5
```

### Step 3: Test the setup

1. Go to `/debug-gpt5` in your app
2. Click "Test Debug Function" to verify connectivity
3. Click "Test Main Function" to test GPT-5 Mini

### Step 4: Expected Input Format

Your Edge Function now matches the exact GPT-5 Mini schema:

```typescript
const input = {
  prompt: "đây là file gì á, bạn đọc được file này không",
  image_input: ["https://example.com/image.jpg"], // Array of image URLs
  system_prompt: "You are a caveman",
  reasoning_effort: "minimal", // minimal, low, medium, high
  max_completion_tokens: 4096
};
```

### Step 5: Test with Node.js (Optional)

If you want to test the one-liner format:

```bash
# Install Replicate
npm install replicate

# Set environment variable
export REPLICATE_API_TOKEN=r8_BON**********************************

# Run the test file
node test-gpt5-oneliner.js
```

## ✅ What's Fixed

1. **Correct Schema**: Updated to match exact GPT-5 Mini input schema
2. **Image Support**: Uses `image_input` array format
3. **Better Logging**: Enhanced error messages and debugging
4. **Debug Tools**: Added debug function and test page

## 🚨 Common Issues

- **Function not found**: Deploy functions with `npx supabase functions deploy`
- **CORS errors**: Make sure you're calling from the correct domain
- **Token errors**: Verify your REPLICATE_API_TOKEN is set correctly

After following these steps, your chat should work with both text and images!