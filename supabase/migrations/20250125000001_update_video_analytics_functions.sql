-- Update video analytics functions to remove watch_percentage references

-- Update get_exercise_video_stats function
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
    ROUND(AVG(CASE 
      WHEN vt.video_duration > 0 THEN (vt.total_watch_time::NUMERIC / vt.video_duration::NUMERIC) * 100
      ELSE 0 
    END), 2) as avg_completion_rate,
    SUM(vt.session_count) as total_sessions,
    ROUND(AVG(vt.session_count), 2) as avg_rewatch_count
  FROM video_tracking vt
  JOIN edu_knowledge_exercises eke ON vt.exercise_id = eke.id
  GROUP BY vt.exercise_id, eke.title
  ORDER BY total_viewers DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update get_user_video_stats function
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
      AVG(CASE 
        WHEN vt.video_duration > 0 THEN (vt.total_watch_time::NUMERIC / vt.video_duration::NUMERIC) * 100
        ELSE 0 
      END) as avg_completion_rate,
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
    us.avg_completion_rate,
    us.total_sessions,
    mw.most_watched_exercise_title
  FROM user_stats us
  LEFT JOIN most_watched mw ON us.user_id = mw.user_id
  ORDER BY us.total_watch_time DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update get_video_dropout_points function
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
    AND (video_duration = 0 OR total_watch_time < (video_duration * 0.9)) -- Users who didn't complete 90%
    GROUP BY FLOOR(last_position / 30)
  )
  SELECT s.time_segment::INTEGER, s.dropout_count
  FROM segments s
  WHERE s.dropout_count >= 2 -- Only show segments where 2+ users dropped out
  ORDER BY s.time_segment;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update calculate_engagement_score function
CREATE OR REPLACE FUNCTION calculate_engagement_score(p_exercise_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  completion_rate NUMERIC;
  rewatch_rate NUMERIC;
  engagement_score NUMERIC;
BEGIN
  -- Get completion rate (percentage of users who watched >80%)
  SELECT 
    (COUNT(CASE 
      WHEN video_duration > 0 AND (total_watch_time::NUMERIC / video_duration::NUMERIC) >= 0.8 THEN 1 
      END)::NUMERIC / COUNT(*)::NUMERIC) * 100
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