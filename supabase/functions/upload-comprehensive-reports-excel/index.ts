import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'
import * as XLSX from 'https://esm.sh/xlsx@0.18.5'

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

    // Read and parse Excel file
    const fileBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(new Uint8Array(fileBuffer), { type: 'array' })
    
    // Find "Đơn đã xác nhận" sheet
    const confirmedOrdersSheet = workbook.Sheets['Đơn đã xác nhận']
    if (!confirmedOrdersSheet) {
      return new Response(
        JSON.stringify({ error: 'Sheet "Đơn đã xác nhận" không tìm thấy trong file Excel' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Convert sheet to JSON
    const data = XLSX.utils.sheet_to_json(confirmedOrdersSheet, { header: 1 })
    
    if (data.length < 2) {
      return new Response(
        JSON.stringify({ error: 'File Excel không có dữ liệu hợp lệ' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Process data (assuming first row is header)
    const headers = data[0] as string[]
    const rows = data.slice(1) as any[][]

    // Map data to comprehensive reports format
    const reports = []
    
    for (const row of rows) {
      if (!row || row.length === 0) continue
      
      // Create mapping based on column positions
      // You'll need to adjust these indices based on your Excel file structure
      const report = {
        report_date: row[0] ? new Date(row[0]).toISOString().split('T')[0] : null,
        total_revenue: parseFloat(row[1]) || 0,
        total_orders: parseInt(row[2]) || 0,
        average_order_value: parseFloat(row[3]) || 0,
        product_clicks: parseInt(row[4]) || 0,
        total_visits: parseInt(row[5]) || 0,
        conversion_rate: parseFloat(row[6]) || 0,
        cancelled_orders: parseInt(row[7]) || 0,
        cancelled_revenue: parseFloat(row[8]) || 0,
        returned_orders: parseInt(row[9]) || 0,
        returned_revenue: parseFloat(row[10]) || 0,
        total_buyers: parseInt(row[11]) || 0,
        new_buyers: parseInt(row[12]) || 0,
        existing_buyers: parseInt(row[13]) || 0,
        potential_buyers: parseInt(row[14]) || 0,
        buyer_return_rate: parseFloat(row[15]) || 0
      }

      if (report.report_date) {
        reports.push(report)
      }
    }

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