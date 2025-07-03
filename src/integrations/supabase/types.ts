export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      banner_types: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      banners: {
        Row: {
          active: boolean
          banner_type_id: string
          canva_link: string | null
          category_id: string
          created_at: string
          id: string
          image_url: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          banner_type_id: string
          canva_link?: string | null
          category_id: string
          created_at?: string
          id?: string
          image_url: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          banner_type_id?: string
          canva_link?: string | null
          category_id?: string
          created_at?: string
          id?: string
          image_url?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "banners_banner_type_id_fkey"
            columns: ["banner_type_id"]
            isOneToOne: false
            referencedRelation: "banner_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "banners_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          bot_type: string
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bot_type?: string
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bot_type?: string
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          metadata: Json | null
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      general_chat_conversations: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      general_chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          metadata: Json | null
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "general_chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "general_chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          category_id: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          role_id: string | null
          team_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role_id?: string | null
          team_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role_id?: string | null
          team_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      seo_chat_conversations: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      seo_chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          metadata: Json | null
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "seo_chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "seo_chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_knowledge: {
        Row: {
          chunk_type: string
          content: string
          content_embedding: string | null
          created_at: string
          created_by: string | null
          id: string
          section_number: string | null
          title: string
          updated_at: string
          word_count: number | null
        }
        Insert: {
          chunk_type: string
          content: string
          content_embedding?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          section_number?: string | null
          title: string
          updated_at?: string
          word_count?: number | null
        }
        Update: {
          chunk_type?: string
          content?: string
          content_embedding?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          section_number?: string | null
          title?: string
          updated_at?: string
          word_count?: number | null
        }
        Relationships: []
      }
      strategy_knowledge: {
        Row: {
          content_embedding: string | null
          created_at: string
          created_by: string | null
          formula_a: string
          formula_a1: string
          id: string
          updated_at: string
        }
        Insert: {
          content_embedding?: string | null
          created_at?: string
          created_by?: string | null
          formula_a: string
          formula_a1: string
          id?: string
          updated_at?: string
        }
        Update: {
          content_embedding?: string | null
          created_at?: string
          created_by?: string | null
          formula_a?: string
          formula_a1?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      teams: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      can_create_user_role: {
        Args: {
          creator_role: Database["public"]["Enums"]["user_role"]
          target_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_user_team: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["team_type"]
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
      search_seo_knowledge: {
        Args: {
          query_embedding: string
          match_threshold?: number
          match_count?: number
        }
        Returns: {
          id: string
          title: string
          content: string
          chunk_type: string
          section_number: string
          similarity: number
        }[]
      }
      search_strategy_knowledge: {
        Args: {
          query_embedding: string
          match_threshold?: number
          match_count?: number
        }
        Returns: {
          id: string
          formula_a1: string
          formula_a: string
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
    Enums: {
      team_type:
        | "Team Bình"
        | "Team Nga"
        | "Team Thơm"
        | "Team Thanh"
        | "Team Giang"
        | "Team Quỳnh"
        | "Team Dev"
      user_role: "admin" | "leader" | "chuyên viên" | "deleted"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database['public'];

// Export individual table types
export type BannerType = PublicSchema['Tables']['banner_types']['Row'];
export type BannerTypeInsert = PublicSchema['Tables']['banner_types']['Insert'];
export type BannerTypeUpdate = PublicSchema['Tables']['banner_types']['Update'];

export type Banner = PublicSchema['Tables']['banners']['Row'];
export type BannerInsert = PublicSchema['Tables']['banners']['Insert'];
export type BannerUpdate = PublicSchema['Tables']['banners']['Update'];

export type Category = PublicSchema['Tables']['categories']['Row'];
export type CategoryInsert = PublicSchema['Tables']['categories']['Insert'];
export type CategoryUpdate = PublicSchema['Tables']['categories']['Update'];

export type ChatConversation = PublicSchema['Tables']['chat_conversations']['Row'];
export type ChatConversationInsert = PublicSchema['Tables']['chat_conversations']['Insert'];
export type ChatConversationUpdate = PublicSchema['Tables']['chat_conversations']['Update'];

export type ChatMessage = PublicSchema['Tables']['chat_messages']['Row'];
export type ChatMessageInsert = PublicSchema['Tables']['chat_messages']['Insert'];
export type ChatMessageUpdate = PublicSchema['Tables']['chat_messages']['Update'];

export type GeneralChatConversation = PublicSchema['Tables']['general_chat_conversations']['Row'];
export type GeneralChatConversationInsert = PublicSchema['Tables']['general_chat_conversations']['Insert'];
export type GeneralChatConversationUpdate = PublicSchema['Tables']['general_chat_conversations']['Update'];

export type GeneralChatMessage = PublicSchema['Tables']['general_chat_messages']['Row'];
export type GeneralChatMessageInsert = PublicSchema['Tables']['general_chat_messages']['Insert'];
export type GeneralChatMessageUpdate = PublicSchema['Tables']['general_chat_messages']['Update'];

export type ProductCategory = PublicSchema['Tables']['product_categories']['Row'];
export type ProductCategoryInsert = PublicSchema['Tables']['product_categories']['Insert'];
export type ProductCategoryUpdate = PublicSchema['Tables']['product_categories']['Update'];

export type Profile = PublicSchema['Tables']['profiles']['Row'];
export type ProfileInsert = PublicSchema['Tables']['profiles']['Insert'];
export type ProfileUpdate = PublicSchema['Tables']['profiles']['Update'];

export type Role = PublicSchema['Tables']['roles']['Row'];
export type RoleInsert = PublicSchema['Tables']['roles']['Insert'];
export type RoleUpdate = PublicSchema['Tables']['roles']['Update'];

export type SeoChatConversation = PublicSchema['Tables']['seo_chat_conversations']['Row'];
export type SeoChatConversationInsert = PublicSchema['Tables']['seo_chat_conversations']['Insert'];
export type SeoChatConversationUpdate = PublicSchema['Tables']['seo_chat_conversations']['Update'];

export type SeoChatMessage = PublicSchema['Tables']['seo_chat_messages']['Row'];
export type SeoChatMessageInsert = PublicSchema['Tables']['seo_chat_messages']['Insert'];
export type SeoChatMessageUpdate = PublicSchema['Tables']['seo_chat_messages']['Update'];

export type SeoKnowledge = PublicSchema['Tables']['seo_knowledge']['Row'];
export type SeoKnowledgeInsert = PublicSchema['Tables']['seo_knowledge']['Insert'];
export type SeoKnowledgeUpdate = PublicSchema['Tables']['seo_knowledge']['Update'];

export type StrategyKnowledge = PublicSchema['Tables']['strategy_knowledge']['Row'];
export type StrategyKnowledgeInsert = PublicSchema['Tables']['strategy_knowledge']['Insert'];
export type StrategyKnowledgeUpdate = PublicSchema['Tables']['strategy_knowledge']['Update'];

export type Team = PublicSchema['Tables']['teams']['Row'];
export type TeamInsert = PublicSchema['Tables']['teams']['Insert'];
export type TeamUpdate = PublicSchema['Tables']['teams']['Update'];

// Export individual enum types
export type UserRole = PublicSchema['Enums']['user_role'];
export type TeamType = PublicSchema['Enums']['team_type'];

// Keep utility types for generic access
export type Tables<
  PublicTableNameOrOptions extends
    keyof PublicSchema['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    keyof PublicSchema['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    keyof PublicSchema['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    keyof PublicSchema['Enums'] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof PublicSchema['CompositeTypes'] | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
    ? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      team_type: [
        "Team Bình",
        "Team Nga",
        "Team Thơm",
        "Team Thanh",
        "Team Giang",
        "Team Quỳnh",
        "Team Dev",
      ],
      user_role: ["admin", "leader", "chuyên viên", "deleted"],
    },
  },
} as const