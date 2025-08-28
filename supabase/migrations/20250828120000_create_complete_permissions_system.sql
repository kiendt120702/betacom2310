-- Complete Permissions System Setup
-- This migration creates all tables and data needed for the permissions system

-- Create permissions table with hierarchical structure
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES permissions(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create role_permissions table  
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role user_role NOT NULL,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role, permission_id)
);

-- Create user_permissions table (for individual user overrides)
CREATE TABLE IF NOT EXISTS user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    permission_type VARCHAR(10) CHECK (permission_type IN ('grant', 'deny')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, permission_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_permissions_parent_id ON permissions(parent_id);
CREATE INDEX IF NOT EXISTS idx_permissions_name ON permissions(name);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_permission_id ON user_permissions(permission_id);

-- Enable RLS
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for permissions table
CREATE POLICY "Anyone can view permissions" ON permissions FOR SELECT USING (true);
CREATE POLICY "Only admins can modify permissions" ON permissions FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- RLS Policies for role_permissions table
CREATE POLICY "Anyone can view role permissions" ON role_permissions FOR SELECT USING (true);
CREATE POLICY "Only admins can modify role permissions" ON role_permissions FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- RLS Policies for user_permissions table
CREATE POLICY "Users can view their own permission overrides" ON user_permissions FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);
CREATE POLICY "Only admins can modify user permissions" ON user_permissions FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Function to update user permission overrides
CREATE OR REPLACE FUNCTION update_user_permission_overrides(
    p_user_id UUID,
    p_permission_overrides JSONB
)
RETURNS VOID AS $$
BEGIN
    -- Delete existing overrides for this user
    DELETE FROM user_permissions WHERE user_id = p_user_id;
    
    -- Insert new overrides
    INSERT INTO user_permissions (user_id, permission_id, permission_type)
    SELECT 
        p_user_id,
        (override->>'permission_id')::UUID,
        override->>'permission_type'
    FROM jsonb_array_elements(p_permission_overrides) AS override;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update role permissions
CREATE OR REPLACE FUNCTION update_role_permissions(
    p_role user_role,
    p_permission_ids UUID[]
)
RETURNS VOID AS $$
BEGIN
    -- Delete existing permissions for this role
    DELETE FROM role_permissions WHERE role = p_role;
    
    -- Insert new permissions
    INSERT INTO role_permissions (role, permission_id)
    SELECT p_role, unnest(p_permission_ids);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert all permissions with hierarchical structure
-- Root permissions first
INSERT INTO permissions (id, name, description) VALUES
-- System Access
('00000000-0000-0000-0000-000000000001', 'system_access', 'Truy cập hệ thống'),
('00000000-0000-0000-0000-000000000002', 'access_admin_panel', 'Truy cập Admin Panel'),
('00000000-0000-0000-0000-000000000003', 'access_leader_view', 'Truy cập Leader View'),

-- Thumbnail Management Root
('00000000-0000-0000-0000-000000000010', 'manage_thumbnails_root', 'Quản lý Thư viện (Gốc)'),

-- Training Management Root  
('00000000-0000-0000-0000-000000000020', 'manage_training_root', 'Quản lý Đào tạo (Gốc)'),

-- User Management Root
('00000000-0000-0000-0000-000000000030', 'manage_users_root', 'Quản lý Người dùng (Gốc)'),

-- Sales & Revenue Management Root
('00000000-0000-0000-0000-000000000040', 'manage_sales_root', 'Quản lý Bán hàng (Gốc)'),

-- Shop Management Root
('00000000-0000-0000-0000-000000000050', 'manage_shops_root', 'Quản lý Cửa hàng (Gốc)'),

-- Employee & Personnel Management Root
('00000000-0000-0000-0000-000000000060', 'manage_employees_root', 'Quản lý Nhân viên (Gốc)'),

-- AI & GPT Integration Root
('00000000-0000-0000-0000-000000000070', 'manage_ai_root', 'Quản lý AI (Gốc)'),

-- Dashboard & Analytics Root
('00000000-0000-0000-0000-000000000080', 'manage_dashboards_root', 'Quản lý Dashboard (Gốc)'),

