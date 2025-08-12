
-- Cải thiện function get_user_role để tránh search_path mutable warning
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

-- Cải thiện function get_user_team_id để tránh search_path mutable warning  
CREATE OR REPLACE FUNCTION public.get_user_team_id(user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT team_id FROM public.profiles WHERE id = user_id;
$$;

-- Cải thiện function get_cached_user_role để tránh search_path mutable warning
CREATE OR REPLACE FUNCTION public.get_cached_user_role()
RETURNS user_role
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  cached_role user_role;
BEGIN
  -- Sử dụng pg_advisory_xact_lock để đảm bảo thread safety
  PERFORM pg_advisory_xact_lock(hashtext('user_role_' || auth.uid()::text));
  
  SELECT role INTO cached_role 
  FROM profiles 
  WHERE id = auth.uid();
  
  RETURN COALESCE(cached_role, 'chuyên viên'::user_role);
END;
$$;

-- Tạo indexes để cải thiện hiệu suất
CREATE INDEX IF NOT EXISTS idx_banners_user_id ON public.banners(user_id);
CREATE INDEX IF NOT EXISTS idx_banners_status ON public.banners(status);
CREATE INDEX IF NOT EXISTS idx_banners_category_id ON public.banners(category_id);
CREATE INDEX IF NOT EXISTS idx_banners_banner_type_id ON public.banners(banner_type_id);
CREATE INDEX IF NOT EXISTS idx_banners_created_at ON public.banners(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_team_id ON public.profiles(team_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Tạo indexes cho các bảng chat để cải thiện hiệu suất
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id_created_at ON public.chat_conversations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id_created_at ON public.chat_messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_seo_chat_conversations_user_id_created_at ON public.seo_chat_conversations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_seo_chat_messages_conversation_id_created_at ON public.seo_chat_messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_general_chat_conversations_user_id_created_at ON public.general_chat_conversations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_general_chat_messages_conversation_id_created_at ON public.general_chat_messages(conversation_id, created_at DESC);

-- Cải thiện function search_banners để tránh search_path mutable warning
CREATE OR REPLACE FUNCTION public.search_banners(
  search_term text DEFAULT ''::text, 
  category_filter uuid DEFAULT NULL::uuid, 
  type_filter uuid DEFAULT NULL::uuid, 
  status_filter text DEFAULT 'approved'::text, 
  page_num integer DEFAULT 1, 
  page_size integer DEFAULT 18
)
RETURNS TABLE(
  id uuid, 
  name text, 
  image_url text, 
  canva_link text, 
  created_at timestamp with time zone, 
  updated_at timestamp with time zone, 
  category_name text, 
  banner_type_name text, 
  status text, 
  user_name text, 
  total_count bigint
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  offset_val integer := (page_num - 1) * page_size;
  current_user_role user_role;
BEGIN
  -- Lấy role một lần duy nhất
  SELECT get_user_role(auth.uid()) INTO current_user_role;
  
  -- Sử dụng window function để tính total_count chỉ một lần
  RETURN QUERY
  SELECT 
    b.id,
    b.name,
    b.image_url,
    b.canva_link,
    b.created_at,
    b.updated_at,
    c.name as category_name,
    bt.name as banner_type_name,
    b.status::text,
    COALESCE(p.full_name, p.email) as user_name,
    COUNT(*) OVER() as total_count
  FROM banners b
  LEFT JOIN categories c ON b.category_id = c.id
  LEFT JOIN banner_types bt ON b.banner_type_id = bt.id
  LEFT JOIN profiles p ON b.user_id = p.id
  WHERE 
    (search_term = '' OR b.name ILIKE '%' || search_term || '%')
    AND (category_filter IS NULL OR b.category_id = category_filter)
    AND (type_filter IS NULL OR b.banner_type_id = type_filter)
    AND (status_filter = 'all' OR b.status::text = status_filter)
    AND (
      -- Admin xem tất cả
      current_user_role = 'admin' 
      -- User thường chỉ xem approved
      OR (current_user_role != 'admin' AND b.status = 'approved')
    )
  ORDER BY 
    CASE WHEN b.status = 'pending' THEN 0 ELSE 1 END,
    b.created_at DESC
  LIMIT page_size
  OFFSET offset_val;
END;
$$;

-- Cải thiện các function thống kê để tránh search_path mutable warning
CREATE OR REPLACE FUNCTION public.get_chat_statistics(start_date_param timestamp with time zone, end_date_param timestamp with time zone)
RETURNS TABLE(total_users bigint, total_messages bigint, total_strategy_messages bigint, total_seo_messages bigint, total_general_messages bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    _total_users bigint;
    _total_messages bigint;
    _total_strategy_messages bigint;
    _total_seo_messages bigint;
    _total_general_messages bigint;
BEGIN
    -- Calculate total unique users who sent messages
    SELECT COUNT(DISTINCT user_id)
    INTO _total_users
    FROM (
        SELECT user_id FROM chat_conversations WHERE created_at BETWEEN start_date_param AND end_date_param
        UNION ALL
        SELECT user_id FROM seo_chat_conversations WHERE created_at BETWEEN start_date_param AND end_date_param
        UNION ALL
        SELECT user_id FROM general_chat_conversations WHERE created_at BETWEEN start_date_param AND end_date_param
    ) AS distinct_users;

    -- Calculate total messages for each bot type
    SELECT COUNT(*)
    INTO _total_strategy_messages
    FROM chat_messages cm
    JOIN chat_conversations cc ON cm.conversation_id = cc.id
    WHERE cm.created_at BETWEEN start_date_param AND end_date_param;

    SELECT COUNT(*)
    INTO _total_seo_messages
    FROM seo_chat_messages scm
    JOIN seo_chat_conversations scc ON scm.conversation_id = scc.id
    WHERE scm.created_at BETWEEN start_date_param AND end_date_param;

    SELECT COUNT(*)
    INTO _total_general_messages
    FROM general_chat_messages gcm
    JOIN general_chat_conversations gcc ON gcm.conversation_id = gcc.id
    WHERE gcm.created_at BETWEEN start_date_param AND end_date_param;

    _total_messages := _total_strategy_messages + _total_seo_messages + _total_general_messages;

    RETURN QUERY SELECT _total_users, _total_messages, _total_strategy_messages, _total_seo_messages, _total_general_messages;
END;
$$;

-- Cải thiện function get_daily_chat_usage 
CREATE OR REPLACE FUNCTION public.get_daily_chat_usage(start_date_param timestamp with time zone, end_date_param timestamp with time zone)
RETURNS TABLE(date date, message_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    RETURN QUERY
    SELECT
        DATE(cm.created_at) AS date,
        COUNT(cm.id) AS message_count
    FROM chat_messages cm
    JOIN chat_conversations cc ON cm.conversation_id = cc.id
    WHERE cm.created_at BETWEEN start_date_param AND end_date_param
    GROUP BY DATE(cm.created_at)
    UNION ALL
    SELECT
        DATE(scm.created_at) AS date,
        COUNT(scm.id) AS message_count
    FROM seo_chat_messages scm
    JOIN seo_chat_conversations scc ON scm.conversation_id = scc.id
    WHERE scm.created_at BETWEEN start_date_param AND end_date_param
    GROUP BY DATE(scm.created_at)
    UNION ALL
    SELECT
        DATE(gcm.created_at) AS date,
        COUNT(gcm.id) AS message_count
    FROM general_chat_messages gcm
    JOIN general_chat_conversations gcc ON gcm.conversation_id = gcc.id
    WHERE gcm.created_at BETWEEN start_date_param AND end_date_param
    GROUP BY DATE(gcm.created_at)
    ORDER BY date;
END;
$$;

-- Cải thiện function get_top_users_by_messages
CREATE OR REPLACE FUNCTION public.get_top_users_by_messages(start_date_param timestamp with time zone, end_date_param timestamp with time zone, limit_param integer DEFAULT 10)
RETURNS TABLE(user_id uuid, user_name text, message_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    RETURN QUERY
    WITH all_messages AS (
        SELECT cm.created_at, cc.user_id
        FROM chat_messages cm
        JOIN chat_conversations cc ON cm.conversation_id = cc.id
        WHERE cm.created_at BETWEEN start_date_param AND end_date_param
        UNION ALL
        SELECT scm.created_at, scc.user_id
        FROM seo_chat_messages scm
        JOIN seo_chat_conversations scc ON scm.conversation_id = scc.id
        WHERE scm.created_at BETWEEN start_date_param AND end_date_param
        UNION ALL
        SELECT gcm.created_at, gcc.user_id
        FROM general_chat_messages gcm
        JOIN general_chat_conversations gcc ON gcm.conversation_id = gcc.id
        WHERE gcm.created_at BETWEEN start_date_param AND end_date_param
    )
    SELECT
        am.user_id,
        COALESCE(p.full_name, p.email) AS user_name,
        COUNT(am.user_id) AS message_count
    FROM all_messages am
    LEFT JOIN profiles p ON am.user_id = p.id
    GROUP BY am.user_id, p.full_name, p.email
    ORDER BY message_count DESC
    LIMIT limit_param;
END;
$$;

-- Cải thiện function get_top_bots_by_messages
CREATE OR REPLACE FUNCTION public.get_top_bots_by_messages(start_date_param timestamp with time zone, end_date_param timestamp with time zone, limit_param integer DEFAULT 10)
RETURNS TABLE(bot_type text, message_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    RETURN QUERY
    SELECT
        'strategy' AS bot_type,
        COUNT(cm.id) AS message_count
    FROM chat_messages cm
    JOIN chat_conversations cc ON cm.conversation_id = cc.id
    WHERE cm.created_at BETWEEN start_date_param AND end_date_param
    GROUP BY 'strategy'
    UNION ALL
    SELECT
        'seo' AS bot_type,
        COUNT(scm.id) AS message_count
    FROM seo_chat_messages scm
    JOIN seo_chat_conversations scc ON scm.conversation_id = scc.id
    WHERE scm.created_at BETWEEN start_date_param AND end_date_param
    GROUP BY 'seo'
    UNION ALL
    SELECT
        'general' AS bot_type,
        COUNT(gcm.id) AS message_count
    FROM general_chat_messages gcm
    JOIN general_chat_conversations gcc ON gcm.conversation_id = gcc.id
    WHERE gcm.created_at BETWEEN start_date_param AND end_date_param
    GROUP BY 'general'
    ORDER BY message_count DESC
    LIMIT limit_param;
END;
$$;

-- Tạo function mới để tối ưu hóa search_strategy_knowledge 
CREATE OR REPLACE FUNCTION public.search_strategy_knowledge(
  query_embedding vector(1536),
  match_threshold double precision DEFAULT 0.8,
  match_count integer DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  formula_a1 text,
  formula_a text,
  similarity double precision
)
LANGUAGE sql
STABLE
SET search_path = 'public'
AS $$
  SELECT
    strategy_knowledge.id,
    strategy_knowledge.formula_a1,
    strategy_knowledge.formula_a,
    1 - (strategy_knowledge.content_embedding <=> query_embedding) as similarity
  FROM strategy_knowledge
  WHERE strategy_knowledge.content_embedding IS NOT NULL
    AND 1 - (strategy_knowledge.content_embedding <=> query_embedding) > match_threshold
  ORDER BY strategy_knowledge.content_embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Tạo function mới để tối ưu hóa search_seo_knowledge
CREATE OR REPLACE FUNCTION public.search_seo_knowledge(
  query_embedding vector(1536), 
  match_threshold double precision DEFAULT 0.7, 
  match_count integer DEFAULT 5
)
RETURNS TABLE(id uuid, content text, similarity double precision)
LANGUAGE sql
STABLE
SET search_path = 'public'
AS $$
  SELECT
    seo_knowledge.id,
    seo_knowledge.content,
    1 - (seo_knowledge.content_embedding <=> query_embedding) as similarity
  FROM seo_knowledge
  WHERE seo_knowledge.content_embedding IS NOT NULL
    AND 1 - (seo_knowledge.content_embedding <=> query_embedding) > match_threshold
  ORDER BY seo_knowledge.content_embedding <=> query_embedding
  LIMIT match_count;
$$;
