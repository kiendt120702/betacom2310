import type { Json } from "../database"

export type UserLoginSessions = {
  Row: {
    browser_name: string | null
    browser_version: string | null
    city: string | null
    country: string | null
    created_at: string | null
    device_info: Json | null
    device_type: string | null
    email: string | null
    failure_reason: string | null
    id: string
    ip_address: string | null
    is_mobile: boolean | null
    location_info: Json | null
    login_method: string | null
    login_time: string | null
    logout_time: string | null
    os_name: string | null
    os_version: string | null
    session_duration: string | null
    success: boolean | null
    timezone: string | null
    user_agent: string | null
    user_id: string | null
  }
  Insert: {
    browser_name?: string | null
    browser_version?: string | null
    city?: string | null
    country?: string | null
    created_at?: string | null
    device_info?: Json | null
    device_type?: string | null
    email?: string | null
    failure_reason?: string | null
    id?: string
    ip_address?: string | null
    is_mobile?: boolean | null
    location_info?: Json | null
    login_method?: string | null
    login_time?: string | null
    logout_time?: string | null
    os_name?: string | null
    os_version?: string | null
    session_duration?: string | null
    success?: boolean | null
    timezone?: string | null
    user_agent?: string | null
    user_id?: string | null
  }
  Update: {
    browser_name?: string | null
    browser_version?: string | null
    city?: string | null
    country?: string | null
    created_at?: string | null
    device_info?: Json | null
    device_type?: string | null
    email?: string | null
    failure_reason?: string | null
    id?: string
    ip_address?: string | null
    is_mobile?: boolean | null
    location_info?: Json | null
    login_method?: string | null
    login_time?: string | null
    logout_time?: string | null
    os_name?: string | null
    os_version?: string | null
    session_duration?: string | null
    success?: boolean | null
    timezone?: string | null
    user_agent?: string | null
    user_id?: string | null
  }
  Relationships: []
}