-- Content Management Root
('00000000-0000-0000-0000-000000000090', 'manage_content_root', 'Quản lý Nội dung (Gốc)'),

-- Assessment & Evaluation Root
('00000000-0000-0000-0000-000000000100', 'manage_assessments_root', 'Quản lý Đánh giá (Gốc)'),

-- Delivery & Logistics Root
('00000000-0000-0000-0000-000000000110', 'manage_delivery_root', 'Quản lý Giao hàng (Gốc)'),

-- Feedback & Quality Assurance Root
('00000000-0000-0000-0000-000000000120', 'manage_feedback_root', 'Quản lý Phản hồi (Gốc)'),

-- Utilities & Tools Root
('00000000-0000-0000-0000-000000000130', 'manage_utilities_root', 'Quản lý Tiện ích (Gốc)'),

-- Data Import/Export Root
('00000000-0000-0000-0000-000000000140', 'manage_data_operations_root', 'Quản lý Thao tác Dữ liệu (Gốc)'),

-- Leader-Specific Permissions Root
('00000000-0000-0000-0000-000000000150', 'manage_leader_functions_root', 'Quản lý Chức năng Leader (Gốc)');

-- Insert child permissions for Thumbnail Management
INSERT INTO permissions (id, name, description, parent_id) VALUES
('00000000-0000-0000-0000-000000000011', 'manage_categories', 'Quản lý Danh mục', '00000000-0000-0000-0000-000000000010'),
('00000000-0000-0000-0000-000000000012', 'manage_thumbnails', 'Quản lý Thumbnails', '00000000-0000-0000-0000-000000000010'),
('00000000-0000-0000-0000-000000000013', 'approve_thumbnails', 'Duyệt Thumbnails', '00000000-0000-0000-0000-000000000010'),
('00000000-0000-0000-0000-000000000014', 'create_thumbnails', 'Tạo Thumbnails', '00000000-0000-0000-0000-000000000010'),
('00000000-0000-0000-0000-000000000015', 'delete_thumbnails', 'Xóa Thumbnails', '00000000-0000-0000-0000-000000000010'),
('00000000-0000-0000-0000-000000000016', 'edit_thumbnails', 'Sửa Thumbnails', '00000000-0000-0000-0000-000000000010'),
('00000000-0000-0000-0000-000000000017', 'view_thumbnails', 'Xem Thumbnails', '00000000-0000-0000-0000-000000000010'),
('00000000-0000-0000-0000-000000000018', 'manage_thumbnail_types', 'Quản lý Loại Thumbnail', '00000000-0000-0000-0000-000000000010');

-- Insert child permissions for Training Management
INSERT INTO permissions (id, name, description, parent_id) VALUES
('00000000-0000-0000-0000-000000000021', 'grade_essays', 'Chấm bài Tự luận', '00000000-0000-0000-0000-000000000020'),
('00000000-0000-0000-0000-000000000022', 'manage_edu_shopee', 'Quản lý Edu Shopee', '00000000-0000-0000-0000-000000000020'),
('00000000-0000-0000-0000-000000000023', 'manage_general_training', 'Quản lý Đào tạo Chung', '00000000-0000-0000-0000-000000000020'),
('00000000-0000-0000-0000-000000000024', 'manage_leader_training', 'Quản lý Đào tạo Leader', '00000000-0000-0000-0000-000000000020'),
('00000000-0000-0000-0000-000000000025', 'manage_specialist_training', 'Quản lý Đào tạo Chuyên viên', '00000000-0000-0000-0000-000000000020'),
('00000000-0000-0000-0000-000000000026', 'view_learning_progress', 'Xem Tiến độ học tập', '00000000-0000-0000-0000-000000000020');

