-- Function để tính thời gian xem trung bình
CREATE OR REPLACE FUNCTION get_avg_watch_time()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COALESCE(AVG(total_watch_time), 0)::INTEGER
    FROM video_tracking
    WHERE total_watch_time > 0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function để tính tổng số session
CREATE OR REPLACE FUNCTION get_total_sessions()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COALESCE(SUM(session_count), 0)::INTEGER
    FROM video_tracking
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function để lấy thống kê chi tiết theo bài tập
CREATE OR REPLACE FUNCTION get_exercise_video_stats()
RETURNS TABLE (
  exercise_id UUID,
  exercise_title TEXT,
  total_viewers BIGINT,
  avg_watch_time NUMERIC,
  avg_completion_rate NUMERIC,
  total_sessions NUMERIC,
  avg_rewatch_count NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vt.exercise_id,
    eke.title as exercise_title,
    COUNT(DISTINCT vt.user_id) as total_viewers,
    ROUND(AVG(vt.total_watch_time), 2) as avg_watch_time,
    ROUND(AVG(vt.watch_percentage), 2) as avg_completion_rate,
    SUM(vt.session_count) as total_sessions,
    ROUND(AVG(vt.session_count), 2) as avg_rewatch_count
  FROM video_tracking vt
  JOIN edu_knowledge_exercises eke ON vt.exercise_id = eke.id
  GROUP BY vt.exercise_id, eke.title
  ORDER BY total_viewers DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function để lấy thống kê theo user
CREATE OR REPLACE FUNCTION get_user_video_stats()
RETURNS TABLE (
  user_id UUID,
  user_email TEXT,
  total_watch_time NUMERIC,
  videos_watched BIGINT,
  avg_completion_rate NUMERIC,
  total_sessions NUMERIC,
  most_watched_exercise_title TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH user_stats AS (
    SELECT 
      vt.user_id,
      p.email as user_email,
      SUM(vt.total_watch_time) as total_watch_time,
      COUNT(DISTINCT vt.exercise_id) as videos_watched,
      AVG(vt.watch_percentage) as avg_completion_rate,
      SUM(vt.session_count) as total_sessions
    FROM video_tracking vt
    LEFT JOIN profiles p ON vt.user_id = p.id
    GROUP BY vt.user_id, p.email
  ),
  most_watched AS (
    SELECT DISTINCT ON (vt.user_id)
      vt.user_id,
      eke.title as most_watched_exercise_title
    FROM video_tracking vt
    JOIN edu_knowledge_exercises eke ON vt.exercise_id = eke.id
    ORDER BY vt.user_id, vt.total_watch_time DESC
  )
  SELECT 
    us.user_id,
    us.user_email,
    us.total_watch_time,
    us.videos_watched,
    ROUND(us.avg_completion_rate, 2) as avg_completion_rate,
    us.total_sessions,
    mw.most_watched_exercise_title
  FROM user_stats us
  LEFT JOIN most_watched mw ON us.user_id = mw.user_id
  ORDER BY us.total_watch_time DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function để phát hiện dropout points (điểm người dùng hay dừng xem)
CREATE OR REPLACE FUNCTION get_video_dropout_points(p_exercise_id UUID)
RETURNS TABLE (
  time_segment INTEGER,
  dropout_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH segments AS (
    SELECT 
      FLOOR(last_position / 30) * 30 as time_segment,
      COUNT(*) as dropout_count
    FROM video_tracking 
    WHERE exercise_id = p_exercise_id 
    AND watch_percentage < 90 -- Users who didn't complete
    GROUP BY FLOOR(last_position / 30)
  )
  SELECT s.time_segment::INTEGER, s.dropout_count
  FROM segments s
  WHERE s.dropout_count >= 2 -- Only show segments where 2+ users dropped out
  ORDER BY s.time_segment;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function để tính engagement score
CREATE OR REPLACE FUNCTION calculate_engagement_score(p_exercise_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  completion_rate NUMERIC;
  rewatch_rate NUMERIC;
  engagement_score NUMERIC;
BEGIN
  -- Get completion rate (percentage of users who watched >80%)
  SELECT 
    (COUNT(CASE WHEN watch_percentage >= 80 THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100
  INTO completion_rate
  FROM video_tracking 
  WHERE exercise_id = p_exercise_id;

  -- Get rewatch rate (average sessions per user)
  SELECT AVG(session_count)
  INTO rewatch_rate
  FROM video_tracking 
  WHERE exercise_id = p_exercise_id;

  -- Calculate engagement score (weighted average)
  engagement_score := (completion_rate * 0.7) + (LEAST(rewatch_rate * 20, 30) * 0.3);

  RETURN ROUND(engagement_score, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;