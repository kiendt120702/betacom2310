-- Create employees table for HR management
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    position VARCHAR(100),
    department VARCHAR(100),
    hire_date DATE,
    salary DECIMAL(15,2),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
    manager_id UUID REFERENCES employees(id),
    shop_id UUID REFERENCES shops(id),
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create employee_roles table for role-based access
CREATE TABLE IF NOT EXISTS employee_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    role_name VARCHAR(50) NOT NULL,
    permissions JSONB DEFAULT '{}',
    assigned_by UUID REFERENCES auth.users(id),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    UNIQUE(employee_id, role_name)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employees_shop_id ON employees(shop_id);
CREATE INDEX IF NOT EXISTS idx_employees_manager_id ON employees(manager_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_employee_code ON employees(employee_code);
CREATE INDEX IF NOT EXISTS idx_employee_roles_employee_id ON employee_roles(employee_id);

-- Enable RLS (Row Level Security)
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can see employees in their shops or employees they manage
CREATE POLICY "Users can view employees in their shops or subordinates"
ON employees FOR SELECT
USING (
    auth.uid() IN (
        SELECT user_id FROM user_profiles 
        WHERE shop_id = employees.shop_id
    )
    OR manager_id = (
        SELECT id FROM employees 
        WHERE created_by = auth.uid()
    )
    OR created_by = auth.uid()
);

-- Users can insert employees in their shops
CREATE POLICY "Users can insert employees in their shops"
ON employees FOR INSERT
WITH CHECK (
    auth.uid() IN (
        SELECT user_id FROM user_profiles 
        WHERE shop_id = employees.shop_id
    )
    OR created_by = auth.uid()
);

-- Users can update employees in their shops or their subordinates
CREATE POLICY "Users can update employees in their shops or subordinates"
ON employees FOR UPDATE
USING (
    auth.uid() IN (
        SELECT user_id FROM user_profiles 
        WHERE shop_id = employees.shop_id
    )
    OR manager_id = (
        SELECT id FROM employees 
        WHERE created_by = auth.uid()
    )
    OR created_by = auth.uid()
);

-- Users can delete employees in their shops or their subordinates
CREATE POLICY "Users can delete employees in their shops or subordinates"
ON employees FOR DELETE
USING (
    auth.uid() IN (
        SELECT user_id FROM user_profiles 
        WHERE shop_id = employees.shop_id
    )
    OR created_by = auth.uid()
);

-- Employee roles policies
CREATE POLICY "Users can view employee roles for accessible employees"
ON employee_roles FOR SELECT
USING (
    employee_id IN (
        SELECT id FROM employees
        WHERE auth.uid() IN (
            SELECT user_id FROM user_profiles 
            WHERE shop_id = employees.shop_id
        )
        OR created_by = auth.uid()
    )
);

CREATE POLICY "Users can manage employee roles for accessible employees"
ON employee_roles FOR ALL
USING (
    employee_id IN (
        SELECT id FROM employees
        WHERE auth.uid() IN (
            SELECT user_id FROM user_profiles 
            WHERE shop_id = employees.shop_id
        )
        OR created_by = auth.uid()
    )
);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_employees_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION update_employees_updated_at();