-- Insert child permissions for User Management
INSERT INTO permissions (id, name, description, parent_id) VALUES
('00000000-0000-0000-0000-000000000031', 'manage_permissions', 'Quản lý Quyền hạn', '00000000-0000-0000-0000-000000000030'),
('00000000-0000-0000-0000-000000000032', 'manage_roles', 'Quản lý Vai trò', '00000000-0000-0000-0000-000000000030'),
('00000000-0000-0000-0000-000000000033', 'manage_teams', 'Quản lý Phòng ban', '00000000-0000-0000-0000-000000000030'),
('00000000-0000-0000-0000-000000000034', 'manage_users', 'Quản lý Người dùng', '00000000-0000-0000-0000-000000000030'),
('00000000-0000-0000-0000-000000000035', 'create_users', 'Tạo Người dùng', '00000000-0000-0000-0000-000000000030'),
('00000000-0000-0000-0000-000000000036', 'delete_users', 'Xóa Người dùng', '00000000-0000-0000-0000-000000000030'),
('00000000-0000-0000-0000-000000000037', 'edit_users', 'Sửa Người dùng', '00000000-0000-0000-0000-000000000030'),
('00000000-0000-0000-0000-000000000038', 'view_users', 'Xem Người dùng', '00000000-0000-0000-0000-000000000030');

-- Insert child permissions for Sales & Revenue Management
INSERT INTO permissions (id, name, description, parent_id) VALUES
('00000000-0000-0000-0000-000000000041', 'view_sales_dashboard', 'Xem Dashboard Bán hàng', '00000000-0000-0000-0000-000000000040'),
('00000000-0000-0000-0000-000000000042', 'manage_daily_sales_report', 'Quản lý Báo cáo Bán hàng Hàng ngày', '00000000-0000-0000-0000-000000000040'),
('00000000-0000-0000-0000-000000000043', 'upload_revenue_excel', 'Upload Excel Doanh thu', '00000000-0000-0000-0000-000000000040'),
('00000000-0000-0000-0000-000000000044', 'manage_comprehensive_reports', 'Quản lý Báo cáo Tổng hợp', '00000000-0000-0000-0000-000000000040'),
('00000000-0000-0000-0000-000000000045', 'upload_multi_day_reports', 'Upload Báo cáo Nhiều ngày', '00000000-0000-0000-0000-000000000040'),
('00000000-0000-0000-0000-000000000046', 'view_revenue_analytics', 'Xem Phân tích Doanh thu', '00000000-0000-0000-0000-000000000040'),
('00000000-0000-0000-0000-000000000047', 'manage_goal_setting', 'Quản lý Thiết lập Mục tiêu', '00000000-0000-0000-0000-000000000040'),
('00000000-0000-0000-0000-000000000048', 'view_shop_performance', 'Xem Hiệu suất Cửa hàng', '00000000-0000-0000-0000-000000000040'),
('00000000-0000-0000-0000-000000000049', 'export_sales_data', 'Xuất Dữ liệu Bán hàng', '00000000-0000-0000-0000-000000000040');

-- Insert child permissions for Shop Management
INSERT INTO permissions (id, name, description, parent_id) VALUES
('00000000-0000-0000-0000-000000000051', 'create_shops', 'Tạo Cửa hàng', '00000000-0000-0000-0000-000000000050'),
('00000000-0000-0000-0000-000000000052', 'edit_shops', 'Sửa Cửa hàng', '00000000-0000-0000-0000-000000000050'),
('00000000-0000-0000-0000-000000000053', 'delete_shops', 'Xóa Cửa hàng', '00000000-0000-0000-0000-000000000050'),
('00000000-0000-0000-0000-000000000054', 'view_shops', 'Xem Cửa hàng', '00000000-0000-0000-0000-000000000050'),
('00000000-0000-0000-0000-000000000055', 'assign_shop_leaders', 'Phân công Leader Cửa hàng', '00000000-0000-0000-0000-000000000050'),
('00000000-0000-0000-0000-000000000056', 'manage_shop_performance', 'Quản lý Hiệu suất Cửa hàng', '00000000-0000-0000-0000-000000000050');

