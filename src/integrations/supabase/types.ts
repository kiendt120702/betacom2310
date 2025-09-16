export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      assignment_submissions: {
        Row: {
          assignment_id: string
          content: string | null
          created_at: string
          feedback: string | null
          file_url: string | null
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assignment_id: string
          content?: string | null
          created_at?: string
          feedback?: string | null
          file_url?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assignment_id?: string
          content?: string | null
          created_at?: string
          feedback?: string | null
          file_url?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          course_id: string
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          instructions: string | null
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          instructions?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          instructions?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          id: string
          new_values: Json | null
          old_values: Json | null
          operation: string
          table_name: string
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          operation: string
          table_name: string
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          operation?: string
          table_name?: string
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      beatcomai_chatgpt: {
        Row: {<dyad-problem-report summary="62 problems">
<problem file="src/integrations/supabase/types/tables.ts" line="129" column="33" code="2344">Type '&quot;departments&quot;' does not satisfy the constraint '{ schema: &quot;public&quot;; } | keyof PublicTables'.</problem>
<problem file="src/integrations/supabase/types/tables.ts" line="130" column="27" code="2344">Type '&quot;departments&quot;' does not satisfy the constraint '{ schema: &quot;public&quot;; } | keyof PublicTables'.</problem>
<problem file="src/integrations/supabase/types/tables.ts" line="131" column="30" code="2344">Type '&quot;segments&quot;' does not satisfy the constraint '{ schema: &quot;public&quot;; } | keyof PublicTables'.</problem>
<problem file="src/integrations/supabase/types/tables.ts" line="132" column="41" code="2344">Type '&quot;profile_segment_roles&quot;' does not satisfy the constraint '{ schema: &quot;public&quot;; } | keyof PublicTables'.</problem>
<problem file="src/hooks/useTeams.ts" line="6" column="27" code="2344">Type '&quot;departments&quot;' does not satisfy the constraint '&quot;assignment_submissions&quot; | &quot;assignments&quot; | &quot;audit_log&quot; | &quot;thumbnail_likes&quot; | &quot;thumbnail_types&quot; | &quot;thumbnail_banners&quot; | &quot;thumbnail_categories&quot; | &quot;shopee_comprehensive_reports&quot; | ... 38 more ... | { ...; }'.</problem>
<problem file="src/hooks/useTeams.ts" line="11" column="5" code="2769">No overload matches this call.
  Overload 1 of 3, '(options: DefinedInitialDataOptions&lt;never[], Error, never[], readonly unknown[]&gt;, queryClient?: QueryClient): DefinedUseQueryResult&lt;never[], Error&gt;', gave the following error.
    Type '() =&gt; Promise&lt;({ course_id: string; created_at: string; created_by: string | null; description: string | null; due_date: string | null; id: string; instructions: string | null; title: string; updated_at: string; } | ... 45 more ... | { ...; })[]&gt;' is not assignable to type 'QueryFunction&lt;never[], readonly unknown[]&gt;'.
      Type 'Promise&lt;({ course_id: string; created_at: string; created_by: string; description: string; due_date: string; id: string; instructions: string; title: string; updated_at: string; } | { assignment_id: string; ... 10 more ...; user_id: string; } | ... 44 more ... | { ...; })[]&gt;' is not assignable to type 'never[] | Promise&lt;never[]&gt;'.
        Type 'Promise&lt;({ course_id: string; created_at: string; created_by: string; description: string; due_date: string; id: string; instructions: string; title: string; updated_at: string; } | { assignment_id: string; ... 10 more ...; user_id: string; } | ... 44 more ... | { ...; })[]&gt;' is not assignable to type 'Promise&lt;never[]&gt;'.
          Type '({ course_id: string; created_at: string; created_by: string; description: string; due_date: string; id: string; instructions: string; title: string; updated_at: string; } | { assignment_id: string; ... 10 more ...; user_id: string; } | ... 44 more ... | { ...; })[]' is not assignable to type 'never[]'.
            Type '{ course_id: string; created_at: string; created_by: string; description: string; due_date: string; id: string; instructions: string; title: string; updated_at: string; } | { assignment_id: string; ... 10 more ...; user_id: string; } | ... 44 more ... | { ...; }' is not assignable to type 'never'.
              Type '{ course_id: string; created_at: string; created_by: string; description: string; due_date: string; id: string; instructions: string; title: string; updated_at: string; }' is not assignable to type 'never'.
  Overload 2 of 3, '(options: UndefinedInitialDataOptions&lt;never[], Error, never[], readonly unknown[]&gt;, queryClient?: QueryClient): UseQueryResult&lt;never[], Error&gt;', gave the following error.
    Type '() =&gt; Promise&lt;({ course_id: string; created_at: string; created_by: string | null; description: string | null; due_date: string | null; id: string; instructions: string | null; title: string; updated_at: string; } | ... 45 more ... | { ...; })[]&gt;' is not assignable to type 'unique symbol | QueryFunction&lt;never[], readonly unknown[], never&gt;'.
      Type '() =&gt; Promise&lt;({ course_id: string; created_at: string; created_by: string | null; description: string | null; due_date: string | null; id: string; instructions: string | null; title: string; updated_at: string; } | ... 45 more ... | { ...; })[]&gt;' is not assignable to type 'QueryFunction&lt;never[], readonly unknown[], never&gt;'.
        Type 'Promise&lt;({ course_id: string; created_at: string; created_by: string; description: string; due_date: string; id: string; instructions: string; title: string; updated_at: string; } | { assignment_id: string; ... 10 more ...; user_id: string; } | ... 44 more ... | { ...; })[]&gt;' is not assignable to type 'never[] | Promise&lt;never[]&gt;'.
          Type 'Promise&lt;({ course_id: string; created_at: string; created_by: string; description: string; due_date: string; id: string; instructions: string; title: string; updated_at: string; } | { assignment_id: string; ... 10 more ...; user_id: string; } | ... 44 more ... | { ...; })[]&gt;' is not assignable to type 'Promise&lt;never[]&gt;'.
            Type '({ course_id: string; created_at: string; created_by: string; description: string; due_date: string; id: string; instructions: string; title: string; updated_at: string; } | { assignment_id: string; ... 10 more ...; user_id: string; } | ... 44 more ... | { ...; })[]' is not assignable to type 'never[]'.
              Type '{ course_id: string; created_at: string; created_by: string; description: string; due_date: string; id: string; instructions: string; title: string; updated_at: string; } | { assignment_id: string; ... 10 more ...; user_id: string; } | ... 44 more ... | { ...; }' is not assignable to type 'never'.
                Type '{ course_id: string; created_at: string; created_by: string; description: string; due_date: string; id: string; instructions: string; title: string; updated_at: string; }' is not assignable to type 'never'.
  Overload 3 of 3, '(options: UseQueryOptions&lt;never[], Error, never[], readonly unknown[]&gt;, queryClient?: QueryClient): UseQueryResult&lt;never[], Error&gt;', gave the following error.
    Type '() =&gt; Promise&lt;({ course_id: string; created_at: string; created_by: string | null; description: string | null; due_date: string | null; id: string; instructions: string | null; title: string; updated_at: string; } | ... 45 more ... | { ...; })[]&gt;' is not assignable to type 'unique symbol | QueryFunction&lt;never[], readonly unknown[], never&gt;'.
      Type '() =&gt; Promise&lt;({ course_id: string; created_at: string; created_by: string | null; description: string | null; due_date: string | null; id: string; instructions: string | null; title: string; updated_at: string; } | ... 45 more ... | { ...; })[]&gt;' is not assignable to type 'QueryFunction&lt;never[], readonly unknown[], never&gt;'.
        Type 'Promise&lt;({ course_id: string; created_at: string; created_by: string; description: string; due_date: string; id: string; instructions: string; title: string; updated_at: string; } | { assignment_id: string; ... 10 more ...; user_id: string; } | ... 44 more ... | { ...; })[]&gt;' is not assignable to type 'never[] | Promise&lt;never[]&gt;'.
          Type 'Promise&lt;({ course_id: string; created_at: string; created_by: string; description: string; due_date: string; id: string; instructions: string; title: string; updated_at: string; } | { assignment_id: string; ... 10 more ...; user_id: string; } | ... 44 more ... | { ...; })[]&gt;' is not assignable to type 'Promise&lt;never[]&gt;'.
            Type '({ course_id: string; created_at: string; created_by: string; description: string; due_date: string; id: string; instructions: string; title: string; updated_at: string; } | { assignment_id: string; ... 10 more ...; user_id: string; } | ... 44 more ... | { ...; })[]' is not assignable to type 'never[]'.
              Type '{ course_id: string; created_at: string; created_by: string; description: string; due_date: string; id: string; instructions: string; title: string; updated_at: string; } | { assignment_id: string; ... 10 more ...; user_id: string; } | ... 44 more ... | { ...; }' is not assignable to type 'never'.
                Type '{ course_id: string; created_at: string; created_by: string; description: string; due_date: string; id: string; instructions: string; title: string; updated_at: string; }' is not assignable to type 'never'.</problem>
<problem file="src/hooks/useTeams.ts" line="13" column="15" code="2769">No overload matches this call.
  Overload 1 of 2, '(relation: &quot;assignment_submissions&quot; | &quot;assignments&quot; | &quot;audit_log&quot; | &quot;thumbnail_likes&quot; | &quot;thumbnail_types&quot; | &quot;thumbnail_banners&quot; | &quot;thumbnail_categories&quot; | &quot;shopee_comprehensive_reports&quot; | ... 38 more ... | &quot;tiktok_comprehensive_reports&quot;): PostgrestQueryBuilder&lt;...&gt;', gave the following error.
    Argument of type '&quot;departments&quot;' is not assignable to parameter of type '&quot;assignment_submissions&quot; | &quot;assignments&quot; | &quot;audit_log&quot; | &quot;thumbnail_likes&quot; | &quot;thumbnail_types&quot; | &quot;thumbnail_banners&quot; | &quot;thumbnail_categories&quot; | &quot;shopee_comprehensive_reports&quot; | ... 38 more ... | &quot;tiktok_comprehensive_reports&quot;'.
  Overload 2 of 2, '(relation: never): PostgrestQueryBuilder&lt;{ PostgrestVersion: &quot;12.2.3 (519615d)&quot;; }, PublicSchema, never, never, never&gt;', gave the following error.
    Argument of type '&quot;departments&quot;' is not assignable to parameter of type 'never'.</problem>
<problem file="src/hooks/useTeams.ts" line="30" column="15" code="2769">No overload matches this call.
  Overload 1 of 2, '(relation: &quot;assignment_submissions&quot; | &quot;assignments&quot; | &quot;audit_log&quot; | &quot;thumbnail_likes&quot; | &quot;thumbnail_types&quot; | &quot;thumbnail_banners&quot; | &quot;thumbnail_categories&quot; | &quot;shopee_comprehensive_reports&quot; | ... 38 more ... | &quot;tiktok_comprehensive_reports&quot;): PostgrestQueryBuilder&lt;...&gt;', gave the following error.
    Argument of type '&quot;departments&quot;' is not assignable to parameter of type '&quot;assignment_submissions&quot; | &quot;assignments&quot; | &quot;audit_log&quot; | &quot;thumbnail_likes&quot; | &quot;thumbnail_types&quot; | &quot;thumbnail_banners&quot; | &quot;thumbnail_categories&quot; | &quot;shopee_comprehensive_reports&quot; | ... 38 more ... | &quot;tiktok_comprehensive_reports&quot;'.
  Overload 2 of 2, '(relation: never): PostgrestQueryBuilder&lt;{ PostgrestVersion: &quot;12.2.3 (519615d)&quot;; }, PublicSchema, never, never, never&gt;', gave the following error.
    Argument of type '&quot;departments&quot;' is not assignable to parameter of type 'never'.</problem>
<problem file="src/hooks/useTeams.ts" line="63" column="37" code="2589">Type instantiation is excessively deep and possibly infinite.</problem>
<problem file="src/hooks/useTeams.ts" line="64" column="15" code="2769">No overload matches this call.
  Overload 1 of 2, '(relation: &quot;assignment_submissions&quot; | &quot;assignments&quot; | &quot;audit_log&quot; | &quot;thumbnail_likes&quot; | &quot;thumbnail_types&quot; | &quot;thumbnail_banners&quot; | &quot;thumbnail_categories&quot; | &quot;shopee_comprehensive_reports&quot; | ... 38 more ... | &quot;tiktok_comprehensive_reports&quot;): PostgrestQueryBuilder&lt;...&gt;', gave the following error.
    Argument of type '&quot;departments&quot;' is not assignable to parameter of type '&quot;assignment_submissions&quot; | &quot;assignments&quot; | &quot;audit_log&quot; | &quot;thumbnail_likes&quot; | &quot;thumbnail_types&quot; | &quot;thumbnail_banners&quot; | &quot;thumbnail_categories&quot; | &quot;shopee_comprehensive_reports&quot; | ... 38 more ... | &quot;tiktok_comprehensive_reports&quot;'.
  Overload 2 of 2, '(relation: never): PostgrestQueryBuilder&lt;{ PostgrestVersion: &quot;12.2.3 (519615d)&quot;; }, PublicSchema, never, never, never&gt;', gave the following error.
    Argument of type '&quot;departments&quot;' is not assignable to parameter of type 'never'.</problem>
<problem file="src/hooks/useTeams.ts" line="96" column="45" code="2769">No overload matches this call.
  Overload 1 of 2, '(relation: &quot;assignment_submissions&quot; | &quot;assignments&quot; | &quot;audit_log&quot; | &quot;thumbnail_likes&quot; | &quot;thumbnail_types&quot; | &quot;thumbnail_banners&quot; | &quot;thumbnail_categories&quot; | &quot;shopee_comprehensive_reports&quot; | ... 38 more ... | &quot;tiktok_comprehensive_reports&quot;): PostgrestQueryBuilder&lt;...&gt;', gave the following error.
    Argument of type '&quot;departments&quot;' is not assignable to parameter of type '&quot;assignment_submissions&quot; | &quot;assignments&quot; | &quot;audit_log&quot; | &quot;thumbnail_likes&quot; | &quot;thumbnail_types&quot; | &quot;thumbnail_banners&quot; | &quot;thumbnail_categories&quot; | &quot;shopee_comprehensive_reports&quot; | ... 38 more ... | &quot;tiktok_comprehensive_reports&quot;'.
  Overload 2 of 2, '(relation: never): PostgrestQueryBuilder&lt;{ PostgrestVersion: &quot;12.2.3 (519615d)&quot;; }, PublicSchema, never, never, never&gt;', gave the following error.
    Argument of type '&quot;departments&quot;' is not assignable to parameter of type 'never'.</problem>
<problem file="src/pages/MyProfilePage.tsx" line="182" column="314" code="2339">Property 'find' does not exist on type 'NoInfer&lt;TQueryFnData&gt;'.</problem>
<problem file="src/pages/admin/TeamManagement.tsx" line="53" column="29" code="2339">Property 'name' does not exist on type 'never'.</problem>
<problem file="src/pages/admin/TeamManagement.tsx" line="68" column="56" code="2339">Property 'id' does not exist on type 'never'.</problem>
<problem file="src/pages/admin/TeamManagement.tsx" line="93" column="22" code="2339">Property 'length' does not exist on type 'any[] | NoInfer&lt;TQueryFnData&gt;'.
  Property 'length' does not exist on type 'NoInfer&lt;TQueryFnData&gt;'.</problem>
<problem file="src/pages/admin/TeamManagement.tsx" line="119" column="20" code="2339">Property 'map' does not exist on type 'any[] | NoInfer&lt;TQueryFnData&gt;'.
  Property 'map' does not exist on type 'NoInfer&lt;TQueryFnData&gt;'.</problem>
<problem file="src/hooks/useSegments.ts" line="5" column="30" code="2344">Type '&quot;segments&quot;' does not satisfy the constraint '&quot;assignment_submissions&quot; | &quot;assignments&quot; | &quot;audit_log&quot; | &quot;thumbnail_likes&quot; | &quot;thumbnail_types&quot; | &quot;thumbnail_banners&quot; | &quot;thumbnail_categories&quot; | &quot;shopee_comprehensive_reports&quot; | ... 38 more ... | { ...; }'.</problem>
<problem file="src/hooks/useSegments.ts" line="10" column="5" code="2769">No overload matches this call.
  Overload 1 of 3, '(options: DefinedInitialDataOptions&lt;never[], Error, never[], readonly unknown[]&gt;, queryClient?: QueryClient): DefinedUseQueryResult&lt;never[], Error&gt;', gave the following error.
    Type '() =&gt; Promise&lt;({ course_id: string; created_at: string; created_by: string | null; description: string | null; due_date: string | null; id: string; instructions: string | null; title: string; updated_at: string; } | ... 45 more ... | { ...; })[]&gt;' is not assignable to type 'QueryFunction&lt;never[], readonly unknown[]&gt;'.
      Type 'Promise&lt;({ course_id: string; created_at: string; created_by: string; description: string; due_date: string; id: string; instructions: string; title: string; updated_at: string; } | { assignment_id: string; ... 10 more ...; user_id: string; } | ... 44 more ... | { ...; })[]&gt;' is not assignable to type 'never[] | Promise&lt;never[]&gt;'.
        Type 'Promise&lt;({ course_id: string; created_at: string; created_by: string; description: string; due_date: string; id: string; instructions: string; title: string; updated_at: string; } | { assignment_id: string; ... 10 more ...; user_id: string; } | ... 44 more ... | { ...; })[]&gt;' is not assignable to type 'Promise&lt;never[]&gt;'.
          Type '({ course_id: string; created_at: string; created_by: string; description: string; due_date: string; id: string; instructions: string; title: string; updated_at: string; } | { assignment_id: string; ... 10 more ...; user_id: string; } | ... 44 more ... | { ...; })[]' is not assignable to type 'never[]'.
            Type '{ course_id: string; created_at: string; created_by: string; description: string; due_date: string; id: string; instructions: string; title: string; updated_at: string; } | { assignment_id: string; ... 10 more ...; user_id: string; } | ... 44 more ... | { ...; }' is not assignable to type 'never'.
              Type '{ course_id: string; created_at: string; created_by: string; description: string; due_date: string; id: string; instructions: string; title: string; updated_at: string; }' is not assignable to type 'never'.
  Overload 2 of 3, '(options: UndefinedInitialDataOptions&lt;never[], Error, never[], readonly unknown[]&gt;, queryClient?: QueryClient): UseQueryResult&lt;never[], Error&gt;', gave the following error.
    Type '() =&gt; Promise&lt;({ course_id: string; created_at: string; created_by: string | null; description: string | null; due_date: string | null; id: string; instructions: string | null; title: string; updated_at: string; } | ... 45 more ... | { ...; })[]&gt;' is not assignable to type 'unique symbol | QueryFunction&lt;never[], readonly unknown[], never&gt;'.
      Type '() =&gt; Promise&lt;({ course_id: string; created_at: string; created_by: string | null; description: string | null; due_date: string | null; id: string; instructions: string | null; title: string; updated_at: string; } | ... 45 more ... | { ...; })[]&gt;' is not assignable to type 'QueryFunction&lt;never[], readonly unknown[], never&gt;'.
        Type 'Promise&lt;({ course_id: string; created_at: string; created_by: string; description: string; due_date: string; id: string; instructions: string; title: string; updated_at: string; } | { assignment_id: string; ... 10 more ...; user_id: string; } | ... 44 more ... | { ...; })[]&gt;' is not assignable to type 'never[] | Promise&lt;never[]&gt;'.
          Type 'Promise&lt;({ course_id: string; created_at: string; created_by: string; description: string; due_date: string; id: string; instructions: string; title: string; updated_at: string; } | { assignment_id: string; ... 10 more ...; user_id: string; } | ... 44 more ... | { ...; })[]&gt;' is not assignable to type 'Promise&lt;never[]&gt;'.
            Type '({ course_id: string; created_at: string; created_by: string; description: string; due_date: string; id: string; instructions: string; title: string; updated_at: string; } | { assignment_id: string; ... 10 more ...; user_id: string; } | ... 44 more ... | { ...; })[]' is not assignable to type 'never[]'.
              Type '{ course_id: string; created_at: string; created_by: string; description: string; due_date: string; id: string; instructions: string; title: string; updated_at: string; } | { assignment_id: string; ... 10 more ...; user_id: string; } | ... 44 more ... | { ...; }' is not assignable to type 'never'.
                Type '{ course_id: string; created_at: string; created_by: string; description: string; due_date: string; id: string; instructions: string; title: string; updated_at: string; }' is not assignable to type 'never'.
  Overload 3 of 3, '(options: UseQueryOptions&lt;never[], Error, never[], readonly unknown[]&gt;, queryClient?: QueryClient): UseQueryResult&lt;never[], Error&gt;', gave the following error.
    Type '() =&gt; Promise&lt;({ course_id: string; created_at: string; created_by: string | null; description: string | null; due_date: string | null; id: string; instructions: string | null; title: string; updated_at: string; } | ... 45 more ... | { ...; })[]&gt;' is not assignable to type 'unique symbol | QueryFunction&lt;never[], readonly unknown[], never&gt;'.
      Type '() =&gt; Promise&lt;({ course_id: string; created_at: string; created_by: string | null; description: string | null; due_date: string | null; id: string; instructions: string | null; title: string; updated_at: string; } | ... 45 more ... | { ...; })[]&gt;' is not assignable to type 'QueryFunction&lt;never[], readonly unknown[], never&gt;'.
        Type 'Promise&lt;({ course_id: string; created_at: string; created_by: string; description: string; due_date: string; id: string; instructions: string; title: string; updated_at: string; } | { assignment_id: string; ... 10 more ...; user_id: string; } | ... 44 more ... | { ...; })[]&gt;' is not assignable to type 'never[] | Promise&lt;never[]&gt;'.
          Type 'Promise&lt;({ course_id: string; created_at: string; created_by: string; description: string; due_date: string; id: string; instructions: string; title: string; updated_at: string; } | { assignment_id: string; ... 10 more ...; user_id: string; } | ... 44 more ... | { ...; })[]&gt;' is not assignable to type 'Promise&lt;never[]&gt;'.
            Type '({ course_id: string; created_at: string; created_by: string; description: string; due_date: string; id: string; instructions: string; title: string; updated_at: string; } | { assignment_id: string; ... 10 more ...; user_id: string; } | ... 44 more ... | { ...; })[]' is not assignable to type 'never[]'.
              Type '{ course_id: string; created_at: string; created_by: string; description: string; due_date: string; id: string; instructions: string; title: string; updated_at: string; } | { assignment_id: string; ... 10 more ...; user_id: string; } | ... 44 more ... | { ...; }' is not assignable to type 'never'.
                Type '{ course_id: string; created_at: string; created_by: string; description: string; due_date: string; id: string; instructions: string; title: string; updated_at: string; }' is not assignable to type 'never'.</problem>
<problem file="src/hooks/useSegments.ts" line="11" column="33" code="2769">No overload matches this call.
  Overload 1 of 2, '(relation: &quot;assignment_submissions&quot; | &quot;assignments&quot; | &quot;audit_log&quot; | &quot;thumbnail_likes&quot; | &quot;thumbnail_types&quot; | &quot;thumbnail_banners&quot; | &quot;thumbnail_categories&quot; | &quot;shopee_comprehensive_reports&quot; | ... 38 more ... | &quot;tiktok_comprehensive_reports&quot;): PostgrestQueryBuilder&lt;...&gt;', gave the following error.
    Argument of type '&quot;segments&quot;' is not assignable to parameter of type '&quot;assignment_submissions&quot; | &quot;assignments&quot; | &quot;audit_log&quot; | &quot;thumbnail_likes&quot; | &quot;thumbnail_types&quot; | &quot;thumbnail_banners&quot; | &quot;thumbnail_categories&quot; | &quot;shopee_comprehensive_reports&quot; | ... 38 more ... | &quot;tiktok_comprehensive_reports&quot;'.
  Overload 2 of 2, '(relation: never): PostgrestQueryBuilder&lt;{ PostgrestVersion: &quot;12.2.3 (519615d)&quot;; }, PublicSchema, never, never, never&gt;', gave the following error.
    Argument of type '&quot;segments&quot;' is not assignable to parameter of type 'never'.</problem>
<problem file="src/hooks/useSegments.ts" line="13" column="17" code="2589">Type instantiation is excessively deep and possibly infinite.</problem>
<problem file="src/hooks/useProfileSegmentRoles.ts" line="6" column="41" code="2344">Type '&quot;profile_segment_roles&quot;' does not satisfy the constraint '&quot;assignment_submissions&quot; | &quot;assignments&quot; | &quot;audit_log&quot; | &quot;thumbnail_likes&quot; | &quot;thumbnail_types&quot; | &quot;thumbnail_banners&quot; | &quot;thumbnail_categories&quot; | &quot;shopee_comprehensive_reports&quot; | ... 38 more ... | { ...; }'.</problem>
<problem file="src/hooks/useProfileSegmentRoles.ts" line="11" column="5" code="2769">No overload matches this call.
  Overload 1 of 3, '(options: DefinedInitialDataOptions&lt;never[], Error, never[], readonly unknown[]&gt;, queryClient?: QueryClient): DefinedUseQueryResult&lt;never[], Error&gt;', gave the following error.
    Type '() =&gt; Promise&lt;({ course_id: string; created_at: string; created_by: string | null; description: string | null; due_date: string | null; id: string; instructions: string | null; title: string; updated_at: string; } | ... 45 more ... | { ...; })[]&gt;' is not assignable to type 'QueryFunction&lt;never[], readonly unknown[]&gt;'.
      Type 'Promise&lt;({ course_id: string; created_at: string; created_by: string; description: string; due_date: string; id: string; instructions: string; title: string; updated_at: string; } | { assignment_id: string; ... 10 more ...; user_id: string; } | ... 44 more ... | { ...; })[]&gt;' is not assignable to type 'never[] | Promise&lt;never[]&gt;'.
        Type 'Promise&lt;({ course_id: string; created_at: string; created_by: string; description: string; due_date: string; id: string; instructions: string; title: string; updated_at: string; } | { assignment_id: string; ... 10 more ...; user_id: string; } | ... 44 more ... | { ...; })[]&gt;' is not assignable to type 'Promise&lt;never[]&gt;'.
          Type '({ course_id: string; created_at: string; created_by: string; description: string; due_date: string; id: string; instructions: string; title: string; updated_at: string; } | { assignment_id: string; ... 10 more ...; user_id: string; } | ... 44 more ... | { ...; })[]' is not assignable to type 'never[]'.
            Type '{ course_id: string; created_at: string; created_by: string; description: string; due_date: string; id: string; instructions: string; title: string; updated_at: string; } | { assignment_id: string; ... 10 more ...; user_id: string; } | ... 44 more ... | { ...; }' is not assignable to type 'never'.
              Type '{ course_id: string; created_at: string; created_by: string; description: string; due_date: string; id: string; instructions: string; title: string; updated_at: string; }' is not assignable to type 'never'.
  Overload 2 of 3, '(options: UndefinedInitialDataOptions&lt;never[], Error, never[], readonly unknown[]&gt;, queryClient?: QueryClient): UseQueryResult&lt;never[], Error&gt;', gave the following error.
    Type '() =&gt; Promise&lt;({ course_id: string; created_at: string; created_by: string | null; description: string | null; due_date: string | null; id: string; instructions: string | null; title: string; updated_at: string; } | ... 45 more ... | { ...; })[]&gt;' is not assignable to type 'unique symbol | QueryFunction&lt;never[], readonly unknown[], never&gt;'.
      Type '() =&gt; Promise&lt;({ course_id: string; created_at: string; created_by: string | null; description: string | null; due_date: string | null; id: string; instructions: string | null; title: string; updated_at: string; } | ... 45 more ... | { ...; })[]&gt;' is not assignable to type 'QueryFunction&lt;never[], readonly unknown[], never&gt;'.
        Type 'Promise&lt;({ course_id: string; created_at: string; created_by: string; description: string; due_date: string; id: string; instructions: string; title: string; updated_at: string; } | { assignment_id: string; ... 10 more ...; user_id: string; } | ... 44 more ... | { ...; })[]&gt;' is not assignable to type 'never[] | Promise&lt;never[]&gt;'.
          Type 'Promise&lt;({ course_id: string; created_at: string; created_by: string; description: string; due_date: string; id: string; instructions: string; title: string; updated_at: string; } | { assignment_id: string; ... 10 more ...; user_id: string; } | ... 44 more ... | { ...; })[]&gt;' is not assignable to type 'Promise&lt;never[]&gt;'.
            Type '({ course_id: string; created_at: string; created_by: string; description: string; due_date: string; id: string; instructions: string; title: string; updated_at: string; } | { assignment_id: string; ... 10 more ...; user_id: string; } | ... 44 more ... | { ...; })[]' is not assignable to type 'never[]'.
              Type '{ course_id: string; created_at: string; created_by: string; description: string; due_date: string; id: string; instructions: string; title: string; updated_at: string; } | { assignment_id: string; ... 10 more ...; user_id: string; } | ... 44 more ... | { ...; }' is not assignable to type 'never'.
                Type '{ course_id: string; created_at: string; created_by: string; description: string; due_date: string; id: string; instructions: string; title: string; updated_at: string; }' is not assignable to type 'never'.
  Overload 3 of 3, '(options: UseQueryOptions&lt;never[], Error, never[], readonly unknown[]&gt;, queryClient?: QueryClient): UseQueryResult&lt;never[], Error&gt;', gave the following error.
    Type '() =&gt; Promise&lt;({ course_id: string; created_at: string; created_by: string | null; description: string | null; due_date: string | null; id: string; instructions: string | null; title: string; updated_at: string; } | ... 45 more ... | { ...; })[]&gt;' is not assignable to type 'unique symbol | QueryFunction&lt;never[], readonly unknown[], never&gt;'.
      Type '() =&gt; Promise&lt;({ course_id: string; created_at: string; created_by: string | null; description: string | null; due_date: string | null; id: string; instructions: string | null; title: string; updated_at: string; } | ... 45 more ... | { ...; })[]&gt;' is not assignable to type 'QueryFunction&lt;never[], readonly unknown[], never&gt;'.
        Type 'Promise&lt;({ course_id: string; created_at: string; created_by: string; description: string; due_date: string; id: string; instructions: string; title: string; updated_at: string; } | { assignment_id: string; ... 10 more ...; user_id: string; } | ... 44 more ... | { ...; })[]&gt;' is not assignable to type 'never[] | Promise&lt;never[]&gt;'.
          Type 'Promise&lt;({ course_id: string; created_at: string; created_by: string; description: string; due_date: string; id: string; instructions: string; title: string; updated_at: string; } | { assignment_id: string; ... 10 more ...; user_id: string; } | ... 44 more ... | { ...; })[]&gt;' is not assignable to type 'Promise&lt;never[]&gt;'.
            Type '({ course_id: string; created_at: string; created_by: string; description: string; due_date: string; id: string; instructions: string; title: string; updated_at: string; } | { assignment_id: string; ... 10 more ...; user_id: string; } | ... 44 more ... | { ...; })[]' is not assignable to type 'never[]'.
              Type '{ course_id: string; created_at: string; created_by: string; description: string; due_date: string; id: string; instructions: string; title: string; updated_at: string; } | { assignment_id: string; ... 10 more ...; user_id: string; } | ... 44 more ... | { ...; }' is not assignable to type 'never'.
                Type '{ course_id: string; created_at: string; created_by: string; description: string; due_date: string; id: string; instructions: string; title: string; updated_at: string; }' is not assignable to type 'never'.</problem>
<problem file="src/hooks/useProfileSegmentRoles.ts" line="13" column="37" code="2589">Type instantiation is excessively deep and possibly infinite.</problem>
<problem file="src/hooks/useProfileSegmentRoles.ts" line="14" column="15" code="2769">No overload matches this call.
  Overload 1 of 2, '(relation: &quot;assignment_submissions&quot; | &quot;assignments&quot; | &quot;audit_log&quot; | &quot;thumbnail_likes&quot; | &quot;thumbnail_types&quot; | &quot;thumbnail_banners&quot; | &quot;thumbnail_categories&quot; | &quot;shopee_comprehensive_reports&quot; | ... 38 more ... | &quot;tiktok_comprehensive_reports&quot;): PostgrestQueryBuilder&lt;...&gt;', gave the following error.
    Argument of type '&quot;profile_segment_roles&quot;' is not assignable to parameter of type '&quot;assignment_submissions&quot; | &quot;assignments&quot; | &quot;audit_log&quot; | &quot;thumbnail_likes&quot; | &quot;thumbnail_types&quot; | &quot;thumbnail_banners&quot; | &quot;thumbnail_categories&quot; | &quot;shopee_comprehensive_reports&quot; | ... 38 more ... | &quot;tiktok_comprehensive_reports&quot;'.
  Overload 2 of 2, '(relation: never): PostgrestQueryBuilder&lt;{ PostgrestVersion: &quot;12.2.3 (519615d)&quot;; }, PublicSchema, never, never, never&gt;', gave the following error.
    Argument of type '&quot;profile_segment_roles&quot;' is not assignable to parameter of type 'never'.</problem>
<problem file="src/hooks/useProfileSegmentRoles.ts" line="27" column="49" code="2344">Type '&quot;profile_segment_roles&quot;' does not satisfy the constraint '&quot;assignment_submissions&quot; | &quot;assignments&quot; | &quot;audit_log&quot; | &quot;thumbnail_likes&quot; | &quot;thumbnail_types&quot; | &quot;thumbnail_banners&quot; | &quot;thumbnail_categories&quot; | &quot;shopee_comprehensive_reports&quot; | ... 38 more ... | { ...; }'.</problem>
<problem file="src/hooks/useProfileSegmentRoles.ts" line="27" column="89" code="2344">Type '&quot;profile_segment_roles&quot;' does not satisfy the constraint '&quot;assignment_submissions&quot; | &quot;assignments&quot; | &quot;audit_log&quot; | &quot;thumbnail_likes&quot; | &quot;thumbnail_types&quot; | &quot;thumbnail_banners&quot; | &quot;thumbnail_categories&quot; | &quot;shopee_comprehensive_reports&quot; | ... 38 more ... | { ...; }'.</problem>
<problem file="src/hooks/useProfileSegmentRoles.ts" line="29" column="23" code="2769">No overload matches this call.
  Overload 1 of 2, '(relation: &quot;assignment_submissions&quot; | &quot;assignments&quot; | &quot;audit_log&quot; | &quot;thumbnail_likes&quot; | &quot;thumbnail_types&quot; | &quot;thumbnail_banners&quot; | &quot;thumbnail_categories&quot; | &quot;shopee_comprehensive_reports&quot; | ... 38 more ... | &quot;tiktok_comprehensive_reports&quot;): PostgrestQueryBuilder&lt;...&gt;', gave the following error.
    Argument of type '&quot;profile_segment_roles&quot;' is not assignable to parameter of type '&quot;assignment_submissions&quot; | &quot;assignments&quot; | &quot;audit_log&quot; | &quot;thumbnail_likes&quot; | &quot;thumbnail_types&quot; | &quot;thumbnail_banners&quot; | &quot;thumbnail_categories&quot; | &quot;shopee_comprehensive_reports&quot; | ... 38 more ... | &quot;tiktok_comprehensive_reports&quot;'.
  Overload 2 of 2, '(relation: never): PostgrestQueryBuilder&lt;{ PostgrestVersion: &quot;12.2.3 (519615d)&quot;; }, PublicSchema, never, never, never&gt;', gave the following error.
    Argument of type '&quot;profile_segment_roles&quot;' is not assignable to parameter of type 'never'.</problem>
<problem file="src/hooks/useProfileSegmentRoles.ts" line="37" column="93" code="2339">Property 'profile_id' does not exist on type '{ course_id: string; created_at: string; created_by: string; description: string; due_date: string; id: string; instructions: string; title: string; updated_at: string; } | { assignment_id: string; ... 10 more ...; user_id: string; } | ... 44 more ... | { ...; }'.
  Property 'profile_id' does not exist on type '{ course_id: string; created_at: string; created_by: string; description: string; due_date: string; id: string; instructions: string; title: string; updated_at: string; }'.</problem>
<problem file="src/hooks/useProfileSegmentRoles.ts" line="53" column="23" code="2769">No overload matches this call.
  Overload 1 of 2, '(relation: &quot;assignment_submissions&quot; | &quot;assignments&quot; | &quot;audit_log&quot; | &quot;thumbnail_likes&quot; | &quot;thumbnail_types&quot; | &quot;thumbnail_banners&quot; | &quot;thumbnail_categories&quot; | &quot;shopee_comprehensive_reports&quot; | ... 38 more ... | &quot;tiktok_comprehensive_reports&quot;): PostgrestQueryBuilder&lt;...&gt;', gave the following error.
    Argument of type '&quot;profile_segment_roles&quot;' is not assignable to parameter of type '&quot;assignment_submissions&quot; | &quot;assignments&quot; | &quot;audit_log&quot; | &quot;thumbnail_likes&quot; | &quot;thumbnail_types&quot; | &quot;thumbnail_banners&quot; | &quot;thumbnail_categories&quot; | &quot;shopee_comprehensive_reports&quot; | ... 38 more ... | &quot;tiktok_comprehensive_reports&quot;'.
  Overload 2 of 2, '(relation: never): PostgrestQueryBuilder&lt;{ PostgrestVersion: &quot;12.2.3 (519615d)&quot;; }, PublicSchema, never, never, never&gt;', gave the following error.
    Argument of type '&quot;profile_segment_roles&quot;' is not assignable to parameter of type 'never'.</problem>
<problem file="src/components/admin/SegmentRoleManager.tsx" line="21" column="50" code="2339">Property 'find' does not exist on type 'NoInfer&lt;TQueryFnData&gt;'.</problem>
<problem file="src/components/admin/SegmentRoleManager.tsx" line="38" column="18" code="2339">Property 'length' does not exist on type 'any[] | NoInfer&lt;TQueryFnData&gt;'.
  Property 'length' does not exist on type 'NoInfer&lt;TQueryFnData&gt;'.</problem>
<problem file="src/components/admin/SegmentRoleManager.tsx" line="40" column="16" code="2339">Property 'forEach' does not exist on type 'any[] | NoInfer&lt;TQueryFnData&gt;'.
  Property 'forEach' does not exist on type 'NoInfer&lt;TQueryFnData&gt;'.</problem>
<problem file="src/components/admin/SegmentRoleManager.tsx" line="41" column="43" code="2339">Property 'find' does not exist on type 'any[] | NoInfer&lt;TQueryFnData&gt;'.
  Property 'find' does not exist on type 'NoInfer&lt;TQueryFnData&gt;'.</problem>
<problem file="src/components/admin/SegmentRoleManager.tsx" line="57" column="14" code="2339">Property 'forEach' does not exist on type 'any[] | NoInfer&lt;TQueryFnData&gt;'.
  Property 'forEach' does not exist on type 'NoInfer&lt;TQueryFnData&gt;'.</problem>
<problem file="src/components/admin/SegmentRoleManager.tsx" line="76" column="40" code="2345">Argument of type 'any[]' is not assignable to parameter of type 'never[]'.
  Type 'any' is not assignable to type 'never'.</problem>
<problem file="src/components/admin/SegmentRoleManager.tsx" line="115" column="19" code="2339">Property 'map' does not exist on type 'any[] | NoInfer&lt;TQueryFnData&gt;'.
  Property 'map' does not exist on type 'NoInfer&lt;TQueryFnData&gt;'.</problem>
<problem file="src/components/admin/EditUserForm.tsx" line="168" column="69" code="2339">Property 'id' does not exist on type 'never'.</problem>
<problem file="src/components/admin/EditUserForm.tsx" line="176" column="55" code="2339">Property 'name' does not exist on type 'never'.</problem>
<problem file="src/components/admin/EditUserForm.tsx" line="177" column="53" code="2339">Property 'id' does not exist on type 'never'.</problem>
<problem file="src/components/admin/EditUserForm.tsx" line="286" column="45" code="2339">Property 'id' does not exist on type 'never'.</problem>
<problem file="src/components/admin/EditUserForm.tsx" line="286" column="61" code="2339">Property 'id' does not exist on type 'never'.</problem>
<problem file="src/components/admin/EditUserForm.tsx" line="287" column="31" code="2339">Property 'name' does not exist on type 'never'.</problem>
<problem file="src/components/admin/EditUserDialog.tsx" line="113" column="13" code="2322">Type 'any[] | NoInfer&lt;TQueryFnData&gt;' is not assignable to type 'never[]'.
  Type 'any[]' is not assignable to type 'never[]'.
    Type 'any' is not assignable to type 'never'.</problem>
<problem file="src/components/admin/CreateUserForm.tsx" line="86" column="20" code="2339">Property 'filter' does not exist on type 'NoInfer&lt;TQueryFnData&gt;'.</problem>
<problem file="src/hooks/useLearningAnalytics.ts" line="40" column="5" code="2769">No overload matches this call.
  Overload 1 of 3, '(options: DefinedInitialDataOptions&lt;LearningAnalyticsData, Error, LearningAnalyticsData, readonly unknown[]&gt;, queryClient?: QueryClient): DefinedUseQueryResult&lt;...&gt;', gave the following error.
    Type '() =&gt; Promise&lt;{ overall: { total_users: number; total_exercises_completed_across_all_users: number; total_unique_exercises: number; total_learning_time_minutes: number; }; users: UserLearningSummary[]; teams: { ...; }[]; }&gt;' is not assignable to type 'QueryFunction&lt;LearningAnalyticsData, readonly unknown[]&gt;'.
      Type 'Promise&lt;{ overall: { total_users: number; total_exercises_completed_across_all_users: number; total_unique_exercises: number; total_learning_time_minutes: number; }; users: UserLearningSummary[]; teams: { ...; }[]; }&gt;' is not assignable to type 'LearningAnalyticsData | Promise&lt;LearningAnalyticsData&gt;'.
        Type 'Promise&lt;{ overall: { total_users: number; total_exercises_completed_across_all_users: number; total_unique_exercises: number; total_learning_time_minutes: number; }; users: UserLearningSummary[]; teams: { ...; }[]; }&gt;' is not assignable to type 'Promise&lt;LearningAnalyticsData&gt;'.
          Type '{ overall: { total_users: number; total_exercises_completed_across_all_users: number; total_unique_exercises: number; total_learning_time_minutes: number; }; users: UserLearningSummary[]; teams: { ...; }[]; }' is not assignable to type 'LearningAnalyticsData'.
            Types of property 'teams' are incompatible.
              Type '{ id: string; name: string; created_at: string; }[]' is not assignable to type 'never[]'.
                Type '{ id: string; name: string; created_at: string; }' is not assignable to type 'never'.
  Overload 2 of 3, '(options: UndefinedInitialDataOptions&lt;LearningAnalyticsData, Error, LearningAnalyticsData, readonly unknown[]&gt;, queryClient?: QueryClient): UseQueryResult&lt;...&gt;', gave the following error.
    Type '() =&gt; Promise&lt;{ overall: { total_users: number; total_exercises_completed_across_all_users: number; total_unique_exercises: number; total_learning_time_minutes: number; }; users: UserLearningSummary[]; teams: { ...; }[]; }&gt;' is not assignable to type 'unique symbol | QueryFunction&lt;LearningAnalyticsData, readonly unknown[], never&gt;'.
      Type '() =&gt; Promise&lt;{ overall: { total_users: number; total_exercises_completed_across_all_users: number; total_unique_exercises: number; total_learning_time_minutes: number; }; users: UserLearningSummary[]; teams: { ...; }[]; }&gt;' is not assignable to type 'QueryFunction&lt;LearningAnalyticsData, readonly unknown[], never&gt;'.
        Type 'Promise&lt;{ overall: { total_users: number; total_exercises_completed_across_all_users: number; total_unique_exercises: number; total_learning_time_minutes: number; }; users: UserLearningSummary[]; teams: { ...; }[]; }&gt;' is not assignable to type 'LearningAnalyticsData | Promise&lt;LearningAnalyticsData&gt;'.
          Type 'Promise&lt;{ overall: { total_users: number; total_exercises_completed_across_all_users: number; total_unique_exercises: number; total_learning_time_minutes: number; }; users: UserLearningSummary[]; teams: { ...; }[]; }&gt;' is not assignable to type 'Promise&lt;LearningAnalyticsData&gt;'.
            Type '{ overall: { total_users: number; total_exercises_completed_across_all_users: number; total_unique_exercises: number; total_learning_time_minutes: number; }; users: UserLearningSummary[]; teams: { ...; }[]; }' is not assignable to type 'LearningAnalyticsData'.
              Types of property 'teams' are incompatible.
                Type '{ id: string; name: string; created_at: string; }[]' is not assignable to type 'never[]'.
                  Type '{ id: string; name: string; created_at: string; }' is not assignable to type 'never'.
  Overload 3 of 3, '(options: UseQueryOptions&lt;LearningAnalyticsData, Error, LearningAnalyticsData, readonly unknown[]&gt;, queryClient?: QueryClient): UseQueryResult&lt;...&gt;', gave the following error.
    Type '() =&gt; Promise&lt;{ overall: { total_users: number; total_exercises_completed_across_all_users: number; total_unique_exercises: number; total_learning_time_minutes: number; }; users: UserLearningSummary[]; teams: { ...; }[]; }&gt;' is not assignable to type 'unique symbol | QueryFunction&lt;LearningAnalyticsData, readonly unknown[], never&gt;'.
      Type '() =&gt; Promise&lt;{ overall: { total_users: number; total_exercises_completed_across_all_users: number; total_unique_exercises: number; total_learning_time_minutes: number; }; users: UserLearningSummary[]; teams: { ...; }[]; }&gt;' is not assignable to type 'QueryFunction&lt;LearningAnalyticsData, readonly unknown[], never&gt;'.
        Type 'Promise&lt;{ overall: { total_users: number; total_exercises_completed_across_all_users: number; total_unique_exercises: number; total_learning_time_minutes: number; }; users: UserLearningSummary[]; teams: { ...; }[]; }&gt;' is not assignable to type 'LearningAnalyticsData | Promise&lt;LearningAnalyticsData&gt;'.
          Type 'Promise&lt;{ overall: { total_users: number; total_exercises_completed_across_all_users: number; total_unique_exercises: number; total_learning_time_minutes: number; }; users: UserLearningSummary[]; teams: { ...; }[]; }&gt;' is not assignable to type 'Promise&lt;LearningAnalyticsData&gt;'.
            Type '{ overall: { total_users: number; total_exercises_completed_across_all_users: number; total_unique_exercises: number; total_learning_time_minutes: number; }; users: UserLearningSummary[]; teams: { ...; }[]; }' is not assignable to type 'LearningAnalyticsData'.
              Types of property 'teams' are incompatible.
                Type '{ id: string; name: string; created_at: string; }[]' is not assignable to type 'never[]'.
                  Type '{ id: string; name: string; created_at: string; }' is not assignable to type 'never'.</problem>
<problem file="src/hooks/useLearningAnalytics.ts" line="119" column="73" code="2339">Property 'name' does not exist on type 'never'.</problem>
<problem file="src/components/admin/LearningProgressDashboard.tsx" line="32" column="25" code="2339">Property 'users' does not exist on type 'NoInfer&lt;TQueryFnData&gt;'.</problem>
<problem file="src/components/admin/LearningProgressDashboard.tsx" line="34" column="34" code="2339">Property 'users' does not exist on type 'NoInfer&lt;TQueryFnData&gt;'.</problem>
<problem file="src/components/admin/LearningProgressDashboard.tsx" line="51" column="75" code="2339">Property 'teams' does not exist on type 'NoInfer&lt;TQueryFnData&gt;'.</problem>
<problem file="src/components/admin/LearningProgressDashboard.tsx" line="99" column="11" code="2339">Property 'overall' does not exist on type '{}'.</problem>
<problem file="src/components/admin/LearningProgressDashboard.tsx" line="99" column="20" code="2339">Property 'teams' does not exist on type '{}'.</problem>
<problem file="src/components/admin/BulkUserImportDialog.tsx" line="66" column="29" code="2339">Property 'map' does not exist on type 'any[] | NoInfer&lt;TQueryFnData&gt;'.
  Property 'map' does not exist on type 'NoInfer&lt;TQueryFnData&gt;'.</problem>
<problem file="src/components/admin/AdminUserManagement.tsx" line="89" column="56" code="2339">Property 'filter' does not exist on type 'NoInfer&lt;TQueryFnData&gt;'.</problem>
<problem file="src/components/admin/ExercisePermissionsDialog.tsx" line="26" column="29" code="2339">Property 'map' does not exist on type 'any[] | NoInfer&lt;TQueryFnData&gt;'.
  Property 'map' does not exist on type 'NoInfer&lt;TQueryFnData&gt;'.</problem>
<problem file="src/components/admin/CreateGeneralTrainingDialog.tsx" line="36" column="43" code="2339">Property 'map' does not exist on type 'any[] | NoInfer&lt;TQueryFnData&gt;'.
  Property 'map' does not exist on type 'NoInfer&lt;TQueryFnData&gt;'.</problem>
<problem file="src/components/admin/EditGeneralTrainingDialog.tsx" line="38" column="43" code="2339">Property 'map' does not exist on type 'any[] | NoInfer&lt;TQueryFnData&gt;'.
  Property 'map' does not exist on type 'NoInfer&lt;TQueryFnData&gt;'.</problem>
<problem file="src/components/admin/GeneralTrainingManagement.tsx" line="26" column="48" code="2339">Property 'map' does not exist on type 'any[] | NoInfer&lt;TQueryFnData&gt;'.
  Property 'map' does not exist on type 'NoInfer&lt;TQueryFnData&gt;'.</problem>
<problem file="src/components/admin/GeneralTrainingManagement.tsx" line="98" column="71" code="2322">Type 'unknown' is not assignable to type 'ReactNode'.</problem>
<problem file="src/components/admin/LeaderViewDashboard.tsx" line="32" column="29" code="2339">Property 'users' does not exist on type 'NoInfer&lt;TQueryFnData&gt;'.</problem>
<problem file="src/components/admin/LeaderViewDashboard.tsx" line="34" column="41" code="2339">Property 'users' does not exist on type 'NoInfer&lt;TQueryFnData&gt;'.</problem>
<problem file="src/hooks/useDetailedLearningProgress.ts" line="43" column="5" code="2769">No overload matches this call.
  Overload 1 of 3, '(options: DefinedInitialDataOptions&lt;DetailedLearningProgressData, Error, DetailedLearningProgressData, readonly unknown[]&gt;, queryClient?: QueryClient): DefinedUseQueryResult&lt;...&gt;', gave the following error.
    Type '() =&gt; Promise&lt;{ exercises: TrainingExercise[]; users: DetailedUserProgress[]; teams: { created_at: string; id: string; name: string; }[]; }&gt;' is not assignable to type 'QueryFunction&lt;DetailedLearningProgressData, readonly unknown[]&gt;'.
      Type 'Promise&lt;{ exercises: TrainingExercise[]; users: DetailedUserProgress[]; teams: { created_at: string; id: string; name: string; }[]; }&gt;' is not assignable to type 'DetailedLearningProgressData | Promise&lt;DetailedLearningProgressData&gt;'.
        Type 'Promise&lt;{ exercises: TrainingExercise[]; users: DetailedUserProgress[]; teams: { created_at: string; id: string; name: string; }[]; }&gt;' is not assignable to type 'Promise&lt;DetailedLearningProgressData&gt;'.
          Type '{ exercises: TrainingExercise[]; users: DetailedUserProgress[]; teams: { created_at: string; id: string; name: string; }[]; }' is not assignable to type 'DetailedLearningProgressData'.
            Types of property 'teams' are incompatible.
              Type '{ created_at: string; id: string; name: string; }[]' is not assignable to type 'never[]'.
                Type '{ created_at: string; id: string; name: string; }' is not assignable to type 'never'.
  Overload 2 of 3, '(options: UndefinedInitialDataOptions&lt;DetailedLearningProgressData, Error, DetailedLearningProgressData, readonly unknown[]&gt;, queryClient?: QueryClient): UseQueryResult&lt;...&gt;', gave the following error.
    Type '() =&gt; Promise&lt;{ exercises: TrainingExercise[]; users: DetailedUserProgress[]; teams: { created_at: string; id: string; name: string; }[]; }&gt;' is not assignable to type 'unique symbol | QueryFunction&lt;DetailedLearningProgressData, readonly unknown[], never&gt;'.
      Type '() =&gt; Promise&lt;{ exercises: TrainingExercise[]; users: DetailedUserProgress[]; teams: { created_at: string; id: string; name: string; }[]; }&gt;' is not assignable to type 'QueryFunction&lt;DetailedLearningProgressData, readonly unknown[], never&gt;'.
        Type 'Promise&lt;{ exercises: TrainingExercise[]; users: DetailedUserProgress[]; teams: { created_at: string; id: string; name: string; }[]; }&gt;' is not assignable to type 'DetailedLearningProgressData | Promise&lt;DetailedLearningProgressData&gt;'.
          Type 'Promise&lt;{ exercises: TrainingExercise[]; users: DetailedUserProgress[]; teams: { created_at: string; id: string; name: string; }[]; }&gt;' is not assignable to type 'Promise&lt;DetailedLearningProgressData&gt;'.
            Type '{ exercises: TrainingExercise[]; users: DetailedUserProgress[]; teams: { created_at: string; id: string; name: string; }[]; }' is not assignable to type 'DetailedLearningProgressData'.
              Types of property 'teams' are incompatible.
                Type '{ created_at: string; id: string; name: string; }[]' is not assignable to type 'never[]'.
                  Type '{ created_at: string; id: string; name: string; }' is not assignable to type 'never'.
  Overload 3 of 3, '(options: UseQueryOptions&lt;DetailedLearningProgressData, Error, DetailedLearningProgressData, readonly unknown[]&gt;, queryClient?: QueryClient): UseQueryResult&lt;...&gt;', gave the following error.
    Type '() =&gt; Promise&lt;{ exercises: TrainingExercise[]; users: DetailedUserProgress[]; teams: { created_at: string; id: string; name: string; }[]; }&gt;' is not assignable to type 'unique symbol | QueryFunction&lt;DetailedLearningProgressData, readonly unknown[], never&gt;'.
      Type '() =&gt; Promise&lt;{ exercises: TrainingExercise[]; users: DetailedUserProgress[]; teams: { created_at: string; id: string; name: string; }[]; }&gt;' is not assignable to type 'QueryFunction&lt;DetailedLearningProgressData, readonly unknown[], never&gt;'.
        Type 'Promise&lt;{ exercises: TrainingExercise[]; users: DetailedUserProgress[]; teams: { created_at: string; id: string; name: string; }[]; }&gt;' is not assignable to type 'DetailedLearningProgressData | Promise&lt;DetailedLearningProgressData&gt;'.
          Type 'Promise&lt;{ exercises: TrainingExercise[]; users: DetailedUserProgress[]; teams: { created_at: string; id: string; name: string; }[]; }&gt;' is not assignable to type 'Promise&lt;DetailedLearningProgressData&gt;'.
            Type '{ exercises: TrainingExercise[]; users: DetailedUserProgress[]; teams: { created_at: string; id: string; name: string; }[]; }' is not assignable to type 'DetailedLearningProgressData'.
              Types of property 'teams' are incompatible.
                Type '{ created_at: string; id: string; name: string; }[]' is not assignable to type 'never[]'.
                  Type '{ created_at: string; id: string; name: string; }' is not assignable to type 'never'.</problem>
<problem file="src/hooks/useDetailedLearningProgress.ts" line="129" column="71" code="2339">Property 'name' does not exist on type 'never'.</problem>
</dyad-problem-report><think>**Investigating TypeScript Errors**

I'm currently focused on the root cause of these pervasive TypeScript errors, which appear linked to Supabase types and a recent database schema alteration. While the errors span numerous files, the source seems consistent. I'm prioritizing understanding how the schema change impacted type definitions to facilitate a comprehensive fix.


**Revising Supabase Type Definitions**

I'm currently updating the `supabase/types.ts` file to reflect the schema changes. The renaming of the `teams` table to `departments`, along with the additions of `segments` and `profile_segment_roles` tables, are now integrated. I'm carefully reviewing the type definitions to ensure they align perfectly with the updated Supabase schema. Once this is complete, I'll move on to addressing the `useQuery` overloads and ensure all file-specific type errors are resolved.


**Resolving Type Mismatches**

I'm making progress updating the Supabase types to reflect the recent schema alterations. I've finished renaming the `teams` table to `departments` within the type definitions, added definitions for the new `segments` and `profile_segment_roles` tables, and ensured the foreign key relationships are correctly represented. I'm now cross-referencing these changes with the error list to prioritize the most impactful fixes and address the `useQuery` overloads that are failing due to the type discrepancies.


**Adjusting Type Definitions**

The main focus now is updating the main Supabase types file, `src/integrations/supabase/types.ts`. I'm systematically going through the existing type definitions, specifically focusing on the `Tables` and `public` schema sections. My plan is to locate the `teams` table definition and rename it to `departments`, and then add definitions for the new `segments` and `profile_segment_roles` tables, paying close attention to foreign key relationships. The schema modifications are being carefully integrated to maintain consistency and resolve those persistent type mismatches.


**Implementing Schema Changes**

I'm currently updating the `src/integrations/supabase/types.ts` file. I've successfully renamed the `teams` table to `departments` within the `Tables` definition and added the `segments` and `profile_segment_roles` table definitions, incorporating their respective column types and foreign key relationships. The next step is to carefully review all associated `Insert`, `Update`, and `Relationships` definitions, ensuring data integrity. I'm taking precautions to avoid typos and ensure the structure mirrors the actual Supabase schema, minimizing further type errors.


**Finalizing Schema Integration**

I'm now integrating the schema changes into the Supabase types. I've successfully modified `src/integrations/supabase/types.ts`, renaming the `teams` table to `departments` and adding definitions for `segments` and `profile_segment_roles`, including their relationships and column types. The `profiles` table's `team_id` foreign key is also updated to reference `departments`. My next step involves meticulously reviewing the remaining type definitions to ensure full consistency and correct any potential type mismatches before resolving `useQuery` overloads.


**Integrating New Table Definitions**

I'm now integrating the new definitions for `segments` and `profile_segment_roles` tables into the main `types.ts` file. I'm carefully reviewing the relationships, ensuring the foreign key references are accurate, and making sure the `profiles` table now correctly references `departments` instead of the old `teams`. This should resolve the type mismatches causing the `useQuery` overloads to fail and remove the 'Table does not exist' errors. Once the type definitions are updated, I'll analyze and fix the errors in my local files.


**Implementing New Supabase Types**

I'm now carefully modifying the `src/integrations/supabase/types.ts` file to fully integrate the recent schema changes. The renaming of the `teams` table to `departments`, and the addition of `segments` and `profile_segment_roles` are progressing well. I'm paying close attention to foreign key relationships and type definitions to resolve the `useQuery` overloads and other type mismatches.


**Integrating New Supabase Types**

I've now successfully updated the `src/integrations/supabase/types/schema-public-tables.ts` file to include the renamed `departments` table and added definitions for `segments` and `profile_segment_roles`, ensuring the correct foreign key relationships, including the update in the `profiles` table to reference `departments` rather than `teams`. I'm now verifying that all associated imports and exports in other type files are accurate and resolving any inconsistencies that remain.


**Integrating Schema Updates**

I've now integrated the new schema definitions into `src/integrations/supabase/types/schema-public-tables.ts`, including renaming the `teams` table to `departments` and adding definitions for `segments` and `profile_segment_roles`. I've also updated the `profiles` table's foreign key reference to the new `departments` table. The `useQuery` overloads should now align with the correct table structures. I'm double-checking all references to ensure the type definitions are precise.


**Implementing New Schema**

I've completed integrating the schema changes into `src/integrations/supabase/types/schema-public-tables.ts` by renaming the `teams` table to `departments`, adding the definitions for `segments` and `profile_segment_roles` tables, and updating the `profiles` table's foreign key to correctly reference `departments`. I'm now reviewing the changes to make sure all relationships are precise before moving on.


**Revising Schema for Types**

I'm now integrating the updated schema into `src/integrations/supabase/types/schema-public-tables.ts`, including table and relationship adjustments. Successfully renamed the 'teams' table to 'departments' and added definitions for the 'segments' and 'profile_segment_roles' tables, with their corresponding relationships. I'm focusing on meticulous type definitions to eliminate type errors stemming from the schema alterations.


**Implementing New Table Types**

I'm presently integrating the new tables `segments` and `profile_segment_roles` into the `schema-public-tables.ts` file, after renaming `teams` to `departments` and updating foreign key references. I'm focusing on consistency with the existing table definitions, particularly regarding column types and relationships. The goal is to resolve all the type mismatches causing the `useQuery` overloads to fail.


**Integrating Table Definitions**

I'm now focusing on integrating the schema changes into the core type definitions, specifically updating `schema-public-tables.ts`. This includes renaming the `teams` table to `departments` and adding comprehensive definitions for the `segments` and `profile_segment_roles` tables, ensuring all relationships and data types are accurate. This is the last step for resolving the issues.


**Integrating New Schema Definitions**

I'm presently integrating the new definitions for `segments` and `profile_segment_roles` tables into the `schema-public-tables.ts` file, after renaming `teams` to `departments` and updating foreign key references. I'm focusing on consistency with the existing table definitions, particularly regarding column types and relationships. The goal is to resolve all the type mismatches causing the `useQuery` overloads to fail, and ensure a smooth migration.

**Implementing Updated Types**

After thoroughly reviewing and adjusting the Supabase type definitions, I've successfully implemented changes to integrate the new `segments` and `profile_segment_roles` tables, along with the renaming of the `teams` table to `departments`. I've specifically focused on updating `src/integrations/supabase/types/schema-public-tables.ts` and `src/integrations/supabase/types/tables.ts`, ensuring all relevant relationships and data types are accurate. Now, I'm confident that the core type mismatches will be resolved and `useQuery` overloads should work correctly.

**Implementing Type Updates**

I've completed integrating the schema changes into the Supabase type definitions. Specifically, I updated `schema-public-tables.ts` to rename `teams` to `departments`, added the new `segments` and `profile_segment_roles` tables, and ensured the foreign key relationships are correctly defined, including updating the `profiles` table to reference `departments`. Additionally, I've added `Department`, `Segment` and `ProfileSegmentRole` types to `tables.ts`, resolving the core type mismatches and paving the way for resolving `useQuery` overloads.


**Refactoring Type Definitions**

I've now updated the main Supabase types file, `src/integrations/supabase/types/schema-public-tables.ts`, including renaming the `teams` table to `departments` and adding the new `segments` and `profile_segment_roles` tables, along with their relationships. I've also integrated these new types into `src/integrations/supabase/types/tables.ts`, including renaming  `Team` to `Department` and added the `Segment` and `ProfileSegmentRole` types. I believe these updates will resolve the core type mismatches and the `useQuery` overloads issues.


</think>Of course. It seems like the recent database changes have caused the TypeScript type definitions to become out of sync, which is leading to this cascade of errors. This is a common issue, and I can fix it by updating the type definitions to match the new database schema.

I'll update the necessary type files to include the new `departments`, `segments`, and `profile_segment_roles` tables. This should resolve all the compile-time errors you're seeing.

Here are the changes:

<dyad-write path="src/integrations/supabase/types/schema-public-tables.ts" description="Cập nhật schema types để bao gồm các bảng mới và đổi tên teams thành departments">
import type { Json } from "./database"
import type { PublicEnums } from "./schema-public-enums"

export type PublicTables = {
  assignment_submissions: {
    Row: {
      assignment_id: string
      content: string | null
      created_at: string
      feedback: string | null
      file_url: string | null
      id: string
      reviewed_at: string | null
      reviewed_by: string | null
      status: string
      submitted_at: string
      updated_at: string
      user_id: string
    }
    Insert: {
      assignment_id: string
      content?: string | null
      created_at?: string
      feedback?: string | null
      file_url?: string | null
      id?: string
      reviewed_at?: string | null
      reviewed_by?: string | null
      status?: string
      submitted_at?: string
      updated_at?: string
      user_id: string
    }
    Update: {
      assignment_id?: string
      content?: string | null
      created_at?: string
      feedback?: string | null
      file_url?: string | null
      id?: string
      reviewed_at?: string | null
      reviewed_by?: string | null
      status?: string
      submitted_at?: string
      updated_at?: string
      user_id?: string
    }
    Relationships: [
      {
        foreignKeyName: "assignment_submissions_assignment_id_fkey"
        columns: ["assignment_id"]
        isOneToOne: false
        referencedRelation: "assignments"
        referencedColumns: ["id"]
      },
    ]
  }
  assignments: {
    Row: {
      course_id: string
      created_at: string
      created_by: string | null
      description: string | null
      due_date: string | null
      id: string
      instructions: string | null
      title: string
      updated_at: string
    }
    Insert: {
      course_id: string
      created_at?: string
      created_by?: string | null
      description?: string | null
      due_date?: string | null
      id?: string
      instructions?: string | null
      title: string
      updated_at?: string
    }
    Update: {
      course_id?: string
      created_at?: string
      created_by?: string | null
      description?: string | null
      due_date?: string | null
      id?: string
      instructions?: string | null
      title?: string
      updated_at?: string
    }
    Relationships: [
      {
        foreignKeyName: "assignments_course_id_fkey"
        columns: ["course_id"]
        isOneToOne: false
        referencedRelation: "training_courses"
        referencedColumns: ["id"]
      },
    ]
  }
  audit_log: {
    Row: {
      id: string
      new_values: Json | null
      old_values: Json | null
      operation: string
      table_name: string
      timestamp: string | null
      user_id: string | null
    }
    Insert: {
      id?: string
      new_values?: Json | null
      old_values?: Json | null
      operation: string
      table_name: string
      timestamp?: string | null
      user_id?: string | null
    }
    Update: {
      id?: string
      new_values?: Json | null
      old_values?: Json | null
      operation?: string
      table_name?: string
      timestamp?: string | null
      user_id?: string | null
    }
    Relationships: []
  }
  profile_segment_roles: {
    Row: {
      id: string
      profile_id: string
      segment_id: string
      role: PublicEnums["user_role"]
      manager_id: string | null
      created_at: string
      updated_at: string
    }
    Insert: {
      id?: string
      profile_id: string
      segment_id: string
      role: PublicEnums["user_role"]
      manager_id?: string | null
      created_at?: string
      updated_at?: string
    }
    Update: {
      id?: string
      profile_id?: string
      segment_id?: string
      role?: PublicEnums["user_role"]
      manager_id?: string | null
      created_at?: string
      updated_at?: string
    }
    Relationships: [
      {
        foreignKeyName: "profile_segment_roles_manager_id_fkey"
        columns: ["manager_id"]
        isOneToOne: false
        referencedRelation: "profiles"
        referencedColumns: ["id"]
      },
      {
        foreignKeyName: "profile_segment_roles_profile_id_fkey"
        columns: ["profile_id"]
        isOneToOne: false
        referencedRelation: "profiles"
        referencedColumns: ["id"]
      },
      {
        foreignKeyName: "profile_segment_roles_segment_id_fkey"
        columns: ["segment_id"]
        isOneToOne: false
        referencedRelation: "segments"
        referencedColumns: ["id"]
      },
    ]
  }
  segments: {
    Row: {
      id: string
      department_id: string | null
      name: string
      created_at: string
    }
    Insert: {
      id?: string
      department_id?: string | null
      name: string
      created_at?: string
    }
    Update: {
      id?: string
      department_id?: string | null
      name?: string
      created_at?: string
    }
    Relationships: [
      {
        foreignKeyName: "segments_department_id_fkey"
        columns: ["department_id"]
        isOneToOne: false
        referencedRelation: "departments"
        referencedColumns: ["id"]
      },
    ]
  }
  video_tracking: {
    Row: {
      id: string
      user_id: string
      exercise_id: string
      total_watch_time: number
      video_duration: number
      watch_percentage: number
      last_position: number
      session_count: number
      created_at: string
      updated_at: string
    }
    Insert: {
      id?: string
      user_id: string
      exercise_id: string
      total_watch_time?: number
      video_duration?: number
      watch_percentage?: number
      last_position?: number
      session_count?: number
      created_at?: string
      updated_at?: string
    }
    Update: {
      id?: string
      user_id?: string
      exercise_id?: string
      total_watch_time?: number
      video_duration?: number
      watch_percentage?: number
      last_position?: number
      session_count?: number
      created_at?: string
      updated_at?: string
    }
    Relationships: []
  }
  user_login_sessions: {
    Row: {
      id: string
      user_id: string | null
      email: string | null
      ip_address: unknown | null
      user_agent: string | null
      device_info: Json | null
      location_info: Json | null
      login_time: string | null
      logout_time: string | null
      session_duration: unknown | null
      login_method: string | null
      success: boolean | null
      failure_reason: string | null
      browser_name: string | null
      browser_version: string | null
      os_name: string | null
      os_version: string | null
      device_type: string | null
      is_mobile: boolean | null
      country: string | null
      city: string | null
      timezone: string | null
      created_at: string | null
    }
    Insert: {
      id?: string
      user_id?: string | null
      email?: string | null
      ip_address?: unknown | null
      user_agent?: string | null
      device_info?: Json | null
      location_info?: Json | null
      login_time?: string | null
      logout_time?: string | null
      session_duration?: unknown | null
      login_method?: string | null
      success?: boolean | null
      failure_reason?: string | null
      browser_name?: string | null
      browser_version?: string | null
      os_name?: string | null
      os_version?: string | null
      device_type?: string | null
      is_mobile?: boolean | null
      country?: string | null
      city?: string | null
      timezone?: string | null
      created_at?: string | null
    }
    Update: {
      id?: string
      user_id?: string | null
      email?: string | null
      ip_address?: unknown | null
      user_agent?: string | null
      device_info?: Json | null
      location_info?: Json | null
      login_time?: string | null
      logout_time?: string | null
      session_duration?: unknown | null
      login_method?: string | null
      success?: boolean | null
      failure_reason?: string | null
      browser_name?: string | null
      browser_version?: string | null
      os_name?: string | null
      os_version?: string | null
      device_type?: string | null
      is_mobile?: boolean | null
      country?: string | null
      city?: string | null
      timezone?: string | null
      created_at?: string | null
    }
    Relationships: []
  }
  user_active_sessions: {
    Row: {
      id: string
      user_id: string | null
      session_id: string | null
      ip_address: unknown | null
      user_agent: string | null
      last_activity: string | null
      expires_at: string | null
      is_active: boolean | null
      created_at: string | null
    }
    Insert: {
      id?: string
      user_id?: string | null
      session_id?: string | null
      ip_address?: unknown | null
      user_agent?: string | null
      last_activity?: string | null
      expires_at?: string | null
      is_active?: boolean | null
      created_at?: string | null
    }
    Update: {
      id?: string
      user_id?: string | null
      session_id?: string | null
      ip_address?: unknown | null
      user_agent?: string | null
      last_activity?: string | null
      expires_at?: string | null
      is_active?: boolean | null
      created_at?: string | null
    }
    Relationships: [
      {
        foreignKeyName: "user_active_sessions_session_id_fkey"
        columns: ["session_id"]
        isOneToOne: false
        referencedRelation: "user_login_sessions"
        referencedColumns: ["id"]
      },
    ]
  }
  tiktok_comprehensive_reports: {
    Row: {
      id: string
      shop_id: string | null
      report_date: string
      total_revenue: number | null
      total_orders: number | null
      total_visits: number | null
      conversion_rate: number | null
      returned_revenue: number | null
      total_buyers: number | null
      feasible_goal: number | null
      breakthrough_goal: number | null
      created_at: string | null
      updated_at: string | null
      platform_subsidized_revenue: number | null
      items_sold: number | null
      store_visits: number | null
      sku_orders: number | null
      cancelled_revenue: number | null
      cancelled_orders: number | null
    }
    Insert: {
      id?: string
      shop_id?: string | null
      report_date: string
      total_revenue?: number | null
      total_orders?: number | null
      total_visits?: number | null
      conversion_rate?: number | null
      returned_revenue?: number | null
      total_buyers?: number | null
      feasible_goal?: number | null
      breakthrough_goal?: number | null
      created_at?: string | null
      updated_at?: string | null
      platform_subsidized_revenue?: number | null
      items_sold?: number | null
      store_visits?: number | null
      sku_orders?: number | null
      cancelled_revenue?: number | null
      cancelled_orders?: number | null
    }
    Update: {
      id?: string
      shop_id?: string | null
      report_date?: string
      total_revenue?: number | null
      total_orders?: number | null
      total_visits?: number | null
      conversion_rate?: number | null
      returned_revenue?: number | null
      total_buyers?: number | null
      feasible_goal?: number | null
      breakthrough_goal?: number | null
      created_at?: string | null
      updated_at?: string | null
      platform_subsidized_revenue?: number | null
      items_sold?: number | null
      store_visits?: number | null
      sku_orders?: number | null
      cancelled_revenue?: number | null
      cancelled_orders?: number | null
    }
    Relationships: []
  }
  thumbnail_categories: {
    Row: {
      id: string
      name: string
      created_at: string
    }
    Insert: {
      id?: string
      name: string
      created_at?: string
    }
    Update: {
      id?: string
      name?: string
      created_at?: string
    }
    Relationships: []
  }
  thumbnail_banners: {
    Row: {
      id: string
      user_id: string
      name: string
      image_url: string
      thumbnail_category_id: string | null
      thumbnail_type_id: string | null
      created_at: string
      updated_at: string
      canva_link: string | null
      status: PublicEnums["banner_status"] | null
      approved_by: string | null
      approved_at: string | null
    }
    Insert: {
      id?: string
      user_id: string
      name: string
      image_url: string
      thumbnail_category_id?: string | null
      thumbnail_type_id?: string | null
      created_at?: string
      updated_at?: string
      canva_link?: string | null
      status?: PublicEnums["banner_status"] | null
      approved_by?: string | null
      approved_at?: string | null
    }
    Update: {
      id?: string
      user_id?: string
      name?: string
      image_url?: string
      thumbnail_category_id?: string | null
      thumbnail_type_id?: string | null
      created_at?: string
      updated_at?: string
      canva_link?: string | null
      status?: PublicEnums["banner_status"] | null
      approved_by?: string | null
      approved_at?: string | null
    }
    Relationships: []
  }
  shopee_shops: {
    Row: {
      id: string
      name: string
      created_at: string | null
      updated_at: string | null
      status: PublicEnums["shopee_shop_status"] | null
      profile_id: string | null
    }
    Insert: {
      id?: string
      name: string
      created_at?: string | null
      updated_at?: string | null
      status?: PublicEnums["shopee_shop_status"] | null
      profile_id?: string | null
    }
    Update: {
      id?: string
      name?: string
      created_at?: string | null
      updated_at?: string | null
      status?: PublicEnums["shopee_shop_status"] | null
      profile_id?: string | null
    }
    Relationships: []
  }
  shop_revenue: {
    Row: {
      id: string
      shop_id: string
      revenue_date: string
      revenue_amount: number
      uploaded_by: string | null
      created_at: string
    }
    Insert: {
      id?: string
      shop_id: string
      revenue_date: string
      revenue_amount?: number
      uploaded_by?: string | null
      created_at?: string
    }
    Update: {
      id?: string
      shop_id?: string
      revenue_date?: string
      revenue_amount?: number
      uploaded_by?: string | null
      created_at?: string
    }
    Relationships: []
  }
  role_permissions: {
    Row: {
      role: PublicEnums["user_role"]
      permission_id: string
    }
    Insert: {
      role: PublicEnums["user_role"]
      permission_id: string
    }
    Update: {
      role?: PublicEnums["user_role"]
      permission_id?: string
    }
    Relationships: []
  }
  profiles: {
    Row: {
      id: string
      email: string
      full_name: string | null
      created_at: string
      updated_at: string
      role: PublicEnums["user_role"] | null
      team_id: string | null
      phone: string | null
      work_type: PublicEnums["work_type"] | null
      join_date: string | null
      manager_id: string | null
    }
    Insert: {
      id: string
      email: string
      full_name?: string | null
      created_at?: string
      updated_at?: string
      role?: PublicEnums["user_role"] | null
      team_id?: string | null
      phone?: string | null
      work_type?: PublicEnums["work_type"] | null
      join_date?: string | null
      manager_id?: string | null
    }
    Update: {
      id?: string
      email?: string
      full_name?: string | null
      created_at?: string
      updated_at?: string
      role?: PublicEnums["user_role"] | null
      team_id?: string | null
      phone?: string | null
      work_type?: PublicEnums["work_type"] | null
      join_date?: string | null
      manager_id?: string | null
    }
    Relationships: [
      {
        foreignKeyName: "profiles_manager_id_fkey"
        columns: ["manager_id"]
        isOneToOne: false
        referencedRelation: "profiles"
        referencedColumns: ["id"]
      },
      {
        foreignKeyName: "profiles_team_id_fkey"
        columns: ["team_id"]
        isOneToOne: false
        referencedRelation: "departments"
        referencedColumns: ["id"]
      },
    ]
  }
  permissions: {
    Row: {
      id: string
      name: string
      description: string | null
      parent_id: string | null
      created_at: string | null
    }
    Insert: {
      id?: string
      name: string
      description?: string | null
      parent_id?: string | null
      created_at?: string | null
    }
    Update: {
      id?: string
      name?: string
      description?: string | null
      parent_id?: string | null
      created_at?: string | null
    }
    Relationships: []
  }
  general_training_recaps: {
    Row: {
      id: string
      user_id: string
      exercise_id: string
      recap_content: string
      created_at: string | null
      updated_at: string | null
    }
    Insert: {
      id?: string
      user_id: string
      exercise_id: string
      recap_content: string
      created_at?: string | null
      updated_at?: string | null
    }
    Update: {
      id?: string
      user_id?: string
      exercise_id?: string
      recap_content?: string
      created_at?: string | null
      updated_at?: string | null
    }
    Relationships: []
  }
  general_training_exercise_tags: {
    Row: {
      exercise_id: string
      tag_id: string
    }
    Insert: {
      exercise_id: string
      tag_id: string
    }
    Update: {
      exercise_id?: string
      tag_id?: string
    }
    Relationships: []
  }
  edu_quiz_questions: {
    Row: {
      id: string
      quiz_id: string
      content: string
      question_type: PublicEnums["question_type"]
      order_index: number | null
      created_at: string | null
      updated_at: string | null
    }
    Insert: {
      id?: string
      quiz_id: string
      content: string
      question_type?: PublicEnums["question_type"]
      order_index?: number | null
      created_at?: string | null
      updated_at?: string | null
    }
    Update: {
      id?: string
      quiz_id?: string
      content?: string
      question_type?: PublicEnums["question_type"]
      order_index?: number | null
      created_at?: string | null
      updated_at?: string | null
    }
    Relationships: []
  }
  edu_essay_submissions: {
    Row: {
      id: string
      user_id: string
      exercise_id: string
      answers: Json | null
      submitted_at: string | null
      created_at: string
      updated_at: string
      started_at: string | null
      time_limit_minutes: number | null
      score: number | null
      grader_feedback: string | null
      status: string | null
    }
    Insert: {
      id?: string
      user_id: string
      exercise_id: string
      answers?: Json | null
      submitted_at?: string | null
      created_at?: string
      updated_at?: string
      started_at?: string | null
      time_limit_minutes?: number | null
      score?: number | null
      grader_feedback?: string | null
      status?: string | null
    }
    Update: {
      id?: string
      user_id?: string
      exercise_id?: string
      answers?: Json | null
      submitted_at?: string | null
      created_at?: string
      updated_at?: string
      started_at?: string | null
      time_limit_minutes?: number | null
      score?: number | null
      grader_feedback?: string | null
      status?: string | null
    }
    Relationships: []
  }
  feedback: {
    Row: {
      id: string
      user_id: string | null
      content: string | null
      image_url: string | null
      created_at: string | null
      status: PublicEnums["feedback_status"] | null
      feedback_type: PublicEnums["feedback_type"] | null
      resolved_by: string | null
      resolved_at: string | null
    }
    Insert: {
      id?: string
      user_id?: string | null
      content?: string | null
      image_url?: string | null
      created_at?: string | null
      status?: PublicEnums["feedback_status"] | null
      feedback_type?: PublicEnums["feedback_type"] | null
      resolved_by?: string | null
      resolved_at?: string | null
    }
    Update: {
      id?: string
      user_id?: string | null
      content?: string | null
      image_url?: string | null
      created_at?: string | null
      status?: PublicEnums["feedback_status"] | null
      feedback_type?: PublicEnums["feedback_type"] | null
      resolved_by?: string | null
      resolved_at?: string | null
    }
    Relationships: []
  }
  user_video_progress: {
    Row: {
      id: string
      user_id: string
      video_id: string
      course_id: string
      watch_count: number
      last_watched_at: string | null
      is_completed: boolean
      created_at: string
      updated_at: string
    }
    Insert: {
      id?: string
      user_id: string
      video_id: string
      course_id: string
      watch_count?: number
      last_watched_at?: string | null
      is_completed?: boolean
      created_at?: string
      updated_at?: string
    }
    Update: {
      id?: string
      user_id?: string
      video_id?: string
      course_id?: string
      watch_count?: number
      last_watched_at?: string | null
      is_completed?: boolean
      created_at?: string
      updated_at?: string
    }
    Relationships: []
  }
  user_permissions: {
    Row: {
      user_id: string
      permission_id: string
      permission_type: PublicEnums["permission_type"]
    }
    Insert: {
      user_id: string
      permission_id: string
      permission_type: PublicEnums["permission_type"]
    }
    Update: {
      user_id?: string
      permission_id?: string
      permission_type?: PublicEnums["permission_type"]
    }
    Relationships: []
  }
  user_exercise_recaps: {
    Row: {
      id: string
      user_id: string
      exercise_id: string
      recap_content: string
      submitted_at: string
      created_at: string
      updated_at: string
    }
    Insert: {
      id?: string
      user_id: string
      exercise_id: string
      recap_content: string
      submitted_at?: string
      created_at?: string
      updated_at?: string
    }
    Update: {
      id?: string
      user_id?: string
      exercise_id?: string
      recap_content?: string
      submitted_at?: string
      created_at?: string
      updated_at?: string
    }
    Relationships: []
  }
  user_exercise_progress: {
    Row: {
      id: string
      user_id: string
      exercise_id: string
      is_completed: boolean
      completed_at: string | null
      time_spent: number | null
      created_at: string
      updated_at: string
      video_completed: boolean
      recap_submitted: boolean
      quiz_passed: boolean
      video_duration: number | null
      session_count: number
      theory_read: boolean
      watch_percentage: number | null
    }
    Insert: {
      id?: string
      user_id: string
      exercise_id: string
      is_completed?: boolean
      completed_at?: string | null
      time_spent?: number | null
      created_at?: string
      updated_at?: string
      video_completed?: boolean
      recap_submitted?: boolean
      quiz_passed?: boolean
      video_duration?: number | null
      session_count?: number
      theory_read?: boolean
      watch_percentage?: number | null
    }
    Update: {
      id?: string
      user_id?: string
      exercise_id?: string
      is_completed?: boolean
      completed_at?: string | null
      time_spent?: number | null
      created_at?: string
      updated_at?: string
      video_completed?: boolean
      recap_submitted?: boolean
      quiz_passed?: boolean
      video_duration?: number | null
      session_count?: number
      theory_read?: boolean
      watch_percentage?: number | null
    }
    Relationships: []
  }
  user_course_progress: {
    Row: {
      id: string
      user_id: string
      course_id: string
      completed_study_sessions: number
      completed_review_videos: number
      is_completed: boolean
      started_at: string
      completed_at: string | null
      created_at: string
      updated_at: string
    }
    Insert: {
      id?: string
      user_id: string
      course_id: string
      completed_study_sessions?: number
      completed_review_videos?: number
      is_completed?: boolean
      started_at?: string
      completed_at?: string | null
      created_at?: string
      updated_at?: string
    }
    Update: {
      id?: string
      user_id?: string
      course_id?: string
      completed_study_sessions?: number
      completed_review_videos?: number
      is_completed?: boolean
      started_at?: string
      completed_at?: string | null
      created_at?: string
      updated_at?: string
    }
    Relationships: []
  }
  tiktok_shops: {
    Row: {
      id: string
      name: string
      profile_id: string | null
      status: PublicEnums["tiktok_shop_status"] | null
      created_at: string | null
      updated_at: string | null
      type: PublicEnums["tiktok_shop_type"]
    }
    Insert: {
      id?: string
      name: string
      profile_id?: string | null
      status?: PublicEnums["tiktok_shop_status"] | null
      created_at?: string | null
      updated_at?: string | null
      type?: PublicEnums["tiktok_shop_type"]
    }
    Update: {
      id?: string
      name?: string
      profile_id?: string | null
      status?: PublicEnums["tiktok_shop_status"] | null
      created_at?: string | null
      updated_at?: string | null
      type?: PublicEnums["tiktok_shop_type"]
    }
    Relationships: []
  }
  tiktok_shop_revenue: {
    Row: {
      id: string
      shop_id: string
      revenue_date: string
      revenue_amount: number
      uploaded_by: string | null
      created_at: string | null
    }
    Insert: {
      id?: string
      shop_id: string
      revenue_date: string
      revenue_amount: number
      uploaded_by?: string | null
      created_at?: string | null
    }
    Update: {
      id?: string
      shop_id?: string
      revenue_date?: string
      revenue_amount?: number
      uploaded_by?: string | null
      created_at?: string | null
    }
    Relationships: []
  }
  thumbnail_types: {
    Row: {
      id: string
      name: string
      created_at: string
    }
    Insert: {
      id?: string
      name: string
      created_at?: string
    }
    Update: {
      id?: string
      name?: string
      created_at?: string
    }
    Relationships: []
  }
  thumbnail_likes: {
    Row: {
      id: string
      user_id: string
      thumbnail_banner_id: string
      created_at: string
      updated_at: string
    }
    Insert: {
      id?: string
      user_id: string
      thumbnail_banner_id: string
      created_at?: string
      updated_at?: string
    }
    Update: {
      id?: string
      user_id?: string
      thumbnail_banner_id?: string
      created_at?: string
      updated_at?: string
    }
    Relationships: []
  }
  tags: {
    Row: {
      id: string
      name: string
      created_at: string | null
    }
    Insert: {
      id?: string
      name: string
      created_at?: string | null
    }
    Update: {
      id?: string
      name?: string
      created_at?: string | null
    }
    Relationships: []
  }
  shops: {
    Row: {
      id: string
      name: string
      description: string | null
      user_id: string | null
      leader_id: string | null
      created_at: string
      updated_at: string
    }
    Insert: {
      id?: string
      name: string
      description?: string | null
      user_id?: string | null
      leader_id?: string | null
      created_at?: string
      updated_at?: string
    }
    Update: {
      id?: string
      name?: string
      description?: string | null
      user_id?: string | null
      leader_id?: string | null
      created_at?: string
      updated_at?: string
    }
    Relationships: []
  }
  shopee_shop_revenue: {
    Row: {
      id: string
      shop_id: string
      revenue_date: string
      revenue_amount: number
      uploaded_by: string | null
      created_at: string | null
    }
    Insert: {
      id?: string
      shop_id: string
      revenue_date: string
      revenue_amount: number
      uploaded_by?: string | null
      created_at?: string | null
    }
    Update: {
      id?: string
      shop_id?: string
      revenue_date?: string
      revenue_amount?: number
      uploaded_by?: string | null
      created_at?: string | null
    }
    Relationships: []
  }
  shopee_comprehensive_reports: {
    Row: {
      id: string
      report_date: string
      total_revenue: number | null
      total_orders: number | null
      average_order_value: number | null
      product_clicks: number | null
      total_visits: number | null
      conversion_rate: number | null
      cancelled_orders: number | null
      cancelled_revenue: number | null
      returned_orders: number | null
      returned_revenue: number | null
      total_buyers: number | null
      new_buyers: number | null
      existing_buyers: number | null
      potential_buyers: number | null
      buyer_return_rate: number | null
      created_at: string
      updated_at: string
      shop_id: string | null
      feasible_goal: number | null
      breakthrough_goal: number | null
    }
    Insert: {
      id?: string
      report_date: string
      total_revenue?: number | null
      total_orders?: number | null
      average_order_value?: number | null
      product_clicks?: number | null
      total_visits?: number | null
      conversion_rate?: number | null
      cancelled_orders?: number | null
      cancelled_revenue?: number | null
      returned_orders?: number | null
      returned_revenue?: number | null
      total_buyers?: number | null
      new_buyers?: number | null
      existing_buyers?: number | null
      potential_buyers?: number | null
      buyer_return_rate?: number | null
      created_at?: string
      updated_at?: string
      shop_id?: string | null
      feasible_goal?: number | null
      breakthrough_goal?: number | null
    }
    Update: {
      id?: string
      report_date?: string
      total_revenue?: number | null
      total_orders?: number | null
      average_order_value?: number | null
      product_clicks?: number | null
      total_visits?: number | null
      conversion_rate?: number | null
      cancelled_orders?: number | null
      cancelled_revenue?: number | null
      returned_orders?: number | null
      returned_revenue?: number | null
      total_buyers?: number | null
      new_buyers?: number | null
      existing_buyers?: number | null
      potential_buyers?: number | null
      buyer_return_rate?: number | null
      created_at?: string
      updated_at?: string
      shop_id?: string | null
      feasible_goal?: number | null
      breakthrough_goal?: number | null
    }
    Relationships: []
  }
  roles: {
    Row: {
      id: string
      name: string
      created_at: string
      updated_at: string
      description: string | null
    }
    Insert: {
      id?: string
      name: string
      created_at?: string
      updated_at?: string
      description?: string | null
    }
    Update: {
      id?: string
      name?: string
      created_at?: string
      updated_at?: string
      description?: string | null
    }
    Relationships: []
  }
  departments: {
    Row: {
      id: string
      name: string
      created_at: string
    }
    Insert: {
      id?: string
      name: string
      created_at?: string
    }
    Update: {
      id?: string
      name?: string
      created_at?: string
    }
    Relationships: []
  }
  practice_tests: {
    Row: {
      id: string
      exercise_id: string
      title: string
      content: string
      is_active: boolean
      created_at: string | null
      updated_at: string | null
    }
    Insert: {
      id?: string
      exercise_id: string
      title: string
      content: string
      is_active?: boolean
      created_at?: string | null
      updated_at?: string | null
    }
    Update: {
      id?: string
      exercise_id?: string
      title?: string
      content?: string
      is_active?: boolean
      created_at?: string | null
      updated_at?: string | null
    }
    Relationships: []
  }
  practice_test_submissions: {
    Row: {
      id: string
      user_id: string
      practice_test_id: string
      submitted_at: string | null
      image_urls: string[]
      feedback: string | null
      score: number | null
      status: string
      created_at: string | null
      updated_at: string | null
      is_passed: boolean | null
    }
    Insert: {
      id?: string
      user_id: string
      practice_test_id: string
      submitted_at?: string | null
      image_urls: string[]
      feedback?: string | null
      score?: number | null
      status?: string
      created_at?: string | null
      updated_at?: string | null
      is_passed?: boolean | null
    }
    Update: {
      id?: string
      user_id?: string
      practice_test_id?: string
      submitted_at?: string | null
      image_urls?: string[]
      feedback?: string | null
      score?: number | null
      status?: string
      created_at?: string | null
      updated_at?: string | null
      is_passed?: boolean | null
    }
    Relationships: []
  }
  page_views: {
    Row: {
      id: string
      created_at: string
      path: string
      user_id: string | null
    }
    Insert: {
      id?: string
      created_at?: string
      path: string
      user_id?: string | null
    }
    Update: {
      id?: string
      created_at?: string
      path?: string
      user_id?: string | null
    }
    Relationships: []
  }
  general_training_exercises: {
    Row: {
      id: string
      title: string
      video_url: string | null
      order_index: number
      created_by: string | null
      created_at: string
      updated_at: string
      target_roles: string[] | null
      target_team_ids: string[] | null
    }
    Insert: {
      id?: string
      title: string
      video_url?: string | null
      order_index?: number
      created_by?: string | null
      created_at?: string
      updated_at?: string
      target_roles?: string[] | null
      target_team_ids?: string[] | null
    }
    Update: {
      id?: string
      title?: string
      video_url?: string | null
      order_index?: number
      created_by?: string | null
      created_at?: string
      updated_at?: string
      target_roles?: string[] | null
      target_team_ids?: string[] | null
    }
    Relationships: []
  }
  exercise_review_submissions: {
    Row: {
      id: string
      user_id: string
      exercise_id: string
      content: string
      video_url: string
      submitted_at: string
      created_at: string
      updated_at: string
    }
    Insert: {
      id?: string
      user_id: string
      exercise_id: string
      content: string
      video_url: string
      submitted_at?: string
      created_at?: string
      updated_at?: string
    }
    Update: {
      id?: string
      user_id?: string
      exercise_id?: string
      content?: string
      video_url?: string
      submitted_at?: string
      created_at?: string
      updated_at?: string
    }
    Relationships: []
  }
  edu_quiz_submissions: {
    Row: {
      id: string
      quiz_id: string
      user_id: string
      score: number
      passed: boolean
      submitted_at: string | null
      answers: Json | null
    }
    Insert: {
      id?: string
      quiz_id: string
      user_id: string
      score: number
      passed: boolean
      submitted_at?: string | null
      answers?: Json | null
    }
    Update: {
      id?: string
      quiz_id?: string
      user_id?: string
      score?: number
      passed?: boolean
      submitted_at?: string | null
      answers?: Json | null
    }
    Relationships: []
  }
  edu_quizzes: {
    Row: {
      id: string
      exercise_id: string
      title: string
      passing_score: number
      created_at: string | null
      updated_at: string | null
    }
    Insert: {
      id?: string
      exercise_id: string
      title: string
      passing_score?: number
      created_at?: string | null
      updated_at?: string | null
    }
    Update: {
      id?: string
      exercise_id?: string
      title?: string
      passing_score?: number
      created_at?: string | null
      updated_at?: string | null
    }
    Relationships: []
  }
  edu_quiz_answers: {
    Row: {
      id: string
      question_id: string
      content: string
      is_correct: boolean
      order_index: number | null
      created_at: string | null
      updated_at: string | null
    }
    Insert: {
      id?: string
      question_id: string
      content: string
      is_correct?: boolean
      order_index?: number | null
      created_at?: string | null
      updated_at?: string | null
    }
    Update: {
      id?: string
      question_id?: string
      content?: string
      is_correct?: boolean
      order_index?: number | null
      created_at?: string | null
      updated_at?: string | null
    }
    Relationships: []
  }
  edu_knowledge_exercises: {
    Row: {
      id: string
      title: string
      order_index: number
      is_required: boolean
      created_by: string
      created_at: string
      updated_at: string
      exercise_video_url: string | null
      min_study_sessions: number
      min_review_videos: number
      required_review_videos: number
      target_roles: string[] | null
      target_team_ids: string[] | null
      documents: Json | null
      required_viewing_count: number
      min_completion_time: number | null
    }
    Insert: {
      id?: string
      title: string
      order_index?: number
      is_required?: boolean
      created_by: string
      created_at?: string
      updated_at?: string
      exercise_video_url?: string | null
      min_study_sessions?: number
      min_review_videos?: number
      required_review_videos?: number
      target_roles?: string[] | null
      target_team_ids?: string[] | null
      documents?: Json | null
      required_viewing_count?: number
      min_completion_time?: number | null
    }
    Update: {
      id?: string
      title?: string
      order_index?: number
      is_required?: boolean
      created_by?: string
      created_at?: string
      updated_at?: string
      exercise_video_url?: string | null
      min_study_sessions?: number
      min_review_videos?: number
      required_review_videos?: number
      target_roles?: string[] | null
      target_team_ids?: string[] | null
      documents?: Json | null
      required_viewing_count?: number
      min_completion_time?: number | null
    }
    Relationships: []
  }
  edu_essay_questions: {
    Row: {
      id: string
      exercise_id: string
      content: string
      created_at: string
      updated_at: string
    }
    Insert: {
      id?: string
      exercise_id: string
      content: string
      created_at?: string
      updated_at?: string
    }
    Update: {
      id?: string
      exercise_id?: string
      content?: string
      created_at?: string
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
      calculate_engagement_score: {
        Args: { p_exercise_id: string }
        Returns: number
      }
      check_permission: {
        Args: { p_permission_name: string; p_user_id: string }
        Returns: boolean
      }
      cleanup_old_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_active_sessions: {
        Args: { p_user_id?: string }
        Returns: {
          browser_name: string
          device_type: string
          email: string
          ip_address: unknown
          is_current: boolean
          last_activity: string
          login_time: string
          os_name: string
          session_id: string
          user_id: string
        }[]
      }
      get_all_reports_for_dashboard: {
        Args: { month_text: string }
        Returns: Json
      }
      get_all_shops_for_dashboard: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_avg_watch_time: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_cached_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_daily_page_views: {
        Args: { end_date_param: string; start_date_param: string }
        Returns: {
          date: string
          view_count: number
        }[]
      }
      get_exercise_video_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          avg_completion_rate: number
          avg_rewatch_count: number
          avg_watch_time: number
          exercise_id: string
          exercise_title: string
          total_sessions: number
          total_viewers: number
        }[]
      }
      get_public_generations: {
        Args: { page_num?: number; page_size?: number }
        Returns: {
          created_at: string
          id: string
          input_image_urls: string[]
          output_image_url: string
          prompt: string
          user_email: string
          user_full_name: string
          user_id: string
        }[]
      }
      get_top_pages: {
        Args: {
          end_date_param: string
          limit_param?: number
          start_date_param: string
        }
        Returns: {
          path: string
          view_count: number
        }[]
      }
      get_top_users_by_page_views: {
        Args: {
          end_date_param: string
          page_num?: number
          page_size?: number
          start_date_param: string
        }
        Returns: {
          total_count: number
          user_id: string
          user_name: string
          view_count: number
        }[]
      }
      get_total_sessions: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_user_email: {
        Args: { p_feedback: Database["public"]["Tables"]["feedback"]["Row"] }
        Returns: string
      }
      get_user_login_history: {
        Args: { p_limit?: number; p_offset?: number; p_user_id?: string }
        Returns: {
          browser_name: string
          browser_version: string
          device_type: string
          email: string
          failure_reason: string
          id: string
          ip_address: unknown
          is_mobile: boolean
          location_info: Json
          login_time: string
          logout_time: string
          os_name: string
          session_duration: unknown
          success: boolean
          user_id: string
        }[]
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_user_team_id: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_video_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          avg_completion_rate: number
          most_watched_exercise_title: string
          total_sessions: number
          total_watch_time: number
          user_email: string
          user_id: string
          videos_watched: number
        }[]
      }
      get_video_dropout_points: {
        Args: { p_exercise_id: string }
        Returns: {
          dropout_count: number
          time_segment: number
        }[]
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
      is_active_user: {
        Args: { user_id: string }
        Returns: boolean
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
        Returns: unknown
      }
      log_user_login: {
        Args: {
          p_email: string
          p_failure_reason?: string
          p_ip_address?: unknown
          p_success?: boolean
          p_user_agent?: string
          p_user_id: string
        }
        Returns: string
      }
      logout_user_session: {
        Args: { p_session_id?: string; p_user_id: string }
        Returns: undefined
      }
      parse_user_agent: {
        Args: { user_agent_string: string }
        Returns: Json
      }
      search_banners: {
        Args: {
          category_filter?: string
          page_num?: number
          page_size?: number
          search_term?: string
          sort_by?: string
          status_filter?: string
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
      update_role_permissions: {
        Args: {
          p_permission_ids: string[]
          p_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: undefined
      }
      update_session_activity: {
        Args: { p_ip_address?: unknown; p_user_id: string }
        Returns: undefined
      }
      update_user_permission_overrides: {
        Args: { p_permission_overrides: Json; p_user_id: string }
        Returns: undefined
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
      banner_status: "pending" | "approved" | "rejected"
      employee_role: "personnel" | "leader"
      feedback_status: "pending" | "reviewed" | "resolved"
      feedback_type: "bug" | "suggestion" | "general"
      permission_type: "grant" | "deny"
      question_type: "single_choice" | "multiple_choice"
      shopee_shop_status: "Shop mới" | "Đang Vận Hành" | "Đã Dừng"
      tiktok_shop_status: "Shop mới" | "Đang Vận Hành" | "Đã Dừng"
      tiktok_shop_type: "Vận hành" | "Booking"
      user_role:
        | "admin"
        | "leader"
        | "chuyên viên"
        | "học việc/thử việc"
        | "deleted"
        | "trưởng phòng"
        | "booking"
      work_type: "fulltime" | "parttime"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      banner_status: ["pending", "approved", "rejected"],
      employee_role: ["personnel", "leader"],
      feedback_status: ["pending", "reviewed", "resolved"],
      feedback_type: ["bug", "suggestion", "general"],
      permission_type: ["grant", "deny"],
      question_type: ["single_choice", "multiple_choice"],
      shopee_shop_status: ["Shop mới", "Đang Vận Hành", "Đã Dừng"],
      tiktok_shop_status: ["Shop mới", "Đang Vận Hành", "Đã Dừng"],
      tiktok_shop_type: ["Vận hành", "Booking"],
      user_role: [
        "admin",
        "leader",
        "chuyên viên",
        "học việc/thử việc",
        "deleted",
        "trưởng phòng",
        "booking",
      ],
      work_type: ["fulltime", "parttime"],
    },
  },
} as const