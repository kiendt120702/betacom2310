
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'
import * as XLSX from 'https://deno.land/x/sheetjs@v0.18.3/xlsx.mjs'

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

    console.log('Processing file:', file.name, file.size, 'bytes')
    
    // Read the file
    const arrayBuffer = await file.arrayBuffer()
    const data = new Uint8Array(arrayBuffer)
    
    // Parse Excel file
    const workbook = XLSX.read(data, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
    
    console.log('Raw data from Excel:', jsonData.slice(0, 3)) // Log first 3 rows for debugging
    
    // Parse and validate data
    const reports = []
    
    // Skip header row (index 0) and process data rows
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i] as any[]
      
      // Skip empty rows
      if (!row || row.length === 0 || !row[0]) continue
      
      try {
        // Parse date - handle various date formats
        let reportDate
        const dateValue = row[0]
        
        if (typeof dateValue === 'number') {
          // Excel date serial number
          reportDate = XLSX.SSF.parse_date_code(dateValue)
          reportDate = new Date(reportDate.y, reportDate.m - 1, reportDate.d).toISOString().split('T')[0]
        } else if (typeof dateValue === 'string') {
          // String date format
          const parsedDate = new Date(dateValue)
          if (!isNaN(parsedDate.getTime())) {
            reportDate = parsedDate.toISOString().split('T')[0]
          } else {
            console.warn(`Invalid date format in row ${i + 1}:`, dateValue)
            continue
          }
        } else {
          console.warn(`Invalid date value in row ${i + 1}:`, dateValue)
          continue
        }

        // Helper function to parse number values
        const parseNumber = (value: any, defaultValue = 0) => {
          if (value === null || value === undefined || value === '') return defaultValue
          if (typeof value === 'number') return value
          if (typeof value === 'string') {
            // Remove commas and parse
            const cleaned = value.replace(/,/g, '')
            // Handle percentage values
            if (cleaned.includes('%')) {
              return parseFloat(cleaned.replace('%', '')) / 100
            }
            const parsed = parseFloat(cleaned)
            return isNaN(parsed) ? defaultValue : parsed
          }
          return defaultValue
        }

        const report = {
          report_date: reportDate,
          total_revenue: parseNumber(row[1]),
          total_orders: parseInt(parseNumber(row[2]).toString()) || 0,
          average_order_value: parseNumber(row[3]),
          product_clicks: parseInt(parseNumber(row[4]).toString()) || 0,
          total_visits: parseInt(parseNumber(row[5]).toString()) || 0,
          conversion_rate: parseNumber(row[6]),
          cancelled_orders: parseInt(parseNumber(row[7]).toString()) || 0,
          cancelled_revenue: parseNumber(row[8]),
          returned_orders: parseInt(parseNumber(row[9]).toString()) || 0,
          returned_revenue: parseNumber(row[10]),
          total_buyers: parseInt(parseNumber(row[11]).toString()) || 0,
          new_buyers: parseInt(parseNumber(row[12]).toString()) || 0,
          existing_buyers: parseInt(parseNumber(row[13]).toString()) || 0,
          potential_buyers: parseInt(parseNumber(row[14]).toString()) || 0,
          buyer_return_rate: parseNumber(row[15])
        }

        console.log(`Parsed report for ${reportDate}:`, report)
        reports.push(report)
        
      } catch (error) {
        console.error(`Error parsing row ${i + 1}:`, error, row)
        continue
      }
    }

    if (reports.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Không tìm thấy dữ liệu hợp lệ trong file Excel. Vui lòng kiểm tra định dạng file.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${reports.length} valid reports to insert`)

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