-- Insert child permissions for Employee & Personnel Management
INSERT INTO permissions (id, name, description, parent_id) VALUES
('00000000-0000-0000-0000-000000000061', 'create_employees', 'Tạo Nhân viên', '00000000-0000-0000-0000-000000000060'),
('00000000-0000-0000-0000-000000000062', 'edit_employees', 'Sửa Nhân viên', '00000000-0000-0000-0000-000000000060'),
('00000000-0000-0000-0000-000000000063', 'delete_employees', 'Xóa Nhân viên', '00000000-0000-0000-0000-000000000060'),
('00000000-0000-0000-0000-000000000064', 'view_employees', 'Xem Nhân viên', '00000000-0000-0000-0000-000000000060'),
('00000000-0000-0000-0000-000000000065', 'manage_personnel_assignments', 'Quản lý Phân công Nhân sự', '00000000-0000-0000-0000-000000000060'),
('00000000-0000-0000-0000-000000000066', 'view_organizational_chart', 'Xem Sơ đồ Tổ chức', '00000000-0000-0000-0000-000000000060'),
('00000000-0000-0000-0000-000000000067', 'manage_manager_relationships', 'Quản lý Quan hệ Quản lý', '00000000-0000-0000-0000-000000000060'),
('00000000-0000-0000-0000-000000000068', 'bulk_import_employees', 'Nhập Nhân viên Hàng loạt', '00000000-0000-0000-0000-000000000060');

-- Insert child permissions for AI & GPT Integration
INSERT INTO permissions (id, name, description, parent_id) VALUES
('00000000-0000-0000-0000-000000000071', 'access_gpt_chat', 'Truy cập Chat GPT', '00000000-0000-0000-0000-000000000070'),
('00000000-0000-0000-0000-000000000072', 'manage_gpt_conversations', 'Quản lý Cuộc hội thoại GPT', '00000000-0000-0000-0000-000000000070'),
('00000000-0000-0000-0000-000000000073', 'generate_seo_content', 'Tạo Nội dung SEO', '00000000-0000-0000-0000-000000000070'),
('00000000-0000-0000-0000-000000000074', 'access_ai_tools', 'Truy cập Công cụ AI', '00000000-0000-0000-0000-000000000070'),
('00000000-0000-0000-0000-000000000075', 'manage_ai_settings', 'Quản lý Cài đặt AI', '00000000-0000-0000-0000-000000000070');

-- Insert child permissions for Dashboard & Analytics
INSERT INTO permissions (id, name, description, parent_id) VALUES
('00000000-0000-0000-0000-000000000081', 'view_executive_dashboard', 'Xem Dashboard Điều hành', '00000000-0000-0000-0000-000000000080'),
('00000000-0000-0000-0000-000000000082', 'view_sales_analytics', 'Xem Phân tích Bán hàng', '00000000-0000-0000-0000-000000000080'),
('00000000-0000-0000-0000-000000000083', 'view_training_analytics', 'Xem Phân tích Đào tạo', '00000000-0000-0000-0000-000000000080'),
('00000000-0000-0000-0000-000000000084', 'view_user_analytics', 'Xem Phân tích Người dùng', '00000000-0000-0000-0000-000000000080'),
('00000000-0000-0000-0000-000000000085', 'export_analytics_data', 'Xuất Dữ liệu Phân tích', '00000000-0000-0000-0000-000000000080'),
('00000000-0000-0000-0000-000000000086', 'manage_kpi_metrics', 'Quản lý Chỉ số KPI', '00000000-0000-0000-0000-000000000080');

-- Insert child permissions for Content Management
INSERT INTO permissions (id, name, description, parent_id) VALUES
('00000000-0000-0000-0000-000000000091', 'manage_theory_content', 'Quản lý Nội dung Lý thuyết', '00000000-0000-0000-0000-000000000090'),
('00000000-0000-0000-0000-000000000092', 'access_wysiwyg_editor', 'Truy cập Trình soạn thảo WYSIWYG', '00000000-0000-0000-0000-000000000090'),
('00000000-0000-0000-0000-000000000093', 'upload_training_videos', 'Upload Video Đào tạo', '00000000-0000-0000-0000-000000000090'),
('00000000-0000-0000-0000-000000000094', 'manage_video_content', 'Quản lý Nội dung Video', '00000000-0000-0000-0000-000000000090'),
('00000000-0000-0000-0000-000000000095', 'create_quiz_questions', 'Tạo Câu hỏi Quiz', '00000000-0000-0000-0000-000000000090'),
('00000000-0000-0000-0000-000000000096', 'manage_essay_questions', 'Quản lý Câu hỏi Tự luận', '00000000-0000-0000-0000-000000000090'),
('00000000-0000-0000-0000-000000000097', 'manage_practice_exercises', 'Quản lý Bài tập Thực hành', '00000000-0000-0000-0000-000000000090');

