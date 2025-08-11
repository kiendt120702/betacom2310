// Test script to check banner likes functionality
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tjzeskxkqvjbowikzqpv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqemVza3hrcXZqYm93aWt6cXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMjg0MjcsImV4cCI6MjA2NTkwNDQyN30.T-AV2KidsjI9c1Y7ue4Rk8PxSbG_ZImh7J0uCAz3qGk'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testLikesFeature() {
  console.log('Testing banner likes functionality...')
  
  // Test 1: Check if banner_likes table exists
  console.log('\n1. Testing banner_likes table access...')
  const { data: likesData, error: likesError } = await supabase
    .from('banner_likes')
    .select('*')
    .limit(5)
  
  if (likesError) {
    console.error('❌ Banner_likes table error:', likesError.message)
  } else {
    console.log('✅ Banner_likes table accessible:', likesData?.length, 'records')
  }
  
  // Test 2: Check if get_banner_likes function exists
  console.log('\n2. Testing get_banner_likes function...')
  const testBannerId = '00000000-0000-0000-0000-000000000001' // Dummy UUID for testing
  
  const { data: functionData, error: functionError } = await supabase.rpc('get_banner_likes', {
    banner_id_param: testBannerId,
    user_id_param: null
  })
  
  if (functionError) {
    console.error('❌ get_banner_likes function error:', functionError.message)
  } else {
    console.log('✅ get_banner_likes function works:', functionData)
  }
  
  // Test 3: Check if toggle_banner_like function exists (will fail without auth, but shows if function exists)
  console.log('\n3. Testing toggle_banner_like function...')
  const { data: toggleData, error: toggleError } = await supabase.rpc('toggle_banner_like', {
    banner_id_param: testBannerId
  })
  
  if (toggleError) {
    if (toggleError.message.includes('User not authenticated')) {
      console.log('✅ toggle_banner_like function exists (auth required as expected)')
    } else {
      console.error('❌ toggle_banner_like function error:', toggleError.message)
    }
  } else {
    console.log('✅ toggle_banner_like function works:', toggleData)
  }
}

testLikesFeature().catch(console.error)