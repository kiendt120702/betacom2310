
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting batch embedding for SEO knowledge...');

    // Lấy tất cả tài liệu chưa có embedding
    const { data: documents, error: fetchError } = await supabase
      .from('seo_knowledge')
      .select('id, title, content, category')
      .is('embedding', null);

    if (fetchError) {
      throw fetchError;
    }

    if (!documents || documents.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'Không có tài liệu SEO nào cần embedding',
        processed: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${documents.length} SEO documents to embed`);

    let processedCount = 0;
    let errorCount = 0;

    // Xử lý từng tài liệu
    for (const doc of documents) {
      try {
        const content = `${doc.title} ${doc.content} ${doc.category || ''}`;
        
        console.log(`Embedding SEO document ${doc.id}...`);
        
        const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'text-embedding-ada-002',
            input: content,
          }),
        });

        if (!embeddingResponse.ok) {
          console.error(`Failed to generate embedding for SEO ${doc.id}`);
          errorCount++;
          continue;
        }

        const embeddingData = await embeddingResponse.json();
        const embedding = embeddingData.data[0].embedding;

        // Cập nhật embedding vào database
        const { error: updateError } = await supabase
          .from('seo_knowledge')
          .update({ embedding: embedding })
          .eq('id', doc.id);

        if (updateError) {
          console.error(`Failed to update embedding for SEO ${doc.id}:`, updateError);
          errorCount++;
        } else {
          processedCount++;
          console.log(`Successfully embedded SEO document ${doc.id}`);
        }

        // Delay để tránh rate limit
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Error processing SEO document ${doc.id}:`, error);
        errorCount++;
      }
    }

    return new Response(JSON.stringify({ 
      message: 'Batch embedding SEO completed',
      totalDocuments: documents.length,
      processed: processedCount,
      errors: errorCount
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in batch-embed-seo function:', error);
    return new Response(JSON.stringify({ 
      error: 'Đã có lỗi xảy ra khi batch embedding SEO knowledge' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
