import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get the authorization header
    const authHeader = req.headers.get('authorization')!
    const token = authHeader.replace('Bearer ', '')

    // Verify the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Access denied. Admin role required.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get form data
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // For now, return success message - we'll implement Excel parsing later
    // This is a placeholder to test the Edge Function deployment
    
    console.log('File received:', file.name, file.size, 'bytes')
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock data for testing
    const mockReports = [
      {
        report_date: new Date().toISOString().split('T')[0],
        total_revenue: 1000000,
        total_orders: 100,
        average_order_value: 10000,
        product_clicks: 500,
        total_visits: 1000,
        conversion_rate: 0.1,
        cancelled_orders: 5,
        cancelled_revenue: 50000,
        returned_orders: 3,
        returned_revenue: 30000,
        total_buyers: 95,
        new_buyers: 20,
        existing_buyers: 75,
        potential_buyers: 200,
        buyer_return_rate: 0.8
      }
    ]

    const reports = mockReports

    if (reports.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Không tìm thấy dữ liệu hợp lệ trong file' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Insert data into database (upsert to handle duplicates)
    const { error: insertError } = await supabase
      .from('comprehensive_reports')
      .upsert(reports, { 
        onConflict: 'report_date',
        ignoreDuplicates: false 
      })

    if (insertError) {
      console.error('Database insert error:', insertError)
      return new Response(
        JSON.stringify({ error: 'Lỗi khi lưu dữ liệu: ' + insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Đã import thành công ${reports.length} bản ghi`,
        imported_count: reports.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})