import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LoginSession {
  id: string;
  user_id: string;
  email: string;
  ip_address: string;
  browser_name: string;
  browser_version: string;
  os_name: string;
  device_type: string;
  is_mobile: boolean;
  login_time: string;
  logout_time: string | null;
  session_duration: string | null;
  success: boolean;
  failure_reason: string | null;
  location_info: any;
  total_count: number; // Add total_count for pagination
}

export interface ActiveSession {
  session_id: string;
  user_id: string;
  email: string;
  ip_address: string;
  browser_name: string;
  os_name: string;
  device_type: string;
  login_time: string;
  last_activity: string;
  is_current: boolean;
}

// Standalone function to fetch IP
const fetchUserIP = async () => {
  try {
    const services = [
      'https://api.ipify.org?format=json',
      'https://ipapi.co/json/',
      'https://ip-api.com/json/'
    ];

    for (const service of services) {
      try {
        const response = await fetch(service);
        const data = await response.json();
        
        if (service.includes('ipify')) return { ip: data.ip, location: null };
        if (service.includes('ipapi.co')) return { ip: data.ip, location: { country: data.country_name, city: data.city, region: data.region, timezone: data.timezone } };
        if (service.includes('ip-api.com')) return { ip: data.query, location: { country: data.country, city: data.city, region: data.regionName, timezone: data.timezone } };
      } catch (error) {
        console.warn(`Failed to get IP from ${service}:`, error);
        continue;
      }
    }
    
    throw new Error('All IP services failed');
  } catch (error) {
    console.error('Failed to get user IP:', error);
    return { ip: 'Unknown', location: null };
  }
};

// Hook to get user's IP address
export const useUserIP = () => {
  return useQuery({
    queryKey: ['user-ip'],
    queryFn: fetchUserIP,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

// Hook to log login attempt
export const useLogLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      userId,
      email,
      success = true,
      failureReason = null
    }: {
      userId: string;
      email: string;
      success?: boolean;
      failureReason?: string | null;
    }) => {
      const ipData = await fetchUserIP();
      const userAgent = navigator.userAgent;
      
      const { data, error } = await supabase.rpc('log_user_login' as any, {
        p_user_id: userId,
        p_email: email,
        p_ip_address: ipData?.ip || null,
        p_user_agent: userAgent,
        p_success: success,
        p_failure_reason: failureReason
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['login-history'] });
      queryClient.invalidateQueries({ queryKey: ['active-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['user-latest-login'] });
    },
  });
};

// Hook to get login history (for admin) with pagination
export const useLoginHistory = (userId?: string, page = 1, pageSize = 20) => {
  return useQuery({
    queryKey: ['login-history', userId, page, pageSize],
    queryFn: async (): Promise<{ sessions: LoginSession[], totalCount: number }> => {
      const { data, error } = await supabase.rpc('get_user_login_history' as any, {
        p_user_id: userId || null,
        p_limit: pageSize,
        p_offset: (page - 1) * pageSize
      });

      if (error) throw error;
      const sessions = (data as LoginSession[]) || [];
      const totalCount = sessions.length > 0 ? sessions[0].total_count : 0;
      return { sessions, totalCount };
    },
    enabled: true,
  });
};

// Hook to get active sessions
export const useActiveSessions = (userId?: string) => {
  return useQuery({
    queryKey: ['active-sessions', userId],
    queryFn: async (): Promise<ActiveSession[]> => {
      const { data, error } = await supabase.rpc('get_active_sessions' as any, {
        p_user_id: userId || null
      });

      if (error) throw error;
      return (data as ActiveSession[]) || [];
    },
    refetchInterval: 30000,
  });
};

// Hook to logout session
export const useLogoutSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      userId,
      sessionId
    }: {
      userId: string;
      sessionId?: string;
    }) => {
      const { data, error } = await supabase.rpc('logout_user_session' as any, {
        p_user_id: userId,
        p_session_id: sessionId || null
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['login-history'] });
      queryClient.invalidateQueries({ queryKey: ['active-sessions'] });
    },
  });
};

// Hook to update session activity
export const useUpdateSessionActivity = () => {
  return useMutation({
    mutationFn: async ({
      userId,
    }: {
      userId: string;
    }) => {
      const ipData = await fetchUserIP();
      const { data, error } = await supabase.rpc('update_session_activity' as any, {
        p_user_id: userId,
        p_ip_address: ipData?.ip || null
      });

      if (error) throw error;
      return data;
    },
  });
};

// Utility function to format device info
export const formatDeviceInfo = (session: LoginSession | ActiveSession) => {
  const parts = [];
  if (session.browser_name && session.browser_name !== 'Unknown') parts.push(session.browser_name);
  if (session.os_name && session.os_name !== 'Unknown') parts.push(session.os_name);
  if (session.device_type) parts.push(session.device_type);
  return parts.join(' • ') || 'Unknown Device';
};

// Hook to get user's latest login info
export const useUserLatestLogin = (userId?: string) => {
  return useQuery({
    queryKey: ['user-latest-login', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase.rpc('get_user_latest_login' as any, { p_user_id: userId });
      if (error) throw error;
      return (data as LoginSession) || null;
    },
    enabled: !!userId,
    staleTime: 1 * 60 * 1000,
  });
};

// Utility function to format location info
export const formatLocationInfo = (locationInfo: any) => {
  if (!locationInfo) return 'Unknown Location';
  const parts = [];
  if (locationInfo.city) parts.push(locationInfo.city);
  if (locationInfo.country) parts.push(locationInfo.country);
  return parts.join(', ') || 'Unknown Location';
};