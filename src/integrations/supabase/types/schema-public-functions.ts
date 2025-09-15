import type { Json } from "./database"
import type { PublicEnums } from "./schema-public-enums"

export type PublicFunctions = {
  binary_quantize: {
    Args: { "": string } | { "": unknown }
    Returns: unknown
  }
  get_cached_user_role: {
    Args: Record<PropertyKey, never>
    Returns: PublicEnums["user_role"]
  }
  get_chat_statistics: {
    Args: { end_date_param: string; start_date_param: string }
    Returns: {
      total_general_messages: number
      total_messages: number
      total_seo_messages: number
      total_strategy_messages: number
      total_users: number
    }[]
  }
  get_daily_chat_usage: {
    Args: { end_date_param: string; start_date_param: string }
    Returns: {
      date: string
      message_count: number
    }[]
  }
  get_daily_page_views: {
    Args: {
      start_date_param: string
      end_date_param: string
    }
    Returns: {
      date: string
      view_count: number
    }[]
  }
  get_all_tiktok_shops_for_dashboard: {
    Args: Record<PropertyKey, never>
    Returns: Json
  }
  get_top_bots_by_messages: {
    Args: {
      end_date_param: string
      limit_param?: number
      start_date_param: string
    }
    Returns: {
      bot_type: string
      message_count: number
    }[]
  }
  get_top_pages: {
    Args: {
      start_date_param: string
      end_date_param: string
      limit_param?: number
    }
    Returns: {
      path: string
      view_count: number
    }[]
  }
  get_top_users_by_messages: {
    Args: {
      end_date_param: string
      limit_param?: number
      start_date_param: string
    }
    Returns: {
      message_count: number
      user_id: string
      user_name: string
    }[]
  }
  get_top_users_by_page_views: {
    Args: {
      start_date_param: string
      end_date_param: string
      page_num?: number
      page_size?: number
    }
    Returns: {
      user_id: string
      user_name: string
      view_count: number
      total_count: number
    }[]
  }
  get_user_role: {
    Args: { user_id: string }
    Returns: PublicEnums["user_role"]
  }
  get_user_team_id: {
    Args: { user_id: string }
    Returns: string
  }
  increment_video_view_count: {
    Args: {
      p_user_id: string
      p_exercise_id: string
    }
    Returns: number
  }
  halfvec_avg: {
    Args: { "": number[] }
    Returns: unknown
  }
  halfvec_out: {
    Args: { "": unknown }
    Returns: unknown
  }
  halfvec_send: {
    Args: { "": unknown }
    Returns: string
  }
  halfvec_typmod_in: {
    Args: { "": unknown[] }
    Returns: number
  }
  hnsw_bit_support: {
    Args: { "": unknown }
    Returns: unknown
  }
  hnsw_halfvec_support: {
    Args: { "": unknown }
    Returns: unknown
  }
  hnsw_sparsevec_support: {
    Args: { "": unknown }
    Returns: unknown
  }
  hnswhandler: {
    Args: { "": unknown }
    Returns: unknown
  }
  ivfflat_bit_support: {
    Args: { "": unknown }
    Returns: unknown
  }
  ivfflat_halfvec_support: {
    Args: { "": unknown }
    Returns: unknown
  }
  ivfflathandler: {
    Args: { "": unknown }
    Returns: unknown
  }
  l2_norm: {
    Args: { "": unknown } | { "": unknown }
    Returns: number
  }
  l2_normalize: {
    Args: { "": string } | { "": unknown } | { "": unknown }
    Returns: string
  }
  search_banners: {
    Args:
      | {
          category_filter?: string
          page_num?: number
          page_size?: number
          search_term?: string
          sort_by?: string
          status_filter?: string
          type_filter?: string
        }
      | {
          category_filter?: string
          page_num?: number
          page_size?: number
          search_term?: string
          status_filter?: string
          type_filter?: string
        }
      | {
          category_filter?: string
          page_num?: number
          page_size?: number
          search_term?: string
          type_filter?: string
        }
    Returns: {
      banner_type_id: string
      banner_type_name: string
      canva_link: string
      category_id: string
      category_name: string
      created_at: string
      id: string
      image_url: string
      name: string
      status: string
      total_count: number
      updated_at: string
      user_name: string
    }[]
  }
  search_seo_knowledge: {
    Args: {
      match_count?: number
      match_threshold?: number
      query_embedding: string
    }
    Returns: {
      content: string
      id: string
      similarity: number
    }[]
  }
  sparsevec_out: {
    Args: { "": unknown }
    Returns: unknown
  }
  sparsevec_send: {
    Args: { "": unknown }
    Returns: string
  }
  sparsevec_typmod_in: {
    Args: { "": unknown[] }
    Returns: number
  }
  start_essay_test: {
    Args: { p_exercise_id: string; p_time_limit?: number }
    Returns: Json
  }
  vector_avg: {
    Args: { "": number[] }
    Returns: string
  }
  vector_dims: {
    Args: { "": string } | { "": unknown }
    Returns: number
  }
  vector_norm: {
    Args: { "": string }
    Returns: number
  }
  vector_out: {
    Args: { "": string }
    Returns: unknown
  }
  vector_send: {
    Args: { "": string }
    Returns: string
  }
  vector_typmod_in: {
    Args: { "": unknown[] }
    Returns: number
  }
}