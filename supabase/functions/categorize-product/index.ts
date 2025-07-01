import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration is missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { productName } = await req.json();

    if (!productName) {
      throw new Error('productName is required');
    }

    // Fetch categories dynamically from the database
    const { data: categoryData, error: fetchError } = await supabase
      .from('product_categories')
      .select('name, category_id');

    if (fetchError) {
      console.error('Error fetching product categories:', fetchError);
      throw new Error('Could not load product categories from database.');
    }

    const categoryListString = categoryData.map(c => `- ${c.name} (ma_nganh_hang: ${c.category_id})`).join('\n');

    const prompt = `You are a highly precise product categorization AI for a Vietnamese e-commerce platform. Your single task is to match a given product name to the most specific and relevant category ID from the provided list.

**CRITICAL INSTRUCTIONS:**
1.  **Analyze the Product Name:** Deconstruct the product name to identify its core type, material, intended user, and function.
2.  **Find the Best Match:** Scrutinize the category list to find the most granular and accurate category. For example, for "Áo khoác bomber nam", the category "Thời Trang Nam/Áo khoác, Áo choàng & Áo vest" is superior to the more general "Thời Trang Nam".
3.  **Output Format:** Your response MUST be ONLY the numerical \`ma_nganh_hang\` (category ID). Do NOT include the category name, any explanation, or any other text. Just the number.

**Category List (Tên ngành hàng (ma_nganh_hang)):**
${categoryListString}

---
**Product Name:**
"${productName}"

**Your Response (ID ONLY):**`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
        max_tokens: 15,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const responseData = await response.json();
    const rawContent = responseData.choices?.[0]?.message?.content || '';

    // Regex to find any sequence of digits in the response
    const match = rawContent.match(/\b(\d+)\b/);
    const categoryId = match ? match[1] : '';

    const isValidId = categoryData.some(c => c.category_id === categoryId);

    return new Response(JSON.stringify({ categoryId: isValidId ? categoryId : '' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in categorize-product function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});