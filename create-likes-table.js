// Script to manually create banner_likes table
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tjzeskxkqvjbowikzqpv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqemVza3hrcXZqYm93aWt6cXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMjg0MjcsImV4cCI6MjA2NTkwNDQyN30.T-AV2KidsjI9c1Y7ue4Rk8PxSbG_ZImh7J0uCAz3qGk'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createLikesTable() {
  console.log('Attempting to create banner_likes table manually...')
  
  // Try to create the table using SQL
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS banner_likes (
        id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL,
        banner_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        UNIQUE(user_id, banner_id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_banner_likes_user_id ON banner_likes(user_id);
      CREATE INDEX IF NOT EXISTS idx_banner_likes_banner_id ON banner_likes(banner_id);
      
      ALTER TABLE banner_likes ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY IF NOT EXISTS "Users can view all banner likes" 
        ON banner_likes FOR SELECT 
        USING (auth.uid() IS NOT NULL);
      
      CREATE POLICY IF NOT EXISTS "Users can like banners" 
        ON banner_likes FOR INSERT 
        WITH CHECK (user_id = auth.uid());
      
      CREATE POLICY IF NOT EXISTS "Users can unlike banners" 
        ON banner_likes FOR DELETE 
        USING (user_id = auth.uid());
    `
  });

  if (error) {
    console.error('❌ Error creating table via SQL function:', error);
    
    // Try alternative approach - test if we can insert directly
    console.log('\nTrying alternative approach - testing direct insert...');
    
    const testUserId = '00000000-0000-0000-0000-000000000001';
    const testBannerId = '00000000-0000-0000-0000-000000000002';
    
    const { data: insertData, error: insertError } = await supabase
      .from('banner_likes')
      .insert({
        user_id: testUserId,
        banner_id: testBannerId
      });
    
    if (insertError) {
      console.error('❌ Table does not exist and cannot be created:', insertError);
      console.log('\n⚠️  You need to create the banner_likes table manually in Supabase Dashboard');
      console.log('Table schema:');
      console.log(`
        CREATE TABLE banner_likes (
          id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL,
          banner_id UUID NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          UNIQUE(user_id, banner_id)
        );
      `);
    } else {
      console.log('✅ Table seems to exist and insert worked');
      
      // Clean up test data
      await supabase
        .from('banner_likes')
        .delete()
        .eq('user_id', testUserId)
        .eq('banner_id', testBannerId);
    }
  } else {
    console.log('✅ Table creation SQL executed successfully');
  }
}

createLikesTable().catch(console.error)