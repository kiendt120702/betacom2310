import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export interface DailyPageView {
  date: string;
  view_count: number;
}

export interface TopPage {
  path: string;
  view_count: number;
}

export interface TopUserByViews {
  user_id: string;
  user_name: string;
  view_count: number;
}

interface WebsiteAnalyticsParams {
  startDate: Date;
  endDate: Date;
  topLimit?: number;
}

export const useWebsiteAnalytics = ({ startDate, endDate, topLimit = 10 }: WebsiteAnalyticsParams) => {
  const formattedStartDate = format(startDate, "yyyy-MM-dd'T'00:00:00");
  const formattedEndDate = format(endDate, "yyyy-MM-dd'T'23:59:59");

  const { data: dailyViews, isLoading: dailyViewsLoading, error: dailyViewsError } = useQuery<DailyPageView[]>({
    queryKey: ["daily-page-views", formattedStartDate, formattedEndDate],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_daily_page_views", {
        start_date_param: formattedStartDate,
        end_date_param: formattedEndDate,
      });
      if (error) throw error;
      return data;
    },
    enabled: !!startDate && !!endDate,
  });

  const { data: topPages, isLoading: topPagesLoading, error: topPagesError } = useQuery<TopPage[]>({
    queryKey: ["top-pages", formattedStartDate, formattedEndDate, topLimit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_top_pages", {
        start_date_param: formattedStartDate,
        end_date_param: formattedEndDate,
        limit_param: topLimit,
      });
      if (error) throw error;
      return data;
    },
    enabled: !!startDate && !!endDate,
  });

  const { data: topUsers, isLoading: topUsersLoading, error: topUsersError } = useQuery<TopUserByViews[]>({
    queryKey: ["top-users-by-page-views", formattedStartDate, formattedEndDate, topLimit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_top_users_by_page_views", {
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
    dailyViews,
    topPages,
    topUsers,
    isLoading: dailyViewsLoading || topPagesLoading || topUsersLoading,
    error: dailyViewsError || topPagesError || topUsersError,
  };
};