-- Insert child permissions for Assessment & Evaluation
INSERT INTO permissions (id, name, description, parent_id) VALUES
('00000000-0000-0000-0000-000000000101', 'create_quizzes', 'Tạo Quiz', '00000000-0000-0000-0000-000000000100'),
('00000000-0000-0000-0000-000000000102', 'edit_quizzes', 'Sửa Quiz', '00000000-0000-0000-0000-000000000100'),
('00000000-0000-0000-0000-000000000103', 'delete_quizzes', 'Xóa Quiz', '00000000-0000-0000-0000-000000000100'),
('00000000-0000-0000-0000-000000000104', 'view_quiz_results', 'Xem Kết quả Quiz', '00000000-0000-0000-0000-000000000100'),
('00000000-0000-0000-0000-000000000105', 'grade_essays_manual', 'Chấm bài Tự luận Thủ công', '00000000-0000-0000-0000-000000000100'),
('00000000-0000-0000-0000-000000000106', 'manage_grading_workflows', 'Quản lý Quy trình Chấm điểm', '00000000-0000-0000-0000-000000000100'),
('00000000-0000-0000-0000-000000000107', 'export_assessment_data', 'Xuất Dữ liệu Đánh giá', '00000000-0000-0000-0000-000000000100');

-- Insert child permissions for Delivery & Logistics
INSERT INTO permissions (id, name, description, parent_id) VALUES
('00000000-0000-0000-0000-000000000111', 'access_fast_delivery_theory', 'Truy cập Lý thuyết Giao hàng Nhanh', '00000000-0000-0000-0000-000000000110'),
('00000000-0000-0000-0000-000000000112', 'use_delivery_calculator', 'Sử dụng Máy tính Giao hàng', '00000000-0000-0000-0000-000000000110'),
('00000000-0000-0000-0000-000000000113', 'manage_delivery_metrics', 'Quản lý Chỉ số Giao hàng', '00000000-0000-0000-0000-000000000110'),
('00000000-0000-0000-0000-000000000114', 'view_delivery_performance', 'Xem Hiệu suất Giao hàng', '00000000-0000-0000-0000-000000000110');

-- Insert child permissions for Feedback & Quality Assurance
INSERT INTO permissions (id, name, description, parent_id) VALUES
('00000000-0000-0000-0000-000000000121', 'view_user_feedback', 'Xem Phản hồi Người dùng', '00000000-0000-0000-0000-000000000120'),
('00000000-0000-0000-0000-000000000122', 'manage_bug_reports', 'Quản lý Báo cáo Lỗi', '00000000-0000-0000-0000-000000000120'),
('00000000-0000-0000-0000-000000000123', 'handle_feature_requests', 'Xử lý Yêu cầu Tính năng', '00000000-0000-0000-0000-000000000120'),
('00000000-0000-0000-0000-000000000124', 'manage_system_improvements', 'Quản lý Cải tiến Hệ thống', '00000000-0000-0000-0000-000000000120'),
('00000000-0000-0000-0000-000000000125', 'export_feedback_data', 'Xuất Dữ liệu Phản hồi', '00000000-0000-0000-0000-000000000120');

-- Insert child permissions for Utilities & Tools
INSERT INTO permissions (id, name, description, parent_id) VALUES
('00000000-0000-0000-0000-000000000131', 'access_rating_calculator', 'Truy cập Máy tính Đánh giá', '00000000-0000-0000-0000-000000000130'),
('00000000-0000-0000-0000-000000000132', 'manage_seo_tools', 'Quản lý Công cụ SEO', '00000000-0000-0000-0000-000000000130'),
('00000000-0000-0000-0000-000000000133', 'access_system_utilities', 'Truy cập Tiện ích Hệ thống', '00000000-0000-0000-0000-000000000130'),
('00000000-0000-0000-0000-000000000134', 'manage_calculation_tools', 'Quản lý Công cụ Tính toán', '00000000-0000-0000-0000-000000000130');

