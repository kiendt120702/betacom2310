-- Create login tracking system to monitor IP addresses and device information

-- Create user_login_sessions table to track login information
CREATE TABLE IF NOT EXISTS user_login_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    device_info JSONB,
    location_info JSONB, -- For geolocation data if needed
    login_time TIMESTAMPTZ DEFAULT NOW(),
    logout_time TIMESTAMPTZ,
    session_duration INTERVAL,
    login_method VARCHAR(50) DEFAULT 'email_password', -- email_password, oauth, etc.
    success BOOLEAN DEFAULT true,
    failure_reason TEXT,
    browser_name VARCHAR(100),
    browser_version VARCHAR(50),
    os_name VARCHAR(100),
    os_version VARCHAR(50),
    device_type VARCHAR(50), -- desktop, mobile, tablet
    is_mobile BOOLEAN DEFAULT false,
    country VARCHAR(100),
    city VARCHAR(100),
    timezone VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_login_sessions_user_id ON user_login_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_login_sessions_email ON user_login_sessions(email);
CREATE INDEX IF NOT EXISTS idx_user_login_sessions_ip_address ON user_login_sessions(ip_address);
CREATE INDEX IF NOT EXISTS idx_user_login_sessions_login_time ON user_login_sessions(login_time DESC);
CREATE INDEX IF NOT EXISTS idx_user_login_sessions_success ON user_login_sessions(success);

-- Create user_active_sessions table to track currently active sessions
CREATE TABLE IF NOT EXISTS user_active_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES user_login_sessions(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, session_id)
);

-- Create indexes for active sessions
CREATE INDEX IF NOT EXISTS idx_user_active_sessions_user_id ON user_active_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_active_sessions_last_activity ON user_active_sessions(last_activity DESC);
CREATE INDEX IF NOT EXISTS idx_user_active_sessions_is_active ON user_active_sessions(is_active);

-- Enable RLS
ALTER TABLE user_login_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_active_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_login_sessions
CREATE POLICY "Users can view their own login history" ON user_login_sessions FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Only system can insert login sessions" ON user_login_sessions FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admins can view all login sessions" ON user_login_sessions FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- RLS Policies for user_active_sessions
CREATE POLICY "Users can view their own active sessions" ON user_active_sessions FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Only system can manage active sessions" ON user_active_sessions FOR ALL WITH CHECK (true);

-- Function to parse user agent and extract device info
CREATE OR REPLACE FUNCTION parse_user_agent(user_agent_string TEXT)
RETURNS JSONB AS $$
DECLARE
    device_info JSONB := '{}';
    is_mobile BOOLEAN := false;
    browser_name TEXT := 'Unknown';
    browser_version TEXT := '';
    os_name TEXT := 'Unknown';
    os_version TEXT := '';
    device_type TEXT := 'desktop';
BEGIN
    -- Detect mobile devices
    IF user_agent_string ~* '(Mobile|Android|iPhone|iPad|iPod|BlackBerry|Windows Phone)' THEN
        is_mobile := true;
        device_type := 'mobile';
    END IF;
    
    -- Detect tablet
    IF user_agent_string ~* '(iPad|Tablet)' THEN
        device_type := 'tablet';
    END IF;
    
    -- Extract browser information
    CASE
        WHEN user_agent_string ~* 'Chrome' THEN
            browser_name := 'Chrome';
            browser_version := substring(user_agent_string from 'Chrome/([0-9.]+)');
        WHEN user_agent_string ~* 'Firefox' THEN
            browser_name := 'Firefox';
            browser_version := substring(user_agent_string from 'Firefox/([0-9.]+)');
        WHEN user_agent_string ~* 'Safari' AND user_agent_string !~* 'Chrome' THEN
            browser_name := 'Safari';
            browser_version := substring(user_agent_string from 'Version/([0-9.]+)');
        WHEN user_agent_string ~* 'Edge' THEN
            browser_name := 'Edge';
            browser_version := substring(user_agent_string from 'Edge/([0-9.]+)');
        ELSE
            browser_name := 'Other';
    END CASE;
    
    -- Extract OS information
    CASE
        WHEN user_agent_string ~* 'Windows NT' THEN
            os_name := 'Windows';
            os_version := substring(user_agent_string from 'Windows NT ([0-9.]+)');
        WHEN user_agent_string ~* 'Mac OS X' THEN
            os_name := 'macOS';
            os_version := substring(user_agent_string from 'Mac OS X ([0-9_]+)');
        WHEN user_agent_string ~* 'Android' THEN
            os_name := 'Android';
            os_version := substring(user_agent_string from 'Android ([0-9.]+)');
        WHEN user_agent_string ~* 'iPhone OS' THEN
            os_name := 'iOS';
            os_version := substring(user_agent_string from 'iPhone OS ([0-9_]+)');
        WHEN user_agent_string ~* 'Linux' THEN
            os_name := 'Linux';
        ELSE
            os_name := 'Other';
    END CASE;
    
    -- Build device info JSON
    device_info := jsonb_build_object(
        'is_mobile', is_mobile,
        'device_type', device_type,
        'browser_name', browser_name,
        'browser_version', browser_version,
        'os_name', os_name,
        'os_version', os_version,
        'user_agent', user_agent_string
    );
    
    RETURN device_info;
END;
$$ LANGUAGE plpgsql;

-- Function to log user login
CREATE OR REPLACE FUNCTION log_user_login(
    p_user_id UUID,
    p_email TEXT,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_success BOOLEAN DEFAULT true,
    p_failure_reason TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    session_id UUID;
    device_info JSONB;
BEGIN
    -- Parse user agent if provided
    IF p_user_agent IS NOT NULL THEN
        device_info := parse_user_agent(p_user_agent);
    ELSE
        device_info := '{}';
    END IF;
    
    -- Insert login session record
    INSERT INTO user_login_sessions (
        user_id,
        email,
        ip_address,
        user_agent,
        device_info,
        login_time,
        success,
        failure_reason,
        browser_name,
        browser_version,
        os_name,
        os_version,
        device_type,
        is_mobile
    ) VALUES (
        p_user_id,
        p_email,
        p_ip_address,
        p_user_agent,
        device_info,
        NOW(),
        p_success,
        p_failure_reason,
        COALESCE((device_info->>'browser_name'), 'Unknown'),
        COALESCE((device_info->>'browser_version'), ''),
        COALESCE((device_info->>'os_name'), 'Unknown'),
        COALESCE((device_info->>'os_version'), ''),
        COALESCE((device_info->>'device_type'), 'desktop'),
        COALESCE((device_info->>'is_mobile')::boolean, false)
    )
    RETURNING id INTO session_id;
    
    -- If login successful, create/update active session
    IF p_success THEN
        INSERT INTO user_active_sessions (
            user_id,
            session_id,
            ip_address,
            user_agent,
            last_activity,
            expires_at,
            is_active
        ) VALUES (
            p_user_id,
            session_id,
            p_ip_address,
            p_user_agent,
            NOW(),
            NOW() + INTERVAL '30 days', -- Session expires in 30 days
            true
        )
        ON CONFLICT (user_id, session_id) 
        DO UPDATE SET 
            last_activity = NOW(),
            is_active = true;
    END IF;
    
    RETURN session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update session activity
CREATE OR REPLACE FUNCTION update_session_activity(
    p_user_id UUID,
    p_ip_address INET DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE user_active_sessions 
    SET 
        last_activity = NOW(),
        ip_address = COALESCE(p_ip_address, ip_address)
    WHERE 
        user_id = p_user_id 
        AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to logout user session
CREATE OR REPLACE FUNCTION logout_user_session(
    p_user_id UUID,
    p_session_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    -- Update login session with logout time
    UPDATE user_login_sessions 
    SET 
        logout_time = NOW(),
        session_duration = NOW() - login_time
    WHERE 
        user_id = p_user_id 
        AND (p_session_id IS NULL OR id = p_session_id)
        AND logout_time IS NULL;
    
    -- Deactivate active sessions
    UPDATE user_active_sessions 
    SET 
        is_active = false,
        last_activity = NOW()
    WHERE 
        user_id = p_user_id 
        AND (p_session_id IS NULL OR session_id = p_session_id)
        AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user login history
CREATE OR REPLACE FUNCTION get_user_login_history(
    p_user_id UUID DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    email TEXT,
    ip_address INET,
    browser_name TEXT,
    browser_version TEXT,
    os_name TEXT,
    device_type TEXT,
    is_mobile BOOLEAN,
    login_time TIMESTAMPTZ,
    logout_time TIMESTAMPTZ,
    session_duration INTERVAL,
    success BOOLEAN,
    failure_reason TEXT,
    location_info JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        uls.id,
        uls.user_id,
        uls.email,
        uls.ip_address,
        uls.browser_name,
        uls.browser_version,
        uls.os_name,
        uls.device_type,
        uls.is_mobile,
        uls.login_time,
        uls.logout_time,
        uls.session_duration,
        uls.success,
        uls.failure_reason,
        uls.location_info
    FROM user_login_sessions uls
    WHERE (p_user_id IS NULL OR uls.user_id = p_user_id)
    ORDER BY uls.login_time DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get active sessions
CREATE OR REPLACE FUNCTION get_active_sessions(
    p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
    session_id UUID,
    user_id UUID,
    email TEXT,
    ip_address INET,
    browser_name TEXT,
    os_name TEXT,
    device_type TEXT,
    login_time TIMESTAMPTZ,
    last_activity TIMESTAMPTZ,
    is_current BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        uas.session_id,
        uas.user_id,
        uls.email,
        uas.ip_address,
        uls.browser_name,
        uls.os_name,
        uls.device_type,
        uls.login_time,
        uas.last_activity,
        false AS is_current -- Will be determined by frontend
    FROM user_active_sessions uas
    JOIN user_login_sessions uls ON uas.session_id = uls.id
    WHERE 
        uas.is_active = true 
        AND (p_user_id IS NULL OR uas.user_id = p_user_id)
        AND uas.last_activity > NOW() - INTERVAL '30 days'
    ORDER BY uas.last_activity DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically clean old sessions
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS VOID AS $$
BEGIN
    -- Deactivate sessions older than 30 days
    UPDATE user_active_sessions 
    SET is_active = false
    WHERE last_activity < NOW() - INTERVAL '30 days' AND is_active = true;
    
    -- Delete very old login session records (older than 1 year)
    DELETE FROM user_login_sessions 
    WHERE login_time < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run cleanup (if pg_cron is available)
-- SELECT cron.schedule('cleanup-old-sessions', '0 2 * * *', 'SELECT cleanup_old_sessions();');

-- Add comments for documentation
COMMENT ON TABLE user_login_sessions IS 'Tracks all user login attempts with IP addresses and device information';
COMMENT ON TABLE user_active_sessions IS 'Tracks currently active user sessions';
COMMENT ON FUNCTION log_user_login IS 'Logs user login attempts with IP and device details';
COMMENT ON FUNCTION get_user_login_history IS 'Retrieves user login history for admin monitoring';
COMMENT ON FUNCTION get_active_sessions IS 'Gets currently active user sessions';