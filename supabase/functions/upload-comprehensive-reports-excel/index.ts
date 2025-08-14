/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'
import * as XLSX from 'https://deno.land/x/sheetjs@v0.18.3/xlsx.mjs'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

    console.log('Starting comprehensive reports upload...')

    // Get the authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      console.error('No authorization header')
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')

    // Verify the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('User authenticated:', user.id)

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      console.error('Access denied, user role:', profile?.role)
      return new Response(
        JSON.stringify({ error: 'Access denied. Admin role required.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get form data
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      console.error('No file provided')
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
    
    // Look for "Đơn đã xác nhận" sheet
    const sheetName = 'Đơn đã xác nhận'
    if (!workbook.Sheets[sheetName]) {
      console.error('Sheet not found:', sheetName, 'Available sheets:', Object.keys(workbook.Sheets))
      return new Response(
        JSON.stringify({ error: `Sheet "${sheetName}" không tìm thấy trong file Excel. Các sheet có sẵn: ${Object.keys(workbook.Sheets).join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

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
        // Parse date - handle format like "DD-MM-YYYY-DD-MM-YYYY" and convert to YYYY-MM-DD
        let reportDate = null
        const dateValue = row[0]
        
        console.log(`Processing row ${i + 1}, date value:`, dateValue, 'type:', typeof dateValue)
        
        if (typeof dateValue === 'string') {
          // Handle date format like "DD-MM-YYYY-DD-MM-YYYY" - take the first date
          const dateStr = dateValue.trim()
          
          // Split by dash and try to extract first date (first 3 parts: day-month-year)
          const parts = dateStr.split('-')
          if (parts.length >= 3) {
            const day = parts[0].padStart(2, '0')
            const month = parts[1].padStart(2, '0')
            const year = parts[2]
            
            // Convert to YYYY-MM-DD format for database
            reportDate = `${year}-${month}-${day}`
            
            // Validate the date
            const testDate = new Date(reportDate)
            if (isNaN(testDate.getTime())) {
              console.warn(`Invalid date format in row ${i + 1}:`, dateValue)
              continue
            }
          } else {
            // Try other date formats
            const possibleDate = new Date(dateStr)
            if (!isNaN(possibleDate.getTime())) {
              reportDate = possibleDate.toISOString().split('T')[0]
            } else {
              console.warn(`Invalid date format in row ${i + 1}:`, dateValue)
              continue
            }
          }
        } else if (typeof dateValue === 'number') {
          // Excel date serial number
          const excelDate = new Date((dateValue - 25569) * 86400 * 1000)
          reportDate = excelDate.toISOString().split('T')[0]
        } else {
          console.warn(`Invalid date value in row ${i + 1}:`, dateValue)
          continue
        }

        console.log(`Parsed date for row ${i + 1}:`, reportDate)

        // Helper function to parse number values
        const parseNumber = (value: any, defaultValue = 0) => {
          if (value === null || value === undefined || value === '') return defaultValue
          
          // Convert to string first
          let strValue = String(value).trim()
          
          if (typeof value === 'number') return value
          
          if (typeof strValue === 'string') {
            // Remove dots as thousand separators and handle commas as decimal separators
            let cleaned = strValue.replace(/\./g, '').replace(',', '.')
            
            // Handle percentage values - convert to decimal
            if (cleaned.includes('%')) {
              const numValue = parseFloat(cleaned.replace('%', ''))
              return isNaN(numValue) ? defaultValue : numValue / 100
            }
            
            const parsed = parseFloat(cleaned)
            return isNaN(parsed) ? defaultValue : parsed
          }
          return defaultValue
        }

        const report = {
          report_date: reportDate,
          total_revenue: parseNumber(row[1]), // Tổng doanh số (VND)
          total_orders: Math.floor(parseNumber(row[2])), // Tổng số đơn hàng
          average_order_value: parseNumber(row[3]), // Doanh số trung bình trên mỗi đơn hàng
          product_clicks: Math.floor(parseNumber(row[4])), // Số lượt nhấp vào sản phẩm
          total_visits: Math.floor(parseNumber(row[5])), // Số lượt truy cập
          conversion_rate: parseNumber(row[6]), // Tỷ lệ chuyển đổi đơn hàng (%)
          cancelled_orders: Math.floor(parseNumber(row[7])), // Số đơn đã hủy
          cancelled_revenue: parseNumber(row[8]), // Doanh số của các đơn đã hủy
          returned_orders: Math.floor(parseNumber(row[9])), // Số đơn đã hoàn trả / hoàn tiền
          returned_revenue: parseNumber(row[10]), // Doanh số của các đơn hoàn trả / hoàn tiền
          total_buyers: Math.floor(parseNumber(row[11])), // Số người mua
          new_buyers: Math.floor(parseNumber(row[12])), // Số người mua mới
          existing_buyers: Math.floor(parseNumber(row[13])), // Số người mua hiện tại
          potential_buyers: Math.floor(parseNumber(row[14])), // Số người mua tiềm năng
          buyer_return_rate: parseNumber(row[15]) // Tỷ lệ quay lại của người mua (%)
        }

        console.log(`Created report for ${reportDate}:`, report)
        reports.push(report)
        
      } catch (error) {
        console.error(`Error parsing row ${i + 1}:`, error, row)
        continue
      }
    }

    if (reports.length === 0) {
      console.error('No valid reports found')
      return new Response(
        JSON.stringify({ error: 'Không tìm thấy dữ liệu hợp lệ trong file Excel. Vui lòng kiểm tra định dạng file và sheet "Đơn đã xác nhận".' }),
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

    console.log('Successfully inserted reports')

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