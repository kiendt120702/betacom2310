-- Drop unused tables from the database schema

-- Drop assignment related tables
DROP TABLE IF EXISTS public.assignment_submissions;
DROP TABLE IF EXISTS public.assignments;

-- Drop old chat table
DROP TABLE IF EXISTS public.beatcomai_chatgpt;

-- Drop old comprehensive_reports table (replaced by shopee_comprehensive_reports)
DROP TABLE IF EXISTS public.comprehensive_reports;