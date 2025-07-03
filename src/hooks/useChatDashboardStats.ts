import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { UserProfile } from './useUserProfile'; // Import UserProfile

interface ChatStatistics {
  total_users: number;
  total_messages: number;
  total_strategy_messages: number;
  total_seo_messages: number;
  total_general_messages: number;
}

interface DailyChatUsage {
  date: string;
  message_count: number;
}

interface TopUser {
  user_id: string;
  user_name: string;
  message_count: number;
}

interface TopBot {
  bot_type: string;
  message_count: number;
}

export const useChatStatistics = (startDate: Date, endDate: Date) => {
  const { user } = useAuth();
  const { data: userProfile } = useUserProfile(); // Get user profile

  return useQuery<ChatStatistics>({
    queryKey: ['chat-statistics', startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      if (!user || !userProfile) throw new Error('User not authenticated or profile not loaded');
      
      // Only allow admins or leaders to fetch statistics
      if (userProfile.role !== 'admin' && userProfile.role !== 'leader') {
        throw new Error('Unauthorized access to chat statistics');
      }

      const { data, error } = await supabase.rpc('get_chat_statistics', {
        start_date_param: startDate.toISOString(),
        end_date_param: endDate.toISOString(),
      }).single();
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!userProfile && (userProfile.role === 'admin' || userProfile.role === 'leader'),
  });
};

export const useDailyChatUsage = (startDate: Date, endDate: Date) => {
  const { user } = useAuth();
  const { data: userProfile } = useUserProfile(); // Get user profile

  return useQuery<DailyChatUsage[]>({
    queryKey: ['daily-chat-usage', startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      if (!user || !userProfile) throw new Error('User not authenticated or profile not loaded');

      // Only allow admins or leaders to fetch daily usage
      if (userProfile.role !== 'admin' && userProfile.role !== 'leader') {
        throw new Error('Unauthorized access to daily chat usage');
      }

      const { data, error } = await supabase.rpc('get_daily_chat_usage', {
        start_date_param: startDate.toISOString(),
        end_date_param: endDate.toISOString(),
      });
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!userProfile && (userProfile.role === 'admin' || userProfile.role === 'leader'),
  });
};

export const useTopUsersByMessages = (startDate: Date, endDate: Date, limit: number = 10) => {
  const { user } = useAuth();
  const { data: userProfile } = useUserProfile(); // Get user profile

  return useQuery<TopUser[]>({
    queryKey: ['top-users-by-messages', startDate.toISOString(), endDate.toISOString(), limit],
    queryFn: async () => {
      if (!user || !userProfile) throw new Error('User not authenticated or profile not loaded');

      // Only allow admins or leaders to fetch top users
      if (userProfile.role !== 'admin' && userProfile.role !== 'leader') {
        throw new Error('Unauthorized access to top users by messages');
      }

      const { data, error } = await supabase.rpc('get_top_users_by_messages', {
        start_date_param: startDate.toISOString(),
        end_date_param: endDate.toISOString(),
        limit_param: limit,
      });
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!userProfile && (userProfile.role === 'admin' || userProfile.role === 'leader'),
  });
};

export const useTopBotsByMessages = (startDate: Date, endDate: Date, limit: number = 10) => {
  const { user } = useAuth();
  const { data: userProfile } = useUserProfile(); // Get user profile

  return useQuery<TopBot[]>({
    queryKey: ['top-bots-by-messages', startDate.toISOString(), endDate.toISOString(), limit],
    queryFn: async () => {
      if (!user || !userProfile) throw new Error('User not authenticated or profile not loaded');

      // Only allow admins or leaders to fetch top bots
      if (userProfile.role !== 'admin' && userProfile.role !== 'leader') {
        throw new Error('Unauthorized access to top bots by messages');
      }

      const { data, error } = await supabase.rpc('get_top_bots_by_messages', {
        start_date_param: startDate.toISOString(),
        end_date_param: endDate.toISOString(),
        limit_param: limit,
      });
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!userProfile && (userProfile.role === 'admin' || userProfile.role === 'leader'),
  });
};