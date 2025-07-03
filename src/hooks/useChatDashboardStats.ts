import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

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
  return useQuery<ChatStatistics>({
    queryKey: ['chat-statistics', startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      const { data, error } = await supabase.rpc('get_chat_statistics', {
        start_date_param: startDate.toISOString(),
        end_date_param: endDate.toISOString(),
      }).single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useDailyChatUsage = (startDate: Date, endDate: Date) => {
  const { user } = useAuth();
  return useQuery<DailyChatUsage[]>({
    queryKey: ['daily-chat-usage', startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      const { data, error } = await supabase.rpc('get_daily_chat_usage', {
        start_date_param: startDate.toISOString(),
        end_date_param: endDate.toISOString(),
      });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useTopUsersByMessages = (startDate: Date, endDate: Date, limit: number = 10) => {
  const { user } = useAuth();
  return useQuery<TopUser[]>({
    queryKey: ['top-users-by-messages', startDate.toISOString(), endDate.toISOString(), limit],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      const { data, error } = await supabase.rpc('get_top_users_by_messages', {
        start_date_param: startDate.toISOString(),
        end_date_param: endDate.toISOString(),
        limit_param: limit,
      });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useTopBotsByMessages = (startDate: Date, endDate: Date, limit: number = 10) => {
  const { user } = useAuth();
  return useQuery<TopBot[]>({
    queryKey: ['top-bots-by-messages', startDate.toISOString(), endDate.toISOString(), limit],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      const { data, error } = await supabase.rpc('get_top_bots_by_messages', {
        start_date_param: startDate.toISOString(),
        end_date_param: endDate.toISOString(),
        limit_param: limit,
      });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};