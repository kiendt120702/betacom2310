import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export interface ChatStatistics {
  total_users: number;
  total_messages: number;
  total_strategy_messages: number;
  total_seo_messages: number;
  total_general_messages: number;
}

export interface DailyChatUsage {
  date: string;
  message_count: number;
}

export interface TopBot {
  bot_type: string;
  message_count: number;
}

export interface TopUser {
  user_id: string;
  user_name: string;
  message_count: number;
}

interface ChatAnalyticsParams {
  startDate: Date;
  endDate: Date;
  topLimit?: number;
}

export const useChatAnalytics = ({ startDate, endDate, topLimit = 10 }: ChatAnalyticsParams) => {
  // Removed 'Z' from format string as it's not needed and causes error
  const formattedStartDate = format(startDate, "yyyy-MM-dd'T'00:00:00");
  const formattedEndDate = format(endDate, "yyyy-MM-dd'T'23:59:59");

  // Query for overall chat statistics
  const { data: chatStats, isLoading: statsLoading, error: statsError } = useQuery<ChatStatistics[]>({
    queryKey: ["chat-statistics", formattedStartDate, formattedEndDate],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_chat_statistics", {
        start_date_param: formattedStartDate,
        end_date_param: formattedEndDate,
      });
      if (error) throw error;
      return data;
    },
    enabled: !!startDate && !!endDate,
  });

  // Query for daily chat usage
  const { data: dailyUsage, isLoading: dailyUsageLoading, error: dailyUsageError } = useQuery<DailyChatUsage[]>({
    queryKey: ["daily-chat-usage", formattedStartDate, formattedEndDate],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_daily_chat_usage", {
        start_date_param: formattedStartDate,
        end_date_param: formattedEndDate,
      });
      if (error) throw error;
      return data;
    },
    enabled: !!startDate && !!endDate,
  });

  // Query for top bots
  const { data: topBots, isLoading: topBotsLoading, error: topBotsError } = useQuery<TopBot[]>({
    queryKey: ["top-bots", formattedStartDate, formattedEndDate, topLimit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_top_bots_by_messages", {
        start_date_param: formattedStartDate,
        end_date_param: formattedEndDate,
        limit_param: topLimit,
      });
      if (error) throw error;
      return data;
    },
    enabled: !!startDate && !!endDate,
  });

  // Query for top users
  const { data: topUsers, isLoading: topUsersLoading, error: topUsersError } = useQuery<TopUser[]>({
    queryKey: ["top-users", formattedStartDate, formattedEndDate, topLimit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_top_users_by_messages", {
        start_date_param: formattedStartDate,
        end_date_param: formattedEndDate,
        limit_param: topLimit,
      });
      if (error) throw error;
      return data;
    },
    enabled: !!startDate && !!endDate,
  });

  return {
    chatStats: chatStats?.[0], // Assuming it returns a single row
    dailyUsage,
    topBots,
    topUsers,
    isLoading: statsLoading || dailyUsageLoading || topBotsLoading || topUsersLoading,
    error: statsError || dailyUsageError || topBotsError || topUsersError,
  };
};