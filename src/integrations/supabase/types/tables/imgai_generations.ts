export type ImgaiGenerations = {
  Row: {
    created_at: string | null
    id: string
    input_image_urls: string[] | null
    output_image_url: string | null
    prompt: string | null
    user_id: string | null
    visibility: string
  }
  Insert: {
    created_at?: string | null
    id?: string
    input_image_urls?: string[] | null
    output_image_url?: string | null
    prompt?: string | null
    user_id?: string | null
    visibility?: string
  }
  Update: {
    created_at?: string | null
    id?: string
    input_image_urls?: string[] | null
    output_image_url?: string | null
    prompt?: string | null
    user_id?: string | null
    visibility?: string
  }
  Relationships: []
}