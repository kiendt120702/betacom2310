// Test script to check banners database connection
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tjzeskxkqvjbowikzqpv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqemVza3hrcXZqYm93aWt6cXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMjg0MjcsImV4cCI6MjA2NTkwNDQyN30.T-AV2KidsjI9c1Y7ue4Rk8PxSbG_ZImh7J0uCAz3qGk'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testBannersConnection() {
  // Check all tables that might contain data
  console.log('Checking all related tables...')
  
  const tables = ['banners', 'categories', 'banner_types', 'profiles']
  
  for (const table of tables) {
    const { data, error, count } = await supabase
      .from(table)
      .select('*', { count: 'exact' })
      .limit(3)
    
    console.log(`${table}:`, error ? `Error - ${error.message}` : `${count} records`)
    if (data && data.length > 0) {
      console.log(`  Sample:`, Object.keys(data[0]))
    }
  }
}

testBannersConnection().catch(console.error)