-- Insert child permissions for Data Import/Export
INSERT INTO permissions (id, name, description, parent_id) VALUES
('00000000-0000-0000-0000-000000000141', 'bulk_import_users', 'Nhập Người dùng Hàng loạt', '00000000-0000-0000-0000-000000000140'),
('00000000-0000-0000-0000-000000000142', 'export_user_data', 'Xuất Dữ liệu Người dùng', '00000000-0000-0000-0000-000000000140'),
('00000000-0000-0000-0000-000000000143', 'upload_excel_files', 'Upload File Excel', '00000000-0000-0000-0000-000000000140'),
('00000000-0000-0000-0000-000000000144', 'process_bulk_operations', 'Xử lý Thao tác Hàng loạt', '00000000-0000-0000-0000-000000000140'),
('00000000-0000-0000-0000-000000000145', 'manage_data_migrations', 'Quản lý Di chuyển Dữ liệu', '00000000-0000-0000-0000-000000000140');

-- Insert child permissions for Leader-Specific Permissions
INSERT INTO permissions (id, name, description, parent_id) VALUES
('00000000-0000-0000-0000-000000000151', 'access_leader_dashboard', 'Truy cập Dashboard Leader', '00000000-0000-0000-0000-000000000150'),
('00000000-0000-0000-0000-000000000152', 'manage_team_personnel', 'Quản lý Nhân sự Nhóm', '00000000-0000-0000-0000-000000000150'),
('00000000-0000-0000-0000-000000000153', 'view_team_performance', 'Xem Hiệu suất Nhóm', '00000000-0000-0000-0000-000000000150'),
('00000000-0000-0000-0000-000000000154', 'assign_team_members', 'Phân công Thành viên Nhóm', '00000000-0000-0000-0000-000000000150'),
('00000000-0000-0000-0000-000000000155', 'manage_team_goals', 'Quản lý Mục tiêu Nhóm', '00000000-0000-0000-0000-000000000150');

-- Set up default permissions for admin role (full access)
INSERT INTO role_permissions (role, permission_id)
SELECT 'admin', id FROM permissions;

-- Set up basic permissions for other roles
-- Leader role - management and oversight permissions
INSERT INTO role_permissions (role, permission_id) VALUES
('leader', '00000000-0000-0000-0000-000000000001'), -- system_access
('leader', '00000000-0000-0000-0000-000000000003'), -- access_leader_view
('leader', '00000000-0000-0000-0000-000000000017'), -- view_thumbnails
('leader', '00000000-0000-0000-0000-000000000026'), -- view_learning_progress
('leader', '00000000-0000-0000-0000-000000000038'), -- view_users
('leader', '00000000-0000-0000-0000-000000000041'), -- view_sales_dashboard
('leader', '00000000-0000-0000-0000-000000000048'), -- view_shop_performance
('leader', '00000000-0000-0000-0000-000000000054'), -- view_shops
('leader', '00000000-0000-0000-0000-000000000064'), -- view_employees
('leader', '00000000-0000-0000-0000-000000000081'), -- view_executive_dashboard
('leader', '00000000-0000-0000-0000-000000000150'), -- manage_leader_functions_root
('leader', '00000000-0000-0000-0000-000000000151'), -- access_leader_dashboard
('leader', '00000000-0000-0000-0000-000000000152'), -- manage_team_personnel
('leader', '00000000-0000-0000-0000-000000000153'), -- view_team_performance
('leader', '00000000-0000-0000-0000-000000000154'), -- assign_team_members
('leader', '00000000-0000-0000-0000-000000000155'); -- manage_team_goals

-- Chuyên viên role - specialist permissions
INSERT INTO role_permissions (role, permission_id) VALUES
('chuyên viên', '00000000-0000-0000-0000-000000000001'), -- system_access
('chuyên viên', '00000000-0000-0000-0000-000000000017'), -- view_thumbnails
('chuyên viên', '00000000-0000-0000-0000-000000000025'), -- manage_specialist_training
('chuyên viên', '00000000-0000-0000-0000-000000000071'), -- access_gpt_chat
('chuyên viên', '00000000-0000-0000-0000-000000000073'), -- generate_seo_content
('chuyên viên', '00000000-0000-0000-0000-000000000111'), -- access_fast_delivery_theory
('chuyên viên', '00000000-0000-0000-0000-000000000112'), -- use_delivery_calculator
('chuyên viên', '00000000-0000-0000-0000-000000000131'), -- access_rating_calculator
('chuyên viên', '00000000-0000-0000-0000-000000000132'); -- manage_seo_tools

-- Học việc/thử việc role - basic permissions
INSERT INTO role_permissions (role, permission_id) VALUES
('học việc/thử việc', '00000000-0000-0000-0000-000000000001'), -- system_access
('học việc/thử việc', '00000000-0000-0000-0000-000000000017'), -- view_thumbnails
('học việc/thử việc', '00000000-0000-0000-0000-000000000023'), -- manage_general_training
('học việc/thử việc', '00000000-0000-0000-0000-000000000111'), -- access_fast_delivery_theory
('học việc/thử việc', '00000000-0000-0000-0000-000000000131'); -- access_rating_calculator

-- Trưởng phòng role - department head permissions
INSERT INTO role_permissions (role, permission_id) VALUES
('trưởng phòng', '00000000-0000-0000-0000-000000000001'), -- system_access
('trưởng phòng', '00000000-0000-0000-0000-000000000002'), -- access_admin_panel
('trưởng phòng', '00000000-0000-0000-0000-000000000020'), -- manage_training_root
('trưởng phòng', '00000000-0000-0000-0000-000000000021'), -- grade_essays
('trưởng phòng', '00000000-0000-0000-0000-000000000022'), -- manage_edu_shopee
('trưởng phòng', '00000000-0000-0000-0000-000000000023'), -- manage_general_training
('trưởng phòng', '00000000-0000-0000-0000-000000000024'), -- manage_leader_training
('trưởng phòng', '00000000-0000-0000-0000-000000000025'), -- manage_specialist_training
('trưởng phòng', '00000000-0000-0000-0000-000000000026'), -- view_learning_progress
('trưởng phòng', '00000000-0000-0000-0000-000000000090'), -- manage_content_root
('trưởng phòng', '00000000-0000-0000-0000-000000000091'), -- manage_theory_content
('trưởng phòng', '00000000-0000-0000-0000-000000000092'), -- access_wysiwyg_editor
('trưởng phòng', '00000000-0000-0000-0000-000000000093'), -- upload_training_videos
('trưởng phòng', '00000000-0000-0000-0000-000000000094'), -- manage_video_content
('trưởng phòng', '00000000-0000-0000-0000-000000000095'), -- create_quiz_questions
('trưởng phòng', '00000000-0000-0000-0000-000000000096'), -- manage_essay_questions
('trưởng phòng', '00000000-0000-0000-0000-000000000100'), -- manage_assessments_root
('trưởng phòng', '00000000-0000-0000-0000-000000000101'), -- create_quizzes
('trưởng phòng', '00000000-0000-0000-0000-000000000102'), -- edit_quizzes
('trưởng phòng', '00000000-0000-0000-0000-000000000103'), -- delete_quizzes
('trưởng phòng', '00000000-0000-0000-0000-000000000104'), -- view_quiz_results
('trưởng phòng', '00000000-0000-0000-0000-000000000105'), -- grade_essays_manual
('trưởng phòng', '00000000-0000-0000-0000-000000000106'); -- manage_grading_workflows

-- Add comment for documentation
COMMENT ON TABLE permissions IS 'Hierarchical permissions system with parent-child relationships';
COMMENT ON TABLE role_permissions IS 'Default permissions assigned to each user role';
COMMENT ON TABLE user_permissions IS 'Individual user permission overrides (grant/deny)';