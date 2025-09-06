import type { PublicSchema } from "./schema-public"

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: PublicSchema
}

export type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
export type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]