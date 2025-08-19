-- Add feasible_goal and breakthrough_goal columns to comprehensive_reports table
ALTER TABLE comprehensive_reports 
ADD COLUMN IF NOT EXISTS feasible_goal DECIMAL(15,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS breakthrough_goal DECIMAL(15,2) DEFAULT NULL;

-- Create index for better performance when querying by goals
CREATE INDEX IF NOT EXISTS idx_comprehensive_reports_feasible_goal ON comprehensive_reports(feasible_goal);
CREATE INDEX IF NOT EXISTS idx_comprehensive_reports_breakthrough_goal ON comprehensive_reports(breakthrough_goal);

-- Add comment to describe the new columns
COMMENT ON COLUMN comprehensive_reports.feasible_goal IS 'Mục tiêu doanh số khả thi cho shop trong tháng';
COMMENT ON COLUMN comprehensive_reports.breakthrough_goal IS 'Mục tiêu doanh số đột phá cho shop trong